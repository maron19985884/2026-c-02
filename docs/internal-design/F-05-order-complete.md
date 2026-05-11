# 内部設計書 - 注文完了表示機能

- **機能ID**: F-05
- **対応外部設計書**: `docs/external-design/F-05-order-complete.md`
- **作成日**: 2026-05-10
- **バージョン**: 1.0

---

## 1. 概要

### 対象機能・変更範囲の要約

注文完了画面（`/order/complete?orderNumber=ORD-xxx`）でクエリパラメータから注文番号を取得して表示する機能。API呼び出しなし・DBアクセスなしのシンプルなクライアントコンポーネント。Next.js の `useSearchParams()` を使用するため `<Suspense>` でラップされた構成になっている。

### 外部設計書との対応関係

| 外部設計項目 | 実装ファイル |
|---|---|
| 注文完了画面 (`/order/complete`) | `frontend/src/app/order/complete/page.tsx` |

---

## 2. アーキテクチャ設計

### コンポーネント構成図

```
OrderCompletePage (frontend/src/app/order/complete/page.tsx)
├── <header>             ← シンプルヘッダー（ロゴのみ）
└── <Suspense fallback="読み込み中…">
    └── OrderCompleteContent（内部コンポーネント）
        └── <main>
            └── 確認ボックスカード
                ├── 注文完了バナー（緑背景 ✓ + メッセージ）
                ├── 注文番号表示（orderNumber が存在する場合のみ）
                ├── お届け予定表示（ダミー固定テキスト）
                └── アクション領域
                    ├── <Link href="/">書籍一覧に戻る</Link>
                    └── <Link href="/">注文履歴を確認する</Link>（未実装リンク）
```

### サービス間データフロー

```
[注文フォーム F-04]
  POST /orders → 成功 → { order_number: "ORD-xxxx" }
  clearCart()
  router.push('/order/complete?orderNumber=ORD-xxxx')
      ↓
[ブラウザ URL]
  /order/complete?orderNumber=ORD-1714900000000
      ↓
[OrderCompleteContent]
  useSearchParams().get("orderNumber")
  → "ORD-1714900000000"
      ↓
  画面表示（APIアクセスなし）
```

### 新規追加・変更するファイル一覧

本機能は既存実装済み。変更なし。

| ファイル | ステータス | 備考 |
|---|---|---|
| `frontend/src/app/order/complete/page.tsx` | 実装済み | `OrderCompletePage` + `OrderCompleteContent` |

---

## 3. フロントエンド設計

### 3.1 ページ・コンポーネント設計

#### `OrderCompletePage` (`frontend/src/app/order/complete/page.tsx`)

**責務**: `<Suspense>` 境界を提供する外側ラッパーコンポーネント。ヘッダーと `OrderCompleteContent` をレンダリングする。

**ディレクティブ**: `"use client"` （ファイル全体に適用。`useSearchParams` を使用する内部コンポーネントを含むため必須）

**`<Suspense>` の必要性**:

Next.js 14 App Router では、`useSearchParams()` を使用するコンポーネントは必ず `<Suspense>` 境界で囲む必要がある。囲まない場合、ビルド時に警告またはエラーが発生する。

```typescript
export default function OrderCompletePage() {
  return (
    <div style={{ ... }}>
      <header>...</header>
      <Suspense fallback={<p style={{ padding: 24, color: AMZ.textSub }}>読み込み中…</p>}>
        <OrderCompleteContent />
      </Suspense>
    </div>
  );
}
```

#### `OrderCompleteContent`（内部コンポーネント）

**責務**: クエリパラメータから注文番号を取得して表示する。

**内部状態**: なし（`useSearchParams` のみ使用）

**クエリパラメータ取得**:

```typescript
const searchParams = useSearchParams();
const orderNumber = searchParams.get("orderNumber");
// orderNumber: string | null
```

**条件付きレンダリング**:

```typescript
// orderNumber が存在する場合のみ注文番号を表示
{orderNumber && (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 14, color: AMZ.textSub, marginBottom: 4 }}>注文番号</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: AMZ.link }}>{orderNumber}</div>
  </div>
)}
```

- `orderNumber === null`（クエリパラメータなし）の場合、注文番号セクションが非表示になるが、エラーメッセージ（「注文情報が見つかりません」等）は現在未実装
- 改善: `orderNumber` が null または `ORD-` 始まりでない場合に警告メッセージを表示

**完了バナー（緑色）**:

```typescript
<div style={{
  background: "#F0FAF0",
  border: "1px solid #4CAF50",
  borderRadius: 4,
  padding: "12px 16px",
  marginBottom: 24,
  display: "flex",
  alignItems: "center",
  gap: 12
}}>
  <span style={{ fontSize: 28, color: AMZ.green }}>✓</span>
  <div>
    <div style={{ fontSize: 18, fontWeight: 700, color: AMZ.green }}>
      ご注文ありがとうございます
    </div>
    <div style={{ fontSize: 14, color: AMZ.textSub, marginTop: 2 }}>
      ご注文が正常に受け付けられました。確認メールをお送りします。
    </div>
  </div>
</div>
```

**お届け予定セクション**（ダミー固定テキスト）:

```typescript
<div style={{ background: "#F3F3F3", borderRadius: 4, padding: 16, marginBottom: 24 }}>
  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>お届け予定</div>
  <div style={{ fontSize: 14, color: AMZ.text }}>
    <span style={{ color: AMZ.prime, fontWeight: 700 }}>Prime</span> 対応 — <strong>明日</strong>お届け予定
  </div>
</div>
```

