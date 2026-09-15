# 基本設計書 — オンライン書店の購買フロー

> **生成元**: /speckit.design basic (AI生成) — 内容を確認の上、承認してから次フェーズへ進むこと

> **図の表示について**: 憲法§7 に従い、すべての図はインライン SVG（HTML）で記述している。
> GitHub の Markdown ビューアはインライン SVG を除去するため、図を確認するには
> ローカルのプレビュー（VS Code の Markdown Preview 等）または HTML へ変換して閲覧すること。
> 各図には再生成用の PlantUML 記法を `<!-- plantuml: ... -->` としてコメントで併記している。

---

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | BASIC-004 |
| 対象フィーチャー | [`specs/004-bookstore-purchase-flow/`](./spec.md) |
| 作成日 | 2026-09-15 |
| 作成者 | AI生成（`/speckit.design basic`） |
| 承認者 | <!-- 要確認: 承認者未定 --> |
| 承認日 | <!-- 要確認: 未承認 --> |
| バージョン | 1.0 |

---

## 1. システム概要

### 1.1 目的

個人運営のオンライン書店において、サイトを訪れた購入希望者が「欲しい本を見つけ、必要事項を入力して注文を完了する」までの購買フローを提供する。

- **対象ユーザー**: 書店サイトを訪れた購入希望者（未ログインの一般利用者）
- **達成したいこと**: 商品一覧 → 商品詳細 → カート → 注文フォーム → 注文完了 の一連の導線を、**会員登録・決済なし**で最後まで通せること
- **位置づけ**: 学習・デモ用途のサンプルアプリケーション

### 1.2 対象範囲

**対象（In Scope）**

- 販売中書籍の一覧閲覧（グリッド表示）／書籍詳細の閲覧
- カートへの追加・数量変更・削除・合計金額表示・ブラウザ内での永続保持
- 注文情報（氏名・住所・メールアドレス）の入力とバリデーション
- 注文内容を確認しながらの注文確定／注文完了の確認（完了メッセージ・注文番号・一覧へ戻る導線）

**対象外（Out of Scope）**

ログイン・会員管理 ／ 決済処理 ／ 在庫管理 ／ 管理画面 ／ レビュー・評価 ／ 検索・フィルター ／ 送料などの計算・表示

---

## 2. アーキテクチャ概要

### 2.1 システム構成図（UML: コンポーネント図）

<!-- plantuml:
@startuml
skinparam componentStyle rectangle
actor "購入希望者" as User
node "Browser" as BR {
  component "Next.js App (画面)" as UI
  database "localStorage\n(カート)" as LS
  database "sessionStorage\n(注文完了の受け渡し)" as SS
}
node "docker compose (app-network)" as DC {
  component "frontend : Next.js :3000" as FE {
    component "app/ (5画面)" as PAGES
    component "components/ (共通UI)" as COMP
    component "lib/ (カート・検証・API)" as LIB
  }
  component "backend : Express :4000" as BE {
    component "routes/ (REST)" as ROUTES
    component "services/ (注文トランザクション)" as SVC
    component "domain/ (純粋ロジック)" as DOM
    component "db/ (mysql2 pool)" as DB
  }
  database "mysql : MySQL 8.0 :3306" as DBMS
}
User --> UI
UI --> LS
UI --> SS
UI --> FE : HTTP
FE --> BE : REST / JSON
BE --> DBMS : SQL (mysql2 placeholder)
@enduml
-->

