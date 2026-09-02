import { evaluateRisk } from "./risk.js";

const officialSkills = ["crypto-market-rank", "binance-trading-signal", "query-token-audit"];

function ema(values, period) {
  const k = 2 / (period + 1);
  return values.reduce((acc, value, i) => i ? value * k + acc * (1 - k) : value, values[0]);
}

function rsi(values, period = 14) {
  const changes = values.slice(-period - 1).slice(1).map((v, i) => v - values.slice(-period - 1)[i]);
  const gains = changes.reduce((s, v) => s + Math.max(v, 0), 0) / period;
  const losses = changes.reduce((s, v) => s + Math.max(-v, 0), 0) / period;
  return losses === 0 ? 100 : 100 - 100 / (1 + gains / losses);
}

function atr(candles, period = 14) {
  const slice = candles.slice(-period);
  return slice.reduce((s, c, i) => {
    const prev = candles[candles.length - period - 1 + i]?.close ?? c.open;
    return s + Math.max(c.high - c.low, Math.abs(c.high - prev), Math.abs(c.low - prev));
  }, 0) / slice.length;
}

export async function analyzeMarket({ snapshot, portfolio, riskPercent }) {
  const closes = snapshot.candles.map(c => c.close);
  const fast = ema(closes.slice(-20), 9);
  const slow = ema(closes, 21);
  const momentum = rsi(closes);
  const volatility = atr(snapshot.candles);
  let stance = "WAIT";
  if (fast > slow && momentum >= 50 && momentum < 72) stance = "WATCH LONG";
  if (fast < slow && momentum <= 50 && momentum > 28) stance = "WATCH SHORT";
  const stopDistance = Math.max(volatility * 1.5, snapshot.price * .008);
  const entry = snapshot.price;
  const stop = stance === "WATCH SHORT" ? entry + stopDistance : entry - stopDistance;
  const target = stance === "WATCH SHORT" ? entry - stopDistance * 2 : entry + stopDistance * 2;
  const risk = evaluateRisk({ portfolio, riskPercent, entry, stop, stance, volatilityPercent: volatility / entry * 100 });
  const checks = [
    { label: "趋势一致性", pass: stance !== "WAIT", detail: `EMA 9 ${fast > slow ? ">" : "≤"} EMA 21` },
    { label: "动量不过热", pass: momentum > 28 && momentum < 72, detail: `RSI ${momentum.toFixed(1)}` },
    { label: "波动率可控", pass: volatility / entry < .035, detail: `ATR ${(volatility / entry * 100).toFixed(2)}%` },
    { label: "仓位符合上限", pass: risk.approved, detail: `风险预算 $${risk.riskBudget.toFixed(2)}` }
  ];
  const confidence = Math.round(48 + checks.filter(c => c.pass).length * 10 + Math.min(Math.abs(fast - slow) / entry * 500, 10));
  return {
    id: crypto.randomUUID(), symbol: snapshot.symbol, stance, confidence: Math.min(confidence, 88),
    summary: stance === "WAIT" ? "信号尚未形成共振，耐心等待比勉强交易更有优势。" : `${stance.replace("WATCH ", "")} 方向出现趋势与动量共振，但应只在计划价位附近观察，不追价。`,
    market: { ...snapshot, candles: snapshot.candles.slice(-36) },
    indicators: { ema9: fast, ema21: slow, rsi14: momentum, atr14: volatility },
    plan: { entry, stop, target, quantity: risk.quantity, notional: risk.notional, riskReward: 2, executionAllowed: false },
    checks,
    risks: ["加密资产波动剧烈，指标可能快速失效", "公开行情存在延迟或网络降级的可能", "该计划只提供观察框架，不构成投资建议"],
    officialSkills,
    audit: { mode: "READ_ONLY", policy: "DETERMINISTIC_RISK_GATE", dataSource: snapshot.source, createdAt: new Date().toISOString() }
  };
}
