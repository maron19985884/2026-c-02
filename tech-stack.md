# 技術選定書 兼 開発規約

> **位置づけ**: `/speckit.plan` を実行する **前に人間が記入する入力ドキュメント**です。本ファイルが**この案件の技術選定書の実物**です。
> ここに書いた技術方針・開発規約をもとに Spec Kit が `plan.md` を生成し、AI がコードを生成します。
> 技術の「**選定**」は人間がこのファイルで確定させ、`plan` フェーズでは選び直さない前提です。
>
> **書き方の参照先:**
> - テンプレート（空欄の雛形。次の案件用のコピー元）: [`docs/inputs/tech-stack-template.md`](docs/inputs/tech-stack-template.md)
> - 記入例（オンライン書店サンプル）: [`docs/inputs/tech-stack-example.md`](docs/inputs/tech-stack-example.md)
> - 利用指南書: [`README.md`](README.md) §5
>
> **選定の根拠:** [`requirements.md`](requirements.md) の制約条件、および main ブランチに既に配置されている雛形実装（`docker-compose.yml` / `frontend` / `backend` / `mysql`）で採用済みの構成に合わせている。

> **⚠️ 重要: 本ファイルへの記入は人間が実施すること。AIによる記入・変更は不可。**
> 不用意なライブラリや依存関係の混入を防ぐため、使用技術・ライブラリの選定および本ファイルへの反映は
> 必ず担当者（人間）が判断・記入する。AIエージェントはこのファイルを参照するのみとし、
> 内容を追加・変更・削除してはならない（憲法§5参照）。
>
> **本ドラフトの取り扱い:** 本ファイルは AI が `user_requirements.md` と main ブランチの既存構成をもとに作成した**下書き**である。
> 憲法§5 に従い、担当者が内容をレビューし、必要に応じて修正のうえ**人間の責任で確定**すること。
>
> **⚠️ AI 代行編集の記録（憲法§5 例外）:** 2026-09-04、ユーザーのチャット上の明示指示により、AI が本ファイルの
> §2 / §3 / §6 に「テストフレームワーク＝Jest と開発依存」「UI・CSS 方針」「却下選択肢（Vitest・`ulid`）」を追記した。
> 内容は `specs/003-bookstore-purchase-flow/plan.md`（実装前ゲート）・`research.md`（D-06 / D-07）で選定理由を文書化済み。
> **最終確認・確定は担当者（人間）が行うこと。**

## 1. 全体構成

- ブラウザ ⇄ フロントエンド（Next.js）⇄ バックエンド（Express REST API）⇄ MySQL の3層構成。
- フロントエンドは商品一覧・商品詳細・カート・注文フォーム・注文完了の画面遷移を担当し、バックエンドの REST API（書籍一覧取得・書籍詳細取得・注文作成 など）を呼び出す。
- バックエンドは書籍データと注文データを MySQL に永続化する。
- フロントエンド（port 3000）・バックエンド（port 4000）・MySQL（port 3306）を Docker Compose でまとめてローカル起動する、学習・デモ用途の最小構成。
- 構成図:

```
[Browser] --HTTP--> [frontend: Next.js :3000] --REST--> [backend: Express :4000] --SQL--> [mysql: MySQL 8 :3306]
                    \___________________________ docker compose (app-network) ___________________________/
```

## 2. 使用技術スタック

