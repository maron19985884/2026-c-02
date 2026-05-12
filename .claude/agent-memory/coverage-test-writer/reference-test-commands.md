---
name: reference-test-commands
description: Where tests live and exact commands to run them for backend and frontend
metadata:
  type: reference
---

## Backend tests
- Location: `backend/src/__tests__/*.test.ts`
- Mock dir: `backend/src/db/__mocks__/pool.ts`
- Config: `backend/jest.config.js`, `backend/tsconfig.test.json`
- Run all: `cd backend && NODE_PATH=/tmp/backend-test-deps/node_modules /tmp/backend-test-deps/node_modules/.bin/jest --config jest.config.js`
- Or via npm: `cd backend && npm test` (but npm itself may fail if script can't find jest — use the NODE_PATH command directly)

## Frontend tests
- Location: `frontend/src/__tests__/*.test.ts`
- Config: `frontend/jest.config.js`, `frontend/tsconfig.test.json`
- Run all: `cd frontend && NODE_PATH=/tmp/frontend-test-deps/node_modules /tmp/frontend-test-deps/node_modules/.bin/jest --config jest.config.js`

## Test files created
Backend: index.test.ts, pool.test.ts, productsQuery.test.ts, ordersQuery.test.ts, productsController.test.ts, ordersController.test.ts
Frontend: api.test.ts, useCart.test.ts
