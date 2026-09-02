import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export const AGENT_OS_ENDPOINT = process.env.BINANCE_AGENT_OS_URL || "https://agent.binance.com/mcp/agentic";

/** Connects to Binance Agent OS, discovers tools, and invokes only read-only market tools. */
export async function discoverAgentOS() {
  const client = new Client({ name: "sentinel-one", version: "1.0.0" }, { capabilities: {} });
  const transport = new StreamableHTTPClientTransport(new URL(AGENT_OS_ENDPOINT));
  await client.connect(transport);
  const listed = await client.listTools();
  return { client, transport, tools: listed.tools || [] };
}

function choose(tools, patterns) {
  const names = tools.map(t => t.name);
  for (const p of patterns) {
    const exact = names.find(n => n.toLowerCase() === p);
    if (exact) return exact;
    const partial = names.find(n => n.toLowerCase().includes(p));
    if (partial) return partial;
  }
  return null;
}

export async function agentOSMarket(symbol) {
  const os = await discoverAgentOS();
  const tickerTool = choose(os.tools, ["ticker", "get_ticker", "price"]);
  const klineTool = choose(os.tools, ["klines", "candlestick", "candle"]);
  if (!tickerTool || !klineTool) throw new Error(`Agent OS read-only tools not found. Discovered ${os.tools.length} tools.`);
  const ticker = await os.client.callTool({ name: tickerTool, arguments: { symbol } });
  const klines = await os.client.callTool({ name: klineTool, arguments: { symbol, interval: "1h", limit: 48 } });
  await os.client.close();
  return { ticker, klines, source: "BINANCE_AGENT_OS_MCP", toolsDiscovered: os.tools.length, tickerTool, klineTool };
}
