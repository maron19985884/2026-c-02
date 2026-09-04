# Phase 0 Research: 個人運営オンライン書店 購買フロー

**Branch**: `003-bookstore-purchase-flow` | **Date**: 2026-09-03
**Input**: [spec.md](spec.md) / [plan.md](plan.md) / [`tech-stack.md`](../../tech-stack.md) / [憲法](../../.specify/memory/constitution.md)

技術スタックは `tech-stack.md` で確定済み。ここでは spec の Clarifications（CL-001〜CL-007）と Technical Context の未確定点を、スタックの範囲内で具体化する。

---

## D-01: カートの保持方式

- **Decision**: フロントエンドの `localStorage` に単一キー（例 `bookstore.cart.v1`）で `{ items: [{ bookId, quantity }] }` を JSON 保存する。バックエンドにカート用エンドポイントは作らない。カート画面・詳細画面の「カートに追加」「数量変更」「削除」はすべてクライアント内で完結し、そのつど `localStorage` を更新する。
- **Rationale**: CL-001（サーバに持たず、同一ブラウザならリロード後も復元、デバイス間同期なし）に直結。未ログイン前提（FR-025）でユーザー識別子がないため、サーバ側カートはセッション or 識別子発行が必要になり過剰。`localStorage` はタブを閉じても残るためリロード/再訪の要件を満たす。
- **Alternatives considered**:
  - `sessionStorage`: タブを閉じると消えるため「再訪問時に復元」を満たさない。却下。
  - Cookie: 容量が小さくサーバへ毎回送信され不要な結合を生む。却下。
  - サーバ side cart（DB/セッション）: 識別子管理が要り CL-001 の「サーバに持たない」に反する。却下。
- **実装メモ**: `localStorage` 参照は SSR で不可のため、カート系はクライアントコンポーネント（`"use client"`）＋ `useEffect` で読み出す。破損 JSON は空カートにフォールバック。カート内の書籍表示名・単価は表示時に一覧/詳細 API の値を用いる（カート自体には bookId と quantity のみ保持）。

## D-02: 同一書籍の再追加

- **Decision**: 「カートに追加」時、`items` に同一 `bookId` があれば当該要素の `quantity` に +1、なければ `{ bookId, quantity: 1 }` を push。
- **Rationale**: CL-002。明細行を増やさないことで合計計算と表示が単純になる。
- **Alternatives considered**: 別明細に分ける（合計・数量変更の実装が複雑化、却下）／追加を無視（ユーザーの意図に反する、却下）。

## D-03: 数量の下限と削除

- **Decision**: 数量は整数 1 以上。`QuantityStepper` の「−」は 1 で下げ止まり。0 にはできず、除外は明示的な「削除」操作のみ（FR-015, FR-011）。上限はアプリとして設けない（在庫概念なし＝Assumptions）。ただし過大入力対策として 1 明細あたり実務的上限 99 を UI 側でガードする（データ健全性のため。仕様上の制限ではなくバリデーション）。
- **Rationale**: FR-015 と Edge Cases「数量を1未満に変更」。99 上限は任意の防御的既定値で、注文 API 側でも同じ上限で弾く。
- **Alternatives considered**: 上限なし（誤操作で巨大値 → 表示崩れ・DB 桁あふれリスク、却下）。

## D-04: 商品一覧のページング

- **Decision**: `GET /api/books?page={1..}&pageSize={n}`。`page` 既定 1、`pageSize` 既定 **12**、許容範囲 1..48。レスポンスに `page, pageSize, totalItems, totalPages` を含める。フロントは `?page=` を URL クエリで持ち、`Pagination` コンポーネントで前/次/先頭/末尾と現在ページを表示。範囲外 `page`（`> totalPages`）は API が最終ページに丸めて返す（`page` を実際に返した値へ補正）。`totalItems === 0` は空状態（FR-004）。
- **Rationale**: CL-006。12件はグリッド 3×4 / 4×3 に収まりデモ規模に妥当。範囲外を最終ページへ丸めるのは Edge Cases「範囲外のページ」に対応し、404 よりユーザー体験がよい。
- **Alternatives considered**:
  - 無限スクロール: 実装コスト増、戻る操作でのスクロール位置復元が難しい。却下。
  - オフセット指定（`?offset=&limit=`）: ページ番号 UI と二重管理になる。`page` 単純化を優先。
  - カーソルページング: カタログ規模が小さく不要。却下。

