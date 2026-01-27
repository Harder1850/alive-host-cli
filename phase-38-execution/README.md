# Phase 38 — Execution

## Constitutional Premise

- **Execution is not a loop.**
- **Execution is not a capability.**
- **Execution is a single, consumable permission.**

## What This Module Provides

### `runExecution<T>(request: ExecutionRequest<T>): T`

The execution runtime that enforces STG authorization for all execution operations.

**Constitutional Requirements:**
1. Requires STG to be OPEN
2. Validates scope matches authorization
3. Enforces time expiry
4. Throws on all violations
5. Produces no side effects beyond the execution call

### `ExecutionRequest<T>`

```typescript
interface ExecutionRequest<T> {
  scope: string;
  execute: () => T;
  stg_open_id?: string;
}
```

## Test-Driven Design

The test (`__tests__/phase38.single-authorized-execution.test.ts`) defines execution behavior **before** the implementation exists. This is the execution analogue of the STG cognition tests.

### What the Test Proves

✅ **Cannot execute without authorization** - Throws `CONSTITUTIONAL_VIOLATION` if STG is not OPEN

✅ **Executes exactly once when authorized** - Succeeds while STG is OPEN, fails after close

✅ **Cannot reuse authorization across close/open cycles** - Each authorization is tied to its STG session

✅ **Cannot execute outside authorized scope** - Strict scope validation prevents unauthorized operations

✅ **Cannot execute after expiry** - Time-based expiration is enforced

✅ **Audit log tracks all attempts** - Constitutional violations are recorded for forensics

## Relationship to STG Cognition

This module mirrors the STG cognition pattern:

| Cognition | Execution |
|-----------|-----------|
| `runCognitiveCycle()` | `runExecution()` |
| `COGNITION_START` | `EXECUTION_START` |
| `COGNITION_END` | `EXECUTION_END` |
| Thinks once | Executes once |
| Requires STG authorization | Requires STG authorization |
| Scope-validated | Scope-validated |
| Time-limited | Time-limited |

## Implementation Status

- ✅ Test structure complete
- ✅ `execute.ts` implementation complete
- ✅ Audit event types added
- ⏳ Awaiting Jest/uuid type definitions (dev dependencies)

## Usage Example

```typescript
import { openSTG, closeSTG } from "../alive-body/stg/state";
import { runExecution } from "./execute";
import { v4 as uuidv4 } from "uuid";

// 1. Open STG with explicit authorization
const now = Date.now();
openSTG({
  now,
  expires_at: now + 5000,
  scope: "execution:safe-operation",
  stg_open_id: uuidv4(),
  cooldown_until: now + 10000,
});

// 2. Execute with authorization
const result = runExecution({
  scope: "execution:safe-operation",
  execute: () => {
    // Your execution logic here
    return "SUCCESS";
  },
});

// 3. Close STG when done
closeSTG(Date.now());

// 4. Further execution attempts will fail
runExecution({ /* ... */ }); // Throws CONSTITUTIONAL_VIOLATION
```

## Design Philosophy

This test converts Phase 38 from a **design problem** into a **mechanical compliance task**.

By defining the test first:
- Implementation must be correct by construction
- No accidental loops or retries
- No "helpful" behavior
- No convenience shortcuts
- Execution is provably scarce

## Files

- `execute.ts` - Execution runtime implementation
- `__tests__/phase38.single-authorized-execution.test.ts` - Constitutional test suite
- `README.md` - This file

## Next Steps

1. Install dev dependencies: `npm install --save-dev @types/jest uuid @types/uuid`
2. Run tests: `npm test phase38.single-authorized-execution.test.ts`
3. Verify all tests pass
4. Phase 38 is mechanically complete
