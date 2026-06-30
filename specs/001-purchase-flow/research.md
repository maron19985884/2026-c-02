# Research: オンライン書店 購買フロー

**Feature**: specs/001-purchase-flow
**Date**: 2026-06-30
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: カート状態の管理方法

**Decision**: React Context + localStorage（クライアントサイド）

**Rationale**:
- spec.md の Assumptions に「カートのデータはブラウザセッション中のみ保持されれば十分」とある
- localStorage により、同一ブラウザセッション内でページリロードしてもカートが保持される
- サーバーサイドセッション不要 → 認証基盤が不要

**Alternatives considered**:
- **サーバーサイドセッション**: Cookie/セッション管理が必要になり Constitution Principle V（Simplicity）に違反
- **URL パラメータ**: カートの複数商品をURLに載せるのは非現実的
- **メモリのみ（React state）**: ページリロードでカートが消えてしまいUXが悪い

---

## Decision 2: 注文番号の生成方式

**Decision**: `ORD-XXXXXX` 形式（例: `ORD-000001`）— AUTO_INCREMENT の id を6桁ゼロ埋め

**Rationale**:
- 人が読んで理解しやすい形式
- AUTO_INCREMENT で一意性が保証される
- MySQL側で生成できるため、アプリ層での採番ロジック不要

**Alternatives considered**:
- **UUID**: 重複しないが人には読みにくい（注文番号の画面表示に不向き）
- **タイムスタンプ**: 並列注文で重複の可能性、ミリ秒まで含めると桁が長い

---

## Decision 3: 金額の数値型

**Decision**: INTEGER（円単位）

**Rationale**:
- 日本円は小数点以下の単位を持たない
- 浮動小数点の計算誤差を回避できる
- MySQL の INT 型で十分（最大 ¥2,147,483,647）

**Alternatives considered**:
- **DECIMAL(10, 2)**: 小数点が不要なため過剰

---

## Decision 4: 注文完了画面への注文番号受け渡し方法

**Decision**: URLクエリパラメータ（`/order-complete?orderNumber=ORD-000001`）

**Rationale**:
- POST /orders のレスポンスで注文番号を受け取り、クライアントが該当URLへリダイレクト
- シンプルで追加ストレージ不要
- ブラウザの「戻る」ボタンを押した際に注文完了画面に戻れない（二重送信防止）

**Alternatives considered**:
- **sessionStorage**: ページ遷移では使えるが、実装が複雑
- **サーバーサイドルーティング**: オーバーエンジニアリング

---

## Decision 5: API レスポンス形式

**Decision**: フラットJSON（ラッパーなし）

**Rationale**:
- Constitution Principle V（Simplicity）に従い、エンベロープは使わない
- `GET /books` → `Book[]`、`POST /orders` → `{ orderNumber: string }` のシンプルな形式
- エラーは HTTP ステータスコード + `{ error: string }` で返す

**Alternatives considered**:
- **`{ data: T, error: null }`** ラッパー: 一貫性はあるが、シンプルなAPIには過剰

---

## Decision 6: 書影（book cover image）の扱い

**Decision**: `imageUrl` フィールド（VARCHAR 500）— シードデータではプレースホルダーURLを使用

**Rationale**:
- 実際の書影画像ファイルの管理はスコープ外
- 初期シードデータでは `https://placehold.jp/150x200.png` 等のプレースホルダーで代替

**Alternatives considered**:
- **バイナリ（BLOB）**: ファイル管理・配信が複雑すぎてスコープ外
- **ファイルアップロード**: 管理画面不要のため対象外

---

## Decision 7: フォームバリデーション方式

**Decision**: クライアントサイドバリデーション（React）+ サーバーサイド二重チェック

**Rationale**:
- FR-014「未入力や形式不正の場合はエラーメッセージを表示」をフロントエンドで即時フィードバック
- バックエンドでも必須チェック・メール形式チェックを実施（セキュリティ）
- メール形式は RFC5322 の簡易チェック（`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`）

**Alternatives considered**:
- **HTML5 `required` + `type="email"` のみ**: ブラウザ依存でスタイルが制御しにくい

---

## Decision 8: Next.js ルーティング

**Decision**: Pages Router（`pages/` ディレクトリ）

**Rationale**:
- Constitution Tech Stack Constraints: "Pages Router preferred; App Router requires explicit justification"
- 5画面の構成はPagesRouterで十分

**Pages構成**:
```
pages/
├── index.tsx            # 商品一覧（U-01〜U-03）
├── books/[id].tsx       # 商品詳細（U-04〜U-06）
├── cart.tsx             # カート（U-07〜U-11）
├── checkout.tsx         # 注文フォーム（U-12〜U-15）
└── order-complete.tsx   # 注文完了（U-16〜U-18）
```

---

## 未解決事項

なし — すべての NEEDS CLARIFICATION を解決済み。
