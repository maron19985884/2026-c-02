# CLAUDE.md — チーム開発標準(GitHub Spec Kit連携版)

> このファイルはGit管理対象。チーム全員が同じルールでClaude Codeを使うための共通設定。
> **編集する場合はチームレビューを経ること。個人設定は `CLAUDE.local.md` に記載。**

---

## ⚠️ ルールの正本について

全社共通の「絶対に破ってはならない原則」(データ保護・破壊的操作禁止等を含む)は
**`.specify/memory/constitution.md`(Spec Kit憲法)を正本とする**。
本ファイルはClaude Code起動時の振る舞いと、フェーズ別ルールへの導線を定義する。

@.specify/memory/constitution.md

## プロジェクト情報
@docs/project.md

## 要件定義書
@docs/requirements/requirements.md

## 機能仕様書
@docs/specs/spec.md

---

## Claudeの基本姿勢

- 設計書・仕様書に記載のない内容を勝手に追加しない
- 不明点は推測せず「確認が必要です: [内容]」と伝えてから停止する
- 生成した成果物に不確かな箇所がある場合は `<!-- 要確認: [理由] -->` を付ける
- 最終判断(レビュー・合否・採否)は必ず人間が行う
- データ削除・破壊を伴う操作は **提案のみ行い、実行コマンドは生成しない**(詳細は憲法 III章)

---

## フェーズ別ルール

作業フェーズに応じて以下を参照する。Spec Kit導入後は、各フェーズで対応する
スラッシュコマンドを使うことを推奨する(従来の標準プロンプトも併用可)。

| フェーズ | 読み込むルール | 主な成果物 | Spec Kitコマンド |
|---|---|---|---|
| 設計 | @.claude/rules/design.md | `docs/design/` 配下の設計書 | `/speckit.specify` → `/speckit.plan` |
| 開発 | @.claude/rules/development.md | `src/` 配下のコード | `/speckit.tasks` → `/speckit.implement` |
| テスト | @.claude/rules/test.md | `tests/` 配下のテストコード・ケース | `/speckit.analyze`(整合性チェック) |

### フェーズの指定方法

**従来方式(標準プロンプト)**
```
設計フェーズ: 「docs/ 配下を読んで設計を開始してください」
開発フェーズ: 「docs/design/ を読んで実装を開始してください」
テストフェーズ: 「src/ と docs/design/ を読んでテストを作成してください」
```

**Spec Kit方式(推奨・要 specify init 済み)**
```
初回のみ:    /speckit.constitution   ← .specify/memory/constitution.md を読込/更新
設計フェーズ: /speckit.specify  →  /speckit.plan
開発フェーズ: /speckit.tasks   →  /speckit.implement
テストフェーズ: /speckit.analyze（実装前の整合性チェック）
```

> 💡 どちらの方式でも `.specify/memory/constitution.md` の制約が最優先で適用される運用とする。
> チームでスラッシュコマンド方式に統一する場合は、本セクションの「従来方式」を削除してよい。

---

## 共通コーディング規約

### 命名規則
| 対象 | 規則 | 例 |
|---|---|---|
| ファイル名 | スネークケース | `invoice_loader.py` |
| クラス名 | パスカルケース | `InvoiceLoader` |
| 関数・変数名 | スネークケース | `load_invoice()` |
| 定数 | 大文字スネークケース | `MAX_RETRY_COUNT` |
| DBテーブル物理名 | スネークケース | `ap_invoice_header` |
| DBカラム物理名 | スネークケース | `vendor_cd` |

### 禁止事項(全フェーズ共通・詳細は憲法 III章)
- マジックナンバーの直書き禁止(定数化またはコメントで意味を明記)
- 機密情報(パスワード・APIキー)のコード直書き禁止
- 設計書に記載のない機能の無断追加禁止
- データ削除・破壊を伴うコマンド(`DELETE`/`DROP`/`TRUNCATE`等)の直接生成禁止

---

## ドキュメント規約

### 設計書
- **変更履歴セクション**を全設計書の先頭に設ける
- **バージョン管理**はファイル名に `_vX.Y` を付与(例: `table_def_v1.0.md`)
- 図・ダイアグラムは **Mermaid記法** を標準とする

### コードコメント
- 関数・メソッドには必ずdocstringまたは同等のコメントを付ける
- 「何をしているか」ではなく「なぜそうしているか」をコメントする
- 未解決事項は `TODO: [内容] (@担当者名)` 形式で記載する
