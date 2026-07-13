# AI駆動開発ひな形（Spec Kit × Lint統合版）

## 結論
このひな形は、**GitHub Spec Kit（Spec-Driven Development）**の標準構造に、
**Lintによる品質ゲート**を組み込んだ、会社・言語・スタックに依存しない汎用テンプレートです。
`.specify/`（Spec Kitのコア）はどの環境でも共通のまま保ち、
組織固有のLintルール・コーディング規約は **preset（プリセット）** として分離することで、
「どの環境（会社）でも流用できる」構造を実現しています。

## 理由
GitHub Spec Kit公式ドキュメントでは、Spec Kitの拡張方法として
「extensions（機能追加）」と「presets（挙動の上書き）」の2系統が定義されています。
組織のコンプライアンス要件・独自の用語・組織標準を計画やタスクに適用する場合は
presetsを使うことが公式に推奨されています。
出典: https://github.com/github/spec-kit/blob/main/README.md

Lintルールは会社・プロジェクトごとに異なるため、コア（`.specify/`）に直接書き込まず、
`.specify/templates/overrides/` または独自presetとして切り出すことで、
コア部分をそのまま他社・他プロジェクトへ横展開できます。

## 構成
（リポジトリ直下に展開して配置）
```
├── README-ai-dev-template.md          ← 本ファイル（ひな形の全体説明）
├── .specify/
│   ├── memory/
│   │   └── constitution.md            ← プロジェクト憲法（組織で一度確定→以後そのまま再利用）
│   └── templates/
│       └── overrides/                 ← 組織固有ルールの上書き先（空。会社ごとに追加）
├── .github/
│   └── workflows/
│       └── quality-gate.yml           ← Lint品質ゲートのCIサンプル
└── docs/
    ├── overview.md                    ← 会議・説明用の簡易サマリ（まずこれを読む）
    ├── requirements-template.md       ← 要件定義書テンプレ（人間が記入 → /speckit.specify の入力）
    ├── tech-stack-template.md         ← 技術選定書テンプレ（人間が記入 → /speckit.plan の入力）
    ├── lint-preset-guide.md           ← 会社固有Lintルールをpreset化する手順
    ├── waterfall-preset-guide.md      ← ウォーターフォール運用への適用ガイド（フェーズゲート対応表）
    ├── brownfield-guide.md            ← 既存システム改修（Brownfield）への適用ガイド
    └── change-spec-template.md        ← 既存システム改修用の狭いspecテンプレート
```

## 対応する開発スタイル
本ひな形は以下のいずれにも対応できるよう設計しています。

| ケース | 対応方法 | 参照ドキュメント |
|---|---|---|
| 新規開発（Agile/AI駆動開発） | Spec Kitコアをそのまま利用 | README（本ファイル） |
| ウォーターフォール運用 | フェーズゲートをpreset/運用ルールとして追加 | `docs/waterfall-preset-guide.md` |
| 既存システムの改修 | 改修範囲だけを対象にした狭いspecを作成 | `docs/brownfield-guide.md`, `docs/change-spec-template.md` |

## 導入ステップ（現場で使う場合）
1. **Spec Kit本体を導入**: `uvx --from git+https://github.com/github/spec-kit.git specify init <project> --integration claude`
2. **憲法を配置**: 組織で確定済みの `.specify/memory/constitution.md` をそのまま配置する（未確定なら本雛形を一度だけ記入して確定版にする）
3. **入力ドキュメントを人間が作成**: `docs/requirements-template.md`（要件定義書）と `docs/tech-stack-template.md`（技術選定書）をコピーして記入し、プロジェクトに配置する
4. **Spec Kitフローを実行**: `/speckit.specify`（要件定義書が入力）→ `/speckit.plan`（技術選定書が入力）→ `/speckit.tasks` → `/speckit.implement`
5. **Lint品質ゲートを設置**: `.github/workflows/quality-gate.yml` を配置し、GitHubへのpush/PullRequestで自動実行されるようにする（会社固有のLintルールは `docs/lint-preset-guide.md` の手順でpreset化）

> 各開発スタイル別の使い方・見込まれる効果の要約は [docs/overview.md](docs/overview.md) を参照。

## 💡 Claude補足
- **注意点**: Spec Kitの`specify`コマンド自体はLintを内蔵していません。Lintは別ツール（ESLint、Ruff、golangci-lint等）を組み合わせる前提です。
- **ベストプラクティス**: `constitution.md`にLintの「基準」（例：警告ゼロ必須、Critical違反は実装フェーズで自動リジェクト）を明文化し、実際のルール定義はpreset/CI側に置くと、憲法自体は会社を変えても再利用できます。
- **未確認情報**: Spec KitのLint連携に関する公式extension（Lint専用extension）が既に存在するかどうかは、2026年7月13日時点の検索結果では確認できませんでした。公式Extensionカタログ（https://github.com/github/spec-kit）で`specify extension search`を実行し、都度確認することを推奨します。
- **ウォーターフォール対応の根拠**: Spec Kit公式READMEには、presetの用途例として「Agile、Kanban、Waterfallなど利用中の方法論にワークフローを適応させる」ことが明記されています（出典: https://github.com/github/spec-kit）。完成済みの公式Waterfallプリセットが配布されているかは確認できていないため、自社でpreset化する前提としています。
- **既存システム改修対応の根拠**: Spec Kit公式READMEは、既存プロジェクトについて「ツール本体の更新」と「specs/配下の機能仕様更新」を分けて管理する運用（Evolving Specsガイド）を推奨しています（出典: https://github.com/github/spec-kit/blob/main/README.md）。Brownfield専用の拡張コマンド（`speckit.brownfield.*`等）はサードパーティのコミュニティ拡張であり、GitHub公式提供ではない点に注意してください。
