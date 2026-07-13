# 開発スタイル別 使い方ガイド

> 「対応する開発スタイル」表（[README-ai-dev-template.md](../README-ai-dev-template.md)）の3ケースについて、
> 実際に何をどの順番でやればいいかを、コマンド付きで具体的にまとめたガイドです。
> まずどのケースに当てはまるか迷ったら、末尾の「[どのケースを選ぶか迷ったら](#どのケースを選ぶか迷ったら)」を見てください。

## 全体像

どのケースでも、Spec Kitの基本の流れ（Spec → Plan → Tasks → Implement）は共通です。
違うのは「そこに何を足すか」だけです。

```
/speckit.constitution   … プロジェクトの原則を決める（最初に1回）
        ↓
/speckit.specify        … 何を作るか（要件）を仕様化する
        ↓
/speckit.clarify        … 曖昧な点をAIと一緒に潰す
        ↓
/speckit.plan           … どう作るか（設計）を決める
        ↓
/speckit.tasks          … 作業をタスクに分解する
        ↓
/speckit.implement      … 実装する（＋Lint品質ゲートが自動で走る）
```

| ケース | この流れに足すもの |
|---|---|
| 新規開発（Agile/AI駆動開発） | 何も足さない。そのまま使う |
| ウォーターフォール運用 | 各フェーズの後に「承認ゲート」を挟む |
| 既存システムの改修 | `/speckit.specify` の対象を「改修範囲だけ」に絞る |

---

## 事前準備（共通・最初の1回だけ）

1. Spec Kit本体を導入する
   ```bash
   uvx --from git+https://github.com/github/spec-kit.git specify init <project> --integration claude
   ```
2. このひな形の憲法テンプレートをコピーする
   ```bash
   cp .specify/memory/constitution.md <project>/.specify/memory/constitution.md
   ```
   コピー後、`/speckit.constitution` を実行し、`[組織名]` `[プロジェクト名]` などのプレースホルダーを埋めながら、テスト基準・UX方針・パフォーマンス要件（セクション2〜4）を自分たちの内容に書き換える。
3. Lint品質ゲートをCIに設置する
   ```bash
   cp .github/workflows/quality-gate.yml <project>/.github/workflows/quality-gate.yml
   ```
   `package.json` や `pyproject.toml` の有無で自動的にESLint/Ruffが切り替わる。自社の言語・ツールに合わせて書き換える手順は [docs/lint-preset-guide.md](lint-preset-guide.md) を参照。

ここまでやれば、あとはケースごとの手順に進むだけです。

---

## ケース1: 新規開発（Agile / AI駆動開発）

**こんなときに使う**: 真っ白な状態から新機能・新プロダクトを作る。手戻りしながら素早く進めたい。

### 手順

| # | コマンド | やること |
|---|---|---|
| 1 | `/speckit.specify` | 作りたい機能を自然言語で伝え、`specs/<feature>/spec.md` を生成する |
| 2 | `/speckit.clarify` | AIが要件の曖昧な点を質問してくるので答える（省略すると手戻りが増えやすい） |
| 3 | `/speckit.plan` | 技術構成・設計方針を決め、`plan.md` を生成する |
| 4 | `/speckit.tasks` | 実装タスク一覧 `tasks.md` を生成する |
| 5 | `/speckit.implement` | 実際にコードを生成・変更する。完了後、Lint品質ゲート（CI）が自動で走る |

### ポイント
- 追加の承認フローや厳密なドキュメント化は不要。スピード重視でよい。
- 実装後に仕様と実装がズレてきたら、`specs/<feature>/spec.md` を直接更新して「生きた仕様書」として保つ（Spec Kitの基本思想）。

---

## ケース2: ウォーターフォール運用

**こんなときに使う**: 顧客・PM・アーキテクトなど複数の承認者がいて、フェーズごとに正式承認を得てから次に進む必要がある。

### 手順（フェーズ対応表）

| ウォーターフォールフェーズ | 使うコマンド | このタイミングで挟む承認ゲート |
|---|---|---|
| 要件定義 | `/speckit.constitution` → `/speckit.specify` | 要件定義書レビュー・承認（顧客/PM） |
| 基本設計・詳細設計 | `/speckit.clarify` → `/speckit.plan` | 設計レビュー・承認（アーキテクト/リーダー） |
| 実装計画 | `/speckit.tasks` | タスク一覧レビュー（PM/リーダー） |
| 実装 | `/speckit.implement` | コードレビュー＋Lint品質ゲート（自動） |
| テスト | 実装後、テスト計画書に基づき実施 | テスト結果レビュー・承認 |
| リリース | デプロイ | リリース承認 |

### 具体的にやること
1. 各フェーズの成果物（`spec.md` / `plan.md` / `tasks.md`）に「承認者・承認日」を書く欄を追加したい場合は、`.specify/templates/overrides/` にテンプレートを配置して上書きする。
2. `/speckit.clarify` は必ず `/speckit.plan` の前に実行し、曖昧さを残さない（ウォーターフォールは後戻りが高コストなため）。
3. 計画確定後に要件が変わった場合は、`spec.md` を直接書き換えず、別途「変更要求書」プロセスを通す運用にする。
4. `specs/<feature>/spec.md` ・`plan.md` ・`tasks.md` は、そのまま社内の「要件定義書」「設計書」「作業計画書」として提出してよい（必要ならWord/PDFに変換）。

詳しくは [docs/waterfall-preset-guide.md](waterfall-preset-guide.md) を参照。

---

## ケース3: 既存システムの改修（Brownfield）

**こんなときに使う**: 動いている既存システムの一部だけを直す。システム全体を仕様化するのは非現実的。

### 手順

| # | やること |
|---|---|
| 1 | 改修する範囲だけを決める（例:「請求書PDF出力に消費税表示を追加」） |
| 2 | 対象モジュールの現状仕様・制約をAIエージェントに調査させる |
| 3 | `.specify/templates/overrides/` に [docs/change-spec-template.md](change-spec-template.md) を配置し、spec-template.mdを上書きする |
| 4 | `/speckit.specify` を実行し、**改修範囲だけ**を対象にspecを作る（システム全体は対象にしない） |
| 5 | 以降は通常どおり `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |

### change-spec-template.md に書く内容（抜粋）
- **改修前の現状仕様（As-Is）**: 現在の挙動、既存テストケース、既存設計書への参照（丸ごと転記しない、リンクのみ）
- **改修後の仕様（To-Be）**: 変更したい挙動、変更理由
- **影響範囲**: 影響を受ける他モジュール／API／後方互換性
- **受け入れ基準**: 既存テストが全てパスすること、新規テストがあること、Lint品質ゲートを通過すること

### ポイント
- 一度に全体をリバースエンジニアリングしてspec化しようとしない。改修のたびに少しずつspec化範囲を広げる（インクリメンタル）。
- 複数リポジトリに機能がまたがる場合は、1つのspecで全部カバーしようとせず、リポジトリ単位・機能単位でspecを分割する。

詳しくは [docs/brownfield-guide.md](brownfield-guide.md) を参照。

---

## 品質ゲート（Lint）の使い方（全ケース共通）

1. `.github/workflows/quality-gate.yml` を導入すると、`main`/`develop` へのPull Request・pushのたびに自動でLintが走る。
2. 自社のLintルール（ESLint設定、Ruff設定など）は `constitution.md` に直接書かず、[docs/lint-preset-guide.md](lint-preset-guide.md) の手順でpreset化する。
3. Lintエラーがあるとワークフローが失敗し、マージがブロックされる。

---

## どのケースを選ぶか迷ったら

```
Q1. 承認者（顧客/PM/アーキテクトなど）が各フェーズごとに
    正式な承認を必要としますか？
      │
      ├─ はい → 【ケース2: ウォーターフォール運用】
      │
      └─ いいえ
           │
           Q2. 既存システムの一部を直す改修ですか？
                │
                ├─ はい → 【ケース3: 既存システムの改修（Brownfield）】
                │
                └─ いいえ（真っ白から作る） → 【ケース1: 新規開発】
```

複数の性質を併せ持つ場合（例: 既存システムの改修だが承認フローも厳密）は、ケース2とケース3の手順を両方組み合わせて問題ありません。presetは優先度付きで積み重ねられる設計です。
