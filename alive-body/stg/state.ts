// alive-body/stg/state.ts

/**
 * STG runtime state is Body-owned, mutable, and enforcement-critical.
 * This module is the ONLY place where STG state may live.
 */

export type STGStatus = "OPEN" | "CLOSED";

export interface STGState {
  readonly state: STGStatus;
  readonly last_open_time: number | null;
  readonly expires_at: number | null;
  readonly scope: string | null;
  readonly stg_open_id: string | null;
  readonly cooldown_until: number;
}

/**
 * Internal mutable state.
 * NOT exported.
 * NOT directly accessible.
 */
let _state: STGState = {
  state: "CLOSED",
  last_open_time: null,
  expires_at: null,
  scope: null,
  stg_open_id: null,
  cooldown_until: 0,
};

/**
 * Read-only snapshot of STG state.
 * Callers may inspect, never mutate.
 */
export function getSTGState(): STGState {
  return _state;
}

/**
 * Replace the entire STG state atomically.
 * This is intentionally blunt to avoid partial updates.
 */
export function setSTGState(next: STGState): void {
  _state = next;
}

/**
 * Force STG into CLOSED state.
 * Used for:
 * - startup
 * - expiry
 * - invariant violation
 */
export function closeSTG(now: number): void {
  _state = {
    state: "CLOSED",
    last_open_time: _state.last_open_time,
    expires_at: null,
    scope: null,
    stg_open_id: null,
    cooldown_until: _state.cooldown_until > now
      ? _state.cooldown_until
      : _state.cooldown_until,
  };
}

/**
 * Open STG with explicit, fully-specified state.
 * Caller must supply all fields.
 */
export function openSTG(params: {
  now: number;
  expires_at: number;
  scope: string;
  stg_open_id: string;
  cooldown_until: number;
}): void {
  _state = {
    state: "OPEN",
    last_open_time: params.now,
    expires_at: params.expires_at,
    scope: params.scope,
    stg_open_id: params.stg_open_id,
    cooldown_until: params.cooldown_until,
  };
}
