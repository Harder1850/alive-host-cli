// alive-body/stg/audit.ts

/**
 * Append-only audit log for STG events.
 * Used for constitutional verification and forensics.
 * 
 * This module:
 * - Never deletes entries
 * - Never modifies entries
 * - Provides read-only access
 */

export type AuditEventType =
  | "STG_OPEN"
  | "STG_CLOSE"
  | "STG_DEFER"
  | "STG_DENY"
  | "COGNITION_START"
  | "COGNITION_END"
  | "CONSTITUTIONAL_VIOLATION"
  | "GATE_EVALUATION";

export interface AuditEvent {
  readonly type: AuditEventType;
  readonly timestamp: number;
  readonly reason: string;
  readonly stg_open_id?: string;
  readonly scope?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Internal append-only log.
 * NOT exported.
 * NOT mutable from outside.
 */
let _log: AuditEvent[] = [];

/**
 * Append an event to the audit log.
 * This is the ONLY way to add entries.
 */
export function logAuditEvent(event: AuditEvent): void {
  _log.push(event);
}

/**
 * Read-only access to the audit log.
 * Returns a shallow copy to prevent mutation.
 */
export function getAuditLog(): readonly AuditEvent[] {
  return _log;
}

/**
 * Clear the audit log.
 * Used ONLY for testing.
 * NEVER use in production.
 */
export function clearAuditLog(): void {
  _log = [];
}
