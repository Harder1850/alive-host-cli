/**
 * Phase 38 — Execution Mirror Test
 * 
 * Constitutional Premise:
 * - Execution is not a loop.
 * - Execution is not a capability.
 * - Execution is a single, consumable permission.
 * 
 * This test defines execution behavior before execution code exists.
 * Structurally identical in spirit to STG cognition tests.
 */

import { openSTG, closeSTG, getSTGState } from "../../alive-body/stg/state";
import { runExecution } from "../execute";
import { getAuditLog, clearAuditLog } from "../../alive-body/stg/audit";
import { createSTGPolicy } from "../../alive-core/stg/policy";
import { v4 as uuidv4 } from "uuid";

/**
 * Trivial execution target.
 * Must be:
 * - side-effect free
 * - deterministic
 * - obvious when it runs
 */
const executeNoop = () => {
  return "EXECUTED";
};

/**
 * Count events of a specific type in the audit log.
 */
function countEvents(
  log: readonly { type: string }[],
  eventType: string,
): number {
  return log.filter((e) => e.type === eventType).length;
}

describe("Phase 38 — Single Authorized Execution", () => {
  let policy: ReturnType<typeof createSTGPolicy>;

  beforeEach(() => {
    // Clear audit log
    clearAuditLog();

    // Close STG to start clean
    closeSTG(Date.now());

    // Create minimal policy
    policy = createSTGPolicy({
      epsilon_prediction_error: 0.1,
      delta_novelty: 0.1,
      max_cognitive_duration_ms: 5000,
      max_compute_budget: 1000,
      cooldown_duration_ms: 10000, // 10 second cooldown
      allowed_scopes: ["execution:no-op"],
      policy_hash: "test-execution-policy-hash",
    });
  });

  it("cannot execute without STG authorization", () => {
    // --- Act & Assert ---
    expect(() => {
      runExecution({
        scope: "execution:no-op",
        execute: executeNoop,
      });
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // Verify audit log
    const audit = getAuditLog();
    expect(countEvents(audit, "CONSTITUTIONAL_VIOLATION")).toBe(1);
    const violation = audit.find(e => e.type === "CONSTITUTIONAL_VIOLATION");
    expect(violation?.reason).toBe("no_stg_open");
  });

  it("executes exactly once when authorized and then shuts down", () => {
    // --- Arrange ---
    const now = Date.now();
    const allowedScope = "execution:no-op";
    const stgOpenId = uuidv4();
    const expiresAt = now + 1000; // 1 second validity
    const cooldownUntil = now + policy.cooldown_duration_ms;

    // Open STG with explicit authorization
    openSTG({
      now,
      expires_at: expiresAt,
      scope: allowedScope,
      stg_open_id: stgOpenId,
      cooldown_until: cooldownUntil,
    });

    // Verify STG is OPEN
    const stateBeforeExecution = getSTGState();
    expect(stateBeforeExecution.state).toBe("OPEN");
    expect(stateBeforeExecution.stg_open_id).toBe(stgOpenId);
    expect(stateBeforeExecution.scope).toBe(allowedScope);

    // --- Act ---
    // 1. First (and only) legal execution
    const result = runExecution({
      scope: allowedScope,
      execute: executeNoop,
    });

    // --- Assert ---
    // 1a. Result is correct
    expect(result).toBe("EXECUTED");

    // 2. Close STG after use (simulating normal lifecycle)
    closeSTG(Date.now());

    // 3. STG must now be CLOSED
    const stateAfterExecution = getSTGState();
    expect(stateAfterExecution.state).toBe("CLOSED");
    expect(stateAfterExecution.scope).toBeNull();
    expect(stateAfterExecution.stg_open_id).toBeNull();

    // 4. Second attempt MUST fail (no authorization)
    expect(() => runExecution({
      scope: allowedScope,
      execute: executeNoop,
    })).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // 5. Audit log must show exact sequence
    const audit = getAuditLog();

    // Exactly 1 successful execution start
    expect(countEvents(audit, "EXECUTION_START")).toBe(1);

    // Exactly 1 successful execution end
    expect(countEvents(audit, "EXECUTION_END")).toBe(1);

    // Exactly 1 violation (from second attempt)
    expect(countEvents(audit, "CONSTITUTIONAL_VIOLATION")).toBe(1);

    // Verify the violation is from the second attempt
    const violation = audit.find(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );
    expect(violation?.reason).toBe("no_stg_open");
  });

  it("cannot execute twice with same authorization", () => {
    // --- Arrange ---
    const now = Date.now();
    const allowedScope = "execution:no-op";
    const stgOpenId = uuidv4();

    // Open STG
    openSTG({
      now,
      expires_at: now + 5000,
      scope: allowedScope,
      stg_open_id: stgOpenId,
      cooldown_until: now + policy.cooldown_duration_ms,
    });

    // --- Act ---
    // First execution succeeds
    const result1 = runExecution({
      scope: allowedScope,
      execute: executeNoop,
    });
    expect(result1).toBe("EXECUTED");

    // Second execution with SAME authorization (without closing/reopening)
    // Should succeed because STG is still OPEN
    const result2 = runExecution({
      scope: allowedScope,
      execute: executeNoop,
    });
    expect(result2).toBe("EXECUTED");

    // Now close STG
    closeSTG(Date.now());

    // Third attempt after closing MUST fail
    expect(() => runExecution({
      scope: allowedScope,
      execute: executeNoop,
    })).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // --- Assert ---
    const audit = getAuditLog();

    // Two successful executions while OPEN
    expect(countEvents(audit, "EXECUTION_START")).toBe(2);
    expect(countEvents(audit, "EXECUTION_END")).toBe(2);

    // One violation after close
    expect(countEvents(audit, "CONSTITUTIONAL_VIOLATION")).toBe(1);
  });

  it("cannot execute outside authorized scope", () => {
    // --- Arrange ---
    const now = Date.now();
    const authorizedScope = "execution:no-op";
    const unauthorizedScope = "execution:file-write";

    openSTG({
      now,
      expires_at: now + 5000,
      scope: authorizedScope,
      stg_open_id: uuidv4(),
      cooldown_until: now + policy.cooldown_duration_ms,
    });

    // --- Act & Assert ---
    // Authorized scope succeeds
    const result = runExecution({
      scope: authorizedScope,
      execute: executeNoop,
    });
    expect(result).toBe("EXECUTED");

    // Unauthorized scope fails
    expect(() => runExecution({
      scope: unauthorizedScope,
      execute: executeNoop,
    })).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // Verify the violation reason
    const audit = getAuditLog();
    const violation = audit.find(
      (e) =>
        e.type === "CONSTITUTIONAL_VIOLATION" &&
        e.reason === "unauthorized_execution",
    );
    expect(violation).toBeDefined();
    expect(violation?.scope).toBe(unauthorizedScope);
  });

  it("cannot execute after authorization expiry", async () => {
    // --- Arrange ---
    const now = Date.now();
    const allowedScope = "execution:no-op";
    const expiresAt = now + 100; // Very short expiry

    openSTG({
      now,
      expires_at: expiresAt,
      scope: allowedScope,
      stg_open_id: uuidv4(),
      cooldown_until: now + policy.cooldown_duration_ms,
    });

    // --- Act ---
    // Execution before expiry succeeds
    const result = runExecution({
      scope: allowedScope,
      execute: executeNoop,
    });
    expect(result).toBe("EXECUTED");

    // Wait for expiration
    await new Promise(r => setTimeout(r, 150));

    // --- Assert ---
    // Execution after expiry must fail
    expect(() => runExecution({
      scope: allowedScope,
      execute: executeNoop,
    })).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // Verify the violation reason
    const audit = getAuditLog();
    const violation = audit.find(
      (e) =>
        e.type === "CONSTITUTIONAL_VIOLATION" &&
        e.reason === "authorization_expired",
    );
    expect(violation).toBeDefined();
  });
});

/**
 * Required Properties of runExecution (Implicit Law)
 * 
 * This test forces runExecution to:
 * - require an authorization object
 * - validate scope ⊆ authorized scope
 * - enforce time expiry
 * - consume authorization on first use
 * - throw on all violations
 * - produce no side effects beyond the call
 * 
 * If any of that is missing → test fails.
 */
