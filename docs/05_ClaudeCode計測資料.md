# Claude Code 実装計測資料

| 項目 | 内容 |
|---|---|
| システム名 | 個人運営オンライン書店（購買フロー特化版） |
| 実装日 | 2026年05月12日 |
| 使用モデル | claude-sonnet-4-6 |
| 実装環境 | Claude Code CLI（ターミナル） |

---

## 1. プロンプト内容履歴

会話の流れとプロンプトを時系列で記録する。

| # | ターン | 種別 | プロンプト概要 | 実施内容 |
|---|---|---|---|---|
| 1 | ユーザー | 指示 | `~/docker-compose.yml を読み込み、MySQLコンテナのサービス名・ポート番号・データベース名・ユーザー名・パスワードを確認してください。確認した内容をもとに backend/.env ファイルを作成し、mysql2/promise で接続テストを行ってください。接続成功を確認したうえで、次のフェーズに進んでください。` | DB接続確認・.env作成・接続テスト |
| 2 | Assistant | 実施 | docker-compose.yml の読み込みと接続情報確認 | サービス名=mysql、Port=3306、DB=appdb、User=appuser、PW=password を確認 |
| 3 | Assistant | 実施 | backend/.env 作成 | DB接続情報を記述した .env を生成 |
| 4 | Assistant | 実施 | Node.js --env-file で接続テスト実施 | `SELECT 1+1` で mysql2/promise 接続成功を確認 |
| 5 | Assistant | 実施 | npm install（依存パッケージ導入）| dotenv / ts-jest 等を package.json に追加 |
| 6 | Assistant | 実施 | DB 接続モジュール作成（src/db/index.ts） | mysql2/promise プール接続を実装 |
| 7 | ユーザー | 指示 | `お願いします`（次フェーズ続行） | DB初期化・バックエンドAPI実装フェーズへ |
| 8 | Assistant | 実施 | mysql/init/01_init.sql 作成・投入 | books / orders / order_items テーブル定義＋サンプルデータ8件 |
| 9 | Assistant | 実施 | バックエンド実装 | types / models / controllers / routes を実装（TypeScript strict） |
| 10 | Assistant | 実施 | Express app を app.ts / index.ts に分離 | supertest でテスト可能な構成に変更 |
| 11 | Assistant | 実施 | API 動作確認 | /health・/api/books・/api/orders 全エンドポイント疎通確認 |
| 12 | ユーザー | 指示 | `お願いします`（次フェーズ続行） | フロントエンド実装フェーズへ |
| 13 | Assistant | 実施 | frontend ディレクトリ構成作成 | types / api / hooks / components / app 各ディレクトリを整備 |
| 14 | Assistant | 実施 | 共通型定義作成（types/index.ts） | Book / Order / CartItem 等のインターフェース定義 |
| 15 | Assistant | 実施 | API クライアント作成（api/client.ts） | fetch ラッパー（SSR/CSR で URL 切り替え） |
| 16 | Assistant | 実施 | カート Context 作成（hooks/useCart.ts） | localStorage 永続化付き CartProvider + useCart フック |
| 17 | Assistant | 実施 | 書籍一覧画面実装（app/page.tsx） | Server Component、グリッド表示 |
| 18 | Assistant | 実施 | 書籍詳細画面実装（app/books/[id]/page.tsx） | Client Component、カート追加 |
| 19 | Assistant | 実施 | カート画面実装（app/cart/page.tsx） | 数量変更・削除・合計表示 |
| 20 | Assistant | 実施 | 注文フォーム画面実装（app/checkout/page.tsx） | バリデーション・POST注文 |
| 21 | Assistant | 実施 | 注文完了画面実装（app/orders/[id]/page.tsx） | Server Component、注文番号表示 |
| 22 | Assistant | 実施 | TypeScript 型チェック・バグ修正 | BookCard に 'use client' 追加（Server Component エラー解消） |
| 23 | ユーザー | 指示 | `お願いします`（次フェーズ続行） | 疎通確認・単体テストフェーズへ |
| 24 | Assistant | 実施 | Jest + supertest セットアップ | jest.config を package.json に記述、ts-jest 設定 |
| 25 | Assistant | 実施 | 単体テスト作成（3スイート・14件） | health / books / orders テスト実装 |
| 26 | Assistant | 実施 | npm test 実施・全件合格確認 | 14/14 PASS |
| 27 | Assistant | 実施 | 統合疎通確認（全エンドポイント） | 正常系・異常系を curl で確認 |
| 28 | ユーザー | 指示 | `docker-compose.yml を起動したらアプリが起動するようにして` | Docker Compose 対応フェーズ |
| 29 | Assistant | 実施 | .dockerignore 作成（backend・frontend） | node_modules / dist / .env を除外 |
| 30 | Assistant | 実施 | frontend dev スクリプトに --hostname 0.0.0.0 追加 | コンテナ外からアクセス可能に |
| 31 | Assistant | 実施 | api/client.ts に SSR/CSR URL 切り替えロジック追加 | INTERNAL_API_URL（内部）/ NEXT_PUBLIC_API_URL（ブラウザ）を分離 |
| 32 | Assistant | 実施 | docker-compose.yml 修正 | INTERNAL_API_URL 追加、backend ヘルスチェック追加、依存関係強化 |
| 33 | Assistant | 実施 | docker compose build & up 実施・動作確認 | 全コンテナ起動（mysql healthy → backend healthy → frontend 200 OK） |
| 34 | ユーザー | 指示 | `設計書およびテスト資料として…作成して` | 設計書・テスト結果・計測資料の作成 |
| 35 | Assistant | 実施 | docs/ 配下に5種のドキュメントを作成 | 本資料を含む全5ファイルを生成 |

