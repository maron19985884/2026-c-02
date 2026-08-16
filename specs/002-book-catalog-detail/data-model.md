# Data Model: 商品一覧・商品詳細

## Book（書籍）

MySQLの`books`テーブルとして永続化する（読み取り専用。登録・編集APIは本機能の対象外）。

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | INT AUTO_INCREMENT (PK) | ○ | 書籍を一意に識別するID |
| `title` | VARCHAR(255) | ○ | タイトル |
| `author` | VARCHAR(255) | ○ | 著者名 |
| `price` | INT | ○ | 価格（日本円、税込み、単位は円の整数） |
| `description` | TEXT | ○ | 説明文（商品詳細画面のみで使用） |
| `cover_image_url` | VARCHAR(500) | NULL許容 | 書影画像のURL/パス。NULLの場合フロントエンドがプレースホルダーを表示（spec.md Edge Cases） |
| `is_for_sale` | BOOLEAN (TINYINT(1)) | ○ | 販売中かどうか。`false`の書籍は一覧・詳細どちらにも表示しない |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | ○ | 登録日時。一覧の並び順（登録順・新しい書籍が先頭）に使用 |

**バリデーション/制約**:
- `price` は0以上の整数。
- 一覧・詳細ともに`is_for_sale = true`の書籍のみを対象とする（spec.md FR-001, FR-009）。
- 一覧の並び順は`created_at DESC, id DESC`（登録順・新しい書籍が先頭。spec.md Assumptions）。`created_at`が同時刻の書籍が複数ある場合に順序が不定にならないよう、`id DESC`をタイブレークとして付加する。

**状態遷移**: 本機能では状態遷移なし（`is_for_sale`の更新は管理機能の責務であり対象外）。

## カート追加操作（クライアント側概念エンティティ）

サーバー側では永続化しない、フロントエンドのクライアント状態（`localStorage`）としてのみ存在する（research.md #3参照）。

| フィールド | 型 | 説明 |
|---|---|---|
| `bookId` | number | 追加対象の書籍ID（`books.id`を参照） |
| `quantity` | number (>=1) | 同一書籍を複数回追加した場合は加算する |

**関係**: `bookId`は概念的に`Book.id`を参照するが、本機能ではサーバー側の外部キー制約は発生しない（カートを保持するテーブル自体が存在しないため）。カート内容の一覧表示・数量編集・削除は後続の「カート」機能（REQ-007〜011）が、このクライアント側store（`frontend/src/app/lib/cartStore.ts`）を読み書きする形で実装する想定。
