# 内部設計書 インデックス

日本語オンライン書店アプリの内部設計書一覧です。

- **プロジェクト**: オンライン書店（Docker 3サービス構成）
- **作成日**: 2026-05-10
- **バージョン**: 1.0

---

## 内部設計書一覧

| 機能ID | 機能名 | ファイル |
|---|---|---|
| F-01 | 商品一覧表示機能 | [F-01-product-list.md](./F-01-product-list.md) |
| F-02 | 商品詳細表示・カート追加機能 | [F-02-product-detail.md](./F-02-product-detail.md) |
| F-03 | カート管理機能 | [F-03-cart.md](./F-03-cart.md) |
| F-04 | 注文フォーム機能 | [F-04-order-form.md](./F-04-order-form.md) |
| F-05 | 注文完了表示機能 | [F-05-order-complete.md](./F-05-order-complete.md) |

---

## 対応する外部設計書

`docs/external-design/` に格納されている以下のファイルに対応しています：

- `F-01-product-list.md`
- `F-02-product-detail.md`
- `F-03-cart.md`
- `F-04-order-form.md`
- `F-05-order-complete.md`

---

## プロジェクト全体アーキテクチャ

### サービス構成

| サービス | スタック | ポート |
|---|---|---|
| frontend | Next.js 14 + TypeScript | 3000 |
| backend | Express.js + TypeScript | 4000 |
| mysql | MySQL 8 | 3306 |

### 画面遷移フロー

```
商品一覧 (/)
    │ 書籍カードクリック
    ▼
商品詳細 (/products/[id])
    │ 「カートに追加」
    ▼ （またはヘッダーのカートアイコン）
カート (/cart)
    │ 「レジに進む」
    ▼
注文フォーム (/order)
    │ POST /orders 成功
    ▼
注文完了 (/order/complete?orderNumber=ORD-xxx)
```

### データフロー概要

| 機能 | フロントエンドのデータソース | APIアクセス |
|---|---|---|
| F-01 商品一覧 | `GET /products` | あり |
| F-02 商品詳細 | `GET /products/:id` | あり |
| F-03 カート | `CartContext` + `localStorage` | なし |
| F-04 注文フォーム | `CartContext` + フォーム入力 → `POST /orders` | あり |
| F-05 注文完了 | URLクエリパラメータ | なし |

### 重要な共有資産

| ファイル | 役割 |
|---|---|
| `frontend/src/types/index.ts` | `Book`, `CartItem` 型定義 |
| `frontend/src/contexts/CartContext.tsx` | カート状態管理（localStorage永続化） |
| `frontend/src/components/Providers.tsx` | `CartProvider` のラッパー（`layout.tsx` から呼び出し） |
| `frontend/src/app/layout.tsx` | ルートレイアウト・グローバルスタイル |
| `backend/src/index.ts` | 全バックエンドルート |
| `mysql/init/01_init.sql` | DBスキーマ・初期データ |

---

## 実装上の共通規約（全機能共通）

### フロントエンド

1. **`"use client"` ディレクティブ**: 全ページコンポーネントに必須
2. **スタイル**: インラインスタイル（`style={{...}}`）のみ。CSS モジュール・Tailwind・外部CSSフレームワーク禁止
3. **カラーパレット**: 各ページで `AMZ` 定数として定義されたAmazonスタイルカラーを使用
4. **パスエイリアス**: `@/*` → `src/*`
5. **TypeScript**: strict モード有効、`any` 型の使用回避

### バックエンド

1. **モジュール形式**: `commonjs`
2. **全ルート**: `backend/src/index.ts` に集約
3. **DBアクセス**: `mysql2/promise` コネクションプール使用
4. **トランザクション**: 複数テーブルへの書き込みは `getConnection()` + `beginTransaction()` を使用
5. **SQLインジェクション対策**: パラメータバインディング（`?` プレースホルダー）必須
6. **strict モード**: 有効

### Amazonスタイルカラーパレット（実装値）

外部設計書と実装の色定数が異なる点に注意:

| 用途 | 外部設計書 | 実装（AMZ定数） |
|---|---|---|
| ページ背景 | `#f3f4f6` | `#EAEDED` |
| カード背景 | `white` | `#FFFFFF` |
| メインネイビー | `#1e3a8a` / `#1e40af` | `#131921` (ヘッダー) / `#232F3E` (ナビ) |
| 本文テキスト | `#111827` / `#374151` | `#0F1111` |
| サブテキスト | `#6b7280` | `#565959` |
| エラー・削除 | `#ef4444` | `#CC0000` (フォームエラー) |
| アクセント | - | `#FF9900` (オレンジ) |

---

## 既知の実装課題（改善余地）

以下は既存実装で確認された改善余地のある点です。内部設計書の各セクションにも記載されています。

| 機能 | 課題 | 推奨対応 |
|---|---|---|
| F-01 | API失敗時のエラー表示なし | `error` state を追加してエラーメッセージを表示 |
| F-01 | データ0件時の空状態表示なし | `books.length === 0` 時に「販売中の書籍はありません」を表示 |
| F-02 | HTTPステータスコードの未確認 | `if (!r.ok) throw new Error(...)` を追加 |
| F-02 | `setTimeout` のクリーンアップなし | `useEffect` の cleanup で `clearTimeout` を実行 |
| F-03 | localStorage 書き込みエラーのサイレント失敗 | `try-catch` を追加 |
| F-03 | `CartItem` に `image_url` がなく書影未表示 | `CartItem` 型に `image_url` を追加（F-02の `addItem` 変更も必要） |
| F-04 | `res.ok` 未確認による誤動作リスク | `if (!res.ok) throw new Error(...)` を追加 |
| F-04 | `name` の100文字上限チェック未実装 | `validate()` 関数に長さチェックを追加 |
| F-04 | 空カート時のリダイレクト未実装 | `useRouter().push("/cart")` による遷移に変更 |
| F-04 | API失敗時のエラーメッセージ未表示 | `error` state を追加してフォーム上部に表示 |
| F-05 | `orderNumber` クエリなし時のエラー表示なし | バリデーションと「注文情報が見つかりません」メッセージを追加 |
