# Quickstart: 商品一覧・商品詳細

## 前提

- Docker / Docker Compose が利用可能であること（`requirements.md`制約条件）
- `docs/tech-stack-template.md`の技術スタックに基づき構築されていること

## 起動手順

1. `docker compose up -d` でfrontend（3000番）・backend（4000番）・mysql（3306番）を起動する
2. `mysql/init/01_books_seed.sql`により`books`テーブルとサンプルデータが自動投入されることを確認する
3. `http://localhost:3000` にアクセスし、商品一覧画面が表示されることを確認する

## 動作確認シナリオ（spec.mdの受け入れ基準に対応）

| # | 手順 | 期待結果 | 対応 |
|---|---|---|---|
| 1 | `http://localhost:3000` を開く | 販売中の書籍がグリッド形式で、登録順（新しい書籍が先頭）に表示される | US1 |
| 2 | 一覧の書籍カードをクリックする | `/books/{id}` に遷移し、書影・タイトル・著者・価格・説明文が表示される | US2 |
| 3 | 存在しない書籍ID（例: `/books/99999`）に直接アクセスする | 「見つかりません」メッセージと一覧へ戻るリンクが表示される | US2 |
| 4 | 詳細画面で「カートに追加」を押す | 追加成功が画面上で分かる表示になる | US3 |
| 5 | 「カートに追加」後、一覧へ戻るリンクから一覧に戻る | 商品一覧画面に戻り、他の書籍を引き続き閲覧できる | US3 |
| 6 | `books`テーブルを全件`is_for_sale = 0`にした状態で一覧を開く | 「現在販売中の書籍はありません」等の空状態メッセージが表示される | Edge Case |

## API動作確認

```bash
curl http://localhost:4000/api/books
curl http://localhost:4000/api/books/1
curl -i http://localhost:4000/api/books/99999   # 404を確認
```

## テスト実行

```bash
# バックエンド（単体・契約テスト）
cd backend && npm run test

# フロントエンド（単体・コンポーネントテスト）
cd frontend && npm run test

# E2E（要: docker compose up -d が起動中であること）
cd e2e && npm install && npx playwright install --with-deps chromium && npm run test
```

E2Eテスト（`e2e/tests/book-catalog.spec.ts`）は上記シナリオ1・2・3・4・5と、キーボード操作のみでの
「カートに追加」実行（WCAG 2.1 AA、憲法セクション3）を自動化している。シナリオ6（空状態）は
シードデータの変更が必要なためE2E化しておらず、`frontend/tests/HomePage.test.tsx`のモックテストで
代替している。
