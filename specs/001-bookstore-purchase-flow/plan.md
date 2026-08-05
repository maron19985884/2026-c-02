# Implementation Plan: 個人運営オンライン書店（購買フロー特化版）

**Branch**: `001-bookstore-purchase-flow` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-bookstore-purchase-flow/spec.md`

## Summary

購入希望者が書籍を一覧・詳細で閲覧し、カートに入れ、注文フォームで氏名・住所・メールアドレスを入力して注文を確定し、注文番号付きの完了画面を見る、という一連の購買フローを提供する。フロントエンドはReact + TypeScript / Next.js、バックエンドはNode.js + TypeScriptのREST API、永続化はSQLite（`docs/tech-stack-template.md` で確定済み）。ログイン・決済・在庫管理・検索等はスコープ外のため、書籍データは管理画面を持たずDB初期化時のシードデータとして投入し、カートはログイン機構がないためフロントエンドの画面状態として保持し、注文確定時にのみバックエンドへ送信して永続化する。

## Technical Context

**Language/Version**: TypeScript（フロントエンド・バックエンド共通）

**Primary Dependencies**:
- フロントエンド: React, Next.js
- バックエンド: Node.js, Express（REST APIルーティング）, better-sqlite3（SQLite同期ドライバ）

**Storage**: SQLite（ファイルDB。`docs/tech-stack-template.md` で確定済み）

**Testing**: フロントエンド・バックエンドともJest（フロントエンドはReact Testing Library併用）

**Target Platform**: Docker上のLinuxコンテナ（ローカル動作確認環境。`docker compose` でフロント・バックを起動）

**Project Type**: Web application（frontend + backend の構成。plan-templateのOption 2を採用）

**Performance Goals**: 主要画面・APIレスポンスは95パーセンタイルで1秒以内（憲法4章）

**Constraints**: 想定同時接続数10、単一インスタンス運用（憲法4章）。ログイン・決済・在庫管理・管理画面・レビュー・検索はスコープ外（ユーザー要件定義書3章）。

**Scale/Scope**: 画面5つ（商品一覧・商品詳細・カート・注文フォーム・注文完了）、機能要件22件（FR-001〜FR-022）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 憲法の原則 | 本feature計画での対応 | 判定 |
|---|---|---|
| 1. コード品質（Lintエラー0件） | フロント・バックそれぞれに`.eslintrc.json`を配置し、`.github/workflows/quality-gate.yml`の対象とする | PASS |
| 2. テスト基準（主要ビジネスロジックは単体テスト必須、カバレッジ80%以上） | カート計算・注文バリデーション・注文番号採番等の主要ロジックにJestで単体テストを作成（Phase 3のtasks.mdで明示） | PASS |
| 3. UX一貫性（CSS Modules+BEM、WCAG2.1 AA） | フロントエンドはCSS Modulesとし、フォーム要素にlabel紐付け等アクセシビリティ対応を行う | PASS |
| 4. パフォーマンス（p95 1秒以内、同時接続10、単一インスタンス） | 個人運営規模のシンプルな構成のため、追加のキャッシュ・水平スケール機構は導入しない | PASS |
| 5. 技術的意思決定（技術選定は`/speckit-plan`前に確定） | `docs/tech-stack-template.md` で確定済み。本plan.mdで技術を選び直していない | PASS |
| 7. 設計ルール（外部/詳細設計書・テーブル定義書はHTML） | `/speckit-plan`完了後、本plan.md・data-model.md・contracts/をもとに`specs/001-bookstore-purchase-flow/design/`配下へHTML設計書を別途作成する（Phase 2の後続プロンプト） | PASS（後続タスクとして計画済み） |

違反なし。Complexity Trackingへの記載は不要。

## Project Structure

### Documentation (this feature)

```text
specs/001-bookstore-purchase-flow/
├── plan.md              # 本ファイル
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── books-api.md
│   └── orders-api.md
├── design/              # Phase 2 後続プロンプトで作成するHTML設計書（外部/詳細/テーブル定義）
└── tasks.md              # Phase 2（/speckit-tasks）で作成
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/       # Book, Order, OrderItem の型・SQLiteアクセス
│   ├── services/     # カート計算・注文採番・バリデーション等のビジネスロジック
│   ├── api/           # Expressルーティング（/api/books, /api/orders）
│   └── db/            # SQLite接続・スキーマ初期化・シードデータ投入
├── tests/
│   └── unit/          # services層を中心とした単体テスト
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── pages/          # 商品一覧・商品詳細・カート・注文フォーム・注文完了の5画面
│   ├── components/     # 書籍カード、カート明細行、フォーム部品等
│   ├── contexts/       # カート状態（フロントエンド保持）
│   └── services/       # バックエンドAPIクライアント
├── tests/
│   └── unit/           # カート計算・フォームバリデーション等のコンポーネント/ロジックテスト
├── Dockerfile
└── package.json

docker-compose.yml   # backend + frontend をローカル起動する構成（リポジトリ直下）
```

**Structure Decision**: フロントエンドとバックエンドを分離するWebアプリケーション構成（Option 2）を採用。カートはログイン機構を持たないため、`frontend/src/contexts` の画面状態として保持し、注文確定（`POST /api/orders`）時にのみバックエンドへ送信して永続化する。書籍データは管理画面を持たないため、`backend/src/db` の初期化処理でシードデータとして投入する。

## Complexity Tracking

*Constitution Check に違反なしのため、記載事項なし。*
