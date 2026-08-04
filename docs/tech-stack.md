# 技術選定書

> 出典: `origin/main` ブランチの実構成（`docker-compose.yml` / `frontend/` / `backend/` / `mysql/` / `.env.example` / `README.md`）
> テンプレート: [tech-stack-template.md](tech-stack-template.md)
> 位置づけ: `/speckit.plan` を実行する **前に人間が記入する入力ドキュメント**。技術の「選定」は本ファイルで確定させ、`plan` フェーズでは選び直さない（憲法セクション5）。
> 対象要件: [要件定義書](requirements.md)

## 1. 全体構成

Docker Compose による3コンテナ構成。フロントエンド（Next.js）がブラウザに画面を返し、バックエンド（Express の REST API）を HTTP で呼び、バックエンドが MySQL に接続する。

```
ブラウザ
   │  http://localhost:3000
   ▼
┌──────────────────┐   NEXT_PUBLIC_API_URL       ┌──────────────────┐        ┌──────────────────┐
│ frontend         │   http://localhost:4000     │ backend          │  3306  │ mysql            │
│ Next.js 14 (TS)  │ ──────────────────────────▶ │ Express 4 (TS)   │ ─────▶ │ MySQL 8.0        │
│ port 3000        │         REST / JSON         │ port 4000        │ mysql2 │ volume: mysql_data│
└──────────────────┘                             └──────────────────┘        └──────────────────┘
                          all on docker network: app-network (bridge)
```

- **通信**: ブラウザから backend を直接呼ぶ構成（`NEXT_PUBLIC_API_URL` はブラウザに露出する公開値、`http://localhost:4000`）。backend 側は `cors()` を全許可で有効化している。
- **起動順序**: `frontend` → `depends_on: backend`、`backend` → `depends_on: mysql (condition: service_healthy)`。MySQL は `mysqladmin ping` によるヘルスチェックが通ってから backend が起動する。
- **開発体験**: frontend / backend ともにソースをボリュームマウントし、ホットリロードで開発する（`node_modules` はコンテナ側を優先）。
- **Dockerfile**: frontend / backend とも `development` / `builder` / `production` のマルチステージ構成。Compose は現状 `target: development` を指定しており、本番は `production` に切り替える前提。
- **DB初期化**: `./mysql/init` を `/docker-entrypoint-initdb.d` にマウントし、初回起動時に `01_init.sql` が自動実行される。

## 2. 使用技術スタック

| レイヤー | 採用技術 | バージョン | 選定理由 |
|---|---|---|---|
| フロントエンド | Next.js（App Router）/ React / TypeScript | Next.js 14.2.3 / React ^18 / TypeScript ^5 | 要件の5画面（一覧・詳細・カート・注文フォーム・完了）をファイルベースルーティングでそのまま画面単位に落とせる。TypeScript は `strict: true` で型安全性を担保 |
| バックエンド | Node.js / Express / TypeScript（REST API） | Node.js 20（`node:20-alpine`）/ Express ^4.18.2 / TypeScript ^5 | フロントと同一言語で開発でき学習コストが低い。Express は REST API に必要な最小構成で足り、購買フローの規模に対して過剰でない |
| （バックエンド補助） | cors / mysql2 / ts-node-dev | cors ^2.8.5 / mysql2 ^3.6.0 / ts-node-dev ^2.0.0 | cors: frontend（3000）から backend（4000）へのオリジン跨ぎ通信に必要。mysql2: MySQL 8 の認証方式に対応し Promise API を持つ。ts-node-dev: 開発時の TypeScript ホットリロード |
| データベース | MySQL | 8.0（公式イメージ `mysql:8.0`） | 書籍・注文・注文明細といった構造の定まったデータを関係モデルで扱うため。文字コードは `utf8mb4` / 照合順序 `utf8mb4_unicode_ci`、ストレージエンジンは InnoDB |
| インフラ・実行環境 | Docker / Docker Compose | Compose v2（`docker compose` コマンド）| 環境差異をなくし、`docker compose up --build` のみで全員が同じ環境を再現できる。データは名前付きボリューム `mysql_data` で永続化 |
| CI/CD | GitHub Actions | `.github/workflows/quality-gate.yml` | `main` / `develop` への push・PR で Lint を自動実行し、基準未達をマージ不可にする（憲法セクション1） |

### 環境変数（`.env.example` 準拠）

`.env` は Git 管理対象外。`cp .env.example .env` で作成する。

