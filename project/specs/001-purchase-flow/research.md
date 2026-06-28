# Research: 購買フロー全体（5画面）

**Feature**: 001-purchase-flow
**Date**: 2026-06-28

## 1. カート状態管理の方式

**Decision**: React Context + useState によるクライアントサイド状態管理

**Rationale**:
- セッション単位でカートを保持する仕様（spec.md「業務ルール」）に準拠
- Next.js 14 の App Router または Pages Router どちらでも Context APIは動作する
- localStorage は使用しない（ブラウザを閉じたら消える仕様のため、永続化は不要）
- バックエンドへのカートAPIは不要（フロントエンド完結）

**Alternatives considered**:
- Redux / Zustand: 学習用途でオーバースペック
- localStorage: ブラウザを閉じてもデータが残り、仕様（セッション単位）に反する
- バックエンドセッション: サーバーへの通信が増え複雑になる

## 2. 画面遷移の方式

**Decision**: Next.js の `useRouter().push()` または `<Link>` コンポーネントによる遷移

**Rationale**:
- Next.js 14 Pages Router の標準機能で対応可能
- 書籍カード → 詳細: `<Link href={/books/${id}}>` でプリフェッチ有効
- カートへの遷移・注文フォームへの遷移: `useRouter().push()` を使用

**Alternatives considered**:
- window.location.href: 全ページリロードが発生し3秒以内表示に影響する可能性

## 3. 書籍データの取得方式

**Decision**: バックエンドREST API（`GET /api/books`, `GET /api/books/:id`）からfetchで取得

**Rationale**:
- フロントエンド・バックエンド分離構成（project.md）の標準パターン
- Next.js の `getServerSideProps` または `useEffect` + fetch で対応
- 学習用途のため SSR/SSG の使い分けは不要。シンプルに `useEffect` + fetch を採用

**Alternatives considered**:
- getStaticProps: 書籍データが変わらない前提が必要（学習用途では不適）
- getServerSideProps: 可能だが、クライアントサイドfetchの方がシンプル

## 4. 同一書籍のカート追加処理

**Decision**: カートアイテムリストを走査し、同一 `book_id` が存在する場合は quantity を加算する

**Rationale**:
- spec.md「業務ルール」に「同一書籍をカートに追加した場合、数量を加算する」と明記
- 新規エントリ追加と数量加算の分岐は Context の `addToCart` 関数内で処理

## 5. 注文完了後のカートクリア

**Decision**: 注文確定（POST /api/orders）が成功したタイミングでカートをクリアし `/order/complete` にリダイレクト（PRGパターン）

**Rationale**:
- 注文完了後にカートに前回の内容が残るのは不自然なUX
- PRGパターンでブラウザの戻る・リロードによる二重注文を防ぐ
- 注文番号はクエリパラメータ（`?orderNumber=xxx`）またはrouterのstateで渡す
