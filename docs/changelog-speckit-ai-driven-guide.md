# 変更ログ：Spec Kit 雛形 AI駆動開発対応

> **ブランチ**: `feature/h1nakamu_speckit`
> **作業日**: 2026-07-13
> **目的**: 「人間が作るのは要件定義書と技術選定書の2つだけ」という方針に雛形全体を統一し、利用指南書を新規作成する

---

## 変更サマリー

| 区分 | ファイル数 |
|---|---|
| 新規作成 | 9ファイル |
| 既存修正 | 6ファイル |

---

## 新規作成ファイル

### `docs/how-to-use.md`（利用指南書）

- この雛形を初めて触る開発者向けの利用指南書を新規作成
- 章立て: ①この雛形は何か ②役割分担 ③準備 ④要件定義書の書き方（良い例・悪い例あり） ⑤技術選定書の書き方 ⑥開発の進め方（全コマンドを1つずつ解説） ⑦テストの進め方 ⑧承認の進め方 ⑨要件変更時の対応 ⑩設計書の作り方 ⑪FAQ
- 各手順に「完了条件」を1行記載（人による判断ブレを防ぐ）

### `docs/requirements-example.md`（要件定義書 記入例）

- `requirements.md` / `user_requirements.md` から退避したオンライン書店サンプルの置き場所
- 参照専用。AI・人間を問わず編集不要
- `docs/how-to-use.md` §4「要件定義書の書き方」からリンクで参照

### `docs/basic-design-template.md`（基本設計書テンプレート）

- 憲法§7「HTMLベースでUMLに準拠した基本設計書」の生成元テンプレート
- `/speckit.design basic` コマンドが使用
- 生成物の構成: メタ情報・システム概要・アーキテクチャ概要（SVG）・機能一覧・画面設計・API設計概要・データ概念モデル・非機能設計方針・承認欄

### `docs/detailed-design-template.md`（詳細設計書テンプレート）

- 憲法§7「HTMLベースでパラメータ・修正対象ファイル・処理概要・In/Out詳細」の生成元テンプレート
- `/speckit.design detail` コマンドが使用
- 生成物の構成: 修正対象ファイル一覧・モジュール詳細（シーケンス図・パラメータ定義・エラー処理）・API詳細仕様・DB操作詳細・承認欄

### `docs/table-definition-template.md`（テーブル定義書テンプレート）

- 憲法§7「HTMLベースのテーブル定義書」の生成元テンプレート
- `/speckit.design table` コマンドが使用
- 生成物の構成: テーブル一覧・カラム定義・インデックス・制約・ER図（HTML+SVG）・DDL参考・承認欄

### `.claude/commands/speckit.design.md`（設計書生成コマンド）

- `basic` / `detail` / `table` の3種類をルーティングする統合コマンド
- 使用方法: `/speckit.design basic`、`/speckit.design detail`、`/speckit.design table`
- 出力先: `specs/[###]/basic-design.md`、`specs/[###]/detailed-design.md`、`specs/[###]/table-definition.md`
- 全図版（コンポーネント図・ER図・シーケンス図）はHTML+SVGで出力（憲法§7準拠）

### `.claude/commands/speckit.testplan.md`（テスト計画書生成コマンド）

- `/speckit.implement` 完了後に `spec.md` の受け入れシナリオからテスト計画書を自動生成
- 出力先: `specs/[###]/test-plan.md`
- 人間の役割: 内容確認・承認署名のみ（記入は不要）

### `.claude/commands/speckit.review.md`（フェーズゲート承認記録生成コマンド）

- 各フェーズ完了時に成果物の存在を確認し、チェックリスト済みの承認記録を自動生成
- 使用方法: `/speckit.review` または `/speckit.review 設計`（フェーズ名を引数に指定可）
- 出力先: `docs/reviews/[phase-slug]-[YYYY-MM-DD].md`
- 人間の役割: チェックリスト確認・承認署名のみ

### `.claude/commands/speckit.change.md`（変更要求書生成コマンド）

- フェーズ確定後の変更発生時に影響分析付きの変更要求書を自動生成
- 使用方法: `/speckit.change 検索機能を追加したい`
- 出力先: `docs/changes/CR-[NNN]-[概要].md`（連番を自動採番）
- 人間の役割: 影響分析の確認・対応方針の決定・承認署名

---

## 既存ファイルの修正

### `requirements.md`（修正）

**変更前の問題**: オンライン書店のサンプル内容（REQ-001〜REQ-018、書籍・カート・注文完了の要件）が入ったまま。新規案件の要件定義書として使えない。