<svg viewBox="0 0 960 470" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="システム構成図: ブラウザ、frontend、backend、MySQL の4要素からなる3層構成">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#37474f"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="960" height="470" fill="#ffffff"/>

  <rect x="196" y="24" width="754" height="420" rx="8" fill="#fafafa" stroke="#90a4ae" stroke-width="1.5" stroke-dasharray="7 5"/>
  <text x="206" y="44" font-family="sans-serif" font-size="13" fill="#546e7a">docker compose (app-network)</text>

  <rect x="14" y="150" width="160" height="70" rx="6" fill="#eceff1" stroke="#455a64" stroke-width="1.8"/>
  <text x="94" y="180" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1f2933">Browser</text>
  <text x="94" y="201" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#546e7a">購入希望者</text>

  <rect x="14" y="250" width="160" height="52" rx="6" fill="#fff8e1" stroke="#c49000" stroke-width="1.5"/>
  <text x="94" y="271" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">localStorage</text>
  <text x="94" y="289" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#6d4c00">カート（永続・FR-016）</text>

  <rect x="14" y="316" width="160" height="52" rx="6" fill="#fff8e1" stroke="#c49000" stroke-width="1.5"/>
  <text x="94" y="337" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">sessionStorage</text>
  <text x="94" y="355" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#6d4c00">注文完了の受渡（D-02）</text>

  <rect x="220" y="62" width="240" height="344" rx="8" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
  <text x="340" y="88" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0d3c61">frontend</text>
  <text x="340" y="107" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1565c0">Next.js 14.2.3 / React 18 — :3000</text>
  <rect x="238" y="124" width="204" height="78" rx="5" fill="#ffffff" stroke="#64b5f6"/>
  <text x="248" y="144" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/app/ — 5画面</text>
  <text x="248" y="163" font-family="sans-serif" font-size="11.5" fill="#37474f">一覧 / 詳細 / カート /</text>
  <text x="248" y="180" font-family="sans-serif" font-size="11.5" fill="#37474f">注文フォーム / 注文完了</text>
  <text x="248" y="196" font-family="sans-serif" font-size="11.5" fill="#37474f">＋ layout（共通ヘッダー）</text>
  <rect x="238" y="212" width="204" height="72" rx="5" fill="#ffffff" stroke="#64b5f6"/>
  <text x="248" y="232" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/components/</text>
  <text x="248" y="251" font-family="sans-serif" font-size="11.5" fill="#37474f">Header / BookCard /</text>
  <text x="248" y="268" font-family="sans-serif" font-size="11.5" fill="#37474f">CartSummary / ErrorNotice /</text>
  <text x="248" y="280" font-family="sans-serif" font-size="11.5" fill="#37474f">EmptyState</text>
  <rect x="238" y="294" width="204" height="94" rx="5" fill="#ffffff" stroke="#64b5f6"/>
  <text x="248" y="314" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/lib/</text>
  <text x="248" y="333" font-family="sans-serif" font-size="11.5" fill="#37474f">cartContext（状態＋永続化）</text>
  <text x="248" y="350" font-family="sans-serif" font-size="11.5" fill="#37474f">calcCartTotal（金額算出）</text>
  <text x="248" y="367" font-family="sans-serif" font-size="11.5" fill="#37474f">validateOrderForm（検証）</text>
  <text x="248" y="382" font-family="sans-serif" font-size="11.5" fill="#37474f">apiClient（API 呼び出し）</text>

  <rect x="520" y="62" width="240" height="344" rx="8" fill="#e8f5e9" stroke="#2e7d32" stroke-width="2"/>
  <text x="640" y="88" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1b5e20">backend</text>
  <text x="640" y="107" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#2e7d32">Node.js 20 / Express 4.18 — :4000</text>
  <rect x="538" y="124" width="204" height="62" rx="5" fill="#ffffff" stroke="#81c784"/>
  <text x="548" y="144" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/routes/ — REST</text>
  <text x="548" y="163" font-family="sans-serif" font-size="11.5" fill="#37474f">books.ts / orders.ts</text>
  <text x="548" y="180" font-family="sans-serif" font-size="11.5" fill="#37474f">＋ 共通エラー整形（D-11）</text>
  <rect x="538" y="196" width="204" height="62" rx="5" fill="#ffffff" stroke="#81c784"/>
  <text x="548" y="216" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/services/</text>
  <text x="548" y="235" font-family="sans-serif" font-size="11.5" fill="#37474f">orderService — 注文作成</text>
  <text x="548" y="252" font-family="sans-serif" font-size="11.5" fill="#37474f">（単一トランザクション）</text>
  <rect x="538" y="268" width="204" height="76" rx="5" fill="#ffffff" stroke="#81c784"/>
  <text x="548" y="288" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/domain/ — 純関数</text>
  <text x="548" y="307" font-family="sans-serif" font-size="11.5" fill="#37474f">calcOrderTotal</text>
  <text x="548" y="324" font-family="sans-serif" font-size="11.5" fill="#37474f">validateOrderRequest</text>
  <text x="548" y="339" font-family="sans-serif" font-size="11.5" fill="#37474f">generateOrderNumber</text>
  <rect x="538" y="354" width="204" height="34" rx="5" fill="#ffffff" stroke="#81c784"/>
  <text x="548" y="376" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1f2933">src/db/ — mysql2 pool</text>

  <rect x="806" y="150" width="138" height="118" rx="6" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="2"/>
  <text x="875" y="180" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="bold" fill="#4a148c">mysql</text>
  <text x="875" y="200" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#6a1b9a">MySQL 8.0 — :3306</text>
  <text x="875" y="224" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#37474f">books</text>
  <text x="875" y="241" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#37474f">orders</text>
  <text x="875" y="258" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#37474f">order_items</text>

  <line x1="174" y1="185" x2="214" y2="185" stroke="#37474f" stroke-width="2" marker-end="url(#ar)"/>
  <text x="194" y="176" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">HTTP</text>
  <line x1="94" y1="220" x2="94" y2="246" stroke="#c49000" stroke-width="1.8" marker-end="url(#ar)" marker-start="url(#ar)"/>
  <line x1="94" y1="302" x2="94" y2="312" stroke="#c49000" stroke-width="1.8" marker-end="url(#ar)" marker-start="url(#ar)"/>
  <line x1="462" y1="234" x2="514" y2="234" stroke="#37474f" stroke-width="2" marker-end="url(#ar)"/>
  <text x="488" y="225" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">REST</text>
  <text x="488" y="250" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">JSON</text>
  <line x1="762" y1="209" x2="800" y2="209" stroke="#37474f" stroke-width="2" marker-end="url(#ar)"/>
  <text x="781" y="200" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#37474f">SQL</text>
