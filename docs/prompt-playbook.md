# プロンプト運用ガイド（要件定義〜単体テスト・ローカル動作確認）

> **位置づけ**: 本ひな形（`docs/overview.md`）が想定するSpec Kitフロー（仕様化→設計→タスク分解→実装）に沿って、
> 「個人運営オンライン書店（購買フロー特化版）」を要件定義からローカル動作確認まで進めるための、
> 各工程で **実際にチャットへ投げるプロンプト** をまとめたもの。
>
> 前提として `.claude/skills/speckit-*` と `.specify/scripts/bash/*` を `feature/AkaneOno-speckit` ブランチから
> 本ブランチ（`AkaneOno_hinagata1`）に取り込み済み（2026-08-05）。これにより `/speckit-specify` などのSkillが使用可能。

## 全体フロー

```
Phase 0  事前準備        技術選定書の確定・Lint基準の確認（人間承認ゲート）
Phase 1  要件定義        /speckit-specify … user_requirements.md → spec.md
Phase 1.5 曖昧点の明確化  /speckit-clarify … spec.mdの曖昧点を潰す
Phase 2  外部設計・詳細設計 /speckit-plan … tech-stack-template.md → plan.md 一式
                          ＋ 外部設計書・詳細設計書のHTML化（追加プロンプト）
Phase 3  タスク分解      /speckit-tasks … tasks.md
Phase 4  実装            /speckit-implement … アプリケーション資材
Phase 5  単体テスト      追加プロンプト … テスト実行・結果mdの生成
Phase 6  ローカル動作確認 追加プロンプト … docker compose起動＋ブラウザでの疎通確認
```

各フェーズの終わりに「次に進んでよいか」を必ず人間が確認する（ウォーターフォール運用ガイド `docs/waterfall-preset-guide.md` の承認ゲートに対応）。

---

## Phase 0｜事前準備（人間承認ゲート）

**やること**
- `docs/tech-stack-template.md` の内容を確認し、特に以下2点を確定させる（現状TODOのまま）：
  - データベースに何を使うか（例: PostgreSQL / SQLite / インメモリ等。書籍・カート・注文の永続化方式）
  - CI/CDの方針（`.github/workflows/quality-gate.yml` をそのまま使うか）
- `.specify/memory/constitution.md` 内の未確定プレースホルダー（`[組織名]`、カバレッジ目標`[例:80%]`、パフォーマンス基準等）を組織として確定させる（本ひな形の運用ルール上、AIには書かせず人間が確定）。

このPhaseはチャットプロンプトではなく、人間によるドキュメント確定作業。ここが済むまで `/speckit-plan`（Phase 2）には進まない。

---

## Phase 1｜要件定義（`/speckit-specify`）

**事前状態**: `user_requirements.md`（人間作成済み）

**投げるプロンプト**

```
/speckit-specify user_requirements.md の内容に基づいて、個人運営オンライン書店（購買フロー特化版）の仕様化を行ってください。

対象は以下5画面・18要件です：
- 商品一覧（U-01〜U-03）
- 商品詳細（U-04〜U-06）
- カート（U-07〜U-11）
- 注文フォーム（U-12〜U-15）
- 注文完了（U-16〜U-18）

スコープ外（ログイン・会員管理／決済処理／在庫管理／管理画面／レビュー・評価／検索・フィルター）は
user_requirements.md 3章の記載どおり明示的に除外してください。
```

**成果物**: `specs/<番号>-<短縮名>/spec.md`、`specs/<番号>-<短縮名>/checklists/requirements.md`

**承認ゲート**: `spec.md` と品質チェックリストの結果を確認し、要件の過不足がないかレビューしてから次へ。

---

## Phase 1.5｜曖昧点の明確化（`/speckit-clarify`）

**投げるプロンプト**

```
/speckit-clarify
```

（引数なしでOK。spec.mdの曖昧点をSpec Kit側が最大5問まで質問してくるので、順番に回答する）

**想定される論点の例**（回答方針を事前に決めておくとスムーズ）：
- 在庫切れ商品の扱い（今回はスコープ外なので「在庫は無限にある前提」等で回答）
- 注文フォームのメールアドレス形式チェックの厳密さ
- カート内数量の上限・下限（0にしたら削除扱いか等）

**成果物**: `spec.md` に `## Clarifications` セクションが追記される

**承認ゲート**: 回答内容が業務要件と矛盾しないか確認してから次へ。

---

## Phase 2｜外部設計・詳細設計（`/speckit-plan` ＋ 追加プロンプト）

**事前状態**: `docs/tech-stack-template.md`（Phase 0で確定済み）

**投げるプロンプト①（設計本体）**

```
/speckit-plan docs/tech-stack-template.md の技術選定（React+TypeScript/Next.js フロントエンド、
Node.js+TypeScript REST API バックエンド、Docker ローカルコンテナでの動作確認）に基づいて計画を立ててください。
Technical Contextには、ローカル動作確認をdocker composeで行うことを明記してください。
```

**成果物（Spec Kit標準）**: `plan.md`、`research.md`、`data-model.md`、`contracts/`、`quickstart.md`

**投げるプロンプト②（外部設計書・詳細設計書のHTML化）**

