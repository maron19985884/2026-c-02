# Spec Kit 雛形 利用指南書

> **対象読者**: この雛形を初めて触る開発者
> **目標**: この指南書だけを読んで、要件定義書と技術選定書の2つを書くだけで、実装とテストまで到達できること

---

## 目次

1. [この雛形は何か](#1-この雛形は何か)
2. [役割分担](#2-役割分担)
3. [初期セットアップ（プロジェクトリーダーが実施）](#3-初期セットアッププロジェクトリーダーが実施)
4. [開発フロー（要件定義〜リリース）](#4-開発フロー要件定義リリース)
   - 4-1. [要件定義書の書き方](#4-1-要件定義書の書き方)
   - 4-2. [技術選定書 兼 開発規約の書き方](#4-2-技術選定書-兼-開発規約の書き方)
   - 4-3. [開発の進め方](#4-3-開発の進め方)
   - 4-4. [テストの進め方](#4-4-テストの進め方)
   - 4-5. [承認の進め方（ウォーターフォールの場合）](#4-5-承認の進め方ウォーターフォールの場合)
   - 4-6. [要件が変わったとき](#4-6-要件が変わったとき)
   - 4-7. [設計書・テーブル定義書の作り方](#4-7-設計書テーブル定義書の作り方)
5. [困ったときは](#5-困ったときは)

---

## 1. この雛形は何か

**仕様駆動開発（Spec-Driven Development）の型を固定し、作業者が変わってもブレないようにする開発雛形です。**

AI（Claude Code）に「仕様→設計→タスク→実装」という順序を守らせることで、誰が担当しても同じ品質の成果物が出るようにします。
「何を作るか（要件）」と「何で作るか（技術）」だけ人間が決めれば、それ以降の仕様化・設計・実装・テスト計画・承認記録は AI が生成します。人間の仕事は生成物のレビューと承認です。

---

## 2. 役割分担

### 人間が作る2つのドキュメント

| ドキュメント | ファイル | タイミング | なぜ人間が作るか |
|---|---|---|---|
| 要件定義書 | `requirements.md` | `/speckit.specify` の前 | 「何を作るか」はビジネス判断。AI に委ねると意図がずれる |
| 技術選定書 | `tech-stack.md` | `/speckit.plan` の前 | 「何で作るか」はアーキテクチャ判断。不用意な依存混入を防ぐため AI 編集禁止 |

### AI が生成するもの

| ドキュメント | コマンド |
|---|---|
| 機能仕様書（spec.md） | `/speckit.specify` |
| 設計書（plan.md） | `/speckit.plan` |
| 基本設計書 | `/speckit.design basic` |
| 詳細設計書 | `/speckit.design detail` |
| テーブル定義書 | `/speckit.design table` |
| タスク一覧（tasks.md） | `/speckit.tasks` |
| ソースコード | `/speckit.implement` |
| テスト計画書 | `/speckit.testplan` |
| フェーズ承認記録 | `/speckit.review` |
| 変更要求書 | `/speckit.change [変更概要]` |

### 機械が自動判定するもの

| チェック | 仕組み | 結果 |
|---|---|---|
| Lint（構文・スタイル） | `.github/workflows/quality-gate.yml` | エラーがあれば GitHub PR のマージをブロック |
| 整合性分析 | `/speckit.analyze` | CRITICAL の指摘があれば `/speckit.implement` の前に解消 |

### 人間が行うこと

- **要件定義書・技術選定書の記入**（各フェーズ開始前）
- **各 AI 生成物のレビューと承認署名**（各フェーズ完了時 → 次フェーズ移行前）
  - 要件定義完了時: `spec.md` を確認し `/speckit.review` で承認記録に署名
  - 設計完了時: `plan.md`・各設計書を確認し `/speckit.review` で承認記録に署名
  - 実装計画完了時: `tasks.md` を確認し `/speckit.review` で承認記録に署名
  - テスト完了時: テスト結果を確認し `/speckit.review` で承認記録に署名
  - リリース時: デプロイ後に `/speckit.review` でリリース承認記録に署名
  - > 詳細な手順は §4-5「承認の進め方」を参照
- **Lint / テストが通ることの最終確認**（実装フェーズ完了時）

---

## 3. 初期セットアップ（プロジェクトリーダーが実施）

新規プロジェクトでこの雛形を使い始めるまでの手順です。開発メンバー全員ではなく、プロジェクトリーダーが最初に1回だけ行います。

### 手順

#### ① 雛形をコピーして Git リポジトリを作る

この雛形リポジトリをそのままコピー（テンプレートとして使用）し、新しい Git リポジトリを作成します。

```bash
# 例: GitHub の "Use this template" ボタンを使うか、手動でコピーする
git clone <この雛形のURL> <新プロジェクト名>
cd <新プロジェクト名>
git remote set-url origin <新リポジトリのURL>
```

`_meta/` フォルダはこの雛形自身の開発履歴（AI評価・変更ログ等）であり、新規プロジェクトには不要です。コピー後に削除してください。

```bash
# 雛形固有の開発履歴を削除（新規プロジェクトには不要）
rm -rf _meta/
```

> **補足**: 削除せず参照用に残しておくことも可能ですが、その場合は `_meta/README.md` に記載されているとおり、プロジェクト固有のメタ情報と混在しないよう注意してください。

#### ② 憲法を確認する

`.specify/memory/constitution.md` を開き、内容を確認してください。
**憲法は組織で一度確定させたものをそのまま使います。案件ごとに書き直さないでください。**

プロジェクト固有の例外ルール（特定ライブラリの禁止など）が必要な場合のみ、`.specify/templates/overrides/` に追加します（詳細は `docs/guides/lint-preset-guide.md` 参照）。

> **完了条件**: `.specify/memory/constitution.md` が存在し、内容を読んで意味を理解できること。

#### ③ `tech-stack.md` の命名規則・禁止事項を記入する

`tech-stack.md` を開き、技術スタックが確定したら以下のセクションをプロジェクトに合わせて記入します。
（`CLAUDE.md` への直接記入は不要です。`CLAUDE.md` は `@tech-stack.md` でこの内容を自動的に読み込みます）

```markdown
## 7. 命名規則
| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名（UIコンポーネント等） | PascalCase | BookCard.tsx |
| 変数・関数名 | camelCase | fetchBooks() |
```

```markdown
## 9. スコープ外機能（実装禁止）
- ログイン・会員管理
- 決済処理
（requirements.md の「対象外（Out of Scope）」セクションを転記する）
```

> **完了条件**: `tech-stack.md` の §7 命名規則と §9 スコープ外機能が記入済みであること。

#### ④ GitHub の直プッシュを禁止する

`.github/workflows/quality-gate.yml` はすでに配置済みです。
直プッシュを禁止することで、Lint が失敗したコードを `main` / `develop` に混入させないようにします。

**設定手順（GitHub リポジトリの画面で行う）：**
1. リポジトリの **Settings** → **Branches** を開く
2. **Add rule**（または Add branch ruleset）をクリック
3. Branch name pattern に `main` と入力
4. 以下にチェックを入れる：
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging → `quality-gate` を追加
   - ✅ Do not allow bypassing the above settings
5. Save changes で保存（`develop` も同様に追加）

> **完了条件**: GitHub Actions の quality-gate ワークフローが "Actions" タブで確認でき、Branch protection rules が設定されていること。

---

## 4. 開発フロー（要件定義〜リリース）

プロジェクトリーダーによる初期セットアップ（§3）完了後、開発者が実施する作業フローです。

---

## 4-1. 要件定義書の書き方

### どのファイルに何を書くか

`requirements.md` 1ファイルに、機能要件・非機能要件・制約条件をまとめて記入します。

> **ユーザー視点の要件（「ユーザーが何をしたいか」）は `/speckit.specify` が `spec.md` の User Scenarios セクションとして自動生成します。** 人間が別ファイルに書く必要はありません。

### 記入の手順

1. ルートに `requirements.md` がまだ無い場合は、`docs/inputs/requirements-template.md` をコピーしてルート直下に `requirements.md` として配置する（この雛形をそのまま新規プロジェクトとして使い始めた場合は配置済み）
2. `requirements.md` を直接開いて記入する（`docs/inputs/requirements-template.md` 本体は次の案件用のコピー元なので編集しない）
3. 記入例（`docs/inputs/requirements-example.md`）を参照しながら埋める
4. `/speckit.specify` を実行して `spec.md` を生成する（→ §4-3）

### 良い例と悪い例

#### 機能要件の書き方

**❌ 悪い例（曖昧で AI が仕様化できない）**

```
| REQ-001 | 一覧 | 表示 | 商品を表示する | 高 |
```

問題: 「どの商品を」「何を表示するか」「どんな形式か」が一切わからない。
AI は推測で埋めてしまい、意図と異なる spec.md が出てくる。

**✅ 良い例（具体的で AI が仕様化できる）**

```
| REQ-001 | 商品一覧 | 書籍一覧表示 | グリッド形式で販売中の書籍を表示する | 高 |
| REQ-002 | 商品一覧 | 書籍基本情報表示 | 書影・タイトル・著者・価格を一覧上で表示する | 高 |
```

ポイント:
- 「何を（書籍）」「どこで（商品一覧）」「どんな形式で（グリッド形式）」が明確
- 要件が1文1機能に分かれている
- 優先度が明記されている

#### 非機能要件の書き方

**❌ 悪い例**

```
| 性能 | 速くする |
```

**✅ 良い例**

```
| 性能 | 主要画面のレスポンスタイムを 95%ile で 2 秒以内とする |
| セキュリティ | 認証情報を .env で管理し、コードへの直書きを禁止 |
```

#### 対象外（Out of Scope）は必ず書く

「やらないこと」を明記しないと、AI が勝手に機能を追加することがあります。

```
### 対象外（Out of Scope）
- ログイン・会員管理
- 決済処理
- 在庫管理
```

### 記入例の参照先

→ [`docs/inputs/requirements-example.md`](inputs/requirements-example.md)（オンライン書店のサンプル）

### 完了条件

`requirements.md` の全セクション（背景・スコープ・機能要件・非機能要件・制約）が記入済みで、「対象外」に何が含まれないかが明記されていること。

---

## 4-2. 技術選定書 兼 開発規約の書き方

### ファイルの場所

`tech-stack.md`（リポジトリのルート直下。空の雛形は `docs/inputs/tech-stack-template.md`）

### ⚠️ 重要ルール：AI は編集禁止

**技術選定書 兼 開発規約への記入・変更は人間のみが実施します。AI（Claude Code）は参照のみで、内容を追加・変更・削除してはなりません。**

理由: 不用意なライブラリや依存関係の混入を防ぐためです。使用技術・ライブラリの選定は必ず担当者が判断して記入してください（憲法 §5）。

### 記入の手順

1. ルートに `tech-stack.md` がまだ無い場合は、`docs/inputs/tech-stack-template.md` をコピーしてルート直下に `tech-stack.md` として配置する（この雛形をそのまま新規プロジェクトとして使い始めた場合は配置済み）
2. `tech-stack.md` を直接開いて記入する（`docs/inputs/tech-stack-template.md` 本体は次の案件用のコピー元なので編集しない）
3. 「全体構成」「使用技術スタック」「Lint・品質ツール」の各セクションを埋める
4. 記入が完了したら `/speckit.plan` を実行する（→ §4-3）

### 良い例と悪い例

#### 使用技術スタックの書き方

**❌ 悪い例（空欄 / 記入が足りない）**

```
| フロントエンド | React | | |
```

問題: バージョンと選定理由がない。AI が依存ライブラリを選ぶとき、どのバージョン体系で選べばよいかわからない。

**✅ 良い例**

```
| フロントエンド | React + TypeScript | React 18.3 / TS 5.4 | 既存チームのスキルセット。TypeScript で型安全性を確保 |
| バックエンド | Node.js + Express | Node 20 LTS / Express 4 | 軽量な REST API サーバーとして十分。フロントと言語統一 |
| データベース | PostgreSQL | 16 | トランザクション整合性が必要。Docker 公式イメージが安定 |
```

#### 却下した選択肢（任意だが推奨）

なぜその技術を選んだかと同等に、「なぜ別の選択肢を選ばなかったか」を書くと AI の推測ミスが防げます。

```
| NestJS | チームに学習コストが高すぎるため見送り |
| MongoDB | トランザクション要件があるため非選択 |
```

### 「AI は編集禁止」の具体的な意味

Claude Code がチャット内で「この依存を追加します」「バージョンを変更します」と言っても、`tech-stack.md` への書き込みを指示してはいけません。
技術スタックを変更したい場合は、担当者がファイルを直接編集してから、再度 `/speckit.plan` を実行してください。

### 記入例の参照先

→ [`docs/inputs/tech-stack-example.md`](inputs/tech-stack-example.md)（オンライン書店のサンプル。`requirements-example.md`と同じ案件の技術選定書）

### 完了条件

`tech-stack.md` の「使用技術スタック」テーブルが全レイヤー記入済みで、「Lint・品質ツール」セクションも埋まっていること。

---

## 4-3. 開発の進め方

コマンドの全体フロー:

```
/speckit.specify → /speckit.clarify → /speckit.plan → /speckit.tasks → /speckit.implement → /speckit.analyze
```

---

### コマンド①: `/speckit.specify`

**何をするか**: `requirements.md` をもとに機能仕様書（`spec.md`）を生成する。ユーザー視点の要件（User Scenarios）は AI が自動生成する。

**実行方法**:
```
/speckit.specify <フィーチャーの説明>
```

例:
```
/speckit.specify オンライン書店の購買フロー（書籍一覧→詳細→カート→注文完了）
```

**何が出てくるか**: `specs/001-[feature-name]/spec.md` が作成される。中身はユーザーストーリー・受け入れシナリオ・機能要件・成功基準。

**人間は何を確認するか**:
- ユーザーストーリーが要件定義書の意図と合っているか
- 受け入れシナリオ（Given/When/Then）が実際にテストできる内容か
- `[NEEDS CLARIFICATION]` マーカーがあれば、質問に答えて明確にする

**完了条件**: `spec.md` が生成され、`[NEEDS CLARIFICATION]` が残っていないこと。

---

### コマンド②: `/speckit.clarify`

**何をするか**: `spec.md` の曖昧な部分を最大5問のQ&A形式で明確化する。

**実行方法**:
```
/speckit.clarify
```

**何が出てくるか**: AIが質問を1つずつ提示する。各質問に選択肢形式または短答で答えると、回答が `spec.md` に書き込まれる。

**人間は何をするか**: 各質問に回答する。不明な点があれば「わからない」と答えてもよい（AI が推奨オプションを示す）。

**完了条件**: 全質問に回答し、`spec.md` の `## Clarifications` セクションに記録されていること。または「No critical ambiguities detected」と表示されること。

> ⚠️ このステップを省くと `/speckit.plan` 以降で手戻りが増えます。スキップする場合は確認メッセージが出ます。

---

### コマンド③: `/speckit.plan`

**何をするか**: `spec.md` と `tech-stack.md` をもとに設計書（`plan.md`）・データモデル（`data-model.md`）・API仕様（`contracts/`）を生成する。

**事前確認**: `tech-stack.md` が記入済みであること（未記入だと `NEEDS CLARIFICATION` になる）。

**実行方法**:
```
/speckit.plan
```

**何が出てくるか**:
- `specs/[###]/plan.md` — アーキテクチャ・技術コンテキスト
- `specs/[###]/data-model.md` — エンティティ定義・フィールド
- `specs/[###]/contracts/` — REST APIエンドポイント・スキーマ
- `specs/[###]/research.md` — 技術選択の根拠（Phase 0）
- `specs/[###]/quickstart.md` — 開発環境のセットアップ手順

**人間は何を確認するか**:
- `plan.md` の `Constitution Check` セクションが PASS しているか（ERROR があれば解消が必要）
- `data-model.md` のエンティティ構造が要件と合っているか
- `contracts/` のAPIパスとリクエスト/レスポンス形式が妥当か

**完了条件**: `plan.md`・`data-model.md`・`contracts/` が生成され、Constitution Check にエラーがないこと。

---

### コマンド④: `/speckit.tasks`

**何をするか**: `spec.md`・`plan.md`・`data-model.md` をもとに実装タスク一覧（`tasks.md`）を生成する。

**実行方法**:
```
/speckit.tasks
```

**何が出てくるか**: `specs/[###]/tasks.md` — フェーズ別・ユーザーストーリー別のタスク一覧。各タスクは `- [ ] T001 [P] [US1] ファイルパス付きの作業内容` 形式。

**人間は何を確認するか**:
- タスクの粒度（1タスク = 1〜2ファイル程度が目安）が適切か
- 複数人開発の場合、タスクを人単位に再編成する（`tasks.md` はPMが編集してよい）
- 見落としているタスクがないか

**完了条件**: `tasks.md` のフェーズ構成（Phase 1 Setup → Phase 2 基盤 → Phase N ユーザーストーリー）が揃っていること。

---

### コマンド⑤: `/speckit.analyze`（任意・推奨）

**何をするか**: `spec.md`・`plan.md`・`tasks.md` の3ファイル間の整合性を分析し、矛盾・漏れ・曖昧さを報告する。**ファイルは一切変更しない**（読み取り専用の分析のみ）。

**実行方法**:
```
/speckit.analyze
```

**何が出てくるか**: 分析レポート（チャット内に出力）。CRITICAL / HIGH / MEDIUM / LOW の重大度別に指摘が表示される。

**人間は何をするか**:
- CRITICAL・HIGH の指摘を解消してから次へ進む
- MEDIUM 以下は `/speckit.implement` と並行して対応可

**完了条件**: CRITICAL・HIGH の指摘事項がすべて解消されていること。

---

### コマンド⑥: `/speckit.implement`

**何をするか**: `tasks.md` を読み、フェーズ順にソースコードを生成する。

**実行方法**:
```
/speckit.implement
```

**何が出てくるか**: `tasks.md` の各タスクに対応するソースコードが生成される。完了したタスクは `[x]` にマークされる。

**人間は何を確認するか**:
- チェックリストが残っている場合は「続行するか」確認が出る → 確認してから続行
- 実装が進んだらコードレビューを行う
- `tasks.md` の `[x]` マークを確認し、全タスクが完了しているか確認する

**完了条件**: `tasks.md` の全タスクが `[x]` になり、Lint が通ること（次ステップ参照）。

---

### Lint チェック（自動）

**タイミング**: GitHub に変更を Push するか、PR を作成した時点で自動実行される。

**何が行われるか**: `.github/workflows/quality-gate.yml` が発火し、言語に応じた Lint（ESLint / Ruff 等）が走る。

**人間は何を確認するか**:
- GitHub Actions の画面でワークフローが green か確認する
- Red（失敗）の場合は Lint エラーを修正してから再 Push する

**完了条件**: `quality-gate` ワークフローが green になること。

---

## 4-4. テストの進め方

### 全体の流れ

```
/speckit.implement 完了
       ↓
/speckit.testplan  ← AI がテスト計画書を生成
       ↓
人間がレビュー・承認
       ↓
テスト実施（単体 / 結合 / 受け入れ）
       ↓
テスト結果を記録（git commit）
       ↓
/speckit.review    ← AI がテストフェーズ承認記録を生成
       ↓
人間が内容確認・署名
```

---

### テスト計画書の生成

**実行方法**:
```
/speckit.testplan
```

**何が出てくるか**: `specs/[###]/test-plan.md` が生成される。内容は `spec.md` の受け入れシナリオをもとに AI が作成したテストケース一覧・合否判定基準・テスト環境情報。

**人間は何を確認するか**:
- テストケースが `spec.md` の受け入れシナリオをカバーしているか
- テストフレームワークが `tech-stack.md` の記載と一致しているか
- `<!-- 要確認: -->` マーカーが残っていれば、該当箇所を補記してから承認する
- 承認したら `test-plan.md` の「承認」セクションに署名を記入する

**完了条件**: `test-plan.md` が承認済みで、承認欄に署名と日付が入っていること。

---

### テストの実施

テスト計画書に従ってテストを実施します。

**単体テスト（自動）**: `tasks.md` に含まれるテストタスクとして `/speckit.implement` が実装済みのはずです。以下で実行できます:

```bash
# Node.js / TypeScript の場合
npm test

# Python の場合
pytest

# Java (Maven) の場合
mvn test
```

テスト実行をCIで自動化する場合は `.github/workflows/quality-gate.yml` にテストステップを追加します（詳細は `docs/guides/testing-strategy-guide.md` 参照）。

**テスト結果の記録**: テスト結果ファイル（例: `test-results/report.md` や `coverage/`）を Git にコミットして証跡として残します。

**完了条件**: 憲法 §2 で定義したカバレッジ目標（未定義の場合は 80%）を達成し、全テストがパスしていること。

---

## 4-5. 承認の進め方（ウォーターフォールの場合）

### フェーズゲート承認記録の生成

各フェーズの完了時に AI がフェーズゲート承認記録を生成します。

**実行方法**:
```
/speckit.review
```

または、フェーズを明示して実行:
```
/speckit.review 要件定義
/speckit.review 設計
/speckit.review テスト
```

**何が出てくるか**: `docs/reviews/[phase-name]-[YYYY-MM-DD].md` が生成される。チェックリスト（成果物の存在確認）が自動で `[x]` / `[ ]` になっている。

**人間は何をするか**:
1. チェックリストで `[ ]` になっている項目を確認し、漏れを修正する
2. 「承認判定」を記入する（✅ 承認 / ⚠️ 条件付き承認 / ❌ 差し戻し）
3. 「承認署名」に氏名と日付を記入する
4. ファイルを Git にコミットして証跡として保管する

**保管場所**: `docs/reviews/` ディレクトリに蓄積していく。

**完了条件**: 対象フェーズのチェックリストが全項目完了し、PM / プロジェクトリーダーの署名が入っていること。

### ウォーターフォールの完全なフロー

```
要件定義フェーズ
  人間: requirements.md 記入
  AI:   /speckit.specify → spec.md
  AI:   /speckit.clarify → spec.md 更新
  AI:   /speckit.review → docs/reviews/phase1-*.md
  人間: 内容確認・承認署名
  ─────────────────────── フェーズゲート ──────────

設計フェーズ
  人間: tech-stack.md 記入
  AI:   /speckit.plan → plan.md, data-model.md, contracts/
  AI:   /speckit.design basic → basic-design.md
  AI:   /speckit.design detail → detailed-design.md
  AI:   /speckit.design table → table-definition.md
  AI:   /speckit.review → docs/reviews/phase2-*.md
  人間: 設計書確認・承認署名
  ─────────────────────── フェーズゲート ──────────

実装計画フェーズ
  AI:   /speckit.tasks → tasks.md
  AI:   /speckit.analyze → 整合性確認
  AI:   /speckit.review → docs/reviews/phase3-*.md
  人間: タスク一覧確認・承認署名
  ─────────────────────── フェーズゲート ──────────

実装フェーズ
  AI:   /speckit.implement → ソースコード
  機械: quality-gate.yml → Lint チェック
  人間: コードレビュー
  ─────────────────────── フェーズゲート ──────────

テストフェーズ
  AI:   /speckit.testplan → test-plan.md
  人間: テスト計画承認
  人間: テスト実施・結果記録
  AI:   /speckit.review → docs/reviews/phase5-*.md
  人間: テスト結果確認・承認署名
  ─────────────────────── フェーズゲート ──────────

リリースフェーズ
  人間: デプロイ実施
  AI:   /speckit.review → docs/reviews/phase6-*.md
  人間: リリース承認署名
```

---

## 4-6. 要件が変わったとき

フェーズが確定した後に要件・設計・スコープの変更が発生した場合は、**必ず変更要求書（Change Request）を通じて管理します**。
変更要求書の承認なしに `spec.md`・`plan.md`・`tasks.md` を直接修正してはいけません。

### 変更要求書の生成

**実行方法**:
```
/speckit.change [変更の概要]
```

例:
```
/speckit.change 商品検索機能を要件に追加したい
/speckit.change ログイン機能はスコープ外に変更する
```

**何が出てくるか**: `docs/changes/CR-[連番]-[概要].md` が生成される。変更前後の比較・影響分析（スコープ・工数・技術・リスク）が自動で入る。

**人間は何をするか**:
1. 生成された変更要求書を確認する
2. 工数見積もり（`<!-- 参考値: -->` マーカー付き）を担当者が補正する
3. 「対応方針」のチェックボックスを選択する
4. 承認を得たら、関連する `spec.md`・`plan.md`・`tasks.md` を AI に更新させる

**完了条件**: 変更要求書が `docs/changes/` に保管され、承認欄に署名が入っていること。

> ⚠️ **技術選定書（`tech-stack.md`）への変更は人間のみが実施します**（AI は変更しません）。技術変更が必要な場合は、変更要求書を承認してから担当者が `tech-stack.md` を直接編集し、その後 `/speckit.plan` を再実行してください。

---

## 4-7. 設計書・テーブル定義書の作り方

### 根拠

憲法 §7 に以下が定められています:

- 基本設計書: HTMLベース・UML準拠で作成
- 詳細設計書: HTMLベースでパラメータ・修正対象ファイル・処理概要・In/Out詳細をまとめて作成
- テーブル定義書: HTMLベースで作成

### コマンド: `/speckit.design`

**誰が作るか**: AI（`/speckit.design` コマンド）
**いつ作るか**: `/speckit.plan` が完了した後（設計フェーズ）
**承認**: 人間がレビューして承認

#### 基本設計書の生成

```
/speckit.design basic
```

**入力**: `spec.md`・`plan.md`・`data-model.md`・`contracts/`
**出力**: `specs/[###]/basic-design.md`（アーキテクチャ概要・画面設計・API概要・ER図 をHTMLベースのSVGで生成）

#### 詳細設計書の生成

```
/speckit.design detail
```

**入力**: `plan.md`・`tasks.md`・`spec.md`・`contracts/`・`data-model.md`
**出力**: `specs/[###]/detailed-design.md`（修正対象ファイル・シーケンス図・パラメータ定義・エラー処理をHTMLベースのSVGで生成）

#### テーブル定義書の生成

```
/speckit.design table
```

**入力**: `data-model.md`・`plan.md`
**出力**: `specs/[###]/table-definition.md`（カラム定義・インデックス・制約・ER図・DDL参考をHTMLベースで生成）

> ⚠️ テーブル定義書の DDL は「参考情報」です。本番適用はマイグレーションスクリプトを使用してください。`DROP` / `TRUNCATE` 等の破壊的DDLは生成されません（憲法 §1）。

### 生成後の確認ポイント

- `<!-- 要確認: -->` マーカーが残っていないか確認する
- HTMLベースの図（SVG）が意図した通りに表示されるかブラウザで確認する
- テーブル定義書は DB 担当者が内容をレビューしてから承認する

**完了条件**: 3つの設計書が生成され、アーキテクト / テックリード の承認署名が入っていること。

---

## 5. 困ったときは

### Q. `/speckit.specify` を実行したら、`No feature description provided` というエラーが出た

**A.** コマンドのあとにフィーチャーの説明を付けてください。

```
✅ /speckit.specify 注文管理機能の追加
❌ /speckit.specify
```

---

### Q. `/speckit.plan` を実行したら `NEEDS CLARIFICATION` が大量に出た

**A.** `tech-stack.md` の記入が不足しています。特に「使用技術スタック」テーブルを全レイヤー埋めてください。

---

### Q. `/speckit.plan` を実行したら `Constitution Check: ERROR` が出た

**A.** 生成された `plan.md` の `Constitution Check` セクションを確認し、どの憲法原則と矛盾しているかを確認してください。
技術選定書の記述が憲法と食い違っている場合は、`tech-stack.md` を修正（人間が記入）してから再実行します。

---

### Q. Lint が GitHub Actions で Red になる

**A.** ローカルで以下を実行して Lint エラーを修正してから Push してください:

```bash
# Node.js / TypeScript の場合
npm run lint

# Python の場合
ruff check .
```

Lint ルールを変更したい場合は `docs/guides/lint-preset-guide.md` を参照してください。

---

### Q. `spec.md` を直接編集してよいか？

**A.** `/speckit.specify` や `/speckit.clarify` で更新するのが原則です。ただし、フェーズ確定前であれば細かい修正は直接編集しても問題ありません。
フェーズ確定後に変更が必要な場合は、`/speckit.change` で変更要求書を通じて管理してください（§4-6 参照）。

---

### Q. テスト計画書を AI に生成させたが、テストケースが足りない

**A.** `spec.md` の受け入れシナリオ（Acceptance Scenarios）が少ないことが原因です。
`spec.md` を更新して受け入れシナリオを追加してから、`/speckit.testplan` を再実行してください。

---

### Q. 憲法（constitution.md）を変更してよいか？

**A.** 憲法は「組織で一度確定させた取り決め」です。案件個別の事情でむやみに変更しないでください。
プロジェクト固有のルールが必要な場合は `.specify/templates/overrides/` に上書きルールを追加します（`docs/guides/lint-preset-guide.md` 参照）。

---

### Q. 既存システムに改修を加える場合はどうするか？

**A.** `docs/guides/brownfield-guide.md` を参照してください。システム全体を仕様化せず、**改修範囲だけ**を対象に `/speckit.specify` を実行します。改修用のテンプレートは `.specify/templates/change-spec-template.md` です。

---

### Q. 「要確認」コメントが生成物に残っている

**A.** `<!-- 要確認: [理由] -->` は AI が情報不足で推測できなかった箇所です。該当箇所を確認し、人間が正しい内容を補記してください。

---

## 関連ドキュメント一覧

| ドキュメント | 内容 |
|---|---|
| `docs/overview.md` | 雛形のサマリー（1ページ概要） |
| `docs/inputs/requirements-template.md` | 要件定義書の空欄テンプレート |
| `docs/inputs/requirements-example.md` | 要件定義書の記入例（オンライン書店） |
| `tech-stack.md` | 技術選定書本体（**人間が記入**。空の雛形は `docs/inputs/tech-stack-template.md`） |
| `docs/inputs/tech-stack-example.md` | 技術選定書の記入例（オンライン書店。requirements-exampleと同一案件） |
| `docs/guides/waterfall-preset-guide.md` | ウォーターフォール運用ガイド・DoD定義 |
| `docs/guides/brownfield-guide.md` | 既存システム改修ガイド |
| `docs/guides/testing-strategy-guide.md` | テスト戦略ガイド（Javaフレームワーク選定含む） |
| `docs/guides/lint-preset-guide.md` | Lint のpreset化手順 |
| `.specify/templates/change-spec-template.md` | 改修用の狭いspecテンプレート |
| `.specify/memory/constitution.md` | 憲法（組織共通ルール） |
| `.github/workflows/quality-gate.yml` | Lint 自動チェックCI |