</svg>

**構成の要点**

| 要素 | 責務 | 備考 |
|---|---|---|
| Browser | 画面表示・カートの保持 | カートは `localStorage`、注文完了の受け渡しは `sessionStorage`（research.md D-01 / D-02） |
| frontend (:3000) | 5画面の描画・カート状態管理・入力検証 | サーバにカートを持たせない |
| backend (:4000) | 書籍参照・注文作成の REST API | 金額算出・注文番号発行・スナップショット化はサーバ側の責務 |
| mysql (:3306) | 書籍・注文の永続化 | スキーマは `mysql/init/` の初期化 SQL のみで定義 |

### 2.2 採用アーキテクチャパターン

`tech-stack.md` §1 の3層構成をそのまま採用する。

```
[Browser] --HTTP--> [frontend: Next.js :3000] --REST--> [backend: Express :4000] --SQL--> [mysql: MySQL 8 :3306]
```

- **レイヤ分離**: バックエンドは `routes`（HTTP 境界）／`services`（トランザクション制御）／`domain`（純関数）／`db`（接続）に分ける。`domain` は DB・HTTP に依存しないため単体テストが容易（憲法§2）
- **カートはクライアント保持**: 会員機能がなく利用者を識別できないため、カートをサーバに持たせない（research.md D-01）
- **ORM 不使用**: `mysql2` の生 SQL とプレースホルダを用いる（`tech-stack.md` §6）

---

## 3. 機能一覧

