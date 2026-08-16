# API Contract: カート画面

本機能は新規のバックエンドAPIを追加しない（`research.md` #1・#2参照）。

カート画面は、既存の`GET /api/books`（`specs/002-book-catalog-detail/contracts/books-api.md`で定義済み）を呼び出し、レスポンス（販売中の書籍一覧）と`cartStore`（`localStorage`）の`bookId`を突き合わせることで、書名・単価の取得と、販売対象外になった書籍の検出（FR-010）の両方を行う。

数量変更・削除は`cartStore`（クライアント側の`localStorage`）に対する操作であり、いずれもHTTP通信を伴わない。

「注文手続きへ」ボタンは、次feature（注文フォーム）の画面への画面遷移（`<a>`/`next/link`によるルーティング）のみで、本機能からのAPI呼び出しは発生しない。
