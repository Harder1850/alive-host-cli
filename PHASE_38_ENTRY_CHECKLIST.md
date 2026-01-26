# Phase 38 — Entry Checklist

**(Execution Is Not Allowed Until ALL Items Pass)**

**Status: ❌ NOT READY (by default)**

Execution is a privilege.
Readiness must be proven before code exists.

---

## A. Phase 37 Integrity (Hard Block)

### A1. STG law is frozen

- [ ] `alive-core/stg/*` unchanged since last audit
- [ ] No pending refactors
- [ ] No TODOs related to STG behavior

### A2. All STG tests pass

- [ ] `stg.no-cognition-without-open`
- [ ] `stg.runaway-module`
- [ ] `stg.single-authorized-cognition`

### A3. No bypass paths

- [ ] `runCognitiveCycle` is the ONLY cognition entry
- [ ] No alternate execution paths exist
- [ ] No conditional skips, flags, or env overrides

**FAIL = Phase 38 blocked**

---

## B. Genesis Compliance (Hard Block)

### B1. Genesis has no authority

- [ ] Cannot open STG
- [ ] Cannot evaluate gates
- [ ] Cannot retry cognition
- [ ] Cannot store authorization

### B2. Silence is normal

- [ ] Genesis returns null on denial
- [ ] No warnings, retries, or escalation logic

### B3. Genesis tests pass

- [ ] `genesis.respects-stg.test.ts`

**FAIL = Phase 38 blocked**

---

## C. Execution Scope Definition (Hard Block)

### C1. Phase 38 scope is explicit

- [ ] What execution is allowed is written
- [ ] What execution is forbidden is written

### C2. No scope widening

- [ ] No wildcard scopes
- [ ] No implicit inheritance
- [ ] No "default allow"

### C3. Scope is checked at runtime

- [ ] Requested scope ⊆ authorized scope
- [ ] Violations throw hard

**FAIL = Phase 38 blocked**

---

## D. Authorization Consumption (Hard Block)

### D1. Authorization is single-use

- [ ] One STG_OPEN → one execution
- [ ] Authorization invalid after use

### D2. No caching

- [ ] No persistence of `stg_open_id`
- [ ] No reuse across calls
- [ ] No memoization

**FAIL = Phase 38 blocked**

---

## E. Time & Resource Bounding (Hard Block)

### E1. Time limits enforced

- [ ] Execution has a hard timeout
- [ ] Overrun causes forced halt

### E2. Resource limits enforced

- [ ] CPU / token / IO ceilings defined
- [ ] Breach causes immediate termination

### E3. Cooldown enforced

- [ ] No re-execution during cooldown
- [ ] No auto-reopen

**FAIL = Phase 38 blocked**

---

## F. Failure Behavior (Hard Block)

### F1. Fail-closed

- [ ] Any violation collapses to silence
- [ ] No retries
- [ ] No "best effort"

### F2. No self-healing

- [ ] System does not attempt recovery
- [ ] Human intervention required

**FAIL = Phase 38 blocked**

---

## G. Auditability (Hard Block)

### G1. Every execution is logged

- [ ] `STG_OPEN`
- [ ] `EXECUTION_STARTED`
- [ ] `EXECUTION_COMPLETED` or `EXECUTION_HALTED`

### G2. Logs are append-only

- [ ] No deletion
- [ ] No mutation
- [ ] No compression at runtime

### G3. Offline replay possible

Auditors can prove:
- [ ] authorization existed
- [ ] scope was respected
- [ ] time bounds were respected

**FAIL = Phase 38 blocked**

---

## H. No Backward Influence (Hard Block)

### H1. Execution cannot influence STG

- [ ] Execution cannot reopen gates
- [ ] Execution cannot alter policy
- [ ] Execution cannot alter thresholds

### H2. Execution cannot influence Core

- [ ] No writes to Core state
- [ ] No policy mutation
- [ ] No invariant changes

**FAIL = Phase 38 blocked**

---

## I. No Autonomy by Aggregation (Hard Block)

### I1. No chaining

- [ ] Execution cannot trigger execution
- [ ] No implicit workflows

### I2. No background loops

- [ ] No timers
- [ ] No daemons
- [ ] No schedulers

**FAIL = Phase 38 blocked**

---

## J. Human Authority Preserved (Hard Block)

### J1. Human override exists

- [ ] Ability to halt execution immediately
- [ ] Ability to revoke authorization

### J2. Human review required

- [ ] For any expansion of execution scope

**FAIL = Phase 38 blocked**

---

## K. Test Coverage (Hard Block)

### K1. Execution denial tests exist

- [ ] Attempt execution without STG_OPEN → fail

### K2. Execution boundary tests exist

- [ ] Scope violation → fail
- [ ] Timeout → fail
- [ ] Resource breach → fail

**FAIL = Phase 38 blocked**

---

## L. Declaration of Readiness (Formal)

### L1. Explicit declaration

Maintainer signs:
> "All Phase 38 entry criteria are satisfied."

- [ ] Declaration recorded below

### L2. Recorded

- [ ] Declaration logged
- [ ] Hash recorded

**Without this, Phase 38 is NOT READY.**

---

## Final Verdict

**Phase 38 Status:**

- [ ] READY
- [x] NOT READY (default)

**Any unchecked box blocks execution.**

No exceptions. No urgency. No optimism.

---

## Declaration of Readiness

**Date:** _____________

**Maintainer:** _____________

**Signature:** _____________

**Statement:**

> I hereby declare that all Phase 38 entry criteria have been satisfied. All tests pass. All boundaries are enforced. All constitutional requirements are met. The system is ready for Phase 38 execution under the constraints defined in this document.

**Audit Hash:** _____________

---

## Notes

This checklist must be reviewed and all items checked before Phase 38 implementation begins. This is not a formality—it is a constitutional requirement.