| 機能ID | 機能名 | 概要 | 対応要件ID |
|---|---|---|---|
| F-001 | 書籍一覧表示 | 販売中の書籍をグリッド形式で全件表示し、書影・タイトル・著者・価格を示す | REQ-001, REQ-002 / FR-001〜FR-002 |
| F-002 | 商品詳細への遷移 | 一覧の書籍を選択して当該書籍の詳細へ遷移する | REQ-003 / FR-003 |
| F-003 | 書籍詳細表示 | 書影・タイトル・著者・価格・説明文を表示する | REQ-004 / FR-005 |
| F-004 | カート追加 | 「カートに追加」操作のみで書籍をカートへ追加する（同一書籍は数量を加算） | REQ-005 / FR-006, FR-007, FR-009 |
| F-005 | 買い物の継続 | カート追加後も一覧へ戻って閲覧を継続でき、カート内容が保持される | REQ-006 / FR-008 |
| F-006 | カート内容表示 | 書名・単価・数量・小計を一覧表示する | REQ-007 / FR-010 |
| F-007 | 数量変更 | 数量を増減し、小計・合計を即時更新する（0で自動削除・上限なし） | REQ-008 / FR-011, FR-011a, FR-011b |
| F-008 | カートからの削除 | 書籍を明示的に削除し、合計を即時更新する | REQ-009 / FR-012 |
| F-009 | 合計金額表示 | カート内全書籍の小計の総和を表示する（送料等は含まない） | REQ-010 / FR-013 |
| F-010 | 注文フォームへの遷移 | 1冊以上ある場合のみ注文フォームへ遷移する | REQ-011 / FR-015 |
| F-011 | 顧客情報入力 | 氏名・住所・メールアドレスを入力する（3項目必須） | REQ-012 / FR-017 |
| F-012 | 入力バリデーション | 未入力・形式不正を検出しエラーを表示する（確定させない） | REQ-013 / FR-018〜FR-020 |
| F-013 | 注文内容の同画面確認 | 注文対象の書籍と合計金額を入力欄と同一画面に表示する | REQ-014 / FR-021 |
| F-014 | 注文確定 | 注文を確定し、注文番号を発行して注文完了画面へ遷移する | REQ-015 / FR-022〜FR-026 |
| F-015 | 注文完了表示 | 完了メッセージと注文番号を表示する（直前の確定に対してのみ） | REQ-016, REQ-017 / FR-027〜FR-029c |
| F-016 | 商品一覧へ戻る | 注文完了画面から商品一覧へ戻る | REQ-018 / FR-029 |
| F-017 | 共通ヘッダー・カート件数 | 全画面共通ヘッダーにカート導線と件数（数量合計）を常時表示する | Clarification / FR-032〜FR-035 |
| F-018 | カートの永続化・復元 | 同一ブラウザでカートを永続保持し、再訪時に復元する | Clarification / FR-016, FR-016a, FR-016b |
| F-019 | 販売状態による表示制御 | 販売中の書籍のみを一覧・詳細に表示する | Clarification / FR-001a, FR-001b, FR-005a |

---

## 4. 画面設計

### 4.1 画面一覧

| 画面ID | 画面名 | URL / ルート | 概要 | 主な機能ID |
|---|---|---|---|---|
| SCR-001 | 商品一覧 | `/` | 販売中の書籍をグリッド表示。0件時は空状態を表示 | F-001, F-002, F-019 |
| SCR-002 | 商品詳細 | `/books/[id]` | 書籍の詳細と「カートに追加」「一覧へ戻る」。販売停止・不存在は「見つかりません」 | F-003, F-004, F-005, F-019 |
| SCR-003 | カート | `/cart` | カート内容・数量操作・削除・合計。0件時は空状態を表示し進行不可 | F-006〜F-010, F-018 |
| SCR-004 | 注文フォーム | `/checkout` | 顧客情報の入力と注文内容の確認を同一画面で行う。0件時はフォーム非表示 | F-011〜F-014 |
| SCR-005 | 注文完了 | `/order-complete` | 完了メッセージ・注文番号・一覧へ戻るリンク。再読込時は注文情報を出さない | F-015, F-016 |

**全画面共通**: ヘッダー（カートへの導線＋件数）、エラー表示（`ErrorNotice`）、空状態表示（`EmptyState`）を統一する（F-017 / FR-030）。

### 4.2 画面遷移図（UML: ステートマシン図）

<!-- plantuml:
@startuml
[*] --> 商品一覧
商品一覧 --> 商品詳細 : 書籍をクリック (REQ-003)
商品詳細 --> 商品一覧 : 一覧へ戻る (REQ-006)
商品一覧 --> カート : ヘッダーのカート導線 (FR-035)
商品詳細 --> カート : ヘッダーのカート導線 (FR-035)
カート --> 注文フォーム : 注文手続きへ\n[カート1件以上] (REQ-011)
注文フォーム --> 注文完了 : 注文する\n[入力が妥当 かつ 確定成功] (REQ-015)
注文フォーム --> 注文フォーム : 入力不正／確定失敗\n(REQ-013, FR-026)
注文完了 --> 商品一覧 : 商品一覧へ戻る (REQ-018)
注文完了 --> 商品一覧 : 再読込・直接アクセス\n(注文情報を表示しない・FR-029a)
@enduml
-->

