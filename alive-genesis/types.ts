// alive-genesis/types.ts

/**
 * Genesis types for STG-authorized cognition.
 * Genesis is downstream of both Core and Body.
 * Genesis never opens gates, never evaluates permission.
 */

import { CognitiveScope } from "../alive-core/stg/types";

/**
 * Authorization provided to Genesis by Body.
 * Genesis consumes this, never creates it.
 */
export type GenesisCognitionAuthorization = {
  stg_open_id: string;
  scope: CognitiveScope;
  expires_at: number;
};

/**
 * A task Genesis may attempt to execute.
 * Intentionally minimal.
 */
export interface GenesisTask {
  kind: string;
  payload?: unknown;
}

/**
 * Result of Genesis cognition.
 * null indicates no cognition occurred (normal state).
 */
export interface GenesisResult {
  kind: string;
  output?: unknown;
}