Spec Kit標準の`plan.md`一式だけでは、憲法（`.specify/memory/constitution.md` 7章）が求める
「外部設計書＝HTML＋UML準拠」「詳細設計書＝HTMLでパラメータ／修正対象ファイル／処理概要／In-Out」の形にならないため、
`/speckit-plan` 完了後に続けて以下を投げる（Skillではなく通常のプロンプト）：

```
先ほど生成した spec.md と plan.md（data-model.md, contracts/含む）をもとに、
.specify/memory/constitution.md 7章の設計ルールに従って以下2点を作成してください。

1. 外部設計書（specs/<feature>/design/external-design.html）
   - 商品一覧・商品詳細・カート・注文フォーム・注文完了の5画面それぞれについて、
     画面概要・表示項目・操作・画面遷移をまとめる
   - 画面遷移はUML（ステートマシン図 or アクティビティ図）をHTML内にSVGまたは説明図として含める

2. 詳細設計書（specs/<feature>/design/detailed-design.html）
   - data-model.mdのエンティティ、contracts/のAPI仕様をもとに、
     機能・API単位でパラメータ・修正/新規対象ファイル・処理概要・In/Out詳細を表形式でまとめる

（データベースを使う場合）テーブル定義書（specs/<feature>/design/table-definition.html）も
HTMLベースで作成してください。
```

**承認ゲート**: 外部設計書・詳細設計書をアーキテクト/リーダー役がレビューし、実装可能な粒度か確認してから次へ。

---

## Phase 3｜タスク分解（`/speckit-tasks`）

**投げるプロンプト**

```
/speckit-tasks 各ユーザーストーリー（画面単位）ごとに、実装タスクに加えて単体テストタスクも
必ず含めてください（TDD前提: テストタスクを対応する実装タスクより前に配置）。
また、Dockerでのローカル起動に必要なセットアップタスク（Dockerfile、docker-compose.yml作成）を
Setup/Foundationalフェーズに含めてください。
```

**成果物**: `tasks.md`

**承認ゲート**: タスク粒度・MVPスコープ（通常は最優先ユーザーストーリー1つ）を確認してから次へ。

---

## Phase 4｜実装（`/speckit-implement`）

**投げるプロンプト**

```
/speckit-implement
```

（`tasks.md` を順に消化して実装する。チェックリストが未完了の場合は確認が入るので、内容を見て進めてよいか判断する）

**成果物**: アプリケーション資材一式（フロントエンド／バックエンド）、`Dockerfile`／`docker-compose.yml`、単体テストコード

**承認ゲート**: `tasks.md` の全項目が `[X]` になっているか、Lint（`.github/workflows/quality-gate.yml` 相当）が通るかを確認してから次へ。

---

## Phase 5｜単体テスト・テスト結果のまとめ（追加プロンプト）

**投げるプロンプト**

```
実装した単体テストを全て実行し、結果をまとめてください。

- テストコマンドを実行し、成功/失敗件数・カバレッジを取得する
- 失敗したテストがあれば原因を修正し、再実行して全て成功させる
- 実行結果を specs/<feature>/test-results.md にまとめる
  （実行日時・コマンド・件数サマリ・カバレッジ・失敗〜修正の経緯があれば記載）
```

**成果物**: 単体テストコード（実装物に含む）＋ `specs/<feature>/test-results.md`

**承認ゲート**: カバレッジ目標（憲法2章、Phase 0で確定した数値）を満たしているか確認してから次へ。

---

## Phase 6｜ローカル環境（Docker）での動作確認（追加プロンプト）

**投げるプロンプト**

```
docker composeでフロントエンド・バックエンドをローカル起動し、以下の購買フローが
user_requirements.md の受け入れ条件どおりに動作するか、ブラウザで実際に確認してください。

1. 商品一覧が表示される（U-01〜U-03）
2. 商品詳細に遷移し、カートに追加できる（U-04〜U-06）
3. カートで数量変更・削除ができ、合計金額がリアルタイムに更新される（U-07〜U-10）
4. 注文フォームに進み、氏名・住所・メールアドレスの必須/形式バリデーションが効く（U-12〜U-14）
5. 注文を確定すると注文番号付きの完了画面が表示され、一覧に戻れる（U-15〜U-18）

確認結果（スクリーンショット・気づいた不具合）を specs/<feature>/quickstart.md の実行結果として追記してください。
```

**成果物**: 動作確認ログ（`quickstart.md` 更新）、必要に応じてスクリーンショット

**承認ゲート**: 全項目が確認できたらウォーターフォールの「テスト」フェーズ完了として承認。ここまでで要求された成果物（アプリケーション資材／単体テスト＋結果／外部設計書md(=HTML)／詳細設計書md(=HTML)）が揃う。

---

## 補足：今回の依頼内容との差分

- ご依頼では外部設計書・詳細設計書は「mdファイル」指定でしたが、憲法7章の指定（HTML＋UML準拠）を優先する方針にしたため、本ガイドはHTML出力を前提にしています。
- `docs/tech-stack-template.md` はデータベースとCI/CDが未確定のままです。Phase 0で確定させてください。
- `.specify/memory/constitution.md` のプレースホルダー（カバレッジ目標等）も未確定です。Phase 5のカバレッジ判定に影響するため、先に埋めることを推奨します。
