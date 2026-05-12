# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

個人運営オンライン書店の購買フロー（商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了）を実装するWebアプリケーション。ログイン・決済・在庫管理はスコープ外。

## Architecture

3サービス構成をDocker Composeで管理する：

- **Frontend** (`frontend/`): Next.js 14 + TypeScript, App Router使用。`src/app/` 配下にページを追加する。
- **Backend** (`backend/`): Express + TypeScript。`backend/src/index.ts` がエントリポイント。REST APIを提供する。
- **MySQL 8** (`mysql/`): 初期化SQLは `mysql/init/` に置くと起動時に自動実行される。

フロントエンドからバックエンドへの通信は環境変数 `NEXT_PUBLIC_API_URL`（デフォルト: `http://localhost:4000`）経由。

## Development Commands

### 起動・停止

```bash
# 初回 or ソース変更後
docker compose up --build

# 2回目以降（変更なし）
docker compose up

# 停止
docker compose down
```

### 動作確認

| 確認先 | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:4000/health |

```bash
# MySQL接続確認
docker compose exec mysql mysql -u appuser -ppassword appdb
```

### コンテナ内で個別コマンドを実行する場合

```bash
# バックエンド（TypeScriptビルド）
docker compose exec backend npm run build

# フロントエンド（Next.jsビルド）
docker compose exec frontend npm run build
```

## Environment Setup

```bash
cp .env.example .env
```

`.env` はGit管理対象外。`docker-compose.yml` が `.env` の値を参照する。

## Database

`mysql/init/01_init.sql` に初期スキーマを定義する。コンテナ初回起動時のみ自動実行されるため、スキーマ変更時はボリュームを削除してから再起動する：

```bash
docker compose down -v
docker compose up --build
```