実際の配送日計算は未実装（ダミー表示）。

**アクション領域**:

```typescript
<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
  <Link href="/">書籍一覧に戻る</Link>
  <Link href="/">注文履歴を確認する</Link>  ← 注文履歴機能は未実装（/ に遷移）
</div>
```

**スタイル定数**:

```typescript
const AMZ = {
  navy: "#131921",
  orange: "#FF9900",
  yellow: "#FFD814",
  link: "#007185",
  text: "#0F1111",
  textSub: "#565959",
  green: "#007600",
  prime: "#00A8E1",
  borderLight: "#E7E7E7",
  bg: "#EAEDED",
  card: "#FFFFFF",
};
```

**確認カードのレイアウト**:

```typescript
// 外側コンテナ
style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}

// カード
style={{
  background: AMZ.card,
  border: `1px solid ${AMZ.borderLight}`,
  borderRadius: 4,
  padding: 24
}}
```

### 3.2 API呼び出し設計

**API呼び出しなし**。

### 3.3 状態管理設計

**CartContext 利用なし**。カートは F-04 の `clearCart()` でクリア済みであることが前提。

**`useSearchParams` の使用**:

```typescript
import { useSearchParams } from "next/navigation";
// → クエリパラメータ "orderNumber" を取得
```

---

## 4. バックエンド設計

**バックエンドとの通信なし。本機能に不要。**

---

## 5. データベース設計

**DBアクセスなし。本機能に不要。**

---

## 6. 型定義設計

追加型定義なし。

---

## 7. エラーハンドリング設計

### フロントエンドのエラー表示方針

| エラー条件 | 現在の実装 | 推奨改善 |
|---|---|---|
| `orderNumber` クエリなし | 注文番号セクションが非表示になるだけ | 「注文情報が見つかりません」メッセージを表示し「商品一覧に戻る」リンクを提示 |
| `orderNumber` が想定形式外（`ORD-` 始まりでない） | そのまま表示される | `startsWith("ORD-")` チェックを追加してバリデーション |
| `<Suspense>` のフォールバック | 「読み込み中…」が表示される | 対応済み |

**エラー表示改善の実装例**:

```typescript
function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const isValid = orderNumber && orderNumber.startsWith("ORD-");

  if (!isValid) {
    return (
      <main style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p>注文情報が見つかりません</p>
          <Link href="/">商品一覧に戻る</Link>
        </div>
      </main>
    );
  }
  // 正常表示...
}
```

### バックエンドのHTTPステータスコード方針

本機能はバックエンドと通信しない。

---

## 8. セキュリティ考慮事項

| 項目 | 対応状況 |
|---|---|
| XSS対策 | `orderNumber` を `dangerouslySetInnerHTML` では使用していない。React の JSX 自動エスケープで保護済み |
| URLパラメータの意図的な改ざん | `orderNumber` はURLに露出するが、本画面ではDBへの照会を行わないため情報漏洩はない |
| クエリパラメータの長さ制限 | 現在制限なし。`orderNumber` は `ORD-` + 13桁で固定長のため問題なし |

---

## 9. テスト観点

| テストケース | 分類 | 確認内容 |
|---|---|---|
| 正常なクエリパラメータで表示 | 正常系 | 注文番号（例: `ORD-1714900000000`）が画面に表示されること |
| 完了メッセージの表示 | 正常系 | 「ご注文ありがとうございます」が表示されること |
| 「書籍一覧に戻る」クリック | 正常系 | `/` に遷移すること |
| `orderNumber` クエリなしでアクセス | 異常系 | 注文番号セクションが表示されないこと（エラーなし） |
| 不正な `orderNumber` でアクセス | 異常系 | 任意のテキストがそのまま表示されること（現状） |
| ブラウザ「戻る」で再表示 | 正常系 | 同じ画面が再表示されること（URLに注文番号が残るため） |
| `<Suspense>` フォールバック表示 | 正常系 | SSR時に「読み込み中…」フォールバックが表示されること |

---

## 10. 実装上の注意事項・制約

1. **`<Suspense>` 境界の必須性**: `useSearchParams()` は Next.js 14 App Router において `<Suspense>` 境界内でのみ使用可能。`OrderCompleteContent` コンポーネントを `OrderCompletePage` から分離して `<Suspense>` でラップする2段構成は必須。

2. **`"use client"` ディレクティブ**: `useSearchParams` を使用するため必須。ファイル先頭に記述。

3. **`orderNumber` の値検証**: 現在はクエリパラメータの値をそのまま表示しているため、URLを手動編集することで任意の文字列を表示できる。これはセキュリティ上の問題ではないが（DBに照会しない）、UXとして意図的な注文番号形式チェックを追加することが推奨される。

4. **「注文履歴を確認する」リンク**: UIに表示されているが、`href="/"` に設定されており注文履歴機能は未実装。

5. **お届け予定日のダミー表示**: 「明日お届け予定」は固定テキスト。実際の配送日計算機能は未実装（スコープ外）。

6. **確認メール**: 画面に「確認メールをお送りします」と表示されているが、メール送信機能は未実装（スコープ外）。

7. **スタイル規約**: 全インラインスタイル必須。CSS モジュール・Tailwind 禁止。
