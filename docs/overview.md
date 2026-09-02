# AI駁E��開発ひな形につぁE��

## これは何か
GitHub Spec Kit�E�仕様駁E��開発�E�！ELint品質ゲートを絁E��込んだ、E*どの会社でも使ぁE��せて、作業老E��とのばらつきが出なぁE*開発ひな形、E

## 課顁E
AI駁E��開発は、E��め方めE��質基準を吁E��業老E�EAIエージェント�E裁E��に任せると、E
- 人によって「仕様を書く／書かなぁE��「Lintを通す�E�通さなぁE��がバラつぁE
- 会社・プロジェクトが変わるたびに、E��用ルールをゼロから作り直ぁE

## こ�Eひな形がやること
- **進め方をコアに固宁E*�E�仕様�E設計�Eタスク→実裁EとぁE��型を全員共通にする
- **会社ごとの違いはpresetで刁E��**�E�Lintルール等�Eコアと刁E��離し、差し替えるだけで他社にも流用可能
- **品質チェチE��を�E動化**�E�Lintを人のチェチE��任せにせず、機械皁E��ブロチE��

## 事前準備�E�人間が用意するもの�E�E
- **憲法！Eonstitution.md�E�E*�E�絁E��で一度確定させた版を、E�E度作り直さずそ�Eまま配置する�E�本ひな形に雛形を同梱�E�E
- **要件定義書**�E�AIには書かせず人間が作�Eする�E�雛形: `docs/inputs/requirements-template.md`�E�E
- **技術選定書 兼 開発規紁E*�E�使用技術�EアーキチE��チャ方針�E命名規則・禁止事頁E�Eスコープ外機�Eを人間がまとめる�E�記�E允E ルート直丁E`tech-stack.md`。空の雛形: `docs/inputs/tech-stack-template.md`�E�E
- これめE点を�Eロジェクトに配置してからSpec Kitのフローに入めE

## 使ぁE��れ
```
配置        憲法�E要件定義書・技術選定書を人間が用意して置ぁE
仕様化      /speckit.specify   … 要件定義書をもとに何を作るか書ぁE
設訁E       /speckit.plan      … 技術選定書をもとに設計に落とす（技術選び自体�EしなぁE��E
タスク刁E��  /speckit.tasks     … 作業単位に刁E��めE
実裁E       /speckit.implement … AIエージェントが実裁E
品質チェチE�� GitHubに変更を送ると自動でLintが走めE… 基準未達�Eマ�Eジ不可
```
「�E法」「要件定義書」「技術選定書」とぁE��土台は人間が固定し、そこから�E�E�仕様�E書き起こし〜実裁E��品質チェチE���E�をSpec Kit�E�Lintが型どおりに進める。人によって進め方がブレる余地がなぁE��E

## 雛形の構�E
```
├── README.md                          … 利用持E��書�E�手頁E�EFAQ、EitHub で自動表示�E�E
├── CLAUDE.md                          … Claude Code 起動時設定（コマンド表・コーチE��ング規紁E��E
├── requirements.md                    … 要件定義書�E�人間が記�E�E�E
├── tech-stack.md                      … 技術選定書 兼 開発規紁E��人間が記�E、EI編雁E��止�E�E
━E
├── .specify/
━E  ├── memory/constitution.md         … 憲法（絁E��で一度確定�Eそ�Eまま再利用�E�E
━E  └── templates/                     … AIがコマンド経由で読み込み成果物を生成するテンプレーチE
━E      ├── spec-template.md           … 機�E仕様書チE��プレ
━E      ├── plan-template.md           … 実裁E��画書チE��プレ
━E      ├── tasks-template.md          … タスクリストテンプレ
━E      ├── basic-design-template.md   … 基本設計書チE��プレ�E�ウォーターフォール用�E�E
━E      ├── detailed-design-template.md … 詳細設計書チE��プレ�E�ウォーターフォール用�E�E
━E      ├── table-definition-template.md … チE�Eブル定義書チE��プレ�E�ウォーターフォール用�E�E
━E      ├── test-plan-template.md      … チE��ト計画書チE��プレ�E�ウォーターフォール用�E�E
━E      ├── review-gate-template.md    … フェーズゲート承認記録チE��プレ�E�ウォーターフォール用�E�E
━E      ├── change-request-template.md … 変更要求書チE��プレ�E�ウォーターフォール用�E�E
━E      └── change-spec-template.md    … 改修用の狭いspecチE��プレ�E�既存シスチE��改修用�E�E
━E
├── .claude/commands/                  … Spec Kit コマンド！E2本�E�E
━E
├── .github/workflows/quality-gate.yml … Lint自動チェチE���E�EitHubへの変更で発火�E�E
━E
├── docs/
━E  ├── overview.md                    … 本ファイル�E�説明用サマリ�E�E
━E  ├── README.md                      … 利用持E��書�E�手頁E�EFAQ�E�E
━E  ├── inputs/                        … 案件開始時に人間がコピ�Eして記�EするチE��プレーチE
━E  ━E  ├── requirements-template.md   … 要件定義書チE��プレ�E�コピ�E允E��ルート直丁Erequirements.md へコピ�Eして記�E�E�E
━E  ━E  ├── requirements-example.md    … 要件定義書の記�E例（オンライン書店！E
━E  ━E  ├── tech-stack-template.md     … 技術選定書チE��プレ�E�コピ�E允E��ルート直丁Etech-stack.md へコピ�Eして記�E�E�E
━E  ━E  └── tech-stack-example.md      … 技術選定書の記�E例（オンライン書店！E
━E  └── guides/                        … 状況依存�E運用ガイド（忁E��な場合�Eみ参�E�E�E
━E      ├── lint-preset-guide.md       … 会社固有Lintルールのpreset化手頁E
━E      ├── waterfall-preset-guide.md  … ウォーターフォール運用ガイチE
━E      ├── brownfield-guide.md        … 既存シスチE��改修ガイチE
━E      └── testing-strategy-guide.md  … チE��ト戦略ガイチE
━E
└── _meta/                             … こ�E雛形自身の開発履歴�E�新規�Eロジェクトでは削除可�E�E
    ├── changelog.md                   … 変更ログ
    └── ai-judge/                      … AI as a Judge 評価記録
```
| 区刁E| ファイル | 誰が用愁E|
|---|---|---|
| 土台�E�人間が記�E�E�E| `requirements.md` / `tech-stack.md` | 人閁E|
| 憲況E| `.specify/memory/constitution.md` | 人間（絁E��で一度確定！E|
| コマンチE| `.claude/commands/` 配丁E2本 | Spec Kit�E�変更不要E��E|
| チE��プレーチE| `.specify/templates/` 配丁E| Spec Kit�E�変更不要E��E|
| 自勁E| `.github/workflows/quality-gate.yml`�E�Eint�E�E| 仕絁E���E�EitHub�E�E|
| ガイチE| `docs/` 配下�E吁E��イチE| 参�EするだぁE|

## 見込まれる効极E
- 拁E��老E�EAIエージェントが変わっても、�E果物の構造とレビュー観点が揃ぁE
- 仕様と実裁E�Eズレによる手戻りが減る
- 新規�Eロジェクト�E新しい会社への導�Eを、ゼロから設計せず短時間で行えめE
- 新規開発・ウォーターフォール・既存改修、どの進め方でも同じ土台を使ぁE��せる