| レイヤー | 採用技術 | バージョン | 選定理由 |
|---|---|---|---|
| フロントエンド | Next.js + React + TypeScript | Next.js 14.2.3 / React 18 / TypeScript 5.x | 5画面の遷移をファイルベースルーティングで簡潔に実装できる。main ブランチの `frontend/package.json` で採用済み。要件定義書の非機能要件（保守性＝型安全性）に合わせ TypeScript を採用 |
| バックエンド | Node.js + Express + TypeScript | Node.js 20 LTS / Express 4.18 / TypeScript 5.x | REST API 数本のみの小規模構成のため軽量な Express で十分。フロントと言語を統一し学習コストを下げる。main ブランチの `backend/package.json` で採用済み |
| DB ドライバ | mysql2 | 3.6.x | Promise ベースで Express から MySQL へ接続できる標準的なドライバ。main ブランチで採用済み |
| CORS | cors | 2.8.x | フロント（:3000）からバックエンド（:4000）への別オリジン API 呼び出しを許可するため。main ブランチで採用済み |
| データベース | MySQL | 8.0 | 書籍・注文というリレーショナルなデータ構造に適する。Docker 公式イメージ `mysql:8.0` が安定。`docker-compose.yml` で採用済み |
| インフラ・実行環境 | Docker / Docker Compose | Docker Desktop（Windows） | 要件定義書の制約条件どおり、frontend :3000 / backend :4000 / mysql :3306 をコンテナで起動する。`docker-compose.yml` に定義済み |
| 開発時ホットリロード | next dev / ts-node-dev | ts-node-dev 2.0.x | フロントは `next dev`、バックは `ts-node-dev --respawn --transpile-only` でソース変更を即時反映。`Dockerfile` の development ターゲットで使用 |
| テスト | Jest | Jest 29.x（`ts-jest` / `next/jest`） | フロント・バック共通。Express は `supertest`、React は `@testing-library/react`。Next.js 公式サポート（`next/jest`）があり Express + Supertest の実績も厚い。詳細は `research.md` D-07 |
| UI スタイル | CSS Modules（UIライブラリ不使用） | — | `tech-stack.md` に UI フレームワーク指定がないため憲法§3のフォールバックに従い、UI ライブラリを導入せず `*.module.css` ＋ `app/globals.css` の共有 CSS 変数で統一。詳細は `research.md` D-06 |
| CI/CD | 未導入（品質ゲートのみ） | — | 学習・デモ用途のため本格的な CI/CD はスコープ外。Lint の品質ゲートのみ `.github/workflows/quality-gate.yml` で運用する |

## 3. Lint・品質ツール

