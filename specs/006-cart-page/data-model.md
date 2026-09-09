# Data Model: カート画面

## CartItem（カート項目）

`005-book-detail-page` の `data-model.md` / `frontend/src/types/cart.ts` で定義済みの型を再利用する（変更なし）。カート内の各行がこの型のインスタンス1件に対応する。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| bookId | number | ✓ | 対象書籍のID |
| title | string | ✓ | 追加時点の書籍タイトル（本画面の「書名」列に表示、FR-001） |
| price | number | ✓ | 追加時点の税込み単価（本画面の「単価」列に表示、FR-001） |
| imageUrl | string \| null | — | 追加時点の書影URL（本画面では未使用。カート画面は書影を表示要件に含まない） |
| quantity | number | ✓ | カート内の数量。1以上の整数、上限なし（FR-005） |

### バリデーション・不変条件

- `bookId` はカート内で一意（`005`のFR-010を踏襲、本機能でも1書籍1行を維持する）。
- `quantity` は1以上の整数。減少操作は`quantity`が2以上のときのみ許可し、1のときは減少ボタンを無効化して1未満にしない（FR-005）。増加に上限は設けない。
- カートから完全に取り除くには専用の削除操作（`removeItem`）を用いる。数量の減少では0にならない（FR-005, FR-006）。

## Cart（カート、導出データ）

`CartItem`の配列（`CartContext`の`items`）そのものであり、独立した永続化単位ではない。以下は本画面が導出して表示する値。

| 導出値 | 計算式 | 表示箇所 |
|---|---|---|
| 行小計 | `item.price * item.quantity` | 各`CartItemRow`（FR-001） |
| 合計金額 | `calcCartTotal(items)` = 全行小計の総和 | カート画面下部（FR-008） |

### 状態遷移

- **数量増加**（`increaseQuantity(bookId)`）: 対象行の`quantity`を+1する。上限なし。
- **数量減少**（`decreaseQuantity(bookId)`）: 対象行の`quantity`が2以上なら-1する。1のときは変化しない（UIでもボタンを無効化）。
- **削除**（`removeItem(bookId)`）: 対象行を配列から取り除く。結果として配列が空になった場合、画面は空状態表示に切り替わる（`data-model.md` D-03参照は`research.md`）。

## 画面外の関連エンティティ（参照のみ・変更なし）

- **Book（書籍）**: `004-book-list-page` / `005-book-detail-page` で定義済み。本画面はカート追加時点のスナップショット（`CartItem`）のみを扱い、`Book`テーブル・APIへの新規アクセスは発生しない。