<svg viewBox="0 0 900 640" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="画面遷移図: 商品一覧から商品詳細、カート、注文フォーム、注文完了への遷移">
  <defs>
    <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#37474f"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="900" height="640" fill="#ffffff"/>

  <circle cx="400" cy="30" r="9" fill="#263238"/>
  <line x1="400" y1="39" x2="400" y2="62" stroke="#37474f" stroke-width="2" marker-end="url(#ar2)"/>

  <rect x="300" y="68" width="200" height="58" rx="10" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
  <text x="400" y="93" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0d3c61">SCR-001 商品一覧</text>
  <text x="400" y="113" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#1565c0">/</text>

  <rect x="300" y="186" width="200" height="58" rx="10" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
  <text x="400" y="211" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0d3c61">SCR-002 商品詳細</text>
  <text x="400" y="231" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#1565c0">/books/[id]</text>

  <rect x="300" y="304" width="200" height="58" rx="10" fill="#e8f5e9" stroke="#2e7d32" stroke-width="2"/>
  <text x="400" y="329" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1b5e20">SCR-003 カート</text>
  <text x="400" y="349" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#2e7d32">/cart</text>

  <rect x="300" y="422" width="200" height="58" rx="10" fill="#fff8e1" stroke="#c49000" stroke-width="2"/>
  <text x="400" y="447" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#6d4c00">SCR-004 注文フォーム</text>
  <text x="400" y="467" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#8a6100">/checkout</text>

  <rect x="300" y="540" width="200" height="58" rx="10" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="2"/>
  <text x="400" y="565" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4a148c">SCR-005 注文完了</text>
  <text x="400" y="585" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#6a1b9a">/order-complete</text>

  <line x1="378" y1="126" x2="378" y2="182" stroke="#37474f" stroke-width="2" marker-end="url(#ar2)"/>
  <text x="370" y="158" text-anchor="end" font-family="sans-serif" font-size="11.5" fill="#37474f">書籍をクリック</text>

  <path d="M 422 182 L 422 130" fill="none" stroke="#37474f" stroke-width="2" marker-end="url(#ar2)"/>
  <text x="432" y="158" font-family="sans-serif" font-size="11.5" fill="#37474f">一覧へ戻る</text>

  <path d="M 500 97 L 560 97 L 560 320 L 504 320" fill="none" stroke="#546e7a" stroke-width="1.8" stroke-dasharray="6 4" marker-end="url(#ar2)"/>
  <path d="M 500 215 L 560 215" fill="none" stroke="#546e7a" stroke-width="1.8" stroke-dasharray="6 4"/>
  <text x="572" y="200" font-family="sans-serif" font-size="11.5" fill="#546e7a">共通ヘッダーの</text>
  <text x="572" y="216" font-family="sans-serif" font-size="11.5" fill="#546e7a">カート導線</text>
  <text x="572" y="232" font-family="sans-serif" font-size="11.5" fill="#546e7a">（全画面・FR-035）</text>

  <line x1="400" y1="362" x2="400" y2="418" stroke="#37474f" stroke-width="2" marker-end="url(#ar2)"/>
  <text x="410" y="386" font-family="sans-serif" font-size="11.5" fill="#37474f">注文手続きへ</text>
  <text x="410" y="403" font-family="sans-serif" font-size="11" fill="#78909c">[カート1件以上]</text>

  <line x1="400" y1="480" x2="400" y2="536" stroke="#37474f" stroke-width="2" marker-end="url(#ar2)"/>
  <text x="410" y="504" font-family="sans-serif" font-size="11.5" fill="#37474f">注文する</text>
  <text x="410" y="521" font-family="sans-serif" font-size="11" fill="#78909c">[入力が妥当 かつ 確定成功]</text>

  <path d="M 300 451 L 252 451 L 252 492 L 296 492" fill="none" stroke="#b71c1c" stroke-width="1.8" marker-end="url(#ar2)"/>
  <text x="246" y="445" text-anchor="end" font-family="sans-serif" font-size="11" fill="#b71c1c">入力不正／確定失敗</text>
  <text x="246" y="461" text-anchor="end" font-family="sans-serif" font-size="11" fill="#b71c1c">（遷移しない）</text>

  <path d="M 300 569 L 150 569 L 150 110 L 296 110" fill="none" stroke="#37474f" stroke-width="2" marker-end="url(#ar2)"/>
  <text x="140" y="330" text-anchor="end" font-family="sans-serif" font-size="11.5" fill="#37474f">商品一覧へ戻る</text>
  <text x="140" y="348" text-anchor="end" font-family="sans-serif" font-size="11" fill="#78909c">／再読込・直接アクセス時</text>
  <text x="140" y="364" text-anchor="end" font-family="sans-serif" font-size="11" fill="#78909c">（注文情報を表示しない）</text>
