# Research: 商品詳細画面

**Status**: 全項目解決済み（Technical Context に `NEEDS CLARIFICATION` なし）

Technical Context のすべての項目は `tech-stack.md`（技術選定書）・`requirements.md`（要件定義書）・`spec.md` の Clarifications セッション、および `004-book-list-page` で確定済みの実装方針から確定できたため、未解決事項はない。以下は本機能固有の実装方式レベルの技術決定を記録する。

## D-01: 書籍単体取得APIの形状

- **Decision**: `GET /api/books/:id` を新設する。`books` テーブルを `WHERE id = ?` で検索し、該当書籍を `description` を含む形で返す。存在しない場合は `404`、DBエラー時は `500` を返す。
- **Rationale**: 商品詳細画面は説明文（`description`）を必要とする（FR-001）が、一覧APIの `BookListItem` には含まれない（004の `data-model.md` で意図的に除外済み）。既存の `books` テーブルに列追加は不要で、SELECT対象列を増やすだけで済む。
- **Alternatives considered**: `GET /api/books` にクエリパラメータ（`?id=`）を追加する方式 → REST設計として単一リソース取得はパスパラメータが自然であり、tech-stack.md §7「REST APIパス: ケバブケース・複数形リソース」の慣例（`GET /api/books/:id`）にも合致するため不採用。

## D-02: 存在しない書籍IDの扱い

- **Decision**: バックエンドは該当行が無い場合に `404 { "error": "Book not found" }` を返す。フロントエンドの `fetchBookById` は `res.ok` が false の場合（404・500 いずれも）例外を送出し、`page.tsx` がキャッチして商品一覧画面と同じ `ErrorNotice` を表示する。専用の「見つかりません」画面は作らない。
- **Rationale**: spec.md Clarifications で「共通エラー表示を流用」と決定済み。404と500を呼び出し側で区別せず同一のエラー表示にまとめることで、UIパターンを増やさない（憲法§3）。
- **Alternatives considered**: Next.js の `notFound()` + 専用 `not-found.tsx` を使う → 見た目・文言が一覧画面のエラー表示と異なるコンポーネントになり、Clarificationsの決定（共通エラー表示の流用）と矛盾するため不採用。

## D-03: カート状態の保持方式

- **Decision**: `frontend/src/context/CartContext.tsx` に `CartProvider` と `useCart()` フックを新設する。`CartProvider` は `frontend/src/app/layout.tsx`（ルートレイアウト）に配置し、初期状態を `localStorage`（キー: `bookstore.cart`）から復元、状態変更のたびに `localStorage` へ書き戻す。`useCart()` は `addItem(book)` を公開し、同一 `bookId` が既に存在すれば数量を+1、存在しなければ数量1の新規項目を追加する（上限なし、Clarifications）。
- **Rationale**: tech-stack.md §6「カート状態はReactのContext/useState + localStorageで足りる規模のため導入しない（Reduxを却下）」の方針に直接対応する最小実装。ルートレイアウトに置くことで、商品一覧⇄商品詳細間のNext.js クライアントサイド遷移でもReactツリーがアンマウントされずカート状態が保持され（REQ-006）、`localStorage` によりページ全体のリロードにも耐える。
- **Alternatives considered**: 画面遷移のたびにカートをバックエンドAPIへ都度保存する方式 → 要件定義書§2でカートはあくまで「一時的に保持する仕組み」（§7用語定義）であり、注文確定（REQ-015）まではサーバー永続化が不要。新規APIとDBテーブルを増やすことになり、憲法§5（技術選定の追加はtech-stack.mdで人間が確定）にも反するため不採用。

## D-04: カート項目のデータ形状（スナップショット方式）

- **Decision**: `CartItem` は `{ bookId, title, price, imageUrl, quantity }` のように、追加時点の書籍情報をスナップショットとして保持する（`Book` への参照IDのみは持たない）。
- **Rationale**: 今後のカート画面（REQ-007、書名・単価・数量・小計の表示）が、書籍IDの配列から都度一括取得する新規APIを必要とせずに描画できる。また要件定義書に在庫管理がないため書籍が削除される可能性は低いが、価格変更等があっても「カートに追加した時点の価格」で表示する一般的なECの挙動に自然に一致する。
- **Alternatives considered**: `{ bookId, quantity }` のみを保持し、カート画面表示時に `GET /api/books` 等から書籍情報を都度引き直す方式 → 複数ID一括取得APIが現状存在せず、本機能のスコープ外である新規APIの追加が必要になるため不採用。

## D-05: 「カートに追加」ボタンのフィードバック実装

- **Decision**: `AddToCartButton`（Client Component）は `onClick` で `useCart().addItem(book)` を呼び出した後、ボタンのラベル状態を `useState` で一時的に「追加しました」に切り替え、`setTimeout` で一定時間後（例: 1.5秒）に「カートに追加」へ戻す。連打・二重クリックに対する抑止（デバウンス等）は行わず、クリックごとに独立して `addItem` を呼び出す。
- **Rationale**: spec.md Clarifications「ボタン表記を一時変化」「連打時も常にクリックごとに+1」の決定をそのまま反映する最小実装。専用の通知（トースト）コンポーネントを新設しない。
- **Alternatives considered**: グローバルなトースト通知コンポーネントを新設する → Clarificationsで明示的に却下された選択肢であり、UIコンポーネントを不必要に増やすため不採用。
