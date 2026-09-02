# AI駆動開発ひな形について

## これは何か
GitHub Spec Kit（仕様駆動開発）＋ Lint品質ゲートを組み込んだ、**どの会社でも使い回せて、作業者ごとのばらつきが出ない**開発ひな形。

## 課題
AI駆動開発は、進め方や品質基準を各作業者・AIエージェントの裁量に任せると、
- 人によって「仕様を書く／書かない」「Lintを通す／通さない」がバラつく
- 会社・プロジェクトが変わるたびに、運用ルールをゼロから作り直す

## このひな形がやること
- **進め方をコアに固定**：仕様→設計→タスク→実装 という型を全員共通にする
- **会社ごとの違いはpresetで分離**：Lintルール等はコアと切り離し、差し替えるだけで他社にも流用可能
- **品質チェックを自動化**：Lintを人のチェック任せにせず、機械的にブロック

## 事前準備（人間が用意するもの）
- **憲法（constitution.md）**：組織で一度確定させた版を、都度作り直さずそのまま配置する（本ひな形に雛形を同梱）
- **要件定義書**：AIには書かせず人間が作成する（雛形: `docs/inputs/requirements-template.md`）
- **技術選定書**：使用技術・アーキテクチャ方針を人間がまとめる（記入先: ルート直下 `tech-stack.md`。空の雛形: `docs/inputs/tech-stack-template.md`）
- これら3点をプロジェクトに配置してからSpec Kitのフローに入る

## 使う流れ
```
配置        憲法・要件定義書・技術選定書を人間が用意して置く
仕様化      /speckit.specify   … 要件定義書をもとに何を作るか書く
設計        /speckit.plan      … 技術選定書をもとに設計に落とす（技術選び自体はしない）
タスク分解  /speckit.tasks     … 作業単位に分ける
実装        /speckit.implement … AIエージェントが実装
品質チェック GitHubに変更を送ると自動でLintが走る … 基準未達はマージ不可
```
「憲法」「要件定義書」「技術選定書」という土台は人間が固定し、そこから先（仕様の書き起こし〜実装〜品質チェック）をSpec Kit＋Lintが型どおりに進める。人によって進め方がブレる余地がない。

## 雛形の構成
```
├── CLAUDE.md                          … Claude Code 起動時設定（コマンド表・コーディング規約）
├── requirements.md                    … 要件定義書（人間が記入）
├── tech-stack.md                      … 技術選定書（人間が記入。AI編集禁止）
│
├── .specify/
│   ├── memory/constitution.md         … 憲法（組織で一度確定→そのまま再利用）
│   └── templates/                     … AIがコマンド経由で読み込み成果物を生成するテンプレート
│       ├── spec-template.md           … 機能仕様書テンプレ
│       ├── plan-template.md           … 実装計画書テンプレ
│       ├── tasks-template.md          … タスクリストテンプレ
│       ├── basic-design-template.md   … 基本設計書テンプレ（ウォーターフォール用）
│       ├── detailed-design-template.md … 詳細設計書テンプレ（ウォーターフォール用）
│       ├── table-definition-template.md … テーブル定義書テンプレ（ウォーターフォール用）
│       ├── test-plan-template.md      … テスト計画書テンプレ（ウォーターフォール用）
│       ├── review-gate-template.md    … フェーズゲート承認記録テンプレ（ウォーターフォール用）
│       ├── change-request-template.md … 変更要求書テンプレ（ウォーターフォール用）
│       └── change-spec-template.md    … 改修用の狭いspecテンプレ（既存システム改修用）
│
├── .claude/commands/                  … Spec Kit コマンド（12本）
│
├── .github/workflows/quality-gate.yml … Lint自動チェック（GitHubへの変更で発火）
│
├── docs/
│   ├── overview.md                    … 本ファイル（説明用サマリ）
│   ├── how-to-use.md                  … 利用指南書（手順・FAQ）
│   ├── inputs/                        … 案件開始時に人間がコピーして記入するテンプレート
│   │   ├── requirements-template.md   … 要件定義書テンプレ（コピー元。ルート直下 requirements.md へコピーして記入）
│   │   ├── requirements-example.md    … 要件定義書の記入例（オンライン書店）
│   │   ├── tech-stack-template.md     … 技術選定書テンプレ（コピー元。ルート直下 tech-stack.md へコピーして記入）
│   │   └── tech-stack-example.md      … 技術選定書の記入例（オンライン書店）
│   └── guides/                        … 状況依存の運用ガイド（必要な場合のみ参照）
│       ├── lint-preset-guide.md       … 会社固有Lintルールのpreset化手順
│       ├── waterfall-preset-guide.md  … ウォーターフォール運用ガイド
│       ├── brownfield-guide.md        … 既存システム改修ガイド
│       └── testing-strategy-guide.md  … テスト戦略ガイド
│
└── _meta/                             … この雛形自身の開発履歴（新規プロジェクトでは削除可）
    ├── changelog.md                   … 変更ログ
    └── ai-judge/                      … AI as a Judge 評価記録
```
| 区分 | ファイル | 誰が用意 |
|---|---|---|
| 土台（人間が記入） | `requirements.md` / `tech-stack.md` | 人間 |
| 憲法 | `.specify/memory/constitution.md` | 人間（組織で一度確定） |
| コマンド | `.claude/commands/` 配下12本 | Spec Kit（変更不要） |
| テンプレート | `.specify/templates/` 配下 | Spec Kit（変更不要） |
| 自動 | `.github/workflows/quality-gate.yml`（Lint） | 仕組み（GitHub） |
| ガイド | `docs/` 配下の各ガイド | 参照するだけ |

## 見込まれる効果
- 担当者・AIエージェントが変わっても、成果物の構造とレビュー観点が揃う
- 仕様と実装のズレによる手戻りが減る
- 新規プロジェクト・新しい会社への導入を、ゼロから設計せず短時間で行える
- 新規開発・ウォーターフォール・既存改修、どの進め方でも同じ土台を使い回せる
