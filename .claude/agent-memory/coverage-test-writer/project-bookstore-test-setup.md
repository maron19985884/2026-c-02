---
name: project-bookstore-test-setup
description: Test infrastructure setup for 2026-c-02 online bookstore; node_modules are root-owned from Docker so test deps must be installed in /tmp
metadata:
  type: project
---

Test deps are installed at `/tmp/backend-test-deps` and `/tmp/frontend-test-deps` because `backend/node_modules` and `frontend/node_modules` are owned by root (Docker volume mounts) and cannot be written to by the `suga` user without sudo.

**Why:** Docker compose created node_modules as root; no sudo available in Claude Code sessions.

**How to apply:** Any new test dependencies must be installed with `npm install --prefix /tmp/backend-test-deps <pkg>` or `npm install --prefix /tmp/frontend-test-deps <pkg>`, and tests must be run with `NODE_PATH=/tmp/backend-test-deps/node_modules /tmp/backend-test-deps/node_modules/.bin/jest`.

Note: /tmp deps are ephemeral — they will be lost on system restart. The package.json test scripts encode the correct command. If tests fail to find modules, re-run `npm install --prefix /tmp/...`.

Installed backend test deps: jest, ts-jest, supertest, @types/jest, @types/supertest, mysql2, express, @types/express, cors, @types/cors.
Installed frontend test deps: jest, ts-jest, @testing-library/react, @testing-library/jest-dom, @types/jest, jest-environment-jsdom, react@18, react-dom@18, @types/react@18, @types/react-dom@18.
