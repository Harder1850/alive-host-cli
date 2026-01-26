// alive-core/stg/types.ts

/**
 * Gate decisions are authoritative outcomes.
 * These are NOT suggestions and MUST be enforced by Body.
 */
export enum GateDecision {
  OPEN = "OPEN",
  DEFER = "DEFER",
  DENY = "DENY",
}

/**
 * A scope is an abstract, hierarchical permission namespace.
 * Interpretation is Body-side; definition is Core-side.
 */
export type CognitiveScope = string;

/**
 * Signals are provided by Body.
 * Core does not compute them.
 */
export interface STGSignals {
  prediction_error: number;
  novelty_delta: number;
  resources_ok: boolean;
  intent_authorized: boolean;
  requested_scope: CognitiveScope;
}

/**
 * Result returned by gate evaluation.
 * Core returns law + reason, not action.
 */
export interface GateResult {
  decision: GateDecision;
  reason: string;
}
