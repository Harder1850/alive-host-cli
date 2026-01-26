// alive-core/stg/policy.ts

import { CognitiveScope } from "./types";

/**
 * STGPolicy is immutable constitutional law.
 * It may be replaced only via explicit constitutional process.
 */
export interface STGPolicy {
  readonly epsilon_prediction_error: number;
  readonly delta_novelty: number;
  readonly max_cognitive_duration_ms: number;
  readonly max_compute_budget: number;
  readonly cooldown_duration_ms: number;
  readonly allowed_scopes: ReadonlySet<CognitiveScope>;
  readonly policy_hash: string;
}

/**
 * Helper to construct an immutable policy object.
 * Mutation after creation is impossible by construction.
 */
export function createSTGPolicy(params: {
  epsilon_prediction_error: number;
  delta_novelty: number;
  max_cognitive_duration_ms: number;
  max_compute_budget: number;
  cooldown_duration_ms: number;
  allowed_scopes: Iterable<CognitiveScope>;
  policy_hash: string;
}): STGPolicy {
  return Object.freeze({
    epsilon_prediction_error: params.epsilon_prediction_error,
    delta_novelty: params.delta_novelty,
    max_cognitive_duration_ms: params.max_cognitive_duration_ms,
    max_compute_budget: params.max_compute_budget,
    cooldown_duration_ms: params.cooldown_duration_ms,
    allowed_scopes: new Set(params.allowed_scopes),
    policy_hash: params.policy_hash,
  });
}
