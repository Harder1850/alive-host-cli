import hostConfig from "./host.config.js";
import readline from "node:readline";
import { startBody } from "../alive-body/index.js";

const mode = hostConfig?.mode ?? "demo";
console.log(`[host] alive-host-cli starting (${mode} mode)`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.once("line", async (input) => {
  const observation = {
    type: "host.stdin",
    payload: input,
    timestamp: new Date().toISOString()
  };

  // Host treats the Body as a black box.
  // One observation in, one finite lifecycle run, then exit.
  try {
    await startBody({ observation });
    console.log("[host] demo complete — exiting cleanly");
    rl.close();
  } catch (err) {
    console.error(err);
    rl.close();
    process.exit(1);
  }
});

rl.once("close", () => {
  process.exit(0);
});
