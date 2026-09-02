const API = "https://api.binance.com/api/v3";
const ALLOWED = new Set(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]);

async function fetchJson(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`${API}${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Binance API ${response.status}`);
    return response.json();
  } finally { clearTimeout(timer); }
}

function fallback(symbol) {
  const anchors = { BTCUSDT: 108420, ETHUSDT: 4385, BNBUSDT: 852, SOLUSDT: 205 };
  const price = anchors[symbol];
  const now = Date.now();
  const candles = Array.from({ length: 48 }, (_, i) => {
    const drift = Math.sin(i / 4) * price * .008 + (i - 24) * price * .00018;
    const close = price + drift;
    return { time: now - (47 - i) * 3600000, open: close * .998, high: close * 1.004, low: close * .995, close, volume: 100 + i * 3 };
  });
  return { symbol, price, change24h: 1.84, high24h: price * 1.026, low24h: price * .972, volume: 18432, candles, source: "DEMO_SNAPSHOT", fetchedAt: new Date().toISOString() };
}

export async function getMarketSnapshot(symbol) {
  if (!ALLOWED.has(symbol)) throw new Error("Supported symbols: BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT");
  if (process.env.AGENT_OS_ONLY === "true") {
    const { agentOSMarket } = await import("./agentos.js");
    const live = await agentOSMarket(symbol);
    const unpack = (result) => {
      const text = (result?.content || []).map(c => c.text || "").join(" ");
      try { return JSON.parse(text); } catch { return {}; }
    };
    const t = unpack(live.ticker); const k = unpack(live.klines);
    const rows = Array.isArray(k) ? k : (k.data || k.klines || k.result || []);
    const candles = rows.map(c => Array.isArray(c) ? ({ time:c[0], open:+c[1], high:+c[2], low:+c[3], close:+c[4], volume:+c[5] }) : c).filter(c => c.close != null);
    if (!t.lastPrice && !t.price && !candles.length) throw new Error("Agent OS returned no parseable market data");
    const price = +(t.lastPrice || t.price || candles.at(-1)?.close);
    return { symbol, price, change24h:+(t.priceChangePercent || t.change24h || 0), high24h:+(t.highPrice || t.high24h || price), low24h:+(t.lowPrice || t.low24h || price), volume:+(t.quoteVolume || t.volume || 0), candles: candles.length ? candles : fallback(symbol).candles, source:`${live.source} · ${live.tickerTool}`, fetchedAt:new Date().toISOString(), agentToolsDiscovered:live.toolsDiscovered };
  }
  try {
    const [ticker, rawCandles] = await Promise.all([
      fetchJson(`/ticker/24hr?symbol=${symbol}`),
      fetchJson(`/klines?symbol=${symbol}&interval=1h&limit=48`)
    ]);
    const candles = rawCandles.map(c => ({ time: c[0], open: +c[1], high: +c[2], low: +c[3], close: +c[4], volume: +c[5] }));
    return { symbol, price: +ticker.lastPrice, change24h: +ticker.priceChangePercent, high24h: +ticker.highPrice, low24h: +ticker.lowPrice, volume: +ticker.quoteVolume, candles, source: "BINANCE_PUBLIC_API", fetchedAt: new Date().toISOString() };
  } catch {
    return fallback(symbol);
  }
}
