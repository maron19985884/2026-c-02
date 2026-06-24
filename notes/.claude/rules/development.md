# 開発フェーズのルール

- `docs/specs/spec.md` を必ず読んでから実装を開始する
- 実装は仕様書に記載された画面・API の範囲のみ行う
- TypeScript の `any` 型は原則禁止。型定義を必ず作成する
- フロントエンド（Next.js）の変更は `frontend/src/` 配下に行う
- バックエンド（Express）の変更は `backend/src/` 配下に行う
- 環境変数は `.env` で管理し、コードへの直書きを禁止する
- Docker Compose 構成（port 3000 / 4000）を変更しない
