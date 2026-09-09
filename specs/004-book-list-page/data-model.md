# Data Model: 商品一覧画面

## Book（書籍）

要件定義書§7「書籍＝書影・タイトル・著者・価格・説明文を持つ」を情報源とし、`research.md` D-04 のテーブル定義に対応する。

| 属性 | 型 | 必須 | 説明 |
|---|---|---|---|
| id | number | ✓ | 書籍を一意に識別するID（DB `id`、AUTO_INCREMENT）。一覧の並び順（ID昇順）の基準（FR-006） |
| title | string | ✓ | 書籍タイトル（一覧・詳細で表示、FR-002） |
| author | string | ✓ | 著者名（一覧・詳細で表示、FR-002） |
| price | number | ✓ | 価格（円、税送料含まず。一覧・詳細で表示、FR-002） |
| imageUrl | string \| null | — | 書影画像のURL。未設定（null/空文字）の場合は共通プレースホルダー画像を表示する（FR-008） |
| description | string \| null | — | 説明文。**商品一覧画面では使用しない**（商品詳細画面のスコープ） |

### バリデーション・不変条件

- `id` は正の整数で一意（DB制約：PRIMARY KEY AUTO_INCREMENT）。
- `price` は0以上の整数（円単位、小数不可）。
- `title` / `author` は空文字を許容しない（`NOT NULL`）。
- `imageUrl` が null または空文字の場合、フロントエンドは D-02 のプレースホルダー画像を用いる（バックエンドはそのまま null/空文字を返し、代替表示ロジックはフロントエンドに置く）。

### 本機能で使用するビュー（BookListItem）

一覧表示に必要な属性のみを抜粋した表示用の形（`description` を含まない）。

| 属性 | 型 | 由来 |
|---|---|---|
| id | number | Book.id |
| title | string | Book.title |
| author | string | Book.author |
| price | number | Book.price |
| imageUrl | string \| null | Book.imageUrl |

### 状態・関係

- 本機能（商品一覧）は `Book` を読み取り専用で扱う。作成・更新・削除は対象外（管理画面はスコープ外、tech-stack.md §9）。
- `Book` は今後の機能（商品詳細・カート・注文）でも共通利用される想定のエンティティであり、本テーブル定義はそれらの前提となる（`description` は商品詳細画面が利用）。
