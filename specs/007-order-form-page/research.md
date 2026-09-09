# Research: 注文フォーム画面

**Status**: 全項目解決済み（Technical Context に `NEEDS CLARIFICATION` なし）

Technical Context のすべての項目は `tech-stack.md`（技術選定書）・`requirements.md`（要件定義書）・`spec.md` の Clarifications セッション、および `004`〜`006`で確定済みの実装方針から確定できたため、未解決事項はない。以下は本機能固有の実装方式レベルの技術決定を記録する。

## D-01: 注文番号の生成方式

- **Decision**: `backend/src/lib/generateOrderNumber.ts` に、Node標準の`crypto.randomBytes`を用いてULID風（Base32・26文字）の注文番号を生成する純粋関数`generateOrderNumber(): string`を新設する。生成はバックエンド側（`POST /api/orders`処理内）で行い、`orders.order_number`に`UNIQUE`制約付きで保存する。
- **Rationale**: tech-stack.md §6「却下した選択肢」で`ulid`npmパッケージは「`crypto.randomBytes`を用いた十数行の自前実装で再現できるため、依存を追加しない」と明記されており、この方針に従う。要件定義書§4（非機能要件）でも「注文番号発行」が単体テスト対象として明記されている。
- **Alternatives considered**: `ulid`パッケージの導入 → tech-stack.md §6で既に却下済み。連番（`orders.id`をそのまま注文番号として使う）→ 要件定義書§7「注文番号は注文を一意に特定する識別子」の定義自体は満たすが、tech-stack.md §6がULID形式・Base32 26文字を前提に却下理由を記載しているため、その方針を踏襲しULID風文字列を採用。

## D-02: 注文金額・書籍情報のスナップショット方式（価格改ざん防止）

- **Decision**: フロントエンドは`POST /api/orders`のリクエストに`bookId`と`quantity`のみを送信し、単価・書名・合計金額は送信しない。バックエンドの`orderService`が`bookId`ごとに`books`テーブルを参照して現在の`title`・`price`を取得し、`order_items`にスナップショットとして保存、`orders.total_amount`もサーバー側で算出する。
- **Rationale**: クライアントから送信された価格をそのまま信用すると、ブラウザの開発者ツール等で価格を改ざんして送信できてしまう（OWASP的な信頼境界の原則）。決済処理は対象外（要件定義書§2）だが、注文データの金額整合性はMySQLに永続化される業務データとして重要であり、追加の依存や複雑な仕組みを要さずサーバー側再計算のみで対応できる。
- **Alternatives considered**: クライアント送信の`price`・`title`をそのまま`order_items`に保存する → 実装は簡単だが、価格改ざんに対して無防備であり、要件定義書のセキュリティ非機能要件（本番運用を想定しない学習用途とはいえ、憲法の「安全なコードを書く」という基本姿勢）に照らして採用しない。

## D-03: ブラウザから注文確定APIを呼び出す経路

- **Decision**: `frontend/src/lib/api/orders.ts`に`createOrder`関数を新設し、ブラウザから直接`fetch(`${NEXT_PUBLIC_API_URL}/api/orders`, { method: "POST", ... })`を呼ぶ。`docker-compose.yml`の`frontend`サービスに環境変数`NEXT_PUBLIC_API_URL=http://localhost:4000`を追加する。
- **Rationale**: 既存の`frontend/src/lib/api/books.ts`はNext.jsのサーバーコンポーネント（`page.tsx`）内からコンテナ内部で`fetch`する設計のため、Dockerネットワーク内のサービス名（`API_INTERNAL_URL=http://backend:4000`）を使っている。しかし注文フォームはユーザー操作（「注文する」ボタン押下）に応じてクライアントコンポーネントから送信する必要があり、ブラウザ（ホストマシン側）から実行されるため`backend`というDocker内部ホスト名は解決できない。`docker-compose.yml`は`backend`のポート4000をホストにも公開済み（`ports: "4000:4000"`）であり、要件定義書§5の制約条件（backend: port 4000）とも一致するため、ブラウザから`http://localhost:4000`へ直接アクセスする方式を採る。バックエンドは既に`cors()`ミドルウェアを有効化済みでオリジン間リクエストを許可できる。
- **Alternatives considered**: Next.jsのRoute Handler（`app/api/orders/route.ts`）を新設し、フロントエンドコンテナ経由でバックエンドにプロキシする → 新たな抽象化レイヤーが増えるだけでREQ-012〜015の要件を満たす上で必須ではなく、tech-stack.md §1が想定する「フロントエンドはバックエンドのREST APIを呼び出す」というシンプルな構成からも外れるため不採用。

