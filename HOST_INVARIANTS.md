#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#+#############
# HOST INVARIANTS

This package is a host interface only.

FORBIDDEN:
- Importing alive-core, alive-body, alive-genesis
- Executing actions
- Writing memory
- Accessing runtime state directly

ALLOWED:
- Sending requests to alive-system
- Displaying responses
- Displaying telemetry
