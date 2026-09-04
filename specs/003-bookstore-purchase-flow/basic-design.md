# 基本設計書 — 個人運営オンライン書店 購買フロー

> **生成元**: /speckit.design basic (AI生成) — 内容を確認の上、承認してから次フェーズへ進むこと
> 関連: [憲法 §7](../../.specify/memory/constitution.md) / [利用指南書 §4-7](../../README.md) / [spec.md](spec.md) / [plan.md](plan.md) / [data-model.md](data-model.md) / [contracts/](contracts/)

---

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | BASIC-003 |
| 対象フィーチャー | [`specs/003-bookstore-purchase-flow/`](.) |
| 作成日 | 2026-09-04 |
| 作成者 | AI生成（`/speckit.design basic`） |
| 承認者 | （未） |
| 承認日 | （未） |
| バージョン | 1.0 |

---

## 1. システム概要

### 1.1 目的

個人運営のオンライン書店において、未ログインの購入希望者が「商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了」の5画面を通して、欲しい本を見つけ、氏名・住所・メールアドレスを入力して注文を完了できる購買フローを提供する。学習・デモ用途のサンプルアプリケーション。

### 1.2 対象範囲

**対象（In Scope）**

- 販売中書籍のグリッド一覧（ページング）
- 書籍詳細の閲覧
- カートへの追加・数量変更・削除・合計表示（カートはブラウザ保持）
- 注文情報（氏名・住所・メール）の入力とバリデーション
- 注文内容を確認しながらの注文確定
- 注文完了の確認（完了メッセージ・注文番号・一覧へ戻る導線）

**対象外（Out of Scope）**

- ログイン・会員管理 / 決済処理 / 在庫管理 / 管理画面 / レビュー・評価 / 検索・フィルター / 送料計算

---

## 2. アーキテクチャ概要

### 2.1 システム構成図（UML: コンポーネント図）

<!-- plantuml:
@startuml
skinparam componentStyle rectangle
actor "購入希望者" as User
node "ブラウザ" {
  [Next.js フロントエンド\n(App Router, :3000)] as FE
  database "localStorage\n(カート: bookstore.cart.v1)" as LS
}
node "Docker Compose (app-network)" {
  [Express バックエンド\n(REST API, :4000)] as BE
  database "MySQL 8.0\n(:3306)" as DB
}
User --> FE
FE --> LS : カート読み書き
FE --> BE : REST (fetch, CORS: localhost:3000)
BE --> DB : SQL (mysql2, プレースホルダ)
BE ..> [books] 
DB --> [books]
DB --> [orders]
DB --> [order_items]
@enduml
-->

