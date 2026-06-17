# CLAUDE.md

## プロジェクト概要

個人運営オンライン書店の購買フロー特化型Webアプリケーション。

**画面遷移：**
```
商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了
```

---

## スコープ制約

以下の機能は実装しない。要求されても追加しないこと。

- ログイン・会員管理
- 決済処理
- 在庫管理
- 管理画面
- レビュー・評価機能
- 検索・フィルター

---

## 技術スタック

| レイヤー | 技術 | ポート |
|---|---|---|
| フロントエンド | Next.js 14 + TypeScript (App Router) | 3000 |
| バックエンド | Express + TypeScript | 4000 |
| データベース | MySQL 8.0 | 3306 |
| 実行環境 | Docker Compose | - |

---

## ディレクトリ構成

```
frontend/src/app/           # ページコンポーネント（App Router）
frontend/src/components/    # 共通UIコンポーネント
frontend/src/context/       # Reactコンテキスト（カート状態など）
frontend/src/lib/           # APIクライアント・ユーティリティ
frontend/src/types/         # 型定義

backend/src/routes/         # APIルート（/api/books, /api/orders）
backend/src/                # DB接続(db.ts)・型定義(types.ts)・エントリ(index.ts)

mysql/init/                 # 初期化SQL（コンテナ起動時に自動実行）

テスト/ユニットテスト/        # Jestユニットテスト（本体コードとは分離）
テスト/結合テスト/            # API結合テスト
```

---

## 開発コマンド

```bash
# 環境変数ファイルの準備（初回のみ）
cp .env.example .env

# 起動（ソース変更時は --build をつける）
docker compose up --build

# 停止
docker compose down

# DB接続確認
docker compose exec mysql mysql -u appuser -ppassword appdb
```

**動作確認URL：**
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000/health

---

## コーディング規約

### 共通
- TypeScript を使用する。`any` 型は使わない
- 型定義は `types.ts`（バックエンド）または `src/types/`（フロントエンド）に集約する

### フロントエンド
- バックエンドとの通信は `src/lib/api.ts` の関数を経由する（直接 fetch しない）
- 環境変数 `NEXT_PUBLIC_API_URL` でAPIのベースURLを参照する
- ページは `app/` 配下のファイルで定義する（App Router）

### バックエンド
- ORMは使わない。`mysql2` で直接SQLを実行する
- APIルートは `/api/books`・`/api/orders` のみ
- ルートハンドラは `src/routes/` に分割する

---

## テスト

テストコードは本体ソースとは分離し、`テスト/` フォルダで管理する。

```bash
# ユニットテスト（frontend / backend 両方）
cd テスト/ユニットテスト
npm test

# frontend のみ
npm run test:frontend

# backend のみ
npm run test:backend

# 結合テスト
cd テスト/結合テスト
npm test
```

テストフレームワーク：Jest + ts-jest

---

## Gitブランチ規約

```
feature/*   # 機能追加
fix/*       # バグ修正
chore/*     # 設定変更・依存更新など
```

PRはmainブランチに向けて作成する。
