# テスト戦略ガイド（SpecKit × Java）

> **位置づけ**: SpecKit を使った開発プロジェクトにおけるテスト設計・自動化・AI活用に関する方針をまとめたガイドです。
> `waterfall-preset-guide.md` のテストフェーズ運用と合わせて参照してください。

---

## 1. SpecKit の範囲にテストは必ず含まれるか

**含まれます。SpecKit の設計上、テストは必須の構成要素として位置づけられています。**

ただし、その深さや形式はプロジェクトの判断に委ねられます。

### テストが必須である理由

#### spec-template.md がテストを設計の核心に置いている

`spec-template.md` の最初のセクションは `User Scenarios & Testing *(mandatory)*` と明示されており、
各ユーザーストーリーには必ず **"Independent Test"** の記述が求められます。
テストシナリオを書けない要件 = 実装できない要件、という思想です。

#### constitution.md でテストなし実装を明示的に禁じている

憲法の「テスト基準」セクションに以下の原則があります：

```
テストのない実装はレビューで差し戻す。
```

これはチーム全体の合意事項（憲法）として確定しているため、個別フィーチャーで省略する余地はありません。

#### tasks-template.md がテスト可能性を実装フェーズのゲートにしている

各フェーズの完了条件として「Checkpoint: User Story N fully functional and testable independently」が
設定されており、「テスト可能な状態」が次フェーズへの入場条件になっています。

### テストの種類と必須かどうか

| テストの種類 | 必須か | 根拠 |
|---|---|---|
| ユーザーストーリーの受け入れシナリオ（Given/When/Then） | **必須** | `spec-template.md` の mandatory セクション |
| 主要ビジネスロジックの単体テスト | **必須**（カバレッジ未達はNG） | `constitution.md` §2 |
| 結合テスト・E2E テスト | **判断による** | 機能の重要度（優先度 高/中/低）に従う |

---

## 2. リスク分析・テスト計画書・テスト仕様書・テストケースをAIで作成できるか

### 現状（2026-08-26 更新）

