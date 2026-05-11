---
name: Istanbul ignore for env config and require.main
description: process.env || default and require.main === module blocks need /* istanbul ignore next */ to hit 100% branch coverage
type: feedback
---

Two patterns in backend/src/index.ts cannot be branch-covered by tests:

1. `process.env.PORT || 4000` — the fallback (right side) branch is never hit because PORT is set in the container environment
2. `if (require.main === module) { app.listen(...) }` — always false when Jest imports the module

**Why:** These are runtime environment branches not reachable under Jest's module system.

**How to apply:** Add `/* istanbul ignore next */` on the line immediately before:
```typescript
/* istanbul ignore next */
const PORT = process.env.PORT || 4000;

/* istanbul ignore next */
const pool = mysql.createPool({ host: process.env.DB_HOST || "localhost", ... });

/* istanbul ignore next */
if (require.main === module) { ... }
```
This brings branch coverage from ~70% to 100% without changing observable behavior.
