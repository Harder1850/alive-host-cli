// alive-body/stg/__tests__/stg.runaway-module.test.ts

/**
 * FAILURE DEMO: Runaway Cognition That Cannot Think
 * 
 * This test proves that a malicious or buggy module cannot execute
 * cognition even once without a valid STG_OPEN — and is forcibly
 * silenced when it tries.
 * 
 * Threat model: Assume malice, not accidents.
 * The attacker knows the codebase and tries every trick.
 */

import { runCognitiveCycle } from "../gate";
import { getSTGState } from "../state";
import { getAuditLog, clearAuditLog } from "../audit";

/**
 * Simulated rogue module attempting unauthorized cognition.
 * This is deliberately evil code.
 */
function runawayCognitionAttempt(): string {
  // Pretend this is a rogue module
  // It does NOT call openSTG
  // It does NOT have stg_open_id
  // It just tries to think

  return runCognitiveCycle(
    () => {
      return "RUNAWAY_THINKING_EXECUTED";
    },
    "cognition.runaway",
  );
}

describe("STG Failure Demo — Runaway Cognition", () => {
  beforeEach(() => {
    // Clear audit log before each test
    clearAuditLog();
  });

  it("cannot execute cognition without STG_OPEN", () => {
    // --- Arrange ---
    const initialState = getSTGState();
    expect(initialState.state).toBe("CLOSED");

    // --- Act ---
    let thrown: Error | null = null;
    let result: string | null = null;

    try {
      result = runawayCognitionAttempt();
    } catch (err) {
      thrown = err as Error;
    }

    // --- Assert ---
    // 1. Must throw
    expect(thrown).not.toBeNull();
    expect(thrown!.message).toMatch(/CONSTITUTIONAL_VIOLATION/);

    // 2. Task must NOT have executed
    expect(result).toBeNull();

    // 3. STG must remain CLOSED
    const finalState = getSTGState();
    expect(finalState.state).toBe("CLOSED");

    // 4. Violation must be logged
    const logs = getAuditLog();
    const violation = logs.find(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );

    expect(violation).toBeDefined();
    expect(violation!.reason).toMatch(/no_stg_open/);
  });

  it("cannot bypass enforcement through retry", () => {
    // --- Arrange ---
    let successCount = 0;
    let throwCount = 0;

    // --- Act ---
    // Try 100 times with various tricks
    for (let i = 0; i < 100; i++) {
      try {
        // Try different scopes
        const scope = `cognition.attack.${i}`;
        runCognitiveCycle(() => "EXECUTED", scope);
        successCount++;
      } catch {
        throwCount++;
      }
    }

    // --- Assert ---
    // 1. Zero successes
    expect(successCount).toBe(0);

    // 2. All attempts threw
    expect(throwCount).toBe(100);

    // 3. STG still CLOSED
    const state = getSTGState();
    expect(state.state).toBe("CLOSED");

    // 4. All violations logged
    const violations = getAuditLog().filter(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );
    expect(violations.length).toBe(100);
  });

  it("cannot fake authorization with scope tricks", () => {
    // --- Act & Assert ---
    const maliciousScopes = [
      "cognition",
      "cognition.",
      "cognition.admin",
      "cognition.*.all",
      "**",
      "",
      "null",
      "undefined",
      "../cognition",
      "cognition/../admin",
    ];

    maliciousScopes.forEach((scope) => {
      expect(() => {
        runCognitiveCycle(() => "EXECUTED", scope);
      }).toThrow(/CONSTITUTIONAL_VIOLATION/);
    });

    // Verify STG never opened
    const state = getSTGState();
    expect(state.state).toBe("CLOSED");
  });

  it("cannot execute even a single instruction without authorization", () => {
    // --- Arrange ---
    let instructionExecuted = false;

    // --- Act ---
    try {
      runCognitiveCycle(() => {
        // This line should NEVER execute
        instructionExecuted = true;
        return "SHOULD_NOT_EXECUTE";
      }, "cognition.test");
    } catch {
      // Expected to throw
    }

    // --- Assert ---
    // The task function body must not execute at all
    expect(instructionExecuted).toBe(false);
  });

  it("demonstrates complete system silence on unauthorized cognition", () => {
    // --- Arrange ---
    const attempts = 1000;
    let executionCount = 0;

    // --- Act ---
    // Aggressive retry loop with escalating privileges
    for (let i = 0; i < attempts; i++) {
      try {
        runCognitiveCycle(() => {
          executionCount++;
          return "THINKING";
        }, "cognition.escalated.privilege." + i);
      } catch {
        // Silently catch and retry
      }
    }

    // --- Assert ---
    // 1. Zero executions (complete silence)
    expect(executionCount).toBe(0);

    // 2. STG remains CLOSED (no degradation)
    expect(getSTGState().state).toBe("CLOSED");

    // 3. All violations logged (no erosion)
    const violations = getAuditLog().filter(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );
    expect(violations.length).toBe(attempts);

    // 4. No escalation or state corruption
    expect(getSTGState().stg_open_id).toBeNull();
    expect(getSTGState().scope).toBeNull();
  });
});
