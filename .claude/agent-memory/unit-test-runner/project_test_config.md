---
name: project-test-config
description: テスト実行環境の構成、既知の問題と対処法、テストファイルの所在
metadata:
  type: project
---

## テスト環境の概要

- テストランナー: Jest + ts-jest
- テスト依存関係は本番 `node_modules` に含まれていない。コンテナ起動後に `/tmp` へ別途インストールが必要。
- `package.json` の `test` スクリプトは `NODE_PATH=/tmp/<service>-test-deps/node_modules` を参照している。

## バックエンド (`backend/`)

- Jest 設定: `backend/jest.config.js`
- テスト依存インストール先: `/tmp/backend-test-deps/`
- インストールコマンド (コンテナ内):
  ```
  mkdir -p /tmp/backend-test-deps && cd /tmp/backend-test-deps && npm init -y && npm install --save-dev jest ts-jest supertest @types/jest @types/supertest
  ```
- 実行コマンド: `docker compose exec backend sh -c "cd /app && npm test"`
- テストファイル (`backend/src/__tests__/`):
  - `index.test.ts` — CORS・ルーター登録・/health エンドポイント
  - `productsController.test.ts` — GET /api/products, GET /api/products/:id
  - `ordersController.test.ts` — POST /api/orders, GET /api/orders/:id
  - `productsQuery.test.ts` — DB クエリ層のモック
  - `ordersQuery.test.ts` — DB クエリ層のモック
  - `pool.test.ts` — MySQL 接続プールのモック

## フロントエンド (`frontend/`)

- Jest 設定: `frontend/jest.config.js`
- テスト依存インストール先: `/tmp/frontend-test-deps/`
- インストールコマンド (コンテナ内):
  ```
  mkdir -p /tmp/frontend-test-deps && cd /tmp/frontend-test-deps && npm init -y && npm install --save-dev jest ts-jest jest-environment-jsdom @testing-library/react@14 @testing-library/jest-dom @types/jest react@18.3.1 react-dom@18.3.1 @types/react@18 @types/react-dom@18
  ```
  React のバージョンはアプリと同じ 18.3.1 に合わせること (不一致で "Invalid hook call" が発生する)。
- 実行コマンド: `docker compose exec frontend sh -c "cd /app && npm test"`
- テストファイル (`frontend/src/__tests__/`):
  - `useCart.test.ts` — useCart フックのテスト
  - `api.test.ts` — フロントエンドの API 呼び出しライブラリのテスト

## 既知の問題と解決済み対処法

### React 重複インスタンスによる "Invalid hook call"

**Why:** `NODE_PATH=/tmp/frontend-test-deps/node_modules` で動作するため、Jest が `/tmp/...` の React と `/app/node_modules/react` の両方を解決できてしまい、フックが異なるインスタンスを参照する。

**How to apply:** `frontend/jest.config.js` の `moduleNameMapper` に以下を追加して React をアプリ側の `node_modules` に固定する:

```js
'^react$': '<rootDir>/node_modules/react',
'^react-dom$': '<rootDir>/node_modules/react-dom',
'^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
```

この修正は 2026-05-16 に適用済み (`frontend/jest.config.js`)。

## コンテナ再起動後の注意

`/tmp` は一時領域のため、コンテナを再起動すると `/tmp/backend-test-deps` と `/tmp/frontend-test-deps` が消える。再起動後は上記インストールコマンドを再実行してからテストを走らせること。