テスト計画書・テストケースの生成は **実装済み** です。

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement → /speckit.testplan → /speckit.review
```

`/speckit.testplan`（`.claude/commands/speckit.testplan.md`）が `spec.md` の受け入れシナリオ（Acceptance Scenarios）からテストケースを生成し、`.specify/templates/test-plan-template.md` の構造で `specs/[###]/test-plan.md` を出力します。`test-plan-template.md` は「人間が記入する」ではなく「AIが生成し、人間が承認する」という位置づけです。

### AIで作成できるもの・できないもの

| やりたいこと | 状況 |
|---|---|
| テスト計画書・テストケースの生成 | ✅ 実装済み（`/speckit.testplan`） |
| テストコードの実装 | ✅ 可能（`tasks.md` にテストタスクを含めて `/speckit.implement` で実装） |
| リスク分析の生成 | ❌ 未実装。専用コマンド（例: `speckit.risk.md`）は存在しない |
| CI でのテスト実行（yml） | ❌ 未実装。`quality-gate.yml` は Lint のみでテスト実行ステップがない（詳細は本ガイド§5） |
| テストが実際に通ること | ⚠️ AIが保証はできない。実行環境（DB・外部サービス等）の整備は人間が必要 |

### 残っている拡張余地

「リスク分析の生成」のみ、`/speckit.testplan` とは別の専用コマンドが必要な未実装機能として残っています。SpecKit のコア（specify → plan → tasks → implement）には手を入れず、既存の拡張方法（`.claude/commands/` へのコマンド追加）の範囲内で対応できます。

---

## 3. SpecKit コマンドとは何か

**Claude Code（AIエージェント）に対する `/スラッシュコマンド` のことです。**

### 実体は Markdown ファイル

コマンドの正体は、`.claude/commands/` フォルダに置かれた `.md` ファイルです。
ファイル名（拡張子なし）がそのままコマンド名になります。

```
.claude/commands/
├── speckit.specify.md      → /speckit.specify  コマンドの定義
├── speckit.plan.md         → /speckit.plan     コマンドの定義
├── speckit.tasks.md        → /speckit.tasks    コマンドの定義
└── speckit.implement.md    → /speckit.implement コマンドの定義
```

### 実行の仕組み（3層）

```
層A: Claudeへの指示（.claude/commands/*.md）
     → 「何をするか」を自然言語で記述した手順書
     → これだけでは何も実行されない

層B: シェルスクリプト（.specify/scripts/bash/）
     → Claudeの指示を受けて実際に走るスクリプト
     → ディレクトリ作成・ファイルコピー・Git操作など

層C: CI/CD（.github/workflows/quality-gate.yml）
     → Lint等、AIの外で機械的に走るチェック
     → GitHub Push/PR 時に自動発火
```

コマンドがシェルスクリプトを呼び出して初めて動く設計です。

---

## 4. テストの「実行」における3種類の違い

| やりたいこと | 必要なもの | コマンドだけで済む？ |
|---|---|---|
| テスト仕様書・テストケースをAIに**生成**させる | コマンド（指示書）＋テンプレート | ほぼ済む |
| テストコード（unit test等）をAIに**実装**させる | コマンド＋`tasks.md`へのテストタスク追記 | ほぼ済む |
| テストを**実際に走らせて**合否を判定する | シェルスクリプト or CI/CDワークフロー追加 | 済まない |

テストの「生成と整備」はコマンドで制御できますが、
テストの「実行と合否判定」は `quality-gate.yml` へのテスト実行ステップ追加がセットで必要になります。

---

## 5. ウォーターフォールにおけるテスト自動化

### 「CI を導入しているプロジェクトが少ない」場合の対応

`quality-gate.yml` は Lint を GitHub Actions で実行する仕組みであり、
**このファイルを置いた時点で CI を導入したことになります**。
専用のCIサーバー（Jenkins等）は不要です。

テストステップを追加することで、Lint と同じ強制力でテストを走らせることができます。

### テストを自動化する方法（CI なしの場合も含む）

| 方法 | CI サーバー | 発火タイミング | 記録の残り方 | 向いているケース |
|---|---|---|---|---|
| ローカルスクリプト | 不要 | テスターが手動起動 | 手動で結果ファイルに記録 | 閉じた環境・GitHub 未使用 |
| pre-commit フック | 不要 | コミット時に自動 | コミット履歴に残る | 開発者単位での品質ゲート |
| GitHub Actions スケジュール | 必要（GitHub） | 定時自動 | Actions のログに残る | テストフェーズ期間中の定点観測 |

### ウォーターフォールへの推奨構成

`waterfall-preset-guide.md` のテストフェーズ DoD には「テスト結果が記録・保管されていること」があります。

```
ローカルスクリプトで実行
      ↓
結果をファイルに出力（例: test-results.xml / test-report.md）
      ↓
そのファイルを Git にコミットして承認ゲートの証跡とする
```

---

## 6. Java テストフレームワーク 選定ガイド

### テストの層とフレームワークの対応

#### 単体テスト

| 名前 | 特徴 | 推奨度 |
|---|---|---|
| **JUnit 5** | Java 標準の単体テストフレームワーク。現在の事実上の標準。アノテーションベースで直感的に書ける。Maven / Gradle どちらでも動作。 | **第一選択** |
| JUnit 4 | 旧世代。既存プロジェクトで残っているケースはあるが、新規採用は非推奨。 | 非推奨 |
| TestNG | JUnit に近いが、並列実行・グループ化が得意。大規模チームや結合テストを JUnit と分けたいときに選択肢に入る。 | 状況次第 |

#### アサーション（テストの「期待値の書き方」を読みやすくする補助ライブラリ）

| 名前 | 特徴 | 推奨度 |
|---|---|---|
| **AssertJ** | `assertThat(result).isEqualTo(expected)` のように自然言語に近い記述が可能。IDE の補完が効きやすい。JUnit 5 との組み合わせが最も一般的。 | **第一選択** |
| Hamcrest | JUnit 4 時代からある。JUnit 5 に同梱されているが、AssertJ のほうが表現力が高い。 | レガシー |

#### モック（外部依存を差し替えて単体テストを独立させる）

| 名前 | 特徴 | 推奨度 |
|---|---|---|
| **Mockito** | Java のモックライブラリとしてデファクトスタンダード。`@Mock` アノテーションで簡単に依存を差し替えられる。Spring Boot との親和性も高い。 | **第一選択** |
| EasyMock | Mockito より古い。現在は Mockito に置き換えられているプロジェクトが多い。 | 非推奨 |

#### 結合テスト（Spring Boot の場合）

| 名前 | 特徴 | 推奨度 |
|---|---|---|
| **Spring Boot Test** | Spring Boot に標準内蔵。`@SpringBootTest` でアプリ全体を起動してテスト、`@WebMvcTest` でコントローラ層だけを起動してテストなど、粒度を選べる。 | Spring Boot 使用時 |
| Testcontainers | Docker を使って DB・Redis 等の実物コンテナを起動しながらテストする。「モックではなく実 DB で結合テストしたい」ときに使う。 | DB結合テストに有効 |

#### E2E テスト / API テスト

| 名前 | 特徴 | 推奨度 |
|---|---|---|
| REST Assured | REST API を HTTP レベルでテストするライブラリ。Spring Boot と組み合わせて使うことが多い。 | API テストに有効 |
| Selenium | ブラウザ操作を自動化する E2E テスト。Web アプリの画面操作を再現する。 | 画面 E2E に有効 |
| Playwright（Java バインディング） | Selenium より新しい。クロスブラウザ対応・動作が安定している。 | 画面 E2E に有効 |

### 典型的な組み合わせ

#### パターン A：Spring Boot 一般業務システム（推奨）

- 単体テスト：**JUnit 5 + AssertJ + Mockito**
- 結合テスト：**Spring Boot Test**（@WebMvcTest / @SpringBootTest）
- API テスト：**REST Assured**（必要な場合のみ）

> ウォーターフォール案件の多くはこの構成で十分。Maven / Gradle どちらでも同じ依存を追加するだけで使える。

#### パターン B：Spring Boot + 実 DB 結合テストが必要

- 単体テスト：JUnit 5 + AssertJ + Mockito
- 結合テスト：Spring Boot Test + **Testcontainers**

> Docker が使える環境であれば、本番に近い DB でテストできる。CI 環境（GitHub Actions）上でも動作する。

### GitHub Actions への組み込みイメージ

技術選定書でフレームワークが決まれば、AI が `quality-gate.yml` にこのステップを追記できます。

```yaml
# Java テスト実行ステップ（Maven の場合）
- name: Set up JDK 21
  uses: actions/setup-java@v4
  with:
    java-version: '21'
    distribution: 'temurin'

- name: Run Tests
  run: mvn test --batch-mode

# Gradle の場合
- name: Run Tests
  run: ./gradlew test
```

### 技術選定書への記入例

> ⚠️ 記入は人間が行うこと。AI による変更は不可。
> 下記はテスト行の記入例です。技術選定書の「使用技術スタック」表に追加してください。

| レイヤー | 採用技術 | バージョン | 選定理由 |
|---|---|---|---|
| 単体テスト | JUnit 5 + AssertJ + Mockito | JUnit 5.11 / AssertJ 3.x / Mockito 5.x | Java 標準構成。チームの既存知識と合致。Maven Central から取得可能。 |
| 結合テスト | Spring Boot Test | Spring Boot に同梱 | 追加依存なし。@WebMvcTest で API 層を独立して検証できる。 |

---

## 7. 技術選定書の管理ルール

**技術選定書（`tech-stack.md`）への記入・変更は人間のみが実施する。AIによる記入・変更は不可。**

不用意なライブラリ・依存関係の混入を防ぐため、AIエージェントは技術選定書を参照するのみとし、
内容を追加・変更・削除してはならない。（`constitution.md` §5 参照）

---

## 関連ドキュメント

| ドキュメント | 内容 |
|---|---|
| `.specify/memory/constitution.md` | テスト基準（§2）・技術的意思決定ルール（§5） |
| `waterfall-preset-guide.md` | テストフェーズ DoD・承認ゲート |
| `.specify/templates/test-plan-template.md` | テスト計画書テンプレート |
| `tech-stack.md` | テストフレームワークの記入先 |
| `.github/workflows/quality-gate.yml` | Lint・テスト自動実行の定義 |
