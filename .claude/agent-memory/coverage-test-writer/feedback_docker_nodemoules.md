---
name: Docker node_modules volume pattern
description: docker compose run creates fresh anonymous volumes each time, so npm install and test must run in one sh -c command
type: feedback
---

`docker compose run --rm` creates a new anonymous volume for `/app/node_modules` each invocation. Packages installed in a previous `run` call are lost by the next call.

**Why:** The docker-compose.yml uses `- /app/node_modules` (anonymous volume), not a named volume. Each `run` gets a fresh one.

**How to apply:** Always combine install + test in a single `sh -c` command:
```bash
docker compose run --rm --no-deps backend sh -c "npm install --save-dev jest ts-jest @types/jest supertest @types/supertest --silent && node_modules/.bin/jest --coverage --forceExit"
```
Do NOT use `npm test` (which calls the script) when the script references `./node_modules/.bin/jest` — use the binary path directly inside `sh -c`.
