# Research: 注文完了画面

**Status**: 全項目解決済み（Technical Context に `NEEDS CLARIFICATION` なし）

Technical Context のすべての項目は `tech-stack.md`（技術選定書）・`requirements.md`（要件定義書）・`spec.md` の Clarifications セッション、および `007-order-form-page` で確定済みの実装方針から確定できたため、未解決事項はない。以下は本機能固有の実装方式レベルの技術決定を記録する。

## D-01: 注文情報の再取得エンドポイント設計

- **Decision**: `backend/src/api/ordersRouter.ts`に`GET /api/orders/:orderNumber`を新設する。`orderService.getOrderByNumber(orderNumber: string)`が`orders`テーブルを`order_number`（`UNIQUE`制約済み）で検索し、見つかれば`{ orderNumber: string }`を返し、見つからなければ`null`を返す。ルーターは`null`の場合`404`を返す。
- **Rationale**: spec.md の User Story 1〜3（完了メッセージ・注文番号・一覧へ戻るリンク）はいずれも顧客情報や注文明細の表示を要求しておらず、Key Entitiesも「少なくとも注文番号を表示する」としているのみ。CLAUDE.mdの基本姿勢（要件定義書に記載のない内容を勝手に追加しない）に従い、レスポンスは表示に必要な`orderNumber`のみに絞る。存在確認自体は、FR-008（有効な注文情報を取得できない場合は一覧へ差し戻す）を満たすために必須。
- **Alternatives considered**: 顧客情報・注文明細・合計金額も含むフルの`Order`オブジェクトを返す（`007`の`data-model.md`で定義済みの`Order`型をそのまま利用） → 将来の拡張に備えられるが、現時点のREQ-016〜018はそれらの表示を要求しておらず、過剰なAPI設計となるため不採用（YAGNI）。

## D-02: 注文完了画面のレンダリング方式とエラー時の挙動

- **Decision**: `frontend/src/app/order/complete/[orderNumber]/page.tsx`をサーバーコンポーネントとし、`fetchOrderByNumber(params.orderNumber)`（`API_INTERNAL_URL`経由、`books/[id]/page.tsx`と同じfetchパターン）で注文情報を取得する。取得に失敗した場合（404・通信エラーいずれも）、`next/navigation`の`redirect("/")`で商品一覧画面へ差し戻す。
- **Rationale**: spec.md Clarificationsで「取得失敗時は商品一覧画面へ自動的に差し戻す」と決定済み（FR-008）。`007`の空カード時のリダイレクト（`router.replace("/cart")`、クライアントコンポーネント）とは異なり、本画面はサーバーコンポーネントで初期表示時に注文情報が必須のため、Next.jsのサーバーサイド`redirect()`を使うことでクライアントへの一瞬の空表示（`007`のような`isLoaded`待ちのnullレンダリング）を避けられる。`books/[id]/page.tsx`はエラー時に`ErrorNotice`を表示する方針だが、本画面は「有効な注文情報がなければ表示すべき対象が存在しない」という前提のずれのため、`007`の空カート同様のリダイレクトパターンを踏襲する（spec.md Clarifications、憲法§3 UX一貫性）。
- **Alternatives considered**: `books/[id]/page.tsx`と同様に`ErrorNotice`を表示する → spec.md Clarificationsで「一覧へ差し戻す」と明示的に決定済みのため不採用。クライアントコンポーネント化して`007`と同じ`useEffect`ベースのリダイレクトにする → サーバーコンポーネントの方がシンプルで、`redirect()`は初回レンダリング前に完結するため不要な空表示が発生しない。

## D-03: カートクリアの実装箇所

- **Decision**: カートのクリア（spec.md FR-006）は`007-order-form-page`の実装（`frontend/src/app/order/page.tsx`が`createOrder`成功直後に`useCart().clearCart()`を呼び出す）で既に完了している。本機能では追加の実装を行わない。
- **Rationale**: `007`の`research.md` D-05で「注文確定成功後にカートをクリアする」ことが決定・実装済みであり、`008`のspec.md FR-006はその既存の振る舞いを機能仕様として追認するものである。同じ振る舞いを本機能で重複実装する必要はない。
- **Alternatives considered**: 注文完了画面の表示（マウント）時にもカートクリアを行う（冪等な二重実装） → `007`のタイミング決定（spec.md Clarifications「注文確定APIが成功した直後」）と矛盾せず不要な重複となるため不採用。

## D-04: ブラウザ再読み込み時の注文番号再表示

- **Decision**: 注文番号をNext.jsの動的ルートセグメント（`/order/complete/[orderNumber]`）としてURLに含めているため、ブラウザの再読み込みでも同じURLに対して同じ`fetchOrderByNumber`が実行され、同一の注文番号・完了メッセージが再表示される（追加の状態保存の仕組みは不要）。
- **Rationale**: spec.md Clarificationsで「注文番号をURLに含め、バックエンドから注文情報を再取得して表示する」と決定済み（FR-007）。`007`のD-07で既に`/order/complete/[orderNumber]`という動的ルートへの遷移が実装されているため、本機能はそのURL設計と整合する形でページ・APIを実装するだけでよい。
- **Alternatives considered**: `sessionStorage`等のブラウザストレージに注文情報を一時保存する → URLだけで再現可能な情報をブラウザストレージに二重管理する必要がなく、バックエンドの`orders`テーブルという単一の真実源（single source of truth）から再取得する方が単純で不整合が生じない。
