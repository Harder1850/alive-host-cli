import hostConfig from "./host.config.js";
import readline from "node:readline";
import { consultBody } from "./bodyClient.js";

const mode = hostConfig?.mode ?? "demo";
console.log(`[host] alive-host-cli starting (${mode} mode)`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.once("line", async (input) => {
  try {
    const response = await consultBody(input);
    console.log(JSON.stringify(response, null, 2));
    console.log("[host] consult complete — exiting cleanly");
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
