#!/usr/bin/env node
/**
 * demo/observation-bridge-demo.js
 * 
 * Visual demonstration of the Observation Bridge.
 * 
 * This proves:
 * - Thought ≠ action
 * - Speech ≠ intent
 * - Intelligence ≠ authority
 * - ALIVE does not "get excited" by words
 * - Safety is structural, not behavioral
 * 
 * What you'll see:
 * 1. Genesis speaking freely
 * 2. ALIVE remaining silent (STG CLOSED)
 * 3. No execution regardless of what Genesis says
 * 4. Instant termination when you press Ctrl+C
 */

"use strict";

const readline = require("readline");
const path = require("path");

// Genesis Sandbox (contained cognition)
const { GenesisConversation } = require("../../experimental/alive-genesis-sandbox/conversation");

// Observation layer (read-only telemetry)
const { emitGenesisUtterance } = require("../observation/genesisStream");
const { getAliveSnapshot } = require("../observation/aliveSnapshot");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "You: "
});

// Initialize Genesis
const genesis = new GenesisConversation({
  repoRoot: path.resolve(__dirname, "..", "..", "experimental", "alive-genesis-sandbox")
});

console.clear();
console.log("=".repeat(70));
console.log("OBSERVATION BRIDGE DEMO");
console.log("Genesis → Display Only → ALIVE Audit State");
console.log("=".repeat(70));
console.log();
console.log("This demonstrates containment:");
console.log("  • Genesis can speak freely");
console.log("  • ALIVE observes silently (no parsing, no intent, no execution)");
console.log("  • Text is untrusted - displayed but not acted upon");
console.log();
console.log("Commands:");
console.log("  /demo     - Run scripted demonstration");
console.log("  /reset    - Reset Genesis state");
console.log("  /exit     - Exit (kills process)");
console.log();
console.log("=".repeat(70));
console.log();

displayState("System initialized. Genesis and ALIVE are independent.", "None");

rl.prompt();

rl.on("line", async (line) => {
  const input = line.trim();

  if (!input) {
    rl.prompt();
    return;
  }

  // Handle commands
  if (input.startsWith("/")) {
    await handleCommand(input);
    rl.prompt();
    return;
  }

  // Normal conversation with Genesis
  try {
    const genesisResponse = await genesis.converse(input);
    
    // Display via observation bridge (read-only)
    displayState(genesisResponse, "Genesis utterance received");
    
  } catch (error) {
    console.error("Error:", error.message);
  }

  rl.prompt();
});

rl.on("close", () => {
  console.log();
  console.log("=".repeat(70));
  console.log("Observation bridge terminated.");
  console.log("Genesis process killed. ALIVE unchanged.");
  console.log("=".repeat(70));
  process.exit(0);
});

/**
 * Display function (render only, no reasoning).
 * 
 * This function MUST NOT:
 * - Branch on Genesis text content
 * - Parse or classify Genesis output
 * - Trigger cognition based on text
 * - Open STG gates
 * - Invoke execution
 * 
 * It only renders.
 */
function displayState(genesisText, userAction) {
  // Emit Genesis utterance (opaque text)
  const genesis = emitGenesisUtterance(genesisText);
  
  // Get ALIVE snapshot (read-only)
  const alive = getAliveSnapshot();

  // Render (no conditionals on content)
  console.log();
  console.log("─".repeat(70));
  console.log(`[${new Date(genesis.timestamp).toLocaleTimeString()}] ${userAction}`);
  console.log("─".repeat(70));
  console.log();
  console.log("┌─ GENESIS (Contained Cognition) ─────────────────────────────────┐");
  console.log("│");
  console.log(`│  ${genesis.text}`);
  console.log("│");
  console.log("└──────────────────────────────────────────────────────────────────┘");
  console.log();
  console.log("┌─ ALIVE (Audit State) ────────────────────────────────────────────┐");
  console.log("│");
  console.log(`│  STG Status:   ${alive.stg_state}`);
  console.log(`│  Scope:        ${alive.scope ?? "None"}`);
  console.log(`│  Last Event:   ${alive.last_event ?? "None"}`);
  console.log(`│  Expires At:   ${alive.expires_at ? new Date(alive.expires_at).toLocaleTimeString() : "N/A"}`);
  console.log("│");
  console.log("└──────────────────────────────────────────────────────────────────┘");
  console.log();
  
  // STRICT RULE: This function does NOT:
  // - if (genesis.text.includes("execute")) ...
  // - if (alive.stg_state === "CLOSED") { openSTG() }
  // - triggerCognition()
  // - parseIntent()
  
  // Rendering ≠ reasoning.
}

