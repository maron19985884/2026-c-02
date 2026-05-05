# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う際に Claude Code (claude.ai/code) へ提供するガイダンスです。

## プロジェクト概要

購買フロー一式を備えた日本語オンライン書店アプリ。Docker サービスは 3 つ：

| サービス | スタック | ポート |
|---|---|---|
| frontend | Next.js 14 + TypeScript | 3000 |
| backend | Express.js + TypeScript | 4000 |
| mysql | MySQL 8 | 3306 |

## セットアップ

```bash
cp .env.example .env
docker compose up --build
```

動作確認：
- フロントエンド: http://localhost:3000
- バックエンド health: http://localhost:4000/health
- MySQL: `docker compose exec mysql mysql -u appuser -ppassword appdb`

2 回目以降の起動: `docker compose up` | 停止: `docker compose down`

## 開発コマンド

開発作業はすべて Docker コンテナ内で実行する。ホスト上で直接コマンドを実行する場合は、先に該当ディレクトリへ `cd` すること。

**バックエンド** (`backend/`):
```bash
npm run dev    # ts-node-dev によるホットリロード（コンテナ内で使用）
npm run build  # tsc → dist/
npm start      # node dist/index.js
```

**フロントエンド** (`frontend/`):
```bash
npm run dev    # next dev
npm run build  # next build
npm start      # next start
```

## アーキテクチャ

- フロントエンド固有の情報（画面フロー・API・状態管理・ページ構成・スタイル規約）は `.claude/rules/frontend-conventions.md` を参照。
- バックエンド固有の情報（ルート構成・DB スキーマ・TypeScript 規約）は `.claude/rules/backend-conventions.md` を参照。

### サービス間通信

- バックエンド → MySQL: `mysql:3306`（Docker ネットワーク `app-network`）
- ブラウザ → バックエンド: `NEXT_PUBLIC_API_URL`（デフォルト `http://localhost:4000`）

### 主要な環境変数

`.env`（`.env.example` からコピー）で定義：

| 変数名 | デフォルト値 | 使用サービス |
|---|---|---|
| `DB_NAME` | appdb | backend, mysql |
| `DB_USER` | appuser | backend, mysql |
| `DB_PASSWORD` | password | backend, mysql |
| `MYSQL_ROOT_PASSWORD` | rootpassword | mysql |
| `NEXT_PUBLIC_API_URL` | http://localhost:4000 | frontend（ブラウザ） |

## TypeScript 設定メモ

- フロントエンド: Next.js バンドラー解決、パスエイリアス `@/*` → `src/*`、strict モード
- バックエンド: `.claude/rules/backend-conventions.md` を参照
