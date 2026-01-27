// phase-38-execution/capabilities/log.ts

/**
 * Path A — First Real Capability
 * 
 * Single-line, append-only execution log.
 * 
 * This is ALIVE's first side effect beyond audit logging.
 * 
 * Constitutional Contract:
 * - Append exactly one JSON line
 * - To exactly one file
 * - In exactly one location
 * - During exactly one authorized execution window
 * 
 * Forbidden:
 * - Creating new files
 * - Writing multiple lines
 * - Reading from the file
 * - Parsing prior entries
 * - Retrying on failure
 * - Writing anywhere else
 * - Branching
 * - Looping
 */

import * as fs from "fs";
import * as path from "path";

export interface ExecutionLogEntry {
  execution_id: string;
  scope: string;
  timestamp: number;
}

export interface ExecutionResult {
  status: "EXECUTED";
  execution_id: string;
}

/**
 * Append exactly one line to the execution log.
 * 
 * This function:
 * - does not branch
 * - does not loop
 * - does not read
 * - does not retry
 * - does not decide
 * 
 * It just acts once.
 * 
 * @param entry - The log entry to append
 * @returns Execution result with status
 */
export function appendExecutionLog(entry: ExecutionLogEntry): ExecutionResult {
  const logPath = path.join(__dirname, "..", "..", "runtime", "execution.log");
  
  fs.appendFileSync(
    logPath,
    JSON.stringify(entry) + "\n",
    { encoding: "utf-8" }
  );

  return {
    status: "EXECUTED",
    execution_id: entry.execution_id,
  };
}