## D-05: 注文番号の形式

- **Decision**: `ORD-` + **ULID** を Crockford Base32 で表した 26 文字（例 `ORD-01J9Z8 K...`、実際は区切りなし 26 文字）。生成はバックエンド。`orders.order_number` に `UNIQUE` 制約。生成時に衝突（重複キー）したら最大3回リトライ。
- **Rationale**: CL-003（一意な英数字、読み上げ/書き写ししやすい、形式は設計で確定）。ULID は生成時刻がプレフィックスに入り時系列ソート可能・分散生成でも衝突しにくい。英大文字＋数字のみ（`I L O U` を除外する Crockford）で口頭伝達の誤りが少ない。`ORD-` プレフィックスで用途が一目で分かる。
- **実装方針（確定）**: **外部ライブラリを使わず自前実装**する。`backend/src/domain/orderNumber.ts` に、48bit のミリ秒タイムスタンプ＋80bit の乱数（`crypto.randomBytes`）を合わせた 128bit を Crockford Base32 で 26 文字にエンコードする関数を置く（`ulid` パッケージのアルゴリズムと同等だが依存は追加しない）。`ulid` npm パッケージは**採用しない**（`tech-stack.md` の「依存を増やさない」方針・却下選択肢欄と整合）。
- **Alternatives considered**:
  - 連番（`AUTO_INCREMENT`）: 総注文数が推測可能。個人運営でも避けたい。却下。
  - `YYYYMMDD-連番`: 日次連番のため当日の注文数が漏れる＋同時実行で採番競合。却下。
  - UUIDv4: 36 文字でハイフン4本、口頭共有に長い。却下（ULID 形式を採用）。
  - `ulid` npm パッケージ: 依存追加を避けるため却下。アルゴリズムは自前実装で再現する（十数行程度）。

## D-06: UI スタイル方針（憲法 §3 フォールバック）

- **Decision**: UI コンポーネントライブラリ（MUI 等）・CSS フレームワーク（Tailwind 等）は導入しない。レイアウトは **CSS Modules**（`*.module.css`）＋ `app/globals.css` の最小限の共通変数（色・間隔・フォント）で統一。エラー表示は `ErrorNotice`、空状態は `EmptyState` の共通コンポーネントに集約し全画面で使い回す（FR-027）。フォーム要素・ボタンはネイティブ要素を基本にし、`label` 関連付け・`aria-invalid`・フォーカス可視化で WCAG 2.1 AA を目標。
- **Rationale**: `tech-stack.md` に UI/CSS の指定がない。憲法 §3 は「未定義ならブラウザ既定を基準に統一」と定めるため、新規の技術選定（＝人間の領分）を避けつつ一貫性を確保する最小構成を採る。
- **Alternatives considered**: Tailwind / MUI 導入（`tech-stack.md` 未記載の技術選定を AI が行うことになり憲法 §5 に抵触。却下。必要なら人間が追記）。
- **人間の対応事項**: CSS 方針を `tech-stack.md` に明文化することを推奨（plan.md Complexity Tracking）。

## D-07: テストフレームワーク

- **Decision（採用案）**: **Jest** を採用。
  - バックエンド: `ts-jest` プリセット。API 結合は `supertest` で Express `app` を直接叩く。
  - フロントエンド: `next/jest`（Next.js 公式）＋ `@testing-library/react` ＋ `@testing-library/jest-dom`。
  - カバレッジ: `jest --coverage`、しきい値 80%（`coverageThreshold`）。対象は純粋ロジック（`lib/cartTotal`, `lib/validation`, `backend/src/domain/*`, `orderService`）。
- **Rationale**: `tech-stack.md` §3 は「Vitest または Jest」で未確定。Jest は Next.js に公式サポートがあり、Express + Supertest の実績が厚く、チームの一般的な習熟度が高い。`quality-gate.yml` は Lint のみ実行のためテストランナー選定に制約はない。
- **Alternatives considered**: Vitest（設定が軽く ESM 親和性が高いが、Next.js 公式サポートは Jest 側が手厚い）。最終決定は人間が `tech-stack.md` に記載して確定する（憲法 §5 / plan.md Complexity Tracking）。

## D-08: 注文作成時のサーバ側処理（信頼境界）

