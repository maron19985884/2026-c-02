# Phase 0 Research: 個人運営オンライン書店（購買フロー特化版）

`docs/tech-stack-template.md` で言語・フレームワーク・DBは確定済み。ここでは実装上の技術的な未決事項を解決する。

## 1. バックエンドのWebフレームワーク

- **Decision**: Express
- **Rationale**: REST API 4〜5本程度の小規模構成であり、学習コストが低く情報も豊富な標準的な選択。TypeScriptとの組み合わせも一般的。
- **Alternatives considered**: Fastify（高速だが本規模では優位性が薄い）、NestJS（DIやモジュール機構が本規模には過剰）

## 2. SQLiteアクセス方法

- **Decision**: `better-sqlite3`（同期API、ORMなしで直接SQLを実行）
- **Rationale**: 書籍・カート明細・注文の3〜4テーブル程度の小規模スキーマであり、ORMの学習・設定コストをかけずSQLを直接書いた方がシンプル。同期APIのためコード量も少なくなる。
- **Alternatives considered**: Prisma（型安全だがマイグレーション基盤の導入コストが本規模には過剰）、`sqlite3`（非同期コールバックAPIで扱いづらい）

## 3. テストフレームワーク

- **Decision**: Jest（フロントエンドはReact Testing Library併用）
- **Rationale**: Next.js・Node.jsどちらの単体テストにも標準的に使え、フロント・バックでツールチェーンを統一できる。
- **Alternatives considered**: Vitest（高速だが本ひな形の標準テスト資産との親和性を優先しJestを採用）

## 4. カートの永続化方式

- **Decision**: カートはログインの無い本アプリではフロントエンドの画面状態（React Context）として保持し、サーバー側では永続化しない。注文確定（`POST /api/orders`）の際にのみカート内容をリクエストボディとしてバックエンドへ送信し、その時点でOrder/OrderItemとしてSQLiteに永続化する。
- **Rationale**: ユーザー要件定義書にログイン・会員管理はスコープ外と明記されており、ユーザーを特定する手段がない。サーバー側でカートを持たせても紐付けるユーザー識別子がなく、複雑さが増すだけで価値がない。
- **Alternatives considered**: サーバー側で匿名セッションID（Cookie）によるカート永続化（ブラウザを閉じても復元できる利点はあるが、要件定義に明記のない機能であり過剰実装と判断）

## 5. 書籍データの投入方法

- **Decision**: バックエンド起動時（またはDB初期化スクリプト）に固定のシードデータ（書籍十数件程度、書影URLはダミー/プレースホルダー画像）をSQLiteへ投入する。
- **Rationale**: 管理画面はスコープ外のため、書籍を登録・編集するUIが存在しない。動作確認（Phase 6）で一覧・詳細を表示するには初期データが必須。
- **Alternatives considered**: フロントエンドにハードコードした静的JSON（バックエンドAPI経由で取得するという要件定義のREST API方針に反するため不採用）

## 6. 注文番号の採番方式

- **Decision**: `ORD-{YYYYMMDD}-{4桁連番}`（例: `ORD-20260805-0001`）。SQLite側のOrderテーブルの自動採番IDをもとに日付プレフィックスを付与して生成する。
- **Rationale**: 一意性を保ちつつ、画面表示時にも人が識別しやすい形式。DBの自動採番を使うため実装がシンプル。
- **Alternatives considered**: UUID（一意性は高いが画面表示上ユーザーにとって読みにくい）

## Technical Context の NEEDS CLARIFICATION 解消状況

plan.md の Technical Context に記載した項目はいずれも本研究および `docs/tech-stack-template.md` により解消済み。未解決の項目なし。
