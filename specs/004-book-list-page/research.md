# Research: 商品一覧画面

**Status**: 全項目解決済み（Technical Context に `NEEDS CLARIFICATION` なし）

Technical Context のすべての項目は `tech-stack.md`（技術選定書）・`requirements.md`（要件定義書）・`spec.md` の Clarifications セッションから確定できたため、未解決事項はない。以下は実装方式レベルの技術決定を記録する。

## D-01: 書籍一覧取得APIの形状

- **Decision**: `GET /api/books` を新設し、`books` テーブルを `ORDER BY id ASC` で全件取得して返す。クエリパラメータ（ページ番号・件数等）は設けない。
- **Rationale**: spec.md の Clarifications（並び順=ID昇順、常に全件表示）をそのまま反映する最小構成。tech-stack.md でORM不使用・`mysql2` 生SQLの方針のため、プレースホルダを使わない単純な `SELECT` で足りる。
- **Alternatives considered**: クエリパラメータでソート順・ページングを受け付ける設計 → 要件定義書§2で検索・フィルターが対象外と明記されており、将来要件が確定するまで導入しない（憲法§5「新規依存や仕様の先取りをしない」の趣旨に沿う）。

## D-02: 書影未設定時のプレースホルダー実装方法

- **Decision**: フロントエンドの静的アセット（例: `frontend/public/images/book-placeholder.png`）を1点用意し、`BookCard` コンポーネントが `imageUrl` が空/nullの場合にそのパスをフォールバックとして使用する。
- **Rationale**: spec.md Clarifications で「共通プレースホルダー画像」と決定済み。バックエンドでの画像生成・アップロード機構は要件になく、静的ファイル1枚で十分。
- **Alternatives considered**: バックエンドが `imageUrl` を常にプレースホルダーURLで埋めて返す方式 → 表示ロジック（何を代替表示とするか）はUI関心事であり、フロントエンドに閉じたほうが責務分離として妥当。

## D-03: エラー表示・空状態表示の共通化

- **Decision**: `frontend/src/components/ErrorNotice.tsx` と `EmptyState.tsx` を本機能で新規作成し、他画面（詳細・カート・注文フォーム・注文完了）からも再利用可能な共通コンポーネントとする。
- **Rationale**: 憲法§3「画面遷移・エラー表示・空状態の扱いを全画面で統一する」、および tech-stack.md §3 に記載の方針（`ErrorNotice` / `EmptyState` への集約）に整合させる。
- **Alternatives considered**: 商品一覧画面専用のエラー/空状態表示を作る → 他画面実装時に重複・表記ゆれが発生するため不採用。

## D-04: `books` テーブルのスキーマ

- **Decision**: 以下のカラムを持つ `books` テーブルとする（snake_case、tech-stack.md §7）。

  | カラム | 型 | 備考 |
  |---|---|---|
  | `id` | `INT AUTO_INCREMENT PRIMARY KEY` | |
  | `title` | `VARCHAR(255) NOT NULL` | |
  | `author` | `VARCHAR(255) NOT NULL` | |
  | `price` | `INT NOT NULL` | 円単位の整数（消費税・送料はスコープ外） |
  | `description` | `TEXT NULL` | 商品詳細画面用（本機能では一覧に含めない） |
  | `image_url` | `VARCHAR(512) NULL` | 未設定時はプレースホルダー表示（D-02） |
  | `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` | 登録順（=ID昇順）の根拠 |

- **Rationale**: 要件定義書§7の用語定義（書籍＝書影・タイトル・著者・価格・説明文を持つ）と、商品詳細画面（description）・カート機能（今後 `order_items` 等で参照）を見据えた最小構成。
- **Alternatives considered**: 一覧専用に列を絞った別テーブル/ビューを作る → テーブル数を増やす複雑化であり、tech-stack.md §6でORM不使用・シンプル構成を選好する方針と矛盾するため不採用。

## D-05: フロントエンド一覧取得のエラーハンドリング方式

- **Decision**: `frontend/src/lib/api/books.ts` の `fetchBooks()` は取得失敗時に例外を送出し、`page.tsx`（Server Component または取得処理側）でキャッチして `ErrorNotice` を表示する。再試行ボタンは設けない（Clarifications Session 2026-09-09）。
- **Rationale**: spec.md FR-007の「再読み込み操作の提供は不要」という決定に合わせ、UIを最小限に保つ。
- **Alternatives considered**: SWR/React Query等のデータ取得ライブラリを導入し自動リトライを行う → tech-stack.mdに記載のない新規依存であり、憲法§5「技術選定はtech-stack.mdで人間が確定、AIは追加不可」に反するため不採用。
