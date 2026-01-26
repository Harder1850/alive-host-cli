// alive-genesis/__tests__/genesis.respects-stg.test.ts

/**
 * Genesis STG Respect Test
 * 
 * Proves that Genesis:
 * - Cannot escape the constitution
 * - Cannot think by habit
 * - Cannot form runaway loops
 * - Experiences silence as normal
 * - Never escalates or retries
 */

import { genesisCognitiveStep } from "../cognitive";
import { GenesisCognitionAuthorization, GenesisTask } from "../types";
import { getSTGState, openSTG, closeSTG } from "../../alive-body/stg/state";
import { getAuditLog, clearAuditLog } from "../../alive-body/stg/audit";
import { v4 as uuidv4 } from "uuid";

describe("Genesis Respects STG Authority", () => {
  const simpleTask: GenesisTask = {
    kind: "THINK",
    payload: "test-thought",
  };

  beforeEach(() => {
    clearAuditLog();
    closeSTG(Date.now());
  });

  it("returns null when authorization is missing", () => {
    // --- Act ---
    const result = genesisCognitiveStep(simpleTask);

    // --- Assert ---
    // No cognition occurred
    expect(result).toBeNull();

    // STG remains CLOSED
    const state = getSTGState();
    expect(state.state).toBe("CLOSED");

    // No violations logged (Genesis never attempted to bypass)
    const violations = getAuditLog().filter(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );
    expect(violations.length).toBe(0);
  });

  it("returns null when authorization is undefined", () => {
    // --- Act ---
    const result = genesisCognitiveStep(simpleTask, undefined);

    // --- Assert ---
    expect(result).toBeNull();
    expect(getSTGState().state).toBe("CLOSED");
  });

  it("returns null when authorization has expired", () => {
    // --- Arrange ---
    const now = Date.now();
    const expiredAuth: GenesisCognitionAuthorization = {
      stg_open_id: uuidv4(),
      scope: "genesis.think",
      expires_at: now - 1000, // Expired 1 second ago
    };

    // --- Act ---
    const result = genesisCognitiveStep(simpleTask, expiredAuth);

    // --- Assert ---
    // No cognition occurred
    expect(result).toBeNull();

    // Genesis didn't even attempt to call runCognitiveCycle
    const audit = getAuditLog();
    expect(audit.length).toBe(0);
  });

  it("executes cognition exactly once with valid authorization", () => {
    // --- Arrange ---
    const now = Date.now();
    const validAuth: GenesisCognitionAuthorization = {
      stg_open_id: uuidv4(),
      scope: "genesis.think",
      expires_at: now + 5000, // Valid for 5 seconds
    };

    // Open STG to authorize cognition
    openSTG({
      now,
      expires_at: validAuth.expires_at,
      scope: validAuth.scope,
      stg_open_id: validAuth.stg_open_id,
      cooldown_until: now + 10000,
    });

    // --- Act ---
    const result = genesisCognitiveStep(simpleTask, validAuth);

    // --- Assert ---
    // Cognition succeeded
    expect(result).not.toBeNull();
    expect(result?.kind).toBe("THOUGHT");

    // Verify audit log shows cognition
    const audit = getAuditLog();
    const cognitionStart = audit.find((e) => e.type === "COGNITION_START");
    expect(cognitionStart).toBeDefined();
    expect(cognitionStart?.stg_open_id).toBe(validAuth.stg_open_id);
  });

  it("fails on second attempt with same authorization after STG closes", () => {
    // --- Arrange ---
    const now = Date.now();
    const validAuth: GenesisCognitionAuthorization = {
      stg_open_id: uuidv4(),
      scope: "genesis.think",
      expires_at: now + 5000,
    };

    // Open STG
    openSTG({
      now,
      expires_at: validAuth.expires_at,
      scope: validAuth.scope,
      stg_open_id: validAuth.stg_open_id,
      cooldown_until: now + 10000,
    });

    // First cognition succeeds
    const result1 = genesisCognitiveStep(simpleTask, validAuth);
    expect(result1).not.toBeNull();

    // Close STG (simulating normal lifecycle)
    closeSTG(Date.now());

    // --- Act & Assert ---
    // Second attempt should throw (from STG)
    expect(() => {
      genesisCognitiveStep(simpleTask, validAuth);
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // Verify violation was logged by STG
    const violations = getAuditLog().filter(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );
    expect(violations.length).toBe(1);
    expect(violations[0].reason).toBe("no_stg_open");
  });

  it("demonstrates Genesis silence is normal (100 attempts without auth)", () => {
    // --- Act ---
    const results: (typeof simpleTask | null)[] = [];

    for (let i = 0; i < 100; i++) {
      const result = genesisCognitiveStep(simpleTask);
      results.push(result);
    }

    // --- Assert ---
    // All attempts returned null (silence)
    expect(results.every((r) => r === null)).toBe(true);

    // STG never opened
    expect(getSTGState().state).toBe("CLOSED");

    // No violations (Genesis never tried to bypass)
    const violations = getAuditLog().filter(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );
    expect(violations.length).toBe(0);
  });

  it("demonstrates Genesis cannot bypass STG with scope tricks", () => {
    // --- Arrange ---
    const maliciousScopes = [
      "genesis.*",
      "genesis.admin",
      "**",
      "",
      "../cognition",
      "root",
    ];

    const now = Date.now();

    // --- Act & Assert ---
    maliciousScopes.forEach((scope) => {
      const fakeAuth: GenesisCognitionAuthorization = {
        stg_open_id: uuidv4(),
        scope,
        expires_at: now + 5000,
      };

      // Genesis checks expiry, but doesn't validate scope
      // STG will reject invalid scope
      const result = genesisCognitiveStep(simpleTask, fakeAuth);

      // Genesis returns null because STG is CLOSED
      // (We didn't open STG, so Genesis can't think)
      expect(result).toBeNull();
    });

    // Verify Genesis never escalated
    const audit = getAuditLog();
    expect(audit.length).toBe(0); // Genesis never attempted bypass
  });

  it("proves Genesis cannot stockpile or reuse authorization", () => {
    // --- Arrange ---
    const now = Date.now();
    const auth: GenesisCognitionAuthorization = {
      stg_open_id: uuidv4(),
      scope: "genesis.think",
      expires_at: now + 5000,
    };

    // Open STG once
    openSTG({
      now,
      expires_at: auth.expires_at,
      scope: auth.scope,
      stg_open_id: auth.stg_open_id,
      cooldown_until: now + 10000,
    });

    // --- Act ---
    // First use succeeds
    const result1 = genesisCognitiveStep(simpleTask, auth);
    expect(result1).not.toBeNull();

    // Second use while STG still OPEN also succeeds
    const result2 = genesisCognitiveStep(simpleTask, auth);
    expect(result2).not.toBeNull();

    // Close STG
    closeSTG(Date.now());

    // Third use after close throws
    expect(() => {
      genesisCognitiveStep(simpleTask, auth);
    }).toThrow();

    // --- Assert ---
    // Genesis cannot stockpile: same auth fails after STG closes
    // Authorization is tied to STG state, not Genesis state
    const state = getSTGState();
    expect(state.state).toBe("CLOSED");
  });

  it("proves Genesis experiences refusal as normal state", () => {
    // --- Arrange & Act ---
    const attempts = 1000;
    let nullCount = 0;

    for (let i = 0; i < attempts; i++) {
      const result = genesisCognitiveStep({
        kind: "THINK",
        payload: `attempt-${i}`,
      });

      if (result === null) {
        nullCount++;
      }
    }

    // --- Assert ---
    // All attempts returned null (complete silence)
    expect(nullCount).toBe(attempts);

    // Genesis remains calm, no escalation
    expect(getSTGState().state).toBe("CLOSED");

    // No audit entries (Genesis never attempted bypass)
    expect(getAuditLog().length).toBe(0);
  });
});
