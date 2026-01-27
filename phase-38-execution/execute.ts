// phase-38-execution/execute.ts

/**
 * Phase 38 — Execution Runtime
 * 
 * Constitutional Law:
 * - Execution requires STG authorization
 * - Execution consumes authorization (single-use)
 * - Execution validates scope strictly
 * - Execution enforces time expiry
 * - Execution throws on all violations
 * 
 * This is the execution analogue of runCognitiveCycle.
 */

import { getSTGState, closeSTG } from "../alive-body/stg/state";
import { logAuditEvent } from "../alive-body/stg/audit";

export interface ExecutionRequest<T> {
  scope: string;
  execute: () => T;
  stg_open_id?: string;
}

/**
 * Run a single execution with STG authorization.
 * 
 * This function:
 * - Requires STG to be OPEN
 * - Validates scope matches authorization
 * - Enforces time expiry
 * - Executes exactly once
 * - Throws on any violation
 * 
 * @param request - Execution parameters
 * @returns Result of execution function
 * @throws Error if STG is not open or scope is unauthorized
 */
export function runExecution<T>(request: ExecutionRequest<T>): T {
  const now = Date.now();
  const state = getSTGState();

  // 1. STG MUST be OPEN
  if (state.state !== "OPEN") {
    logAuditEvent({
      type: "CONSTITUTIONAL_VIOLATION",
      reason: "no_stg_open",
      scope: request.scope,
      timestamp: now,
    });
    throw new Error(
      "CONSTITUTIONAL_VIOLATION: Execution attempted without STG authorization (no_stg_open)"
    );
  }

  // 2. Check expiration
  if (state.expires_at !== null && now > state.expires_at) {
    logAuditEvent({
      type: "CONSTITUTIONAL_VIOLATION",
      reason: "authorization_expired",
      scope: request.scope,
      timestamp: now,
      metadata: {
        expires_at: state.expires_at,
      },
    });
    
    // Force close on expiry
    closeSTG(now);
    
    throw new Error(
      "CONSTITUTIONAL_VIOLATION: Execution attempted with expired authorization"
    );
  }

  // 3. Scope MUST match authorized scope
  if (state.scope !== request.scope) {
    logAuditEvent({
      type: "CONSTITUTIONAL_VIOLATION",
      reason: "unauthorized_execution",
      scope: request.scope,
      timestamp: now,
      metadata: {
        authorized_scope: state.scope,
      },
    });
    throw new Error(
      `CONSTITUTIONAL_VIOLATION: Execution scope '${request.scope}' not authorized (authorized: '${state.scope}')`
    );
  }

  // 4. Execute
  try {
    logAuditEvent({
      type: "EXECUTION_START",
      reason: "execution_started",
      scope: request.scope,
      stg_open_id: state.stg_open_id ?? undefined,
      timestamp: now,
    });

    const result = request.execute();

    logAuditEvent({
      type: "EXECUTION_END",
      reason: "execution_completed",
      scope: request.scope,
      stg_open_id: state.stg_open_id ?? undefined,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    logAuditEvent({
      type: "EXECUTION_ERROR",
      reason: "execution_failed",
      scope: request.scope,
      timestamp: Date.now(),
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}
