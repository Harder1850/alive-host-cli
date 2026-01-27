# Observation Boundary

## Purpose

This directory provides **read-only telemetry** for visual demonstration purposes.

It is NOT integration. It is NOT a feedback loop. It is display-only.

## Constitutional Law

**This directory is READ ONLY.**

Genesis output is opaque text.  
ALIVE state is read-only telemetry.

## Strict Prohibitions

No code in this directory may:

- ❌ Trigger cognition
- ❌ Infer intent
- ❌ Open STG gates
- ❌ Invoke execution
- ❌ Mutate state
- ❌ Parse Genesis output for meaning
- ❌ Classify text
- ❌ Extract commands
- ❌ "Helpfully" respond
- ❌ Feed text back to ALIVE

## Architectural Principle

```
User
  ↕
Genesis Sandbox (free conversation)
  ↓  (TEXT ONLY - one direction)
alive-host-cli/observation (display layer)
  ↓  (READ ONLY - one direction)
ALIVE Audit State (STG status, last events)
```

**No arrows ever point back up.**

## What This Demonstrates

This observation bridge proves:

- **Thought ≠ action** - Genesis can speak freely, nothing happens
- **Speech ≠ intent** - Text is not parsed or classified
- **Intelligence ≠ authority** - ALIVE does not "get excited" by words
- **Safety is structural** - Containment is architectural, not behavioral

## Modules

### genesisStream.ts

Wraps Genesis output as opaque text.

**Does:**
- Emit utterances with timestamp
- Type the data

**Does NOT:**
- Parse text
- Extract meaning
- Classify intent
- Trigger anything

### aliveSnapshot.ts

Reads ALIVE audit state.

**Does:**
- Read STG state
- Read recent audit events
- Return pure data

**Does NOT:**
- Trigger cognition
- Open/close gates
- Execute anything
- Mutate anything
- "Refresh" or "update"

## Import Rules

**Allowed imports:**
- `../alive-body/stg/state` (read-only getters)
- `../alive-body/stg/audit` (read-only getters)

**Prohibited imports:**
- ❌ `../alive-core/*` (Core is not involved)
- ❌ `../alive-system/*` (System is not involved)
- ❌ `../phase-38-execution/*` (Execution is not involved)
- ❌ Any mutation functions
- ❌ Any trigger functions

If you need to import something else, you are doing it wrong.

## Testing

To verify this boundary is respected:

```bash
# No feedback paths should exist
grep -r "runCognitiveCycle" observation/
grep -r "runExecution" observation/
grep -r "openSTG" observation/
grep -r "closeSTG" observation/

# Should return nothing
```

## Demo Usage

See: `demo/observation-bridge-demo.js`

This script demonstrates:
1. Genesis speaking freely
2. ALIVE remaining silent
3. Visual proof of containment

## Stop Conditions

**DO NOT add:**
- Intent inference
- Sentiment analysis
- Keyword detection
- Command parsing
- "Just temporary" reasoning
- "Phase 39 preview" features

Those require constitutional amendments.

This is Phase 38. Stay in bounds.

---

**Observation Boundary Status: ENFORCED**  
**Feedback Paths: ZERO**  
**Authority Granted: NONE**
