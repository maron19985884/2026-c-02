# 開発工程別プロンプトガイド
## 個人運営オンライン書店（購買フロー特化版）

作成日：2026-05-27

---

## 背景・目的

ユーザー要件定義書（`user_requirements.md`）をもとに、要件定義〜単体テスト〜ローカル動作確認までの各工程で投入するプロンプトをまとめたガイドです。

### 対象プロジェクト概要

- **アプリ概要**：購買フロー特化型のオンライン書店（5画面構成）
- **フロントエンド**：Next.js 14（App Router）+ TypeScript
- **バックエンド**：Node.js + Express + TypeScript（REST API）
- **動作確認環境**：Docker（ローカルコンテナ）

### 成果物一覧

| 成果物 | 説明 |
|--------|------|
| アプリケーション資材 | frontend/, backend/ 配下の実装コード |
| 単体テスト・テスト結果 | テストコード + docs/test_results_*.md |
| 外部設計書（機能仕様） | docs/external_design/*.md |
| 詳細設計書（資材仕様） | docs/detailed_design/*.md |

---

## 全体フロー

```
Phase 1: システム設計書作成
  ↓
Phase 2: 外部設計書作成（画面仕様）
  ↓
Phase 3: 詳細設計書作成（資材仕様）
  ↓
Phase 4: バックエンド実装
  ↓
Phase 5: フロントエンド実装
  ↓
Phase 6a: バックエンド単体テスト  ─ 並行可
Phase 6b: フロントエンド単体テスト ─ 並行可
  ↓
Phase 7: Docker環境構築・動作確認
```

---

## Phase 1｜システム設計書作成

**投げ方**：新規セッション、単一メッセージで投入

```
以下のユーザー要件定義書をもとに、システム設計書を作成してください。

■要件定義書
C:\Software\workspace\2026-c-02\user_requirements.md

■作成物
`C:\Software\workspace\2026-c-02\docs\system_design.md` を新規作成してください。
以下の項目を含めること：

1. データモデル定義
   - エンティティ一覧（Book, CartItem, Order, OrderItemなど）
   - 各エンティティのフィールド名・型・説明

2. REST APIエンドポイント一覧
   - HTTPメソッド・パス・概要・リクエスト/レスポンス形式（JSON例付き）

3. 画面とAPIの対応表
   - 各画面でコールするAPIエンドポイントの一覧

4. ディレクトリ構成案
   - frontend/ と backend/ 双方のフォルダ・ファイル構造

■技術スタック
- フロントエンド：Next.js 14（App Router）+ TypeScript
- バックエンド：Node.js + Express + TypeScript
- データ永続化：JSONファイル（DB不使用）
- 実行環境：Dockerコンテナ（ローカル）

■制約
- スコープ外機能（ログイン・決済・在庫管理）はAPI設計にも含めないこと
- 注文確定時にサーバー側でデータ保存し、注文番号を発番して返すこと
```

---

## Phase 2｜外部設計書作成（画面仕様）

**投げ方**：Phase 1完了後、同セッション継続 or 新規セッション

```
以下のドキュメントをもとに、各画面の外部設計書（機能仕様書）を作成してください。

■参照ドキュメント
- C:\Software\workspace\2026-c-02\user_requirements.md
- C:\Software\workspace\2026-c-02\docs\system_design.md

■作成物
`C:\Software\workspace\2026-c-02\docs\external_design\` 配下に以下5ファイルを作成：
- 01_product_list.md（商品一覧画面）
- 02_product_detail.md（商品詳細画面）
- 03_cart.md（カート画面）
- 04_order_form.md（注文フォーム画面）
- 05_order_complete.md（注文完了画面）

■各ファイルの記載項目
1. 画面概要
2. 画面レイアウト（テキストベースのワイヤーフレーム）
3. 表示項目と表示条件
4. ユーザー操作と動作（ボタン・リンクごとに記載）
5. バリデーションルール（注文フォームのみ）
6. 使用するAPIエンドポイント
7. 画面遷移先
```

---

## Phase 3｜詳細設計書作成（資材仕様）

**投げ方**：Phase 2完了後、新規セッション推奨（前工程の成果物を参照させる）

```
以下のドキュメントをもとに、実装資材の詳細設計書を作成してください。

■参照ドキュメント
- C:\Software\workspace\2026-c-02\docs\system_design.md
- C:\Software\workspace\2026-c-02\docs\external_design\（ディレクトリ内の全ファイル）

■作成物
`C:\Software\workspace\2026-c-02\docs\detailed_design\` 配下に以下を作成：

【バックエンド】
- api_books.md：書籍関連APIの仕様（GET /api/books, GET /api/books/:id）
- api_orders.md：注文関連APIの仕様（POST /api/orders）
- data_models.md：TypeScript型定義・インターフェース一覧（コード例付き）
- data_store.md：JSONファイルの構造とCRUD操作仕様

【フロントエンド】
- components.md：各Reactコンポーネントのprops・state・責務・使用箇所
- pages.md：各ページのルーティング・データ取得方式・状態管理
- api_client.md：フロントエンドからバックエンドへのAPI呼び出し関数仕様

■APIファイルの必須記載項目
- エンドポイント・HTTPメソッド
- リクエスト形式（ヘッダー・パラメータ・ボディのJSON例）
- レスポンス形式（成功・エラーのJSON例）
- バリデーションルールと対応エラーコード
- 処理フロー（箇条書き）
```

---

## Phase 4｜バックエンド実装

**投げ方**：Phase 3完了後、新規セッション推奨

```
以下の詳細設計書をもとに、バックエンドAPIを実装してください。

■参照ドキュメント
- C:\Software\workspace\2026-c-02\docs\detailed_design\api_books.md
- C:\Software\workspace\2026-c-02\docs\detailed_design\api_orders.md
- C:\Software\workspace\2026-c-02\docs\detailed_design\data_models.md
- C:\Software\workspace\2026-c-02\docs\detailed_design\data_store.md

■実装先
C:\Software\workspace\2026-c-02\backend\

■技術スタック
- Node.js + Express + TypeScript
- バリデーション：zod
- テスト：Jest + ts-jest + supertest
- ポート：3001

■実装内容（この順で実装すること）
1. package.json, tsconfig.json 初期化
2. 型定義（src/types/index.ts）
3. データアクセス層（src/lib/dataStore.ts）
4. ルーター（src/routes/books.ts, src/routes/orders.ts）
5. エントリーポイント（src/index.ts）
6. 初期データ（data/books.json：書籍10冊以上のサンプルデータ）

■制約
- TypeScript strict modeを有効にし、any禁止
- CORS設定でhttp://localhost:3000からのアクセスを許可
- エラーハンドリングを適切に実装（400/404/500）
- 実装完了後に `npx ts-node src/index.ts` でサーバー起動を確認すること
```

---

## Phase 5｜フロントエンド実装

**投げ方**：Phase 4完了後、新規セッション推奨

```
以下の詳細設計書をもとに、フロントエンドを実装してください。

■参照ドキュメント
- C:\Software\workspace\2026-c-02\docs\external_design\（全ファイル）
- C:\Software\workspace\2026-c-02\docs\detailed_design\components.md
- C:\Software\workspace\2026-c-02\docs\detailed_design\pages.md
- C:\Software\workspace\2026-c-02\docs\detailed_design\api_client.md

■実装先
C:\Software\workspace\2026-c-02\frontend\

■技術スタック
- Next.js 14（App Router）+ TypeScript（strict mode）
- スタイリング：Tailwind CSS
- 状態管理：React Context API（カート状態のみ）
- APIベースURL：http://localhost:3001（環境変数 NEXT_PUBLIC_API_URL で管理）
- ポート：3000

■実装内容（この順で実装すること）
1. プロジェクト初期化（next.config.ts, tailwind.config.ts等）
2. 型定義（src/types/index.ts）
3. APIクライアント（src/lib/api.ts）
4. カートコンテキスト（src/contexts/CartContext.tsx）
5. 共通コンポーネント（src/components/配下）
6. 各ページ（src/app/配下：一覧・詳細・カート・注文フォーム・注文完了）

■制約
- any禁止、TypeScript strictモード維持
- カートはLocalStorageで永続化（リロード後も保持）
- レスポンシブデザイン対応（モバイル幅 375px 基準）
- Server Componentsを活用し、'use client'は最小限に留めること
- 実装完了後に `npm run dev` で起動し、全ページの表示を確認すること
```

---

## Phase 6a｜バックエンド単体テスト

**投げ方**：Phase 4完了後（Phase 5と並行可）、バックエンドの実装コードが存在するセッション or 新規セッション

```
バックエンドの単体テストを実装し、実行してください。

■対象コード
C:\Software\workspace\2026-c-02\backend\

■テストフレームワーク：Jest + ts-jest + supertest

■テスト対象・観点

【APIエンドポイント（routes/books.ts, routes/orders.ts）】
- GET /api/books → 書籍配列が返ること
- GET /api/books/:id（存在するID）→ 書籍オブジェクトが返ること
- GET /api/books/:id（存在しないID）→ 404が返ること
- POST /api/orders（正常データ）→ 201と注文番号が返ること
- POST /api/orders（必須項目欠損）→ 400が返ること
- POST /api/orders（items空配列）→ 400が返ること

【データストア（lib/dataStore.ts）】
- 書籍一覧取得
- IDによる書籍取得（存在・不存在）
- 注文保存と注文番号の採番ロジック

■作成物
1. テストファイル（__tests__/配下 or *.test.ts）
2. `C:\Software\workspace\2026-c-02\docs\test_results_backend.md`
   → `npm test -- --coverage` の出力結果（全文）を貼付し、パス/失敗を明記

■完了条件
全テストがパスし、カバレッジレポートが出力されること
```

---

## Phase 6b｜フロントエンド単体テスト

**投げ方**：Phase 5完了後（Phase 6aと並行可）

```
フロントエンドの単体テストを実装し、実行してください。

■対象コード
C:\Software\workspace\2026-c-02\frontend\

■テストフレームワーク：Jest + React Testing Library

■テスト対象・観点

【CartContext（contexts/CartContext.tsx）】
- 商品追加でカートに追加されること
- 同一商品を追加すると数量がインクリメントされること
- 数量変更が正しく反映されること
- 商品削除でカートから除かれること
- 合計金額（小計の総和）が正しく計算されること

【コンポーネント】
- BookCard：タイトル・著者・価格が表示されること
- CartItem：書名・数量・小計が表示されること、削除ボタンのクリックで onRemove が呼ばれること
- OrderSummary：注文商品リストと合計金額が表示されること

【注文フォームバリデーション（app/order/page.tsx）】
- 全項目空欄で送信するとエラーメッセージが表示されること
- メールアドレス形式不正でエラーメッセージが表示されること
- 全項目入力済みでエラーが表示されないこと

■作成物
1. テストファイル（__tests__/配下 or *.test.tsx）
2. `C:\Software\workspace\2026-c-02\docs\test_results_frontend.md`
   → `npm test -- --coverage` の出力結果（全文）を貼付し、パス/失敗を明記

■完了条件
全テストがパスし、カバレッジレポートが出力されること
```

---

## Phase 7｜Docker環境構築・動作確認

**投げ方**：Phase 6a・6b完了後、新規セッション推奨

```
Docker Composeを用いてローカル環境を構築し、購買フローの動作確認を行ってください。

■対象ディレクトリ
C:\Software\workspace\2026-c-02\

■作成物
- docker-compose.yml（ルート）
- backend/Dockerfile
- frontend/Dockerfile
- backend/.dockerignore
- frontend/.dockerignore

■Docker Compose構成
- frontend サービス：ポート3000、Next.js開発サーバー
- backend サービス：ポート3001、Node.js Express
- 同一Dockerネットワークでサービス間通信
- backend/data/ をホストボリュームにマウント（JSONデータ永続化）
- frontendの環境変数 NEXT_PUBLIC_API_URL=http://localhost:3001 を設定

■動作確認手順（実際に実行して確認すること）
1. `docker compose up --build` でコンテナ起動
2. http://localhost:3000 で商品一覧が表示されること
3. 商品をクリックして詳細画面へ遷移し、カートに追加できること
4. カート画面で数量変更・削除・合計金額リアルタイム更新ができること
5. 注文フォームでバリデーションエラーが表示されること
6. 全項目入力して「注文する」を押すと注文完了画面に遷移し、注文番号が表示されること

■成果物
`C:\Software\workspace\2026-c-02\docs\verification_report.md` を作成し、
各確認項目のOK/NG・確認できたURL・レスポンス内容を記録すること

■完了条件
全コンテナが正常起動し、購買フロー全体（U-01〜U-18）が動作すること
```

---

## 補足：プロンプト投入時の共通ポイント

| 観点 | 推奨 |
|------|------|
| **セッション管理** | Phase 1〜3は設計フェーズとして同一セッション可。Phase 4以降は新規セッションにして設計書を参照させる形が安定 |
| **エラー時の対処** | 実行エラーが出たら「エラー内容を貼って原因と修正を指示」する形で継続。セッションを切らない |
| **6a/6b の並行** | 別ウィンドウで同時投入可能（互いに依存なし） |
| **成果物確認** | 各Phaseで `docs/` 配下のMDが更新されているか目視確認してから次へ進む |

---

## 期待する最終ディレクトリ構成

```
2026-c-02/
├── user_requirements.md
├── development_prompt_guide.md（本ファイル）
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # 商品一覧
│   │   │   ├── books/[id]/page.tsx         # 商品詳細
│   │   │   ├── cart/page.tsx               # カート
│   │   │   ├── order/page.tsx              # 注文フォーム
│   │   │   └── order/complete/page.tsx     # 注文完了
│   │   ├── components/
│   │   ├── contexts/CartContext.tsx
│   │   ├── lib/api.ts
│   │   └── types/index.ts
│   └── __tests__/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── books.ts
│   │   │   └── orders.ts
│   │   ├── lib/dataStore.ts
│   │   └── types/index.ts
│   ├── data/
│   │   ├── books.json
│   │   └── orders.json
│   └── __tests__/
└── docs/
    ├── system_design.md
    ├── external_design/
    │   ├── 01_product_list.md
    │   ├── 02_product_detail.md
    │   ├── 03_cart.md
    │   ├── 04_order_form.md
    │   └── 05_order_complete.md
    ├── detailed_design/
    │   ├── api_books.md
    │   ├── api_orders.md
    │   ├── data_models.md
    │   ├── data_store.md
    │   ├── components.md
    │   ├── pages.md
    │   └── api_client.md
    ├── test_results_backend.md
    ├── test_results_frontend.md
    └── verification_report.md
```
