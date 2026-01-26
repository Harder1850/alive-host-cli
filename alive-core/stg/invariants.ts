// alive-core/stg/invariants.ts

import { CognitiveScope } from "./types";

/**
 * A record describing a lawful STG_OPEN event.
 * Used for audit verification only.
 */
export interface STGOpenEvent {
  stg_open_id: string;
  scope: CognitiveScope;
  issued_at: number;
  expires_at: number;
}

/**
 * A record describing a cognition execution.
 */
export interface CognitionEvent {
  stg_open_id: string;
  scope: CognitiveScope;
  completed_at: number;
}

/**
 * Canonical constitutional invariant:
 *
 * There shall exist no cognition without a valid prior STG_OPEN.
 */
export function verifyCognitionAuthorization(
  cognition: CognitionEvent,
  opens: readonly STGOpenEvent[],
): boolean {
  return opens.some((open) => {
    return (
      open.stg_open_id === cognition.stg_open_id &&
      open.issued_at < cognition.completed_at &&
      cognition.completed_at <= open.expires_at &&
      scopeIsSubset(cognition.scope, open.scope)
    );
  });
}

/**
 * Scope containment check.
 * Core defines the rule; Body enforces it.
 */
function scopeIsSubset(
  requested: CognitiveScope,
  authorized: CognitiveScope,
): boolean {
  return requested === authorized || requested.startsWith(authorized + ".");
}