- 使用するLint（言語別）：ESLint（TypeScript 対応。フロントエンド・バックエンド共通）
- 対応する設定ファイル：`frontend/.eslintrc.json`（`eslint-config-next` = `next/core-web-vitals` ベース）、`backend/.eslintrc.json`（`@typescript-eslint` recommended）
- Lint 用開発依存：
  - フロント：`eslint`, `eslint-config-next`
  - バック：`eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- **テストフレームワーク：Jest（確定）**。カート合計計算・入力バリデーション・注文番号生成・注文スナップショット化のユニットテストと、注文作成 API の結合テストに使用
- テスト用開発依存：
  - 共通：`jest`, `@types/jest`
  - バック：`ts-jest`, `supertest`, `@types/supertest`
  - フロント：`jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`（設定は `next/jest`）
- カバレッジ目標：80%（憲法 §2 の暫定値を適用。`jest --coverage` の `coverageThreshold` で強制。主要ビジネスロジックを対象）
- UI・CSS 方針：UI コンポーネントライブラリ・CSS フレームワークは導入しない。レイアウトは CSS Modules（`*.module.css`）＋ `frontend/app/globals.css` の共有 CSS 変数（色・間隔・フォント）で統一する（憲法§3 フォールバック）。エラー表示・空状態は共通コンポーネント（`ErrorNotice` / `EmptyState`）に集約
- ※ 憲法セクション1（コード品質原則）および `.github/workflows/quality-gate.yml` の Node.js/TypeScript 向けステップと整合させること（Lint エラー0件を必須）
- ※ `quality-gate.yml` はルート `package.json` を前提とするため、ルートに両サブパッケージの lint を呼ぶ `package.json` を用意するか、CI を分離構成向けに調整する（`plan.md` Complexity Tracking）

## 4. 外部依存・連携

- 利用する外部API・サービス：なし（決済・会員管理・メール送信はスコープ外のため外部連携は発生しない）
- 既存システムとの連携点：なし（スタンドアロン構成）
- 書籍データの初期投入：`mysql/init/` に配置する初期化 SQL（`docker-entrypoint-initdb.d`）で行う

## 5. 制約・前提

- 使用禁止の技術／ライブラリ：認証・ログイン関連ライブラリ、決済関連ライブラリ（いずれも requirements.md の対象外機能に該当するため導入しない）
- 破壊的 DDL（`DROP` / `TRUNCATE` 等）をアプリケーションコードから発行しない（憲法 §1）
- ライセンス上の制約：特になし（すべて OSS ライブラリを使用）
- 前提：フロント・バックともに TypeScript で統一し担当者間の学習コストを抑える。認証情報・DB 接続情報は `.env` および `docker-compose.yml` の環境変数注入で管理し、コードへ直書きしない（requirements.md 非機能要件・セキュリティ）
- 前提：ローカル単一利用者での動作を対象とし、スケーラビリティ・冗長化は考慮しない

## 6. 却下した選択肢

| 検討した技術 | 却下理由 |
|---|---|
| React 単体（Next.js 不使用の素の SPA） | 5画面の遷移をファイルベースルーティングで扱える Next.js の方が実装コストが低い。main の既存構成とも不一致になるため非選択 |
| NestJS | 数エンドポイントのみの小規模 API に対して構成が過剰 |
| PostgreSQL | 書籍・注文のシンプルなリレーションでは MySQL で十分。`docker-compose.yml` の既存構成と合わせる |
| ORM（Prisma / TypeORM 等） | テーブル数が少なく、`mysql2` の生 SQL で十分。依存を増やさない方針 |
| 状態管理ライブラリ（Redux 等） | カート状態は React の Context / useState ＋ `localStorage` で足りる規模のため導入しない |
| Vitest | テストフレームワークは Jest を採用。Next.js 公式サポート（`next/jest`）と Express + Supertest の実績を優先。Vitest は設定が軽い利点はあるが今回は非選択 |
| `ulid` npm パッケージ | 注文番号（ULID 形式・Base32 26文字）は `crypto.randomBytes` を用いた十数行の自前実装で再現できるため、依存を追加しない |
| CSS フレームワーク / UI ライブラリ（Tailwind・MUI 等） | 5画面・小規模のため CSS Modules ＋共有変数で十分。憲法§3 のフォールバック（未定義ならブラウザ既定で統一）に沿い新規選定を避ける |

## 7. 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名（UIコンポーネント） | PascalCase | `BookCard.tsx` / `CartSummary.tsx` |
| ファイル名（ユーティリティ・ロジック） | camelCase | `calcCartTotal.ts` / `validateOrderForm.ts` |
| ファイル名（Next.js ルート） | Next.js の規約に従う | `app/books/[id]/page.tsx` |
| 変数・関数名 | camelCase | `fetchBooks()` / `cartTotal` |
| 型・クラス・インターフェース名 | PascalCase | `Book` / `CartItem` / `OrderRequest` |
| 定数（不変のグローバル値） | UPPER_SNAKE_CASE | `MAX_QUANTITY` |
| DB テーブル名・カラム名 | snake_case（複数形テーブル） | `books` / `order_items` / `created_at` |
| REST API パス | ケバブケース・複数形リソース | `GET /api/books` / `POST /api/orders` |

## 8. プロジェクト固有の禁止事項

- TypeScript の `any` 型の使用を原則禁止する（やむを得ない場合は理由をコメントで明記）。
- SQL 文字列へのリクエスト値の直接連結を禁止する（`mysql2` のプレースホルダを必ず使用）。
- 認証情報・接続情報のソースコードへの直書きを禁止する（`.env` / 環境変数経由のみ）。
- アプリケーションコードからの破壊的 DDL（`DROP` / `TRUNCATE` / スキーマ削除）の発行を禁止する。

## 9. スコープ外機能（実装禁止）

- ログイン・会員管理
- 決済処理
- 在庫管理
- 管理画面
- レビュー・評価
- 検索・フィルター
- 送料などの計算・表示
