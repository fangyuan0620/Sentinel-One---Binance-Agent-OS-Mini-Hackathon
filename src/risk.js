export function evaluateRisk({ portfolio, riskPercent, entry, stop, stance, volatilityPercent }) {
  if (![portfolio, riskPercent, entry, stop].every(Number.isFinite)) return { approved: false, reason: "INVALID_INPUT", quantity: 0, notional: 0, riskBudget: 0 };
  if (portfolio <= 0 || riskPercent <= 0 || riskPercent > 3) return { approved: false, reason: "RISK_LIMIT", quantity: 0, notional: 0, riskBudget: 0 };
  if (stance === "WAIT" || volatilityPercent > 3.5) return { approved: false, reason: stance === "WAIT" ? "NO_SIGNAL" : "VOLATILITY_HIGH", quantity: 0, notional: 0, riskBudget: portfolio * riskPercent / 100 };
  const riskBudget = portfolio * riskPercent / 100;
  const quantityByStop = riskBudget / Math.abs(entry - stop);
  const maxNotional = portfolio * .2;
  const quantity = Math.min(quantityByStop, maxNotional / entry);
  return { approved: true, reason: "APPROVED_PLAN_ONLY", quantity, notional: quantity * entry, riskBudget };
}
