// alive-genesis/cognitive.ts

/**
 * Genesis cognitive entry point.
 * This is the ONLY way Genesis performs cognition.
 * 
 * Genesis never opens gates.
 * Genesis never evaluates permission.
 * Genesis only consumes valid authorization or does nothing.
 * 
 * Silence is normal. Refusal is expected.
 */

import { runCognitiveCycle } from "../alive-body/stg/gate";
import {
  GenesisCognitionAuthorization,
  GenesisTask,
  GenesisResult,
} from "./types";

/**
 * Genesis cognitive step.
 * 
 * Rules:
 * - auth is required to think
 * - auth missing → return null
 * - auth expired → return null
 * - No throw (STG throws, Genesis doesn't catch)
 * - No retry
 * - No logging (Body already logs)
 * 
 * Silence is success.
 */
export function genesisCognitiveStep(
  task: GenesisTask,
  auth?: GenesisCognitionAuthorization,
): GenesisResult | null {
  // 1. Authorization missing → no cognition
  if (!auth) {
    return null;
  }

  // 2. Authorization expired → cognition window closed
  if (Date.now() > auth.expires_at) {
    return null;
  }

  // 3. Authorized cognition (exactly one cycle)
  // Genesis does not wrap this.
  // Genesis does not catch violations.
  // Genesis does not retry.
  // If STG throws → Genesis dies silently (caller handles).
  return runCognitiveCycle(
    () => performGenesisTask(task),
    auth.scope,
  );
}

/**
 * Perform the actual Genesis task.
 * This is where Genesis cognition logic lives.
 * 
 * This function is wrapped by STG enforcement via runCognitiveCycle.
 */
function performGenesisTask(task: GenesisTask): GenesisResult {
  // Placeholder implementation
  // Real Genesis logic would go here
  
  switch (task.kind) {
    case "THINK":
      return {
        kind: "THOUGHT",
        output: `Genesis processed task: ${task.kind}`,
      };

    case "REFLECT":
      return {
        kind: "REFLECTION",
        output: task.payload,
      };

    case "ANALYZE":
      return {
        kind: "ANALYSIS",
        output: {
          task_kind: task.kind,
          analyzed_at: Date.now(),
          payload: task.payload,
        },
      };

    default:
      return {
        kind: "UNKNOWN",
        output: `Unknown task kind: ${task.kind}`,
      };
  }
}