## D-04: カートが空の状態での注文フォーム画面アクセス制御

- **Decision**: `frontend/src/app/order/page.tsx`（クライアントコンポーネント）で`useCart()`の`items`を参照し、`CartContext`のロード完了後（`005`/`006`と同様に`localStorage`からの読み込みは非同期）に`items.length === 0`であれば`useRouter().replace("/cart")`でカート画面へ差し戻す。差し戻しが発生するまでの一瞬（ロード中）は何も描画しない、または簡易のローディング表示に留める。
- **Rationale**: spec.md Clarificationsで「カート画面へ自動的に差し戻す」と決定済み（FR-012）。`CartContext`はカート画面（`006`）で確立済みの状態管理をそのまま再利用でき、新規の状態管理やAPIを追加せずに実現できる。
- **Alternatives considered**: 空状態メッセージを注文フォーム画面上に表示し「注文する」を無効化する → spec.mdのClarificationsで不採用と決定済み。

## D-05: 注文確定成功後のカート状態のクリア

- **Decision**: `CartContext`に`clearCart(): void`を新設し（`items`を空配列にして`localStorage`も更新）、`POST /api/orders`が成功した直後（注文完了画面へ遷移する前）に呼び出す。
- **Rationale**: 注文が確定した後もカートに同じ書籍が残っていると、購入希望者が商品一覧へ戻った際に古いカート内容が残存し、意図せず同じ内容を再度注文できてしまう。要件定義書に明記はないが、REQ-018「一覧へ戻るリンク」を含む購買フロー全体（§6 画面遷移図）が「注文完了後は一連の購買が完結する」ことを前提としており、注文確定という業務イベントの当然の帰結としてカートを空にする。新機能・新画面の追加ではなく、既存`CartContext`への振る舞い追加（`006`で追加した`increaseQuantity`等と同様の変更粒度）である。
- **Alternatives considered**: カートを維持したまま注文完了画面へ遷移する → 上記の再注文リスクがあり、他のオンラインストアの一般的な挙動（注文確定後はカートが空になる）とも乖離するため不採用。

## D-06: 注文フォーム画面のバリデーション実装場所

- **Decision**: 主たるバリデーションは`frontend/src/lib/validateOrderForm.ts`（tech-stack.md §7 命名規則の例に明記済み）で行い、「注文する」ボタン押下時に氏名・住所・メールアドレスをまとめてチェックする（spec.md Assumptions）。バックエンド（`orderService`）側では、欠落値や明らかに不正な型（空文字・非文字列等）に対する最小限の防御的バリデーションのみを行い、詳細なUXエラーメッセージの生成はフロントエンドの責務とする。
- **Rationale**: spec.md FR-003〜FR-005はUI上のエラーメッセージ表示を要求しており、フロントエンドでの実装が自然。一方、バックエンドAPIを直接呼び出された場合の不正データ挿入を防ぐため、最小限のガード（必須項目の空文字チェック等）は二重に持たせる（`006`のD-01で採用した「UIとロジック層の二重ガード」という設計判断を踏襲）。
- **Alternatives considered**: バリデーションロジックをフロントエンド・バックエンドで完全に共有するパッケージを新設する → tech-stack.mdにモノレポ・共有パッケージの構成が定義されておらず、2画面規模の機能に対して過剰な構成変更となるため不採用。

## D-07: 注文完了画面への遷移先ルート

- **Decision**: 注文確定成功時、`router.push(`/order/complete/${orderNumber}`)`で遷移する。`/order/complete/[orderNumber]`ページ自体（注文完了メッセージ・注文番号表示、REQ-016〜018）は本機能のスコープ外であり、別スペックで実装される。
- **Rationale**: 既存の動的ルート`frontend/src/app/books/[id]/page.tsx`と同様の命名慣習（リソースを一意に特定する値をパスセグメントにする）に合わせ、注文番号をパスパラメータとする。`006`のD-04で「`/order`は本機能スコープ外だが遷移動作のみ実装する」という前例があり、同様に遷移先ページの存在有無に関わらず遷移動作（`router.push`呼び出し）のみを本機能のテスト対象とする。
- **Alternatives considered**: クエリパラメータ`/order/complete?orderNumber=...`にする → Next.jsの動的ルート慣習（`/books/[id]`）との一貫性が薄れるため不採用。