---

## 2. トークン使用量（推定）

> **注意:** Claude Code CLI はリアルタイムのトークン数を UI 上に表示しません。  
> 以下の数値は、会話ターン数・生成コンテンツ量・ファイル操作数をもとに推定した参考値です。

### 推定根拠

| 要素 | 推定方法 |
|---|---|
| Input tokens | 各ターンで読み込んだファイル内容 + 会話履歴の累積 |
| Output tokens | 生成したコード・ドキュメント・回答文の文字数 × 換算係数（~0.75 token/文字） |
| キャッシュ | Claude Code は prompt caching を活用（繰り返し参照ファイルは割引） |

### ターン別推定トークン数

| フェーズ | 主な作業 | 推定 Input | 推定 Output | 小計（推定） |
|---|---|---|---|---|
| Phase 1: DB接続確認 | docker-compose.yml 読み込み、.env 作成、接続テスト | 8,000 | 2,000 | 10,000 |
| Phase 2: DB初期化・バックエンド実装 | init.sql、types / models / controllers / routes | 15,000 | 8,000 | 23,000 |
| Phase 3: フロントエンド実装 | 5画面 + Context + API クライアント | 20,000 | 12,000 | 32,000 |
| Phase 4: 疎通確認・単体テスト | Jest セットアップ、14件テスト実装・実行 | 12,000 | 5,000 | 17,000 |
| Phase 5: Docker Compose 対応 | .dockerignore、docker-compose.yml 修正、ビルド | 10,000 | 4,000 | 14,000 |
| Phase 6: 設計書・テスト資料作成 | 5種のドキュメント生成 | 8,000 | 10,000 | 18,000 |
| **合計（推定）** | | **73,000** | **41,000** | **114,000** |

### 参考: 生成した主要ファイルと行数

| ファイル | 行数 | 種別 |
|---|---|---|
| backend/src/app.ts | 27 | TypeScript |
| backend/src/index.ts | 5 | TypeScript |
| backend/src/db/index.ts | 16 | TypeScript |
| backend/src/types/index.ts | 38 | TypeScript |
| backend/src/models/bookModel.ts | 20 | TypeScript |
| backend/src/models/orderModel.ts | 52 | TypeScript |
| backend/src/controllers/bookController.ts | 38 | TypeScript |
| backend/src/controllers/orderController.ts | 55 | TypeScript |
| backend/src/routes/books.ts | 10 | TypeScript |
| backend/src/routes/orders.ts | 10 | TypeScript |
| backend/src/__tests__/health.test.ts | 17 | TypeScript |
| backend/src/__tests__/books.test.ts | 46 | TypeScript |
| backend/src/__tests__/orders.test.ts | 77 | TypeScript |
| frontend/src/types/index.ts | 42 | TypeScript |
| frontend/src/api/client.ts | 48 | TypeScript |
| frontend/src/hooks/useCart.ts | 65 | TypeScript |
| frontend/src/components/Header.tsx | 26 | TSX |
| frontend/src/components/BookCard.tsx | 42 | TSX |
| frontend/src/app/layout.tsx | 13 | TSX |
| frontend/src/app/globals.css | 28 | CSS |
| frontend/src/app/page.tsx | 35 | TSX |
| frontend/src/app/books/[id]/page.tsx | 76 | TSX |
| frontend/src/app/cart/page.tsx | 76 | TSX |
| frontend/src/app/checkout/page.tsx | 106 | TSX |
| frontend/src/app/orders/[id]/page.tsx | 68 | TSX |
| mysql/init/01_init.sql | 49 | SQL |
| docker-compose.yml | 90 | YAML |
| **合計** | **1,276 行** | |

---

## 3. 実装効率指標

| 指標 | 値 |
|---|---|
| 実装フェーズ数 | 5フェーズ |
| ユーザープロンプト数（指示） | 6 回 |
| 生成ファイル数 | 27 ファイル |
| 総コード行数（推定） | 約 1,276 行 |
| テスト件数 | 14 件 |
| テスト合格率 | 100%（14/14） |
| TypeScript エラー | 0 件（backend・frontend 両方） |
| Docker Compose 起動確認 | 全3コンテナ正常起動 |

---

## 4. 実装上の主なトラブルと解決

| # | 事象 | 原因 | 解決策 |
|---|---|---|---|
| 1 | Docker daemon が停止していた | Docker Desktop が起動していなかった | `open -a Docker` で起動後に再実施 |
| 2 | mysql2 が見つからない | node_modules が空だった | `npm install` で依存パッケージをインストール |
| 3 | BookCard でイベントハンドラエラー | Server Component に onMouseEnter を渡した | `'use client'` ディレクティブを追加 |
| 4 | backend コンテナが unhealthy | 古い node_modules 匿名ボリュームに dotenv が入っていなかった | dangling volume を削除して再ビルド |
| 5 | next.config.ts が非対応エラー | Next.js 14 は `.ts` 設定ファイル非対応 | `next.config.mjs` に変換 |
| 6 | SSR からバックエンドに届かない | `localhost:4000` はコンテナ内ではバックエンドを指さない | `INTERNAL_API_URL=http://backend:4000` を追加し、サーバー/クライアントで URL 切り替え |