</svg>

**遷移に関する取り決め**

| 遷移 | 条件 | 根拠 |
|---|---|---|
| カート → 注文フォーム | カートが1件以上 | FR-014, FR-015 |
| 注文フォーム → 注文完了 | 入力が妥当 **かつ** 注文確定が成功 | FR-022, FR-026 |
| 注文フォーム内で留まる | 入力不正・確定失敗（入力内容とカートを保持） | FR-020, FR-022b, FR-026 |
| 注文完了 → 商品一覧 | リンク操作、または再読込・直接アクセス（この場合は注文情報を表示しない） | FR-029, FR-029a |
| 全画面 → カート | 共通ヘッダーの導線（いつでも可能） | FR-035 |

---

## 5. API 設計概要

> 詳細は [`contracts/`](./contracts/) を参照。ここでは主要エンドポイントの一覧のみ示す。

| メソッド | パス | 概要 | 対応機能ID |
|---|---|---|---|
| GET | `/health` | 起動確認（雛形に既存） | — |
| GET | `/api/books` | 販売中の書籍を全件取得（`id` 昇順・ページングなし） | F-001, F-018, F-019 |
| GET | `/api/books/:id` | 書籍詳細を取得。販売停止・不存在は 404 | F-003, F-019 |
| POST | `/api/orders` | 注文を作成。検証・金額算出・注文番号発行・スナップショット化 | F-012, F-014, F-015 |

**設けないエンドポイント**

| 設けないもの | 理由 |
|---|---|
| カート関連 API | カートはブラウザ内に保持しサーバへ永続化しない（F-018 / FR-016a） |
| 注文照会 API | 認証なしで他者の注文を引ける経路となり FR-029b の趣旨に反する |
| 認証・決済・在庫・検索 API | スコープ外（FR-031） |

**エラー応答の統一形式**: `{ "error": { "code", "message", "details"? } }`。
コードは `VALIDATION_ERROR`(400) / `BOOK_NOT_FOUND`(404) / `BOOKS_UNAVAILABLE`(409) / `INTERNAL_ERROR`(500)。

---

## 6. データ概念モデル（UML: ER図）

> 詳細は [`data-model.md`](./data-model.md) を参照。ここではエンティティ間の関係のみ示す。