| 変数 | 既定値 | 用途 |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root パスワード |
| `DB_NAME` | `appdb` | データベース名 |
| `DB_USER` | `appuser` | アプリ接続ユーザー |
| `DB_PASSWORD` | `password` | アプリ接続パスワード |
| `NODE_ENV` | `development` | backend 実行モード |
| `PORT` | `4000` | backend 待ち受けポート |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | frontend から backend への接続先（ブラウザに露出） |

backend コンテナには上記に加え `DB_HOST=mysql` / `DB_PORT=3306` が Compose から渡される。

### 動作確認エンドポイント

| 確認先 | URL | 正常時 |
|---|---|---|
| フロントエンド | http://localhost:3000 | 「Frontend 起動確認 🚀」 |
| バックエンド | http://localhost:4000/health | `{ "status": "ok" }` |

## 3. Lint・品質ツール

- **使用するLint（言語別）**: ESLint（JavaScript / TypeScript）
- **対応する設定ファイル**: **未整備**（後述）
- 憲法セクション1により、静的解析エラー0件を必須とする。警告の扱いは preset で定義する（[lint-preset-guide.md](lint-preset-guide.md)）。

> **⚠️ 現時点の未整備事項（`/speckit.plan` 前に解消が必要）**
> `origin/main` の実構成を確認した結果、以下が揃っていない。このままでは品質ゲートが機能しない。
>
> | 事項 | 現状 | 必要な対応 |
> |---|---|---|
> | ESLint 本体・設定ファイル | frontend / backend とも ESLint が devDependencies になく、`.eslintrc*` / `eslint.config.*` も存在しない | ESLint を導入し設定ファイルを配置する。ルールセットは preset 化する |
> | `npm run lint` スクリプト | frontend / backend の `package.json` に `lint` スクリプトがない | 両方に `lint` スクリプトを追加する |
> | `quality-gate.yml` の実行対象 | ワークフローはリポジトリ直下の `package.json` を `hashFiles` で判定するが、直下に `package.json` はなく `frontend/` `backend/` 配下にある。また `npm ci` は `package-lock.json` を要求するが、これも main に存在しない | frontend / backend を個別にチェックする job 構成へ書き換え、lock ファイルをコミットする |
> | テスト | テストフレームワーク・テストコードとも未導入 | 憲法セクション2（主要ロジックの単体テスト必須・カバレッジ目標）を満たす構成を決める |

## 4. 外部依存・連携

- **利用する外部API・サービス**: なし。決済処理は要件上スコープ外のため決済ゲートウェイとの連携は行わない。認証・会員管理もスコープ外のため外部 IdP は利用しない。
- **既存システムとの連携点**: なし（新規開発。Brownfield ではない）。
- **アプリ内部の依存関係**: frontend → backend（REST / JSON）、backend → MySQL（mysql2）。frontend から MySQL への直接接続は行わない。

## 5. 制約・前提

- **使用禁止の技術／ライブラリ**:
  - 決済系 SDK・認証／会員管理系ライブラリ（要件のスコープ外機能を実装しないため）
  - `/speckit.plan` フェーズで本書に記載のない技術を追加すること（憲法セクション5）。追加が必要な場合は本書を改訂してから plan に進む
- **ライセンス上の制約**: 採用技術はいずれも OSS（Next.js / React / Express / cors / mysql2 は MIT、TypeScript は Apache-2.0、MySQL Community Server は GPLv2）。MySQL は公式イメージを非改変で利用し、アプリケーションからはネットワーク越しに接続するのみ。新規依存を追加する際はライセンスと選定理由を本書に明記する（憲法セクション5）。
- **前提**:
  - 開発者のローカルに Docker / Docker Compose v2 が導入済みであること
  - ブランチ運用は `main` から `feature/*` を切り、PR 経由でマージする（README 手順書に準拠）
  - チームは TypeScript を共通言語とし、フロント・バックを同一言語で扱えることを前提とする
  - 個人運営規模を想定し、水平スケールや高可用構成は初期スコープに含めない（憲法セクション4のパフォーマンス基準との整合は要件定義書の非機能要件確定時に再確認する）

## 6. 却下した選択肢

| 検討した技術 | 却下理由 |
|---|---|
| — | `origin/main` の構成確立時点の検討経緯が記録として残っていないため、記載なし。今後の技術変更時にはここへ却下理由を追記すること |
