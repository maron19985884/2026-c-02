# 設計フェーズのルール

- `docs/requirements/requirements.md` を必ず読んでから設計を開始する
- 設計書は `docs/design/` 配下に Mermaid 記法で図を含めて作成する
- スコープ外機能（ログイン・決済・在庫管理等）の設計は行わない
- API 設計は `docs/specs/spec.md` の API 仕様と整合すること
- DB テーブル設計は MySQL 8.x の構文に準拠すること
