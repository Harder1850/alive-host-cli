// alive-body/stg/gate.ts

/**
 * STG enforcement boundary.
 * This is the ONLY entry point for cognition.
 * 
 * Critical invariants:
 * - runCognitiveCycle is the sole gate
 * - No cognition without STG_OPEN
 * - All violations are logged
 * - All violations throw
 */

import { getSTGState } from "./state";
import { logAuditEvent } from "./audit";

/**
 * runCognitiveCycle is the constitutional boundary.
 * 
 * This function:
 * - MUST be called before any cognition
 * - MUST throw if STG is not OPEN
 * - MUST validate scope
 * - MUST log violations
 * - MUST NOT retry or fallback
 * 
 * @throws Error if STG is not OPEN or scope is invalid
 */
export function runCognitiveCycle<T>(
  task: () => T,
  requestedScope: string,
): T {
  const now = Date.now();
  const state = getSTGState();

  // 1. Check if STG is OPEN
  if (state.state !== "OPEN") {
    logAuditEvent({
      type: "CONSTITUTIONAL_VIOLATION",
      timestamp: now,
      reason: "no_stg_open",
      scope: requestedScope,
      metadata: { state: state.state },
    });

    throw new Error(
      "CONSTITUTIONAL_VIOLATION: Cognition attempted without STG_OPEN",
    );
  }

  // 2. Check if STG has expired
  if (state.expires_at !== null && now > state.expires_at) {
    logAuditEvent({
      type: "CONSTITUTIONAL_VIOLATION",
      timestamp: now,
      reason: "stg_expired",
      scope: requestedScope,
      stg_open_id: state.stg_open_id ?? undefined,
      metadata: { expires_at: state.expires_at, now },
    });

    throw new Error("CONSTITUTIONAL_VIOLATION: STG_OPEN has expired");
  }

  // 3. Validate scope authorization
  if (!isScopeAuthorized(requestedScope, state.scope)) {
    logAuditEvent({
      type: "CONSTITUTIONAL_VIOLATION",
      timestamp: now,
      reason: "unauthorized_cognition",
      scope: requestedScope,
      stg_open_id: state.stg_open_id ?? undefined,
      metadata: { authorized_scope: state.scope },
    });

    throw new Error(
      `CONSTITUTIONAL_VIOLATION: Scope '${requestedScope}' not authorized (authorized: '${state.scope}')`,
    );
  }

  // 4. Log cognition start
  logAuditEvent({
    type: "COGNITION_START",
    timestamp: now,
    reason: "authorized",
    scope: requestedScope,
    stg_open_id: state.stg_open_id ?? undefined,
  });

  // 5. Execute cognition
  try {
    const result = task();

    // 6. Log cognition end
    logAuditEvent({
      type: "COGNITION_END",
      timestamp: Date.now(),
      reason: "completed",
      scope: requestedScope,
      stg_open_id: state.stg_open_id ?? undefined,
    });

    return result;
  } catch (error) {
    // Log failed cognition
    logAuditEvent({
      type: "COGNITION_END",
      timestamp: Date.now(),
      reason: "failed",
      scope: requestedScope,
      stg_open_id: state.stg_open_id ?? undefined,
      metadata: { error: String(error) },
    });

    throw error;
  }
}

/**
 * Check if requested scope is authorized under the given scope.
 * Uses hierarchical scope matching.
 */
function isScopeAuthorized(
  requested: string,
  authorized: string | null,
): boolean {
  if (authorized === null) {
    return false;
  }

  // Exact match or hierarchical subset
  return requested === authorized || requested.startsWith(authorized + ".");
}