- **Decision**: `POST /api/orders` はリクエストの `items[].bookId` と `quantity` のみを信頼し、**単価・書名・小計・合計はサーバが `books` テーブルの現在値から再取得・再計算**する。クライアントが送る金額は受け取らない（または受け取っても無視）。検証順:
  1. `customer.name` 必須（トリム後1文字以上、最大255）
  2. `customer.address` 必須（トリム後1文字以上、最大1000）
  3. `customer.email` 必須かつ形式（RFC 5322 の実用的サブセット正規表現、最大255）
  4. `items` が1件以上、各 `bookId` が実在し「販売中」、`quantity` が 1..99 の整数
  - いずれか失敗で `400` と `fields` にエラー内訳。すべて通れば `orders` + `order_items` を**単一トランザクション**で INSERT し `201`。
- **Rationale**: FR-018/FR-024a/CL-005。金額をクライアント任せにすると改ざん・不整合の温床。スナップショット列（`title_snapshot`, `unit_price_snapshot`）に確定時点値を書き込むことで以後の価格改定と独立させる。
- **Alternatives considered**: クライアント計算値を保存（改ざん・浮動小数の不一致リスク、却下）。`order_items` に book_id だけ持ち表示時 JOIN（CL-005 の「以後の変更に影響されない」を満たせない、却下）。

## D-09: 金額の型と通貨

- **Decision**: 価格・小計・合計は**円単位の整数**（`INT UNSIGNED`）。小数・通貨コードは扱わない。フロントは `Intl.NumberFormat('ja-JP')` で桁区切り表示（`¥` 記号付き任意）。
- **Rationale**: 日本の個人書店・デモ用途。税/送料/割引なし（Assumptions）。整数円なら丸め誤差が出ない。
- **Alternatives considered**: `DECIMAL(10,2)`（不要な複雑さ、却下）。

## D-10: DB 接続とマイグレーション

- **Decision**: `mysql2/promise` の**コネクションプール**を `backend/src/config/db.ts` で1つ生成し使い回す。接続情報は `docker-compose.yml` が注入する環境変数（`DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`）から読む。スキーマとシードは `mysql/init/*.sql`（`docker-entrypoint-initdb.d`）で初回起動時に適用。`DROP`/`TRUNCATE` は置かない（憲法 §1）。全クエリはプレースホルダ（`?`）使用（`tech-stack.md` §8）。
- **Rationale**: 既存 `docker-compose.yml` の構成にそのまま乗る。ORM を入れないため（`tech-stack.md` 却下選択肢）生 SQL ＋ プレースホルダ。
- **Alternatives considered**: マイグレーションツール（Flyway/Prisma Migrate）: デモ規模で過剰、依存追加。却下。初回 init SQL で足りる。

## D-11: CORS とポート

- **Decision**: バックエンドは `cors` で `http://localhost:3000`（＝`FRONTEND_ORIGIN` 環境変数、既定 `http://localhost:3000`）からのアクセスのみ許可。フロントは `NEXT_PUBLIC_API_URL`（`docker-compose.yml` で `http://localhost:4000`）を基点に `fetch`。
- **Rationale**: `requirements.md` §5 のポート固定、`tech-stack.md` の cors 採用理由に一致。ワイルドカード `*` は避け明示オリジン。
- **Alternatives considered**: Next.js の rewrites でプロキシ（構成が増える、却下）。`*` 許可（不要に緩い、却下）。

## D-12: エラー表示方針

- **Decision**: フロントの API 呼び出しは `lib/api.ts` に集約。ネットワーク失敗・非2xx はすべて共通の `ApiError` に正規化し、画面側は `ErrorNotice`（「読み込みに失敗しました。時間をおいて再度お試しください」等の定型文）を表示するのみ。自動リトライ・再試行ボタンは出さない。注文送信の `400` だけは例外で、`fields` を `CheckoutForm` の項目別エラーに反映する（FR-018）。
- **Rationale**: CL-007。汎用表示に統一しつつ、バリデーションエラーだけは項目対応が必要なため分岐。
- **Alternatives considered**: 画面ごと個別のエラーハンドリング（一貫性が崩れる、FR-027 に反する、却下）。

---

## 未解決事項

なし（spec の Clarifications はすべて設計に反映済み）。plan.md Complexity Tracking に記載の4点は「人間が `tech-stack.md` 等を更新して確定する運用上の対応事項」であり、設計上のブロッカーではない。
