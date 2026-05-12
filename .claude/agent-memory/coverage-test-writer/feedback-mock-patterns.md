---
name: feedback-mock-patterns
description: Jest mock patterns that work in this project for mysql2 pool and DB query modules
metadata:
  type: feedback
---

For mocking `src/db/pool.ts` in Jest tests:

1. Create a `src/db/__mocks__/pool.ts` file with mock implementations of `pool.query` and `pool.getConnection`.
2. In test files, call `jest.mock('../db/pool')` — Jest auto-resolves the `__mocks__` sibling directory.
3. Import pool through the ORIGINAL path (`import pool from '../db/pool'`) to get the same mock instance that the module under test uses. Do NOT import from `__mocks__/pool` directly — that creates a separate instance.
4. Cast mock functions: `const mockQuery = pool.query as jest.Mock`.

**Why:** If you import from `__mocks__/pool.ts` directly and also via `jest.mock('../db/pool')`, you get two separate objects. The module under test gets the jest-injected version; your test assertions need to reference that same version.

**How to apply:** Always import mocked modules through their original path after `jest.mock()`. This is Jest standard behavior but easy to get wrong.

For mysql2/promise in pool.test.ts: use `jest.isolateModules()` + `jest.mock()` inside a helper function, then `require('../db/pool')` inside the isolateModules callback. Use a local `jest.fn()` as createPool mock captured in the helper's closure.
