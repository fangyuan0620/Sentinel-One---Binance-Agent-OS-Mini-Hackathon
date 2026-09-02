import http from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeMarket } from "./src/agent.js";
import { getMarketSnapshot } from "./src/binance.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 3000);
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("Request too large");
  }
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { ok: true, service: "Sentinel One", mode: "READ_ONLY" });
    }
    if (req.method === "GET" && url.pathname === "/api/market") {
      const symbol = (url.searchParams.get("symbol") || "BTCUSDT").toUpperCase();
      return json(res, 200, await getMarketSnapshot(symbol));
    }
    if (req.method === "GET" && url.pathname === "/api/skills") {
      const names = await readdir(join(root, "skills"), { withFileTypes: true });
      const official = JSON.parse(await readFile(join(root, "skills", "binance-official.json"), "utf8"));
      return json(res, 200, { pipeline: ["market-scan", "official-skill-context", "risk-gate", "explain-plan", "audit-trail"], skills: names.filter(x => x.isDirectory()).map(x => ({ name: x.name, enabled: true })), official });
    }
    if (req.method === "POST" && url.pathname === "/api/analyze") {
      const input = await body(req);
      const symbol = String(input.symbol || "BTCUSDT").toUpperCase();
      const portfolio = Number(input.portfolio || 1000);
      const riskPercent = Number(input.riskPercent || 1);
      const snapshot = await getMarketSnapshot(symbol);
      return json(res, 200, await analyzeMarket({ snapshot, portfolio, riskPercent, question: String(input.question || "") }));
    }
    if (req.method !== "GET") return json(res, 404, { error: "Not found" });

    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const safe = normalize(requested).replace(/^(\.\.[/\\])+/, "");
    const file = join(publicDir, safe);
    if (!file.startsWith(publicDir)) return json(res, 403, { error: "Forbidden" });
    const data = await readFile(file);
    res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") return json(res, 404, { error: "Not found" });
    json(res, 500, { error: error.message || "Internal error" });
  }
});

server.listen(port, () => console.log(`Sentinel One running at http://localhost:${port}`));