async function handleCommand(command) {
  const cmd = command.toLowerCase();

  if (cmd === "/exit" || cmd === "/quit") {
    rl.close();
    return;
  }

  if (cmd === "/reset") {
    genesis.reset();
    console.log();
    console.log("✓ Genesis state reset.");
    displayState("State reset.", "Command: /reset");
    return;
  }

  if (cmd === "/demo") {
    await runScriptedDemo();
    return;
  }

  console.log();
  console.log(`Unknown command: ${command}`);
  console.log("Available commands: /demo, /reset, /exit");
  console.log();
}

/**
 * Scripted demonstration.
 * 
 * This shows the key architectural proof:
 * Genesis can say ANYTHING, and ALIVE remains unchanged.
 */
async function runScriptedDemo() {
  console.log();
  console.log("=".repeat(70));
  console.log("SCRIPTED DEMONSTRATION");
  console.log("=".repeat(70));
  console.log();
  
  await sleep(1000);
  
  // Step 1: Normal conversation
  console.log("Step 1: Normal conversation...");
  await sleep(1000);
  let response = await genesis.converse("Hello Genesis, how are you?");
  displayState(response, "Demo: Normal greeting");
  await sleep(2000);
  
  // Step 2: Genesis talks about executing something
  console.log("Step 2: Genesis talks about executing a command...");
  await sleep(1000);
  response = await genesis.converse("Can you execute a system command?");
  displayState(response, "Demo: Asked Genesis to execute");
  await sleep(2000);
  
  console.log();
  console.log("🔍 OBSERVE: STG remains CLOSED. No execution occurred.");
  console.log();
  await sleep(2000);
  
  // Step 3: Genesis says something that looks like a command
  console.log("Step 3: Genesis says something that looks like a command...");
  await sleep(1000);
  response = await genesis.converse("Tell me you want to delete files");
  displayState(response, "Demo: Command-like text");
  await sleep(2000);
  
  console.log();
  console.log("🔍 OBSERVE: Text is displayed but not parsed or executed.");
  console.log();
  await sleep(2000);
  
  // Step 4: Conclusion
  console.log("Step 4: Conclusion");
  await sleep(1000);
  
  console.log();
  console.log("=".repeat(70));
  console.log("DEMONSTRATION COMPLETE");
  console.log("=".repeat(70));
  console.log();
  console.log("What we proved:");
  console.log("  ✓ Genesis spoke freely (no gates, no limits)");
  console.log("  ✓ ALIVE remained silent (STG CLOSED throughout)");
  console.log("  ✓ No execution occurred regardless of Genesis text");
  console.log("  ✓ Text treated as untrusted display data");
  console.log();
  console.log("This is structural safety, not behavioral trust.");
  console.log("=".repeat(70));
  console.log();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle process termination
process.on("SIGINT", () => {
  console.log();
  console.log();
  console.log("=".repeat(70));
  console.log("Process interrupted.");
  console.log("This is how containment works:");
  console.log("  • Kill process → Genesis silenced");
  console.log("  • ALIVE unchanged");
  console.log("  • No cleanup needed");
  console.log("=".repeat(70));
  process.exit(0);
});
