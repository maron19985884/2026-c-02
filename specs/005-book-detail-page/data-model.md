# Data Model: 商品詳細画面

## Book（書籍）

`004-book-list-page` の `data-model.md` で定義済みの `books` テーブル（DBスキーマに変更なし）を再利用する。本機能では `description` を含む全属性を返す。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | number | ✓ | 書籍を一意に識別するID |
| title | string | ✓ | 書籍タイトル（FR-001） |
| author | string | ✓ | 著者名（FR-001） |
| price | number | ✓ | 税込み価格（円）。税抜き価格・税率は保持しない（Clarifications Session 2026-09-09） |
| imageUrl | string \| null | — | 書影画像のURL。未設定時は共通プレースホルダー画像を表示（FR-007、`004`のD-02を踏襲） |
| description | string \| null | — | 説明文。**商品詳細画面で表示する**（一覧画面ではスコープ外） |

### バリデーション・不変条件

- `id` は正の整数で一意（DB制約：PRIMARY KEY AUTO_INCREMENT）。存在しない `id` を指定した場合、APIは404を返す（FR-009）。
- `price` は0以上の整数（円単位、小数不可、税込み）。
- `title` / `author` は空文字を許容しない（`NOT NULL`）。

## CartItem（カート項目）

購入希望者が「カートに追加」した書籍を、追加時点の情報のスナップショットとして一時的に保持する単位（要件定義書§7「カート」の実体）。バックエンドには永続化せず、フロントエンドの `CartContext` が保持し `localStorage`（キー: `bookstore.cart`）にシリアライズする（`research.md` D-03, D-04）。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| bookId | number | ✓ | 対象書籍のID（`Book.id` への参照） |
| title | string | ✓ | 追加時点の書籍タイトル（カート画面表示用のスナップショット） |
| price | number | ✓ | 追加時点の税込み価格（円）。カートの小計・合計計算の基準値 |
| imageUrl | string \| null | — | 追加時点の書影URL |
| quantity | number | ✓ | カート内の数量。初回追加時は1、以降「カートに追加」が押されるたびに1ずつ加算する。上限なし（Clarifications Session 2026-09-09） |

### バリデーション・不変条件

- `bookId` はカート内で一意（同一書籍は1行に集約し、複数行に分割しない。Clarifications Session 2026-09-09 / FR-010）。
- `quantity` は1以上の整数。上限は設けない。
- カート全体は `CartItem` の配列としてローカル状態・`localStorage` に保持する。

### 状態・関係

- 本機能（商品詳細画面）は `CartItem` の**新規追加・数量加算のみ**を行う。数量の減算・削除（REQ-009）、合計金額の集計・表示（REQ-010）は今後のカート画面のスコープであり、本機能では扱わない。
- `CartContext` はルートレイアウト（`app/layout.tsx`）に配置し、商品一覧画面・商品詳細画面を含む全画面からアクセス可能な状態として、画面遷移をまたいで保持する（REQ-006、FR-005）。
