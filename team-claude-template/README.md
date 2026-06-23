# チーム開発 Claude標準テンプレート

## このテンプレートの目的

複数人で同じシステムを開発するとき、各自のClaude出力のバラツキを抑えるための共通設定。
リポジトリをcloneした全員に同じCLAUDE.mdが適用される。

---

## 導入手順

### リーダーが行う作業（初回のみ）

1. このテンプレートをプロジェクトリポジトリにコピーする
2. `docs/project.md` にプロジェクト情報を記入する
3. `docs/requirements/requirements.md` に要件定義書を記入する
4. `docs/specs/spec.md` に機能仕様書を記入する
5. 技術スタックに合わせて `.claude/rules/` の規約を調整する
6. リポジトリにcommit・pushする

### メンバー全員が行う作業

```bash
# リポジトリをclone（CLAUDE.mdも一緒に取得される）
git clone <リポジトリURL>
cd <プロジェクト>

# Claude Codeを起動
claude
```

---

## フォルダ構成

```
project/
├── CLAUDE.md                    ← 全員共通のルール（Git管理）
├── CLAUDE.local.md              ← 個人設定（Git管理外 / .gitignore済み）
├── .gitignore
├── docs/
│   ├── project.md               ← ★ プロジェクト情報（リーダーが記入）
│   ├── requirements/
│   │   └── requirements.md      ← ★ 要件定義書（業務担当者が記入）
│   ├── specs/
│   │   └── spec.md              ← ★ 機能仕様書（設計担当者が記入）
│   └── design/                  ← 設計フェーズで自動生成される
│       ├── table_def.md
│       ├── interface_def.md
│       └── sequence.md
├── src/                         ← 開発フェーズで自動生成される
├── tests/                       ← テストフェーズで自動生成される
│   ├── test_cases.md
│   └── test_*.py
└── .claude/
    └── rules/
        ├── design.md            ← 設計ルール
        ├── development.md       ← 開発ルール
        └── test.md              ← テストルール
```

---

## ドキュメントの記入担当

| ファイル | 記入担当 | タイミング |
|---|---|---|
| `docs/project.md` | プロジェクトリーダー | プロジェクト開始時 |
| `docs/requirements/requirements.md` | 業務担当者 / PL | 要件定義フェーズ |
| `docs/specs/spec.md` | 設計担当者 | 設計フェーズ開始前 |

---

## 各フェーズの標準プロンプト

**設計フェーズ**
```
docs/ 配下を読んで設計を開始してください
```

**開発フェーズ**
```
docs/design/ を読んで実装を開始してください
```

**テストフェーズ**
```
src/ と docs/design/ を読んでテストを作成してください
```

---

## ルールを変更したい場合

| 変更内容 | 手順 |
|---|---|
| チーム共通ルールの変更 | PR・レビューを経てCLAUDE.mdまたは`.claude/rules/`を更新 |
| 個人の作業設定 | CLAUDE.local.mdに記載（Gitにpushしない） |
| プロジェクト情報の更新 | docs/project.mdを更新してcommit |
| 要件・仕様の変更 | 該当ドキュメントを更新し変更履歴を記録してcommit |
