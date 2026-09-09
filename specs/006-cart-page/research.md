# Research: カート画面

**Status**: 全項目解決済み（Technical Context に `NEEDS CLARIFICATION` なし）

Technical Context のすべての項目は `tech-stack.md`（技術選定書）・`requirements.md`（要件定義書）・`spec.md` の Clarifications セッション、および `004-book-list-page` / `005-book-detail-page` で確定済みの実装方針から確定できたため、未解決事項はない。以下は本機能固有の実装方式レベルの技術決定を記録する。

## D-01: 数量増減・削除操作の実装場所

- **Decision**: 既存の `frontend/src/context/CartContext.tsx` に `increaseQuantity(bookId)` / `decreaseQuantity(bookId)` / `removeItem(bookId)` を追加する。`decreaseQuantity` は対象項目の `quantity` が2以上のときのみ1減らし、1のときは何もしない（下限1をコンテキスト側でも保証する防御的実装。UI側でも数量1の減少ボタンを無効化する）。新規APIエンドポイントは追加しない。
- **Rationale**: カート状態は`005`で確立済みの`CartContext`（`localStorage`保持）に一元化されており、tech-stack.md §6の方針（状態管理ライブラリ不使用、Context/useStateのみ）を踏襲するのが最小の変更。UIの無効化とコンテキスト側の下限ガードを二重に持たせることで、将来UI以外から呼び出された場合でも不変条件（数量1以上、FR-005）を破らない。
- **Alternatives considered**: 数量の下限チェックをUIコンポーネント（`CartItemRow`）側のみで行い、コンテキストは無条件に−1する方式 → コンテキストの不変条件がUI実装に依存してしまい、単体テストでコンテキスト単独の不変条件を保証できなくなるため不採用。

## D-02: 合計金額計算ロジックの切り出し

- **Decision**: `frontend/src/lib/calcCartTotal.ts` に `calcCartTotal(items: CartItem[]): number` を新設する（`items.reduce((sum, item) => sum + item.price * item.quantity, 0)`）。各行の小計（`price * quantity`）はこの合計と同じ計算式のため、行内では都度計算し、テストは合計関数の側に集約する。
- **Rationale**: tech-stack.md §7 命名規則の例に `calcCartTotal.ts` が明記されており、この機能で新設することが規約上想定されている。憲法§2「主要なビジネスロジックには単体テスト必須」に対応する対象として最も明確な計算ロジックであり、純粋関数として切り出すことでUIから独立してテストできる（SC-004）。
- **Alternatives considered**: `CartPage` コンポーネント内にインラインで合計計算を書く → テスト対象がコンポーネント経由でのみ検証可能になり、`calcCartTotal.ts`という規約上の命名例とも乖離するため不採用。

## D-03: カートが空の場合の表示・導線

- **Decision**: `CartPage` は `items.length === 0` の場合、`004-book-list-page` で作成済みの `EmptyState` コンポーネントをそのまま再利用し、「カートに書籍がありません」等のメッセージと、商品一覧へ戻る `Link href="/"` を表示する。「注文手続きへ」ボタンはこの分岐では描画しない。
- **Rationale**: spec.md Clarificationsで「空カート時は注文手続きへボタンを非表示」と決定済み。既存の`EmptyState`（一覧画面の0件表示で使用中）を再利用することで、憲法§3「空状態の扱いを全画面で統一」を満たし、新規コンポーネントを増やさない。
- **Alternatives considered**: 専用の`CartEmptyState`コンポーネントを新設する → 見た目・文言のパターンが増え、既存の統一方針（`EmptyState`の使い回し）と矛盾するため不採用。

## D-04: 注文フォーム画面への遷移

- **Decision**: 「注文手続きへ」ボタンは Next.js の `Link href="/order"` として実装する。`/order`（注文フォーム画面、REQ-012〜REQ-015相当）は本機能のスコープ外であり、別途今後のfeatureで実装される。本機能では遷移先ページの存在有無に関わらず、リンク自体（押下時の遷移動作）のみを実装・テスト対象とする。
- **Rationale**: 要件定義書の画面遷移図で「カート →（注文手続きへ）→ 注文フォーム」が定義されており（requirements.md §6）、パスは他画面のURL慣例（`/`, `/books/[id]`）に合わせ`/order`とするのが自然。REQ-011の要求は「注文フォーム画面へ遷移するボタンを提供すること」であり、注文フォーム画面自体の実装は別スペックの責務。
- **Alternatives considered**: 本機能内で`/order`のプレースホルダーページまで作成する → spec.mdのスコープ（REQ-007〜REQ-011）を超え、注文フォーム画面の要件（REQ-012〜REQ-015）を先取りしてしまうため不採用。
