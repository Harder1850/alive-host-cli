import hostConfig from "./host.config.js";
import readline from "node:readline";

const mode = hostConfig?.mode ?? "demo";
console.log(`[host] alive-host-cli starting (${mode} mode)`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.once("line", (line) => {
  const observation = {
    observedAt: new Date().toISOString(),
    input: line
  };

  process.stdout.write(`${JSON.stringify(observation)}\n`);
  console.log("[host] demo complete — exiting cleanly");
  rl.close();
});

rl.once("close", () => {
  process.exit(0);
});
