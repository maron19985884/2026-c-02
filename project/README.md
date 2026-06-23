# チーム開発 Claude標準テンプレート(GitHub Spec Kit連携版)

## このテンプレートの目的

複数人で同じシステムを開発するとき、各自のClaude Code出力のバラツキを抑えるための共通設定。
GitHub Spec Kit を導入することで、設計・開発・テストの各フェーズを
「仕様 → 計画 → タスク → 実装」のSpec-Driven Developmentフローに統一し、
**全社共通ルール(`.specify/memory/constitution.md`)を最上位の制約として常に適用する。**

---

## 導入手順

### 0. (初回のみ)GitHub Spec Kitのインストール

```bash
# uv のインストールが前提
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

### リーダーが行う作業(初回のみ)

1. このテンプレートをプロジェクトリポジトリにコピーする
2. プロジェクトルートで Spec Kit を初期化する
   ```bash
   specify init --here --integration claude
   ```
   (`.specify/templates/` `.specify/scripts/` 等が自動生成される。
   既存の `.specify/memory/constitution.md` は本テンプレートのものを使い続けて良い)
3. `docs/project.md` にプロジェクト情報を記入する
4. `docs/requirements/requirements.md` に要件定義書を記入する
5. `docs/specs/spec.md` に機能仕様書を記入する
6. `.specify/memory/constitution.md` を自社ルールに合わせて調整する(データ保護制約は変更前に必ずチームレビュー)
7. 技術スタックに合わせて `.claude/rules/` の規約を調整する
8. リポジトリにcommit・pushする

### メンバー全員が行う作業

```bash
# リポジトリをclone(CLAUDE.md / .specify/ も一緒に取得される)
git clone <リポジトリURL>
cd <プロジェクト>

# Claude Codeを起動
claude
```

---

## フォルダ構成

```
project/
├── CLAUDE.md                    ← 全員共通のルール(Git管理・Spec Kit連携)
├── CLAUDE.local.md              ← 個人設定(Git管理外 / .gitignore済み)
├── .gitignore
├── .specify/
│   └── memory/
│       └── constitution.md      ← ★全社共通ルールの正本(Spec Kit憲法・データ保護制約含む)
├── docs/
│   ├── project.md               ← ★ プロジェクト情報(リーダーが記入)
│   ├── requirements/
│   │   └── requirements.md      ← ★ 要件定義書(業務担当者が記入)
│   ├── specs/
│   │   └── spec.md              ← ★ 機能仕様書(設計担当者が記入・全体版)
│   └── design/                  ← 設計フェーズで自動生成される
│       ├── table_def.md
│       ├── interface_def.md
│       └── sequence.md
├── specs/                       ← Spec Kitが機能単位で生成する仕様・計画・タスク
│   └── 001-<feature-name>/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── src/                         ← 開発フェーズで自動生成される
├── tests/                       ← テストフェーズで自動生成される
│   ├── test_cases.md
│   └── test_*.py
└── .claude/
    └── rules/
        ├── design.md            ← 設計ルール(詳細手順)
        ├── development.md       ← 開発ルール(詳細手順)
        └── test.md              ← テストルール(詳細手順)
```

---

## ドキュメントの記入担当

| ファイル | 記入担当 | タイミング |
|---|---|---|
| `.specify/memory/constitution.md` | プロジェクトリーダー / 技術リード | プロジェクト開始時(変更は要レビュー) |
| `docs/project.md` | プロジェクトリーダー | プロジェクト開始時 |
| `docs/requirements/requirements.md` | 業務担当者 / PL | 要件定義フェーズ |
| `docs/specs/spec.md` | 設計担当者 | 設計フェーズ開始前 |

---

## 各フェーズの実行方法

| フェーズ | 従来方式(標準プロンプト) | Spec Kit方式(推奨) |
|---|---|---|
| 憲法整備(初回) | — | `/speckit.constitution` |
| 設計 | 「docs/ 配下を読んで設計を開始してください」 | `/speckit.specify` → `/speckit.plan` |
| 開発 | 「docs/design/ を読んで実装を開始してください」 | `/speckit.tasks` → `/speckit.implement` |
| テスト | 「src/ と docs/design/ を読んでテストを作成してください」 | `/speckit.analyze`(整合性チェック) |

どちらの方式でも `.specify/memory/constitution.md` の制約(コーディング規約・セキュリティ・
データ保護・テスト基準)は必ず適用される。

---

## データ保護・誤削除防止について(重要)

`.specify/memory/constitution.md` の **III章** に、以下を明記している。

- `DELETE` / `DROP` / `TRUNCATE` 等の破壊的操作は **提案のみ**(実行コマンドは生成しない)
- 本番DB・本番ストレージへの書き込み/削除コマンドの直接生成禁止

ただしこれは**プロンプトレベルのガードレール**であり、技術的な強制ブロックではない。
以下のインフラ側の防御を必ず併用すること。

- IAM権限の最小化・本番環境への書き込み権限分離
- RDSの削除保護(Deletion Protection)
- S3バージョニング / MFA Delete

---

## ルールを変更したい場合

| 変更内容 | 手順 |
|---|---|
| 全社共通の最上位ルール変更(データ保護制約等) | PR・レビューを経て `.specify/memory/constitution.md` を更新 |
| フェーズ別の詳細手順変更 | PR・レビューを経て `.claude/rules/` を更新 |
| 個人の作業設定 | `CLAUDE.local.md` に記載(Gitにpushしない) |
| プロジェクト情報の更新 | `docs/project.md` を更新してcommit |
| 要件・仕様の変更 | 該当ドキュメントを更新し変更履歴を記録してcommit |