<!-- plantuml:
@startuml
entity books {
  * id : INT UNSIGNED <<PK>>
  --
  title / author / price
  description / cover_image_url
  is_available : BOOLEAN
}
entity orders {
  * id : INT UNSIGNED <<PK>>
  --
  order_number : CHAR(26) <<UK>>
  customer_name / address / email
  total_amount
}
entity order_items {
  * id : INT UNSIGNED <<PK>>
  --
  order_id <<FK>>
  book_id <<FK, NULL可>>
  title / unit_price (スナップショット)
  quantity / subtotal
}
entity "cart (非永続)" as cart {
  bookId / quantity
}
books ||--o{ order_items
orders ||--|{ order_items
cart .. books : 参照のみ（DB関連なし）
@enduml
-->

<svg viewBox="0 0 900 500" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ER図: books、orders、order_items の関係とブラウザ内のカート">
  <rect x="0" y="0" width="900" height="500" fill="#ffffff"/>

  <rect x="30" y="50" width="220" height="196" rx="6" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="2"/>
  <rect x="30" y="50" width="220" height="30" rx="6" fill="#6a1b9a"/>
  <text x="140" y="71" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">books</text>
  <text x="42" y="100" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1f2933">PK  id</text>
  <line x1="36" y1="108" x2="244" y2="108" stroke="#ce93d8"/>
  <text x="42" y="126" font-family="sans-serif" font-size="11.5" fill="#37474f">title</text>
  <text x="42" y="144" font-family="sans-serif" font-size="11.5" fill="#37474f">author</text>
  <text x="42" y="162" font-family="sans-serif" font-size="11.5" fill="#37474f">price</text>
  <text x="42" y="180" font-family="sans-serif" font-size="11.5" fill="#37474f">description</text>
  <text x="42" y="198" font-family="sans-serif" font-size="11.5" fill="#37474f">cover_image_url（NULL可）</text>
  <text x="42" y="216" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#4a148c">is_available</text>
  <text x="42" y="234" font-family="sans-serif" font-size="11" fill="#78909c">created_at / updated_at</text>

  <rect x="340" y="50" width="220" height="196" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="2"/>
  <rect x="340" y="50" width="220" height="30" rx="6" fill="#2e7d32"/>
  <text x="450" y="71" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">order_items</text>
  <text x="352" y="100" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1f2933">PK  id</text>
  <line x1="346" y1="108" x2="554" y2="108" stroke="#a5d6a7"/>
  <text x="352" y="126" font-family="sans-serif" font-size="11.5" fill="#37474f">FK  order_id</text>
  <text x="352" y="144" font-family="sans-serif" font-size="11.5" fill="#37474f">FK  book_id（NULL可）</text>
  <text x="352" y="168" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1b5e20">title ← スナップショット</text>
  <text x="352" y="186" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1b5e20">unit_price ← スナップショット</text>
  <text x="352" y="204" font-family="sans-serif" font-size="11.5" fill="#37474f">quantity</text>
  <text x="352" y="222" font-family="sans-serif" font-size="11.5" fill="#37474f">subtotal</text>

  <rect x="650" y="50" width="220" height="196" rx="6" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
  <rect x="650" y="50" width="220" height="30" rx="6" fill="#1565c0"/>
  <text x="760" y="71" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">orders</text>
  <text x="662" y="100" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1f2933">PK  id</text>
  <line x1="656" y1="108" x2="864" y2="108" stroke="#90caf9"/>
  <text x="662" y="126" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0d3c61">UK  order_number</text>
  <text x="662" y="144" font-family="sans-serif" font-size="11.5" fill="#37474f">customer_name</text>
  <text x="662" y="162" font-family="sans-serif" font-size="11.5" fill="#37474f">customer_address</text>
  <text x="662" y="180" font-family="sans-serif" font-size="11.5" fill="#37474f">customer_email</text>
  <text x="662" y="198" font-family="sans-serif" font-size="11.5" fill="#37474f">total_amount</text>
  <text x="662" y="216" font-family="sans-serif" font-size="11" fill="#78909c">created_at</text>

  <line x1="250" y1="148" x2="336" y2="148" stroke="#37474f" stroke-width="2"/>
  <text x="262" y="140" font-family="sans-serif" font-size="12" fill="#37474f">1</text>
  <text x="318" y="140" font-family="sans-serif" font-size="12" fill="#37474f">0..N</text>
  <line x1="560" y1="148" x2="646" y2="148" stroke="#37474f" stroke-width="2"/>
  <text x="572" y="140" font-family="sans-serif" font-size="12" fill="#37474f">1..N</text>
  <text x="634" y="140" font-family="sans-serif" font-size="12" fill="#37474f">1</text>

  <rect x="340" y="320" width="220" height="112" rx="6" fill="#fff8e1" stroke="#c49000" stroke-width="2" stroke-dasharray="7 4"/>
  <rect x="340" y="320" width="220" height="30" rx="6" fill="#c49000"/>
  <text x="450" y="341" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff">cart（非永続）</text>
  <text x="352" y="370" font-family="sans-serif" font-size="11.5" fill="#37474f">bookId</text>
  <text x="352" y="388" font-family="sans-serif" font-size="11.5" fill="#37474f">quantity</text>
  <text x="352" y="412" font-family="sans-serif" font-size="11" fill="#6d4c00">ブラウザの localStorage に保持</text>
  <text x="352" y="427" font-family="sans-serif" font-size="11" fill="#6d4c00">DB テーブルを持たない</text>

  <path d="M 340 376 L 140 376 L 140 250" fill="none" stroke="#c49000" stroke-width="1.8" stroke-dasharray="6 4"/>
  <text x="150" y="300" font-family="sans-serif" font-size="11" fill="#6d4c00">id を参照するのみ</text>
  <text x="150" y="316" font-family="sans-serif" font-size="11" fill="#6d4c00">（DB 上の関連なし）</text>
</svg>

**関係の要点**

| 関係 | 多重度 | 意味 |
|---|---|---|
| `books` — `order_items` | 1 : 0..N | 書籍は複数の注文に現れうる。`book_id` は参照のみで、表示には必ずスナップショット列を使う |
| `orders` — `order_items` | 1 : 1..N | 注文は1件以上の明細を持つ |
| `cart` — `books` | 参照のみ | カートは `books.id` を参照するが DB 上の関連を持たない（ブラウザ内に保持） |

**スナップショットの設計意図**: `order_items.title` / `unit_price` に注文時点の値をコピーすることで、以後 `books` の価格が変わっても確定済み注文の金額は変化しない（FR-024 / SC-006）。`book_id` を NULL 許容にしているのは、書籍が削除されても注文記録を失わないためである。

---

## 7. 非機能設計方針

| 区分 | 方針 | 根拠ドキュメント |
|---|---|---|
| 性能 | 主要画面の表示・操作への応答を **95パーセンタイルで2秒以内**とする。書籍は全件1画面表示のため、初期データを十数冊規模に留める。数値目標は学習・デモ用途のため個別には設けない | `requirements.md` §4 / `constitution.md` §4 |
| セキュリティ | 接続情報・認証情報は `.env`／環境変数経由のみとし、ソースコードへ直書きしない。SQL は `mysql2` のプレースホルダを必須とし、リクエスト値を文字列連結しない。個人情報は注文フォームの3項目に限定する。注文番号を画面のアドレスに含めず、注文照会 API も設けない（他者の注文を閲覧できる経路を作らない） | `constitution.md` §1 / `requirements.md` §4 / `tech-stack.md` §8 / FR-029b |
| 可用性 | ローカル環境（Docker Compose）で単一利用者が動作させられることを要件とする。冗長化・SLA・同時注文の競合制御は対象外 | `requirements.md` §4 |
| 保守性 | フロント・バックともに TypeScript で型安全性を確保し、`any` を原則禁止とする。主要ビジネスロジック（カート合計計算・入力バリデーション・注文番号発行・スナップショット化）を純関数として切り出し単体テストを用意する（カバレッジ80%）。Lint エラー0件を必須とする | `constitution.md` §1, §2 / `requirements.md` §4 / `tech-stack.md` §8 |
| UX一貫性 | 画面遷移・エラー表示・空状態の扱いを全画面で統一する。共通コンポーネント（`ErrorNotice` / `EmptyState` / `Header`）に集約し、CSS Modules ＋ `globals.css` の共有変数でスタイルを揃える。アクセシビリティは WCAG 2.1 AA を目標とする | `constitution.md` §3 / FR-030 / research.md D-06 |
| データ整合性 | 注文作成を単一トランザクション（`orders` → `order_items` → COMMIT）で実行し、失敗時は ROLLBACK して部分的な注文を残さない。注文番号に UNIQUE 制約を置く。アプリケーションコードから破壊的 DDL を発行しない | `constitution.md` §1 / FR-024〜FR-026 / research.md D-08 |

---

## 8. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | <!-- 要確認: 未記入 --> | | — |
| アーキテクト / テックリード | <!-- 要確認: 未記入 --> | | |
| PM / プロジェクトリーダー | <!-- 要確認: 未記入 --> | | |

> **承認前の留意事項**: `/speckit.analyze` で検出された CRITICAL 1件（憲法§5 — `tech-stack.md` の AI 代行編集が担当者未確定）が未解決である。
> 本設計書は `tech-stack.md` の内容を前提に作成しているため、同ファイルの確定後に本書の整合性を再確認すること。