**変更内容**:
- サンプル内容を全削除し、プレースホルダー（記入例へのリンク付き）に置き換え
- 参照先リンクを追加: `docs/requirements-template.md`、`docs/requirements-example.md`、`docs/how-to-use.md`
- `セクション8: 受け入れ基準`を追加（`/speckit.specify` との連携を明示）

### `user_requirements.md`（修正）

**変更前の問題**: `requirements.md` と同様、書店サンプルのU-01〜U-18が入ったまま。

**変更内容**:
- サンプル内容を全削除し、プレースホルダーに置き換え
- `requirements.md` との役割分担（システム要件 vs ユーザー要件）をヘッダーに明記
- 記入例へのリンクを追加

### `docs/test-plan-template.md`（修正）

**変更前の問題**: 「人間が記入する入力ドキュメント」という位置づけだった。方針（AI生成＋人間承認）と矛盾。

**変更内容**（ヘッダーのみ修正、テンプレート本体は変更なし）:
```diff
- > `/speckit.implement` 完了後、テストフェーズ開始前に人間が記入する入力ドキュメントです。
+ > `/speckit.implement` 完了後、テストフェーズ開始前に `/speckit.testplan` が本テンプレートをもとにテスト計画書を生成します。
+ > 人間はその出力をレビューし、承認を得てからテストを開始します。
```

### `docs/review-gate-template.md`（修正）

**変更前の問題**: 「フェーズ完了のたびに本ファイルをコピーして人間が記入する」という位置づけだった。

**変更内容**（ヘッダーのみ修正）:
```diff
- > ウォーターフォール各フェーズの完了時に記入・保管するドキュメントです。
+ > ウォーターフォール各フェーズの完了時に `/speckit.review` が本テンプレートをもとに承認記録を生成します。
+ > 人間はその出力をレビューし、承認署名を記入してから次フェーズへ進みます。
```

### `docs/change-request-template.md`（修正）

**変更前の問題**: 「変更発生のたびに本ファイルをコピーして人間が記入する」という位置づけだった。

**変更内容**（ヘッダーのみ修正）:
```diff
- > フェーズ確定後に要件・設計・スコープの変更が発生した場合に起票するドキュメントです。
+ > フェーズ確定後に要件・設計・スコープの変更が発生した場合に `/speckit.change` が本テンプレートをもとに変更要求書を生成します。
+ > 人間はその出力をレビューし、承認を得てから変更を適用します。
```

### `docs/waterfall-preset-guide.md`（修正）

**変更内容1 — フェーズ対応表の更新**:

各フェーズのコマンド列に新規コマンドを追加:

| フェーズ | 追加されたコマンド |
|---|---|
| 基本設計・詳細設計 | `/speckit.design basic`、`/speckit.design detail`、`/speckit.design table`、`/speckit.review` |
| 要件定義 / 実装計画 | `/speckit.review` |
| テスト | `/speckit.testplan`（人間記入から AI 生成に変更）、`/speckit.review` |
| リリース | `/speckit.review` |

**変更内容2 — ドキュメント一覧の更新**:

「誰が作るか」列を整理し、AI生成ドキュメントを明確化:

```diff
- | `docs/test-plan-template.md`    | 人間            | テスト     |
- | `docs/review-gate-template.md`  | 人間（フェーズごと） | 全フェーズ |
- | `docs/change-request-template.md` | 人間（変更発生時） | 全フェーズ |
+ | `specs/[###]/basic-design.md`     | AI | `/speckit.design basic`  | 設計     |
+ | `specs/[###]/detailed-design.md`  | AI | `/speckit.design detail` | 設計     |
+ | `specs/[###]/table-definition.md` | AI | `/speckit.design table`  | 設計     |
+ | `specs/[###]/test-plan.md`        | AI | `/speckit.testplan`      | テスト   |
+ | `docs/reviews/phase[N]-*.md`      | AI（署名は人間） | `/speckit.review`  | 全フェーズ |
+ | `docs/changes/CR-[NNN]-*.md`      | AI（承認は人間） | `/speckit.change`  | 全フェーズ |
```

---

## 修正しなかった箇所と理由

| ファイル | 理由 |
|---|---|
| `docs/tech-stack-template.md` | 矛盾②の方針通り「ファイルは触らず、運用ルールで解決」。指南書§5に「AI編集禁止」と「案件開始時に必ずこのファイルへ記入すること」を明記した |
| `.specify/memory/constitution.md` | 組織で確定済みの憲法。案件ごとに変更しない運用のため対象外 |
| `CLAUDE.md` | 雛形の振る舞い定義ファイル。コマンド参照先の追記は不要（自動で `.claude/commands/` を読み込む） |
| `docs/waterfall-preset-guide.md` の DoD セクション | 新規コマンドは追加したが、各フェーズの DoD（完了定義）自体の変更は今回の作業範囲外のため変更なし |
