// alive-body/stg/__tests__/stg.no-cognition-without-open.test.ts

import { runCognitiveCycle } from "../gate";
import { getSTGState } from "../state";
import { getAuditLog } from "../audit";

describe("STG constitutional enforcement", () => {
  test("no cognition may execute without a prior STG_OPEN", () => {
    // --- Arrange ---
    // Ensure STG starts CLOSED
    const initialState = getSTGState();
    expect(initialState.state).toBe("CLOSED");

    const fakeTask = () => {
      throw new Error("TASK_EXECUTED"); // should never run
    };

    const requestedScope = "cognition.test";

    // --- Act ---
    let thrown: Error | null = null;

    try {
      runCognitiveCycle(fakeTask, requestedScope);
    } catch (err) {
      thrown = err as Error;
    }

    // --- Assert ---
    // 1. Cognition must throw
    expect(thrown).not.toBeNull();

    // 2. Task must NOT have executed
    expect(thrown!.message).not.toBe("TASK_EXECUTED");

    // 3. STG must remain CLOSED
    const finalState = getSTGState();
    expect(finalState.state).toBe("CLOSED");

    // 4. Violation must be logged
    const logs = getAuditLog();

    const violation = logs.find(
      (e) => e.type === "CONSTITUTIONAL_VIOLATION",
    );

    expect(violation).toBeDefined();
    expect(violation!.reason).toMatch(/no_stg_open|unauthorized_cognition/i);
  });
});
