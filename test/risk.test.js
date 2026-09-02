import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRisk } from "../src/risk.js";

test("caps proposed notional at 20% of portfolio", () => {
  const r = evaluateRisk({ portfolio: 1000, riskPercent: 1, entry: 100, stop: 99, stance: "WATCH LONG", volatilityPercent: 1 });
  assert.equal(r.approved, true);
  assert.equal(r.notional, 200);
});

test("rejects risk above policy maximum", () => {
  const r = evaluateRisk({ portfolio: 1000, riskPercent: 5, entry: 100, stop: 99, stance: "WATCH LONG", volatilityPercent: 1 });
  assert.equal(r.approved, false);
  assert.equal(r.reason, "RISK_LIMIT");
});

test("never creates a plan when there is no signal", () => {
  const r = evaluateRisk({ portfolio: 1000, riskPercent: 1, entry: 100, stop: 99, stance: "WAIT", volatilityPercent: 1 });
  assert.equal(r.approved, false);
});