<div style="font-family:system-ui,sans-serif;">
<svg viewBox="0 0 940 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="システム構成図">
  <defs>
    <marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="#334155"/>
    </marker>
    <style>
      .box{fill:#f8fafc;stroke:#334155;stroke-width:1.5;rx:8;}
      .node{fill:#eef2ff;stroke:#6366f1;stroke-width:1.5;}
      .db{fill:#ecfeff;stroke:#0891b2;stroke-width:1.5;}
      .lbl{font-size:13px;fill:#0f172a;}
      .sub{font-size:11px;fill:#475569;}
      .edge{stroke:#334155;stroke-width:1.4;fill:none;marker-end:url(#arr);}
      .edgelbl{font-size:11px;fill:#334155;}
    </style>
  </defs>

  <!-- actor -->
  <circle cx="60" cy="70" r="14" class="box"/>
  <line x1="60" y1="84" x2="60" y2="120" class="edge" style="marker-end:none"/>
  <text x="60" y="150" text-anchor="middle" class="lbl">購入希望者</text>

  <!-- browser group -->
  <rect x="140" y="30" width="330" height="200" class="box" fill="#ffffff"/>
  <text x="155" y="50" class="sub">ブラウザ</text>
  <rect x="160" y="60" width="290" height="70" class="node" rx="8"/>
  <text x="175" y="88" class="lbl">Next.js フロントエンド</text>
  <text x="175" y="108" class="sub">App Router / 5画面 / :3000</text>
  <rect x="160" y="145" width="290" height="65" class="db" rx="8"/>
  <text x="175" y="170" class="lbl">localStorage</text>
  <text x="175" y="190" class="sub">カート: bookstore.cart.v1（非永続DB相当）</text>

  <!-- backend group -->
  <rect x="560" y="30" width="350" height="330" class="box" fill="#ffffff"/>
  <text x="575" y="50" class="sub">Docker Compose（app-network）</text>
  <rect x="585" y="65" width="300" height="70" class="node" rx="8"/>
  <text x="600" y="93" class="lbl">Express バックエンド</text>
  <text x="600" y="113" class="sub">REST API / routes・services・domain・repositories / :4000</text>
  <rect x="585" y="160" width="300" height="180" class="db" rx="8"/>
  <text x="600" y="185" class="lbl">MySQL 8.0（:3306）</text>
  <rect x="605" y="200" width="120" height="34" class="box"/><text x="665" y="222" text-anchor="middle" class="sub">books</text>
  <rect x="605" y="244" width="120" height="34" class="box"/><text x="665" y="266" text-anchor="middle" class="sub">orders</text>
  <rect x="605" y="288" width="150" height="34" class="box"/><text x="680" y="310" text-anchor="middle" class="sub">order_items</text>

  <!-- edges -->
  <line x1="74" y1="70" x2="158" y2="90" class="edge"/>
  <line x1="305" y1="130" x2="305" y2="143" class="edge"/>
  <text x="312" y="140" class="edgelbl">カート読み書き</text>
  <line x1="452" y1="95" x2="583" y2="95" class="edge"/>
  <text x="470" y="86" class="edgelbl">REST (fetch) / CORS: localhost:3000</text>
  <line x1="735" y1="135" x2="735" y2="158" class="edge"/>
  <text x="742" y="152" class="edgelbl">SQL (mysql2 / プレースホルダ)</text>
</svg>
</div>

### 2.2 採用アーキテクチャパターン

- **3層構成**: ブラウザ（Next.js フロントエンド） ⇄ REST API（Express バックエンド） ⇄ MySQL。
- **フロントエンド**: App Router のページ単位。純粋ロジック（カート・合計・入力検証）は `lib/` に分離しテスト容易性を確保。カートはサーバに持たず `localStorage` で保持（CL-001）。
- **バックエンド**: `routes`（HTTP） → `services`（ユースケース） → `domain`（純ロジック） / `repositories`（DB アクセス）の層分割。金額はサーバ側で `books` 現在値から再計算（信頼境界、D-08）。
- **実行環境**: Docker Compose で frontend:3000 / backend:4000 / mysql:3306 をローカル起動。
- 出典: [`tech-stack.md`](../../tech-stack.md) §1 / [plan.md](plan.md) Structure Decision。

---

## 3. 機能一覧

| 機能ID | 機能名 | 概要 | 対応要件ID |
|---|---|---|---|
| F-001 | 書籍一覧表示 | 販売中書籍をグリッドでページング表示。0件は空状態 | REQ-001, REQ-002 / FR-001, FR-002, FR-004, FR-031 |
| F-002 | 書籍詳細遷移・表示 | 一覧から詳細へ遷移し、書影・タイトル・著者・価格・説明文を表示。非実在/非公開は404表示 | REQ-003, REQ-004 / FR-003, FR-005, FR-008 |
| F-003 | カート追加 | 詳細で「カートに追加」。既存書籍は数量+1。追加後も一覧へ戻れる | REQ-005, REQ-006 / FR-006, FR-007, FR-030 |
| F-004 | カート内容表示 | 書名・単価・数量・小計・合計を表示（送料なし） | REQ-007, REQ-010 / FR-009, FR-012, FR-014 |
| F-005 | カート数量変更・削除 | 数量増減（下限1・上限99）・削除で小計/合計が即時更新。全削除で空状態 | REQ-008, REQ-009 / FR-010, FR-011, FR-015, FR-016 |
| F-006 | カート永続化（ブラウザ） | カートを `localStorage` に保持。同一ブラウザはリロード後も復元 | — / FR-029, CL-001 |
| F-007 | 注文フォーム入力・確認 | 氏名・住所・メール（必須3項目）を入力。同画面に注文商品と合計を表示 | REQ-012, REQ-014 / FR-017, FR-019 |
| F-008 | 入力バリデーション | 未入力・形式不正で項目別エラー表示、注文は確定しない | REQ-013 / FR-018, SC-003 |
| F-009 | 注文確定 | 「注文する」で注文を確定、サーバが再計算・スナップショット保存・注文番号発行。成功後カートを空にする | REQ-015 / FR-020, FR-020a, FR-024, FR-024a, CL-004, CL-005 |
| F-010 | 注文番号発行 | 一意な英数字（`ORD-` + Base32 26文字）を発行 | REQ-017 / FR-022, CL-003, SC-004 |
| F-011 | 注文完了表示 | 完了メッセージ・注文番号・商品一覧へ戻るリンクを表示 | REQ-016, REQ-017, REQ-018 / FR-021, FR-022, FR-023 |
| F-012 | 注文照会（補助） | 注文番号で確定注文を参照（UI必須ではないが SC-007 を支援） | — / SC-007 |
| F-013 | 汎用エラー表示 | API 通信失敗時は定型メッセージのみ表示（自動リトライ・再試行ボタンなし） | — / FR-032, CL-007 |
| F-014 | 画面横断の一貫性 | 画面遷移・エラー・空状態の表現を全画面で統一。未認証で全機能利用可 | — / FR-025, FR-027 |

---

## 4. 画面設計

### 4.1 画面一覧

| 画面ID | 画面名 | ルート | 概要 |
|---|---|---|---|
| SCR-001 | 商品一覧 | `/`（`?page=` でページ指定） | 販売中書籍のグリッド。カード=書影・タイトル・著者・価格。ページング。空状態表示 |
| SCR-002 | 商品詳細 | `/books/[id]` | 書影・タイトル・著者・価格・説明文。「カートに追加」「一覧へ戻る」。404表示 |
| SCR-003 | カート | `/cart` | カート明細（書名・単価・数量・小計）＋合計。数量増減・削除。「注文手続きへ」。空状態 |
| SCR-004 | 注文フォーム | `/checkout` | 氏名・住所・メール入力＋注文内容サマリ。項目別エラー。「注文する」 |
| SCR-005 | 注文完了 | `/order-complete` | 完了メッセージ・注文番号・「商品一覧へ戻る」リンク |

**共通要素**: ヘッダに「商品一覧」「カート」への導線（`app/layout.tsx`）。エラーは `ErrorNotice`、空状態は `EmptyState` に共通化。

### 4.2 画面遷移図（UML: ステートマシン図）

<!-- plantuml:
@startuml
[*] --> 商品一覧
商品一覧 --> 商品詳細 : 書籍カードをクリック
商品詳細 --> 商品一覧 : 一覧へ戻る / カートに追加後
商品一覧 --> カート : ヘッダのカート導線
商品詳細 --> カート : ヘッダのカート導線
カート --> 商品一覧 : 買い物を続ける
カート --> 注文フォーム : 注文手続きへ (カートが空でない)
注文フォーム --> カート : 戻る
注文フォーム --> 注文フォーム : 「注文する」→ バリデーションNG (項目別エラー)
注文フォーム --> 注文完了 : 「注文する」→ 検証OK・201 (カートを空にする)
注文完了 --> 商品一覧 : 商品一覧へ戻る
注文完了 --> [*]
@enduml
-->

<div style="font-family:system-ui,sans-serif;">
<svg viewBox="0 0 960 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="画面遷移図">
  <defs>
    <marker id="a2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#334155"/></marker>
    <style>
      .s{fill:#eef2ff;stroke:#6366f1;stroke-width:1.6;rx:10;}
      .t{font-size:13px;fill:#0f172a;font-family:system-ui,sans-serif;}
      .e{stroke:#334155;stroke-width:1.4;fill:none;marker-end:url(#a2);}
      .el{font-size:10.5px;fill:#334155;}
      .term{fill:#0f172a;}
    </style>
  </defs>

  <circle cx="40" cy="60" r="9" class="term"/>
  <line x1="49" y1="60" x2="88" y2="60" class="e"/>

  <rect x="90" y="35" width="150" height="50" class="s"/><text x="165" y="65" text-anchor="middle" class="t">SCR-001 商品一覧</text>
  <rect x="330" y="35" width="150" height="50" class="s"/><text x="405" y="65" text-anchor="middle" class="t">SCR-002 商品詳細</text>
  <rect x="330" y="185" width="150" height="50" class="s"/><text x="405" y="215" text-anchor="middle" class="t">SCR-003 カート</text>
  <rect x="590" y="185" width="160" height="50" class="s"/><text x="670" y="215" text-anchor="middle" class="t">SCR-004 注文フォーム</text>
  <rect x="590" y="330" width="160" height="50" class="s"/><text x="670" y="360" text-anchor="middle" class="t">SCR-005 注文完了</text>
  <circle cx="880" cy="355" r="9" class="term"/><circle cx="880" cy="355" r="13" fill="none" stroke="#0f172a"/>

  <!-- 一覧 <-> 詳細 -->
  <line x1="240" y1="52" x2="328" y2="52" class="e"/><text x="248" y="45" class="el">カードをクリック</text>
  <line x1="328" y1="70" x2="240" y2="70" class="e"/><text x="243" y="84" class="el">一覧へ戻る / 追加後</text>

  <!-- 一覧/詳細 -> カート -->
  <line x1="165" y1="85" x2="360" y2="183" class="e"/><text x="150" y="150" class="el">ヘッダのカート導線</text>
  <line x1="405" y1="85" x2="405" y2="183" class="e"/><text x="410" y="140" class="el">ヘッダのカート導線</text>

  <!-- カート -> 一覧 -->
  <line x1="360" y1="185" x2="180" y2="87" class="e"/><text x="230" y="175" class="el">買い物を続ける</text>

  <!-- カート -> フォーム -->
  <line x1="480" y1="210" x2="588" y2="210" class="e"/><text x="486" y="203" class="el">注文手続きへ（空でない）</text>
  <line x1="588" y1="228" x2="480" y2="228" class="e"/><text x="500" y="242" class="el">戻る</text>

  <!-- フォーム self loop -->
  <path d="M 750 195 q 55 -25 0 -45 q -20 -8 -30 5" class="e"/><text x="700" y="150" class="el">検証NG（項目別エラー）</text>

  <!-- フォーム -> 完了 -->
  <line x1="670" y1="235" x2="670" y2="328" class="e"/><text x="676" y="290" class="el">検証OK・201（カートを空に）</text>

  <!-- 完了 -> 一覧 -->
  <path d="M 590 345 q -430 30 -420 -255" class="e"/><text x="250" y="330" class="el">商品一覧へ戻る</text>
  <!-- 完了 -> [*] -->
  <line x1="750" y1="355" x2="866" y2="355" class="e"/>
</svg>
</div>

---

## 5. API 設計概要

> 詳細は [`contracts/`](contracts/) を参照。ここでは主要エンドポイントの一覧のみ示す。金額はすべて円単位の整数。認証なし。

| メソッド | パス | 概要 | 対応機能ID | 契約 |
|---|---|---|---|---|
| GET | `/api/books?page=&pageSize=` | 販売中書籍のページング一覧（既定 `pageSize=12`、範囲外 `page` は最終ページへ丸め） | F-001 | [books-list.md](contracts/books-list.md) |
| GET | `/api/books/:id` | 書籍1件の詳細（説明文含む）。非実在/非公開は404 | F-002 | [books-detail.md](contracts/books-detail.md) |
| POST | `/api/orders` | 注文の作成。サーバで再計算・スナップショット保存・注文番号発行。検証NGは400（`fields`） | F-007〜F-010 | [orders-create.md](contracts/orders-create.md) |
| GET | `/api/orders/:orderNumber` | 注文番号での照会（補助） | F-012 | [orders-create.md](contracts/orders-create.md#補助-get-apiordersordernumber) |

- カート用エンドポイントは存在しない（F-006、カートは `localStorage`）。
- エラー形式は共通 `{ error, message, fields? }`。フロントは `POST /api/orders` の 400 以外を汎用エラー表示に正規化（F-013）。

---

## 6. データ概念モデル（UML: ER図）

> 詳細（列定義・制約）は [data-model.md](data-model.md) / [table-definition.md](table-definition.md)（`/speckit.design table` で生成）を参照。ここではエンティティと関係のみ示す。

<!-- plantuml:
@startuml
entity books {
  * id : PK
  --
  title, author, price, cover_image_url, description, status
}
entity orders {
  * id : PK
  --
  order_number (UNIQUE), customer_name, customer_address,
  customer_email, total_amount, ordered_at
}
entity order_items {
  * id : PK
  --
  order_id : FK -> orders.id (CASCADE)
  book_id : FK -> books.id (SET NULL, nullable)
  title_snapshot, unit_price_snapshot, quantity, subtotal
}
orders ||--|{ order_items
books ||--o{ order_items
note bottom of books : Cart / CartItem は\nDB非永続（localStorage）
@enduml
-->

<div style="font-family:system-ui,sans-serif;">
<svg viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ER図">
  <defs>
    <marker id="a3" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#0891b2"/></marker>
    <style>
      .ent{fill:#ffffff;stroke:#0891b2;stroke-width:1.6;}
      .hd{fill:#ecfeff;stroke:#0891b2;stroke-width:1.6;}
      .n{font-size:13px;fill:#0f172a;font-weight:bold;font-family:system-ui,sans-serif;}
      .f{font-size:11px;fill:#334155;font-family:system-ui,sans-serif;}
      .rel{stroke:#0891b2;stroke-width:1.5;fill:none;marker-end:url(#a3);}
      .rl{font-size:11px;fill:#0891b2;}
    </style>
  </defs>

  <!-- books -->
  <rect x="40" y="60" width="230" height="150" class="ent" rx="6"/>
  <rect x="40" y="60" width="230" height="26" class="hd" rx="6"/>
  <text x="52" y="78" class="n">books</text>
  <text x="52" y="104" class="f">PK id</text>
  <text x="52" y="122" class="f">title / author / price</text>
  <text x="52" y="140" class="f">cover_image_url</text>
  <text x="52" y="158" class="f">description</text>
  <text x="52" y="176" class="f">status (selling / unlisted)</text>

  <!-- orders -->
  <rect x="620" y="30" width="240" height="150" class="ent" rx="6"/>
  <rect x="620" y="30" width="240" height="26" class="hd" rx="6"/>
  <text x="632" y="48" class="n">orders</text>
  <text x="632" y="74" class="f">PK id</text>
  <text x="632" y="92" class="f">order_number (UNIQUE)</text>
  <text x="632" y="110" class="f">customer_name / _address / _email</text>
  <text x="632" y="128" class="f">total_amount</text>
  <text x="632" y="146" class="f">ordered_at</text>

  <!-- order_items -->
  <rect x="330" y="200" width="270" height="150" class="ent" rx="6"/>
  <rect x="330" y="200" width="270" height="26" class="hd" rx="6"/>
  <text x="342" y="218" class="n">order_items</text>
  <text x="342" y="244" class="f">PK id</text>
  <text x="342" y="262" class="f">FK order_id → orders.id (CASCADE)</text>
  <text x="342" y="280" class="f">FK book_id → books.id (SET NULL)</text>
  <text x="342" y="298" class="f">title_snapshot / unit_price_snapshot</text>
  <text x="342" y="316" class="f">quantity / subtotal</text>

  <!-- relations -->
  <path d="M 620 120 Q 500 150 600 235" class="rel"/>
  <text x="520" y="150" class="rl">1 : N（注文は1明細以上）</text>
  <path d="M 200 210 Q 260 300 330 285" class="rel"/>
  <text x="210" y="270" class="rl">1 : N（book_id は任意）</text>

  <text x="52" y="205" class="f" style="fill:#94a3b8;">※ Cart / CartItem は localStorage（DB非永続）</text>
</svg>
</div>

主なエンティティ:

| エンティティ | 永続化先 | 説明 |
|---|---|---|
| 書籍 Book | `books` | 販売対象カタログ。`status='selling'` のみ一覧・詳細・注文対象 |
| カート Cart / 明細 CartItem | `localStorage` | 単一ブラウザの購入予定。`{ bookId, quantity }` のみ保持 |
| 注文 Order | `orders` | 確定した1注文。注文番号・注文者情報・合計・注文日時 |
| 注文明細 OrderLineItem | `order_items` | 注文内の1書籍分。注文時点の書名・単価をスナップショット |

---

## 7. 非機能設計方針

| 区分 | 方針 | 根拠ドキュメント |
|---|---|---|
| 性能 | 数値目標なし（学習・デモ）。一覧はページング（既定12件）で応答を一定化。憲法の暫定基準「主要画面/API 95%ile 2秒以内」を上限の目安 | [requirements.md](../../requirements.md) §4 / [constitution.md](../../.specify/memory/constitution.md) §4 |
| セキュリティ | 認証情報・DB接続情報は `.env`／環境変数のみ（コード直書き禁止）。SQL はプレースホルダ必須。CORS は `http://localhost:3000` の明示オリジンのみ許可。個人情報は氏名・住所・メールの3項目に限定。注文金額はクライアント値を信頼せずサーバ再計算 | [constitution.md](../../.specify/memory/constitution.md) §1 / [requirements.md](../../requirements.md) §4 / [tech-stack.md](../../tech-stack.md) §8 / research D-08 |
| 可用性 | ローカル環境・単一利用者を前提。冗長化・SLA は対象外。API 失敗時は汎用エラー表示（自動リトライなし） | [requirements.md](../../requirements.md) §4 / spec FR-032 |
| 保守性 | フロント・バックとも TypeScript（`strict`）。純粋ロジックを `lib/`・`domain/` に分離。主要ロジックに単体テスト（カバレッジ目標80%）。ESLint エラー0件必須 | [constitution.md](../../.specify/memory/constitution.md) §1・§2 / [tech-stack.md](../../tech-stack.md) §3 |
| UX一貫性 | 画面遷移・エラー表示・空状態を全画面で統一（`ErrorNotice` / `EmptyState`）。UI ライブラリ不使用・CSS Modules。フォームは `label` 関連付け・`aria-invalid`・フォーカス可視化で WCAG 2.1 AA を目標 | [constitution.md](../../.specify/memory/constitution.md) §3 / research D-06 |

---

## 8. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | | | — |
| アーキテクト / テックリード | | | |
| PM / プロジェクトリーダー | | | |

<!-- 要確認: 承認欄は人間が記入すること。CSS 方針・テストFW・ルート package.json 集約は tech-stack.md へのユーザー指示による AI 代行記入分（plan.md「実装前ゲート」）。最終確定は担当者が行う。 -->
