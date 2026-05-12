# Claude Code プロンプト集 — オンライン書店プロジェクト

> 各プロンプトは上から順に実行してください。  
> 前のフェーズが完了してから次のプロンプトを投入すること。

---

## Phase 0｜事前確認

```
~/docker-compose.yml を読み込み、MySQLコンテナのサービス名・ポート番号・データベース名・ユーザー名・パスワードを確認してください。
確認した内容をもとに backend/.env ファイルを作成し、mysql2/promise で接続テストを行ってください。
接続成功を確認したうえで、次のフェーズに進んでください。
```

---

## Phase 1｜DBセットアップ

```
以下の要件でMySQLのDDLを作成し、db/init.sql として保存してください。

テーブル：
1. books（商品）
   - id: INT AUTO_INCREMENT PRIMARY KEY
   - title: VARCHAR(255) NOT NULL
   - author: VARCHAR(255) NOT NULL
   - price: INT NOT NULL（税込価格、円）
   - description: TEXT
   - image_url: VARCHAR(512)
   - created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

2. orders（注文）
   - id: INT AUTO_INCREMENT PRIMARY KEY
   - order_number: VARCHAR(20) NOT NULL UNIQUE（形式: ORD-YYYYMMDD-XXXX）
   - customer_name: VARCHAR(255) NOT NULL
   - customer_address: TEXT NOT NULL
   - customer_email: VARCHAR(255) NOT NULL
   - total_amount: INT NOT NULL
   - created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

3. order_items（注文明細）
   - id: INT AUTO_INCREMENT PRIMARY KEY
   - order_id: INT NOT NULL（FK: orders.id）
   - book_id: INT NOT NULL（FK: books.id）
   - quantity: INT NOT NULL
   - unit_price: INT NOT NULL（注文時点の価格を保存）

サンプルデータとして booksテーブルに5件のダミーデータを挿入してください。
DDL作成後、Dockerコンテナに対してinit.sqlを実行し、テーブル作成を確認してください。
```

---

## Phase 2｜バックエンドAPI実装

```
backend/ ディレクトリに Node.js + TypeScript + Express の REST API を実装してください。
package.json の作成からすべて実施すること。

実装するエンドポイント：

1. GET /api/books
   - 全書籍一覧を返す
   - レスポンス: { data: Book[], error: null }

2. GET /api/books/:id
   - 指定IDの書籍詳細を返す
   - 存在しない場合: HTTP 404

3. POST /api/orders
   - リクエストボディ: { customerName, customerAddress, customerEmail, items: [{bookId, quantity}] }
   - バリデーション: customerName/customerAddress/customerEmailは必須、itemsは1件以上
   - 注文番号を ORD-YYYYMMDD-XXXX 形式で採番して保存
   - レスポンス: { data: { orderId, orderNumber }, error: null }

型定義はすべて backend/src/types/ に集約してください。
エラーハンドリングはExpressのエラーミドルウェアで一元管理してください。
実装後、curl コマンドで各エンドポイントの動作確認を行い結果を示してください。
```

---

## Phase 3｜フロントエンド実装

```
frontend/ ディレクトリに React + TypeScript + Vite のフロントエンドを実装してください。
package.json の作成からすべて実施すること。

実装する画面（React Router v6 で画面遷移を管理）：

1. 商品一覧ページ（/）
   - グリッドレイアウトで書籍一覧を表示
   - 各カードに書影・タイトル・著者・価格を表示
   - カードクリックで商品詳細へ遷移

2. 商品詳細ページ（/books/:id）
   - 書影・タイトル・著者・価格・説明文を表示
   - 「カートに追加」ボタン
   - 「一覧に戻る」リンク

3. カートページ（/cart）
   - 書名・単価・数量（増減ボタン）・小計を表示
   - 「削除」ボタン（即時合計更新）
   - 合計金額表示
   - 「注文手続きへ」ボタン

4. 注文フォームページ（/checkout）
   - 氏名・住所・メールアドレスの入力フォーム（すべて必須）
   - リアルタイムバリデーション（未入力・メール形式チェック）
   - 注文商品と合計金額のサマリー表示
   - 「注文する」ボタン

5. 注文完了ページ（/order-complete）
   - 注文完了メッセージ
   - 注文番号表示
   - 「商品一覧に戻る」リンク

カートの状態管理は React Context + useReducer で実装してください。
API通信は frontend/src/api/ にまとめ、fetch を使用してください。
バックエンドのAPIは http://localhost:3001 に向けてください（Viteのproxyで設定）。
```

---

## Phase 4｜単体テスト実施

```
以下の項目について単体テストを実施し、結果をコンソールに出力してください。

【バックエンドAPIテスト（curl使用）】
1. GET /api/books → 200, books配列が返ること
2. GET /api/books/1 → 200, 書籍データが返ること
3. GET /api/books/9999 → 404が返ること
4. POST /api/orders（正常） → 201, orderNumberが返ること
5. POST /api/orders（customerName未入力） → 400が返ること
6. POST /api/orders（items空） → 400が返ること

各テストについて以下を記録してください：
- テストケース番号・内容
- 実行コマンド
- 期待値
- 実際のレスポンス（ステータスコード + bodyの要約）
- 合否判定（OK / NG）

結果をmarkdown表形式で出力してください。
```

---

## Phase 5｜設計書・測定資料の最終確認

```
実装が完了した状態で、以下を確認・整理してください。

1. backend/src/routes/ 配下のエンドポイント一覧を表形式で出力してください
2. DB上のテーブル定義（SHOW CREATE TABLE）を3テーブル分出力してください
3. frontend/src/ のディレクトリ構成を tree 形式で出力してください
4. 上記をもとに、実装と要件定義書（user_requirements.md）のU-01〜U-18が
   すべて満たされているかチェックリスト形式で確認してください
```
