// alive-core/stg/evaluate.ts

import { GateDecision, GateResult, STGSignals } from "./types";
import { STGPolicy } from "./policy";

/**
 * evaluateGate applies constitutional law to measured signals.
 *
 * This function:
 * - is deterministic
 * - has no side effects
 * - performs no learning
 * - performs no interpretation
 */
export function evaluateGate(
  signals: STGSignals,
  policy: STGPolicy,
  now: number,
  cooldown_until: number,
): GateResult {
  if (now < cooldown_until) {
    return { decision: GateDecision.DENY, reason: "cooldown_active" };
  }

  if (!signals.intent_authorized) {
    return { decision: GateDecision.DENY, reason: "unauthorized_intent" };
  }

  if (!signals.resources_ok) {
    return { decision: GateDecision.DEFER, reason: "insufficient_resources" };
  }

  if (signals.prediction_error <= policy.epsilon_prediction_error) {
    return { decision: GateDecision.DENY, reason: "low_prediction_error" };
  }

  if (signals.novelty_delta <= policy.delta_novelty) {
    return { decision: GateDecision.DENY, reason: "low_novelty" };
  }

  return { decision: GateDecision.OPEN, reason: "thresholds_satisfied" };
}
