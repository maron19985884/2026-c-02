# CLAUDE.md

このファイルは Claude Code がセッション開始時に自動で読み込む、本プロジェクトの規約・決定事項である。
ここに書かれた決定事項は、セッション中のプロンプトで明示的に上書きされない限り常に適用される。

## プロジェクト概要

個人運営オンライン書店（購買フロー特化・5画面構成）。
要件定義は `user_requirements.md` を参照。要件定義に書かれていない仕様は本ファイルの「決定事項」が正となる。
`backend/` `frontend/` には各ディレクトリ専用の `CLAUDE.md` がある（本ファイルが正、各ファイルはサブセットの再掲）。

## 技術スタック

- フロントエンド: Next.js 14（App Router）+ TypeScript
- バックエンド: Node.js + Express + TypeScript（REST API）
- DB: MySQL 8（docker-compose で起動、初期化 SQL は `mysql/init/`）
- テスト: Jest（バックエンドは supertest 併用可）

## コマンド

| 操作 | コマンド |
|---|---|
| 環境一式の起動 | `docker compose up -d` |
| バックエンド開発起動 | `cd backend && npm run dev` |
| フロントエンド開発起動 | `cd frontend && npm run dev` |
| バックエンドテスト | `cd backend && npm test` |
| フロントエンドテスト | `cd frontend && npm test`（カバレッジ付き） |

## 決定事項（Decision Record）

要件定義書の空白を埋める確定仕様。追加・変更する場合は必ず `docs/decisions.md` に経緯を記録し、本セクションへ反映すること。

### ポート（固定・変更禁止）

- フロントエンド: **3000**
- バックエンド: **4000**
- MySQL: **3306**

### API 設計

- レスポンスは常に `{ data, error, message }` の統一フォーマット
  - 正常時: `{ data: <結果>, error: null, message: "OK" }`
  - 異常時: `{ data: null, error: "<エラーコード>", message: "<説明>" }`
- リクエストバリデーションは zod を使用する

### 画面 URL 設計

| URL | 画面 |
|---|---|
| `/` | 商品一覧 |
| `/books/[id]` | 商品詳細 |
| `/cart` | カート |
| `/checkout` | 注文フォーム |
| `/orders/[id]` | 注文完了 |

### DB スキーマ規約

- テーブル名は複数形スネークケース（例: `books`, `orders`）
- `orders` テーブルの顧客情報カラムは `customer_name` / `customer_email` / `customer_address`
- 注文番号フォーマット: `ORD-{10桁ゼロ埋めID}`（例: `ORD-0000000042`）

### 画面間のデータ受け渡し

- 注文完了画面へは URL パス（`/orders/[id]`）で ID を渡し、API で再取得する
- Context やメモリ上の状態のみでの受け渡しは禁止（リロードで消失するため）

## コーディング規約

- TypeScript strict モード。`any` 型の使用禁止
- SQL はプリペアドステートメント必須（SQL インジェクション対策）
- エラーは握りつぶさない（catch して無視しない。上記 API フォーマットで返す）

## 禁止事項

- デバッグ用の `console.log` をコミットに含めない
- `.env` をコミットしない（`.env.example` を更新する）
- 決定事項と異なる実装を独自判断で行わない（下記ワークフロー 2 に従う）
- 新規ライブラリの依存追加は禁止（permissions で `npm install` 等をブロック済み。必要な場合はユーザーに提案して承認を得る）
- 許可ディレクトリ外の編集は禁止（hook で強制ブロックされる。許可リストは `.claude/hooks/check-edit-path.sh` を参照）

## ワークフロー

1. 実装前に対象機能の設計内容を確認し、本ファイルの決定事項に違反していないか検証する
2. 要件定義書にも本ファイルにも定義がない仕様に遭遇したら、**独自判断で実装せず**、`docs/decisions.md` に決定案を追記してユーザーに確認を求める
3. 実装後は必ずテストを実行し、結果（件数・成否）を報告する

※ 1・2 は `.claude/hooks/check-edit-path.sh`（PreToolUse hook）により、ファイル編集のたびに自動リマインドされる。
