// observation/genesisStream.ts

/**
 * Genesis Output Channel (Read-Only Telemetry)
 * 
 * Constitutional Contract:
 * - Genesis output is opaque text
 * - No parsing
 * - No classification
 * - No branching
 * - No filtering
 * - No mutation
 * - No intent inference
 * 
 * This is telemetry, not integration.
 */

export type GenesisUtterance = {
  readonly source: "genesis";
  readonly text: string;
  readonly timestamp: number;
};

/**
 * Emit a Genesis utterance as opaque text.
 * 
 * This function:
 * - Does NOT parse the text
 * - Does NOT extract meaning
 * - Does NOT classify intent
 * - Does NOT trigger cognition
 * - Does NOT trigger execution
 * 
 * It simply wraps text in a typed envelope.
 * 
 * @param text - Raw Genesis output (untrusted)
 * @returns Typed utterance object (still untrusted)
 */
export function emitGenesisUtterance(text: string): GenesisUtterance {
  return {
    source: "genesis",
    text,
    timestamp: Date.now(),
  };
}

/**
 * PROHIBITIONS (DO NOT ADD):
 * 
 * ❌ if (text.includes("execute")) ...
 * ❌ if (text.match(/command|action|do/)) ...
 * ❌ const intent = classifyIntent(text);
 * ❌ return parseGenesisOutput(text);
 * ❌ triggerCognitionFor(text);
 * ❌ extractMeaningFrom(text);
 * 
 * Genesis output is untrusted text.
 * Treat it like a log file entry.
 * Display it.
 * Do not reason about it.
 */
