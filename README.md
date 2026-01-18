# alive-host-cli

**A sandboxed host environment for the ALIVE Virtual Body.**  
Handles I/O, internet access, and LLM calls **without cognition or decision authority**.

---

## What This Is

`alive-host-cli` is a **host**—not an AI.

It provides a controlled environment where the **ALIVE Virtual Body** can:
- observe user input,
- observe external systems (e.g., LLM responses, web content),
- log experience,
- consult the ALIVE Brain **without granting execution authority**.

This repository exists to **accelerate safe experimentation and demos** while keeping the Brain clean, frozen, and auditable.

---

## What This Is NOT

This repository is **not**:

- an agent framework  
- a chatbot  
- an autonomous system  
- a planner or executor  
- a replacement for `alive-core`  

It **does not**:
- make decisions,
- act on the world,
- store identity,
- bypass the Body's firewall,
- or grant power to the Brain.

If you're looking for automation or agents, this is intentionally the wrong place.

---

## Architecture at a Glance

```
User / Internet / LLMs
│
▼
alive-host-cli
│ (raw observations only)
▼
ALIVE Body
│ (logged experience + consultation)
▼
ALIVE Core
(identity, law, explanation)
```

**Key rule:**  
The Host may *observe* and *ask*.  
The Brain may *explain*.  
Only explicitly authorized systems may *act*—and none exist here.

---

## Relationship to Other Repositories

- **alive-core** (public, frozen)  
  The constitutional cognitive core: identity, continuity, arbitration, explanation.  
  **No execution. No experimentation.**

- **alive-body** (library / module)  
  The Virtual Body: senses, nervous system, lifecycle, firewall.  
  **Perception without cognition.**

- **alive-host-cli** (this repo)  
  The sandbox: I/O, LLMs, internet, demos, experiments.  
  **Fast, replaceable, and safe to break.**

---

## Current Capabilities (v0)

- Read user input from stdin
- Optionally fetch external content (e.g., LLM output)
- Emit **raw observation events** to the Body
- Trigger a single, finite Body lifecycle (demo-safe)
- Exit cleanly

No loops.  
No memory.  
No autonomy.

---

## Why This Exists

Most AI systems collapse safety boundaries by mixing:
- perception,
- memory,
- reasoning,
- and execution.

`alive-host-cli` exists to **keep those concerns separate**.

It lets us:
- test ALIVE in real environments,
- observe behavior safely,
- run demos,
- and iterate quickly—

**without ever contaminating the Brain.**

---

## Design Principles

- **Separation of powers**
- **No hidden authority**
- **Finite, observable runs**
- **Auditability over convenience**
- **Replaceability over permanence**

If the host fails, it can be thrown away.  
The Brain must never be.

---

## Getting Started (Minimal)

```bash
npm install
node index.js
```

Follow on-screen prompts.  
Expect the system to observe once and exit.

That behavior is intentional.

---

## Contributing

Contributions are welcome within scope.

Please do not submit PRs that:

- add autonomous behavior,
- bypass the Body firewall,
- introduce execution authority,
- or attempt to modify alive-core behavior.

When in doubt, open an issue first.

---

## License

License will be defined as the Host matures.  
This repository may eventually use different terms than alive-core.

---

## Final Note

This repository is where experimentation lives.

The Brain stays frozen.  
The Body stays safe.  
The Host gets to move fast.

That's the whole point.
