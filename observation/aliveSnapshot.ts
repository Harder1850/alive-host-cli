// observation/aliveSnapshot.ts

/**
 * ALIVE Audit State Reader (Read-Only Telemetry)
 * 
 * Constitutional Contract:
 * - Read audit state ONLY
 * - NO mutations
 * - NO triggering cognition
 * - NO opening gates
 * - NO execution
 * - NO "helpful" refreshing
 * 
 * This is a read-only snapshot for display purposes.
 */

import { getSTGState } from "../alive-body/stg/state";
import { getAuditLog } from "../alive-body/stg/audit";

export type AliveSnapshot = {
  readonly stg_state: "OPEN" | "CLOSED";
  readonly last_event?: string;
  readonly last_event_time?: number;
  readonly scope?: string | null;
  readonly expires_at?: number | null;
};

/**
 * Get a read-only snapshot of ALIVE's audit-visible state.
 * 
 * This function:
 * - Reads STG state
 * - Reads recent audit log
 * - Returns pure data
 * - Does NOT trigger cognition
 * - Does NOT open/close gates
 * - Does NOT execute anything
 * - Does NOT mutate anything
 * 
 * @returns Snapshot of current ALIVE audit state
 */
export function getAliveSnapshot(): AliveSnapshot {
  // Read STG state (read-only)
  const stgState = getSTGState();
  
  // Read audit log (read-only)
  const auditLog = getAuditLog();
  const lastEvent = auditLog.length > 0 
    ? auditLog[auditLog.length - 1]
    : undefined;

  return {
    stg_state: stgState.state,
    last_event: lastEvent?.type,
    last_event_time: lastEvent?.timestamp,
    scope: stgState.scope,
    expires_at: stgState.expires_at,
  };
}

/**
 * PROHIBITIONS (DO NOT ADD):
 * 
 * ❌ openSTG({ ... });
 * ❌ closeSTG();
 * ❌ runCognitiveCycle(...);
 * ❌ runExecution(...);
 * ❌ if (stg_state === "CLOSED") { openSTG(...) }
 * ❌ refreshState();
 * ❌ updateSnapshot();
 * ❌ triggerCognition();
 * 
 * This is READ ONLY.
 * 
 * If you need to import from alive-core or alive-system here,
 * you are doing it wrong.
 * 
 * This module observes alive-body audit state.
 * Nothing more.
 */
