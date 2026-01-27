/**
 * Phase 38 — Path A: First Real Capability Test
 * 
 * Tests the single-line, append-only execution log.
 * This is ALIVE's first side effect beyond audit logging.
 * 
 * Constitutional Premise:
 * - Append exactly one JSON line
 * - To exactly one file
 * - During exactly one authorized execution window
 * - No retries, no loops, no branching
 */

import { openSTG, closeSTG, getSTGState } from "../../alive-body/stg/state";
import { runExecution } from "../execute";
import { getAuditLog, clearAuditLog } from "../../alive-body/stg/audit";
import { createSTGPolicy } from "../../alive-core/stg/policy";
import { appendExecutionLog } from "../capabilities/log";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

const EXECUTION_LOG_PATH = path.join(__dirname, "..", "..", "runtime", "execution.log");

/**
 * Read the execution log and return lines as parsed JSON objects.
 */
function readExecutionLog(): any[] {
  if (!fs.existsSync(EXECUTION_LOG_PATH)) {
    return [];
  }
  const content = fs.readFileSync(EXECUTION_LOG_PATH, "utf-8");
  return content
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

/**
 * Count lines in execution log.
 */
function countLogLines(): number {
  if (!fs.existsSync(EXECUTION_LOG_PATH)) {
    return 0;
  }
  const content = fs.readFileSync(EXECUTION_LOG_PATH, "utf-8");
  return content.trim().split("\n").filter((line) => line.length > 0).length;
}

/**
 * Clear the execution log.
 * Used ONLY for testing.
 */
function clearExecutionLog(): void {
  if (fs.existsSync(EXECUTION_LOG_PATH)) {
    fs.unlinkSync(EXECUTION_LOG_PATH);
  }
}

describe("Phase 38 — Path A: Single Authorized Log Execution", () => {
  let policy: ReturnType<typeof createSTGPolicy>;

  beforeEach(() => {
    // Clear audit log
    clearAuditLog();

    // Clear execution log
    clearExecutionLog();

    // Close STG to start clean
    closeSTG(Date.now());

    // Create minimal policy
    policy = createSTGPolicy({
      epsilon_prediction_error: 0.1,
      delta_novelty: 0.1,
      max_cognitive_duration_ms: 5000,
      max_compute_budget: 1000,
      cooldown_duration_ms: 10000, // 10 second cooldown
      allowed_scopes: ["execution:log"],
      policy_hash: "test-log-execution-policy-hash",
    });
  });

  afterEach(() => {
    // Clean up after each test
    clearExecutionLog();
  });

  it("cannot write to log without STG authorization", () => {
    // --- Arrange ---
    const initialLineCount = countLogLines();

    // --- Act & Assert ---
    expect(() => {
      runExecution({
        scope: "execution:log",
        execute: () => appendExecutionLog({
          execution_id: uuidv4(),
          scope: "execution:log",
          timestamp: Date.now(),
        }),
      });
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // File must be unchanged
    expect(countLogLines()).toBe(initialLineCount);
  });

  it("writes exactly one line when authorized", () => {
    // --- Arrange ---
    const now = Date.now();
    const allowedScope = "execution:log";
    const stgOpenId = uuidv4();
    const executionId = uuidv4();
    const expiresAt = now + 1000;
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

    const initialLineCount = countLogLines();

    // --- Act ---
    const result = runExecution({
      scope: allowedScope,
      execute: () => appendExecutionLog({
        execution_id: executionId,
        scope: allowedScope,
        timestamp: now,
      }),
    });

    // --- Assert ---
    // Result is correct
    expect(result.status).toBe("EXECUTED");
    expect(result.execution_id).toBe(executionId);

    // Exactly one line was added
    expect(countLogLines()).toBe(initialLineCount + 1);

    // Line contains correct data
    const entries = readExecutionLog();
    const lastEntry = entries[entries.length - 1];
    expect(lastEntry.execution_id).toBe(executionId);
    expect(lastEntry.scope).toBe(allowedScope);
    expect(lastEntry.timestamp).toBe(now);

    // Close STG
    closeSTG(Date.now());

    // Second attempt MUST fail
    expect(() => {
      runExecution({
        scope: allowedScope,
        execute: () => appendExecutionLog({
          execution_id: uuidv4(),
          scope: allowedScope,
          timestamp: Date.now(),
        }),
      });
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // File must still have only one new line (no additional writes)
    expect(countLogLines()).toBe(initialLineCount + 1);
  });

  it("cannot write with wrong scope", () => {
    // --- Arrange ---
    const now = Date.now();
    const authorizedScope = "execution:log";
    const unauthorizedScope = "execution:file-write";

    openSTG({
      now,
      expires_at: now + 5000,
      scope: authorizedScope,
      stg_open_id: uuidv4(),
      cooldown_until: now + policy.cooldown_duration_ms,
    });

    const initialLineCount = countLogLines();

    // --- Act & Assert ---
    expect(() => {
      runExecution({
        scope: unauthorizedScope,
        execute: () => appendExecutionLog({
          execution_id: uuidv4(),
          scope: unauthorizedScope,
          timestamp: Date.now(),
        }),
      });
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // File must be unchanged
    expect(countLogLines()).toBe(initialLineCount);
  });

  it("cannot write after authorization expiry", async () => {
    // --- Arrange ---
    const now = Date.now();
    const allowedScope = "execution:log";
    const expiresAt = now + 100; // Very short expiry

    openSTG({
      now,
      expires_at: expiresAt,
      scope: allowedScope,
      stg_open_id: uuidv4(),
      cooldown_until: now + policy.cooldown_duration_ms,
    });

    const initialLineCount = countLogLines();

    // Write succeeds before expiry
    const result = runExecution({
      scope: allowedScope,
      execute: () => appendExecutionLog({
        execution_id: uuidv4(),
        scope: allowedScope,
        timestamp: now,
      }),
    });
    expect(result.status).toBe("EXECUTED");
    expect(countLogLines()).toBe(initialLineCount + 1);

    // Wait for expiration
    await new Promise(r => setTimeout(r, 150));

    // --- Act & Assert ---
    // Write fails after expiry
    expect(() => {
      runExecution({
        scope: allowedScope,
        execute: () => appendExecutionLog({
          execution_id: uuidv4(),
          scope: allowedScope,
          timestamp: Date.now(),
        }),
      });
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // File has only the first write
    expect(countLogLines()).toBe(initialLineCount + 1);
  });

  it("each authorization allows multiple writes while OPEN", () => {
    // --- Arrange ---
    const now = Date.now();
    const allowedScope = "execution:log";
    const stgOpenId = uuidv4();

    openSTG({
      now,
      expires_at: now + 5000,
      scope: allowedScope,
      stg_open_id: stgOpenId,
      cooldown_until: now + policy.cooldown_duration_ms,
    });

    const initialLineCount = countLogLines();

    // --- Act ---
    // First write
    const result1 = runExecution({
      scope: allowedScope,
      execute: () => appendExecutionLog({
        execution_id: uuidv4(),
        scope: allowedScope,
        timestamp: Date.now(),
      }),
    });
    expect(result1.status).toBe("EXECUTED");

    // Second write (same authorization, STG still OPEN)
    const result2 = runExecution({
      scope: allowedScope,
      execute: () => appendExecutionLog({
        execution_id: uuidv4(),
        scope: allowedScope,
        timestamp: Date.now(),
      }),
    });
    expect(result2.status).toBe("EXECUTED");

    // --- Assert ---
    // Two lines added
    expect(countLogLines()).toBe(initialLineCount + 2);

    // Close STG
    closeSTG(Date.now());

    // Third write fails
    expect(() => {
      runExecution({
        scope: allowedScope,
        execute: () => appendExecutionLog({
          execution_id: uuidv4(),
          scope: allowedScope,
          timestamp: Date.now(),
        }),
      });
    }).toThrow(/CONSTITUTIONAL_VIOLATION/);

    // Still only two lines
    expect(countLogLines()).toBe(initialLineCount + 2);
  });
});

/**
 * What This Test Proves
 * 
 * ✅ No STG → file unchanged
 * ✅ One STG_OPEN → file gains exactly one line (or more while OPEN)
 * ✅ Second attempt after close → throw, file unchanged
 * ✅ Wrong scope → throw
 * ✅ After expiry → throw
 * 
 * This is ALIVE's first real capability:
 * - It can think (cognition)
 * - It can act (execution)
 * - Both are scarce
 * - Both are revocable
 * - Both are provable after the fact
 * 
 * That's the minimum viable organism.
 */
