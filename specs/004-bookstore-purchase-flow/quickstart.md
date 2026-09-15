# Quickstart — オンライン書店の購買フロー

**Branch**: `004-bookstore-purchase-flow` | **Date**: 2026-09-15 | **Plan**: [plan.md](./plan.md)

実装の着手から動作確認までの手順。`/speckit.implement` の前提条件と、実装後の受け入れ確認手順を兼ねる。

---

## 1. 雛形の取り込み（実装前に必須）

本ブランチには `frontend/` `backend/` `docker-compose.yml` `mysql/` `.env.example` `.gitignore` が**存在しない**。
`origin/main` の雛形を取り込む（2026-09-15・ユーザー承認済みの案A）。

```bash
git checkout origin/main -- frontend backend docker-compose.yml mysql .env.example .gitignore
```

取り込まれる内容:

| パス | 内容 |
|---|---|
| `frontend/` | Next.js 14.2.3 + React 18 + TypeScript 5（App Router・`src/app/`） |
| `backend/` | Express 4.18 + mysql2 3.6 + cors（`/health` のみ実装済み） |
| `mysql/init/01_init.sql` | サンプルの `users` テーブル（**本仕様のスキーマに置き換える**） |
| `docker-compose.yml` | frontend :3000 / backend :4000 / mysql :3306 |
| `.env.example` | 環境変数の雛形 |

確認:

```bash
git status --short && ls frontend backend mysql
```

---

## 2. 環境変数の用意

```bash
cp .env.example .env
```

`.env` は `.gitignore` によりコミットされない。接続情報をコードへ直書きしない（`tech-stack.md` §8 / requirements.md §4）。

| 変数 | 既定値 | 用途 |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root パスワード |
| `DB_NAME` | `appdb` | データベース名 |
| `DB_USER` | `appuser` | アプリ用ユーザー |
| `DB_PASSWORD` | `password` | アプリ用パスワード |
| `PORT` | `4000` | バックエンドのポート |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | フロントから見た API のベース URL |

---

## 3. 品質ツールの整備（憲法§1・§2）

雛形には ESLint も Jest も入っていない。`tech-stack.md` §3 が指定する構成を追加する（**新規の技術選定ではない**）。

| 対象 | 追加する開発依存 | 設定ファイル |
|---|---|---|
| frontend | `eslint`, `eslint-config-next`, `jest`, `@types/jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom` | `.eslintrc.json`（`next/core-web-vitals`）, `jest.config.js`（`next/jest`） |
| backend | `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `jest`, `@types/jest`, `ts-jest`, `supertest`, `@types/supertest` | `.eslintrc.json`（`@typescript-eslint` recommended）, `jest.config.js`（`ts-jest`） |

`frontend/package.json` `backend/package.json` の双方に `lint` / `test` スクリプトを追加する。
CI（`.github/workflows/quality-gate.yml`）は `working-directory` 単位で ESLint を実行する構成のため、両方に `lint` が必要（`tech-stack.md` §3 の注記）。

`coverageThreshold` でカバレッジ80%を強制する（憲法§2 / SC-008）。

---

## 4. 起動

```bash
docker compose up --build
```

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3000 |
| バックエンド | http://localhost:4000 |
| MySQL | localhost:3306 |

起動確認:

```bash
curl http://localhost:4000/health
```

`mysql/init/` の SQL は**データベースが空のときだけ**実行される。スキーマを変更したら作り直す:

```bash
docker compose down -v && docker compose up --build
```

> `-v` はボリューム（MySQL のデータ）を削除する。開発中の書籍・注文データが消える点に注意。

---

## 5. 品質ゲートの実行

```bash
cd backend && npm run lint && npm test -- --coverage
```

```bash
cd frontend && npm run lint && npm test -- --coverage
```

いずれも **Lint エラー0件**（憲法§1）・**カバレッジ80%以上**（憲法§2）が合格条件。

---

## 6. 受け入れ確認

実装後、[spec.md](./spec.md) の Success Criteria と requirements.md §8 を確認する。手順は `/speckit.testplan` で正式なテスト計画書に展開する。

### 主要導線（SC-001 / SC-002）

1. http://localhost:3000 で書籍がグリッド表示され、各カードに書影・タイトル・著者・価格がある
2. 書籍をクリックして詳細へ遷移し、説明文が表示される
3. 「カートに追加」を押すと**ヘッダーの件数が増える**（FR-007 / FR-032）
4. 一覧へ戻って別の書籍も追加できる
5. カート画面で書名・単価・数量・小計・合計が表示される
6. 数量を増減すると小計・合計が**画面遷移なしで**更新される
7. 「注文手続きへ」→ 注文フォームで、入力欄と注文内容・合計が**同一画面**にある
8. 未入力・メール形式不正で「注文する」を押すとエラーが出て、**遷移しない**
9. 正しく入力して「注文する」→ 注文完了画面に完了メッセージ・注文番号・一覧へ戻るリンクがある

### Clarification で決めた挙動の確認

| 確認項目 | 期待結果 | 対応 |
|---|---|---|
| 同じ書籍を2回「カートに追加」 | 行は増えず数量が2になる | FR-009 / SC-011 |
| カートに入れてブラウザを閉じ再訪 | カートの内容が復元される | FR-016 / SC-010 |
| 数量を0まで減らす | その書籍がカートから消え、合計が更新される | FR-011a |
| ヘッダーの件数 | 数量の合計（A×2 + B×3 なら 5） | FR-033 / SC-014 |
| 注文確定後にカートを開く | 0件（再訪しても0件） | FR-022a / SC-012 |
| 注文完了画面を再読込 | 注文番号が表示されず一覧へ誘導される | FR-029a / SC-013 |
| 注文完了画面のアドレス | 注文番号を含まない | FR-029b / SC-013 |
| 販売停止の書籍 | 一覧に出ない。詳細へ直接アクセスすると「見つかりません」 | FR-001a / FR-005a / SC-015 |
| 注文確定後に書籍の価格を変更 | 確定済み注文の金額が変わらない | FR-024 / SC-006 |

価格変更の確認例:

```bash
docker compose exec mysql mysql -u appuser -p appdb -e "UPDATE books SET price = 9999 WHERE id = 1;"
```

実行後、確定済みの `order_items.unit_price` が変わらないことを確認する。

---

## 7. 次のフェーズ

| 順序 | コマンド | 成果物 |
|---|---|---|
| 1 | `/speckit.design basic` / `detail` / `table` | 基本設計書・詳細設計書・テーブル定義書（HTML・憲法§7） |
| 2 | `/speckit.review` | 設計フェーズの承認記録（憲法§6） |
| 3 | `/speckit.tasks` | `tasks.md` |
| 4 | `/speckit.implement` | ソースコード |
| 5 | `/speckit.testplan` | テスト計画書 |
| 6 | `/speckit.analyze` | 実装と仕様の整合性確認 |
