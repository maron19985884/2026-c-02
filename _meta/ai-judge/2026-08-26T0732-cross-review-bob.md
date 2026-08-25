# AI as a Judge — 評価結果クロスレビュー

> **作成日時**: 2026-08-26 07:32
> **作成者**: Bob (IBM Bob Agent)
> **目的**: 第3回評価（Bob 07:03）と第3回評価（Claude Sonnet 5 07:19）の指摘を突き合わせ、対応優先順位を統合整理する
> **参照元**:
> - [`2026-08-26T0703-ai-review-bob.md`](2026-08-26T0703-ai-review-bob.md)（Bob評価、83/100）
> - [`2026-08-26-0719-claude-sonnet-5-ai-review.md`](2026-08-26-0719-claude-sonnet-5-ai-review.md)（Claude Sonnet 5評価、87/100）

---

## スコア比較

| 観点 | Bob（07:03） | Claude Sonnet 5（07:19） | 差 |
|---|---|---|---|
| ① フロー設計 | 17/20 | 19/20 | +2（Claude） |
| ② AI命令の精度 | 17/20 | 18/20 | +1（Claude） |
| ③ ウォーターフォール整合 | 18/20 | 18/20 | ±0 |
| ④ 汎用性・移植性 | 16/20 | 15/20 | +1（Bob） |
| ⑤ 保守性・一貫性 | 15/20 | 17/20 | +2（Claude） |
| **総合** | **83/100** | **87/100** | **+4（Claude）** |

### スコア差の解釈

4点差は許容範囲内。Claude Sonnet 5 は自己評価であることを自己開示した上で事実ベースに絞った評価姿勢を取っており誠実だが、自分が修正した箇所を正確に把握しているため①②に軽度の加点バイアスが働いている可能性がある。③（ウォーターフォール整合）で一致したことは、今回の最重要改善軸に対する評価の信頼性を裏付ける。

---

## 指摘の全量マッピング

| 指摘内容 | Bob | Claude | 判断 |
|---|---|---|---|
| `quality-gate.yml` の言語対応不足・未対応言語でのフェイルセーフ | N-2（MEDIUM） | N-5（LOW・既知継続） | **両者一致。** Claudeは「既知・別タスク」として重大度を下げており妥当 |
| `tasks-template.md` Phase 2 のWebアプリ残存（`T004 Setup database schema` 等） | N-1（MEDIUM） | ✗ | **Bobのみ。** F-2対応の漏れとして有効。Phase 3 以降は汎用化されたが Phase 2 が取り残された |
| `plan-template.md` の「閉じた3択」表現（Option 1/2/3 以外も可という明示がない） | ✗ | N-3（LOW） | **Claudeのみ。** F-2対応の設計意図がテンプレート本体に書かれていないという、より深い観点。有効 |
| `how-to-use.md` §3① に `_meta/` 削除ステップがない | N-4（LOW） | ✗ | **Bobのみ。** 実用的。`_meta/README.md` にのみ記載では見落とされる |
| `CLAUDE.md` コマンド表が不完全（design/review/testplan/change の4コマンド未掲載） | N-5（LOW） | ✗ | **Bobのみ。** AI の動作改善に直結。Claude 起動時の認識に影響する |
| `changelog.md` の見出し番号欠落（対処9の独立見出しがない） | ✗ | N-1（LOW） | **Claudeのみ。** 保守性の観点から有効。番号だけを頼りに本文を検索すると見つからない |
| `overview.md` 構成図の陳腐化（`guides/`・`.specify/templates/`・`_meta/` が未反映） | ✗ | N-2（LOW） | **Claudeのみ。** 有効。入口ドキュメントとして実態との乖離を解消すべき |
| ウォーターフォール専用機能の `.specify/templates/` 混在（既知継続） | ✗ | N-4（LOW〜MEDIUM・既知） | **Claudeのみ（`changelog.md` 対処22記録済み）。** 設計判断を要する別課題 |
| `requirements-template.md` に実物ファイルへのリンクがない（`tech-stack-template.md` との非対称） | N-3（LOW） | ✗ | **Bobのみ。** 軽微だが対称性の観点で有効 |

**有効な指摘：計8件（重複1件を統合）**。両者の評価が互いの見落としを補完しており、組み合わせることで網羅性が向上している。

---

## 統合版 対応優先順位

| # | 対応内容 | 難度 | 出典 |
|---|---|---|---|
| 1 | `tasks-template.md` Phase 2 タスクに「Project Type によっては削除/調整すること」注記を追加 | 低 | Bob N-1 |
| 2 | `CLAUDE.md` フェーズ別コマンド表に残り4コマンド（design/review/testplan/change）を追加 | 低 | Bob N-5 |
| 3 | `plan-template.md` のOption一覧末尾に「上記に当てはまらない場合は独自構成を定義してよい」を追記 | 低 | Claude N-3 |
| 4 | `how-to-use.md` §3① に `_meta/` 削除ステップを追加 | 低 | Bob N-4 |
| 5 | `_meta/changelog.md` の対処9に独立した見出しを追加（または要約テーブルに「対処8に含む」と注記） | 低 | Claude N-1 |
| 6 | `docs/overview.md` の構成図を現状（`guides/`・`.specify/templates/`・`_meta/` 等）に合わせて全面更新 | 中 | Claude N-2 |
| 7 | `requirements-template.md` ヘッダーに実物ファイル（`../../requirements.md`）へのリンクを追加 | 低 | Bob N-3 |
| 8 | `quality-gate.yml` に Java ブロック（`pom.xml`/`build.gradle` 判定）を追加 | 中 | 両者 |
| 9 | ウォーターフォール専用機能（review/testplan/change 系）の preset 分離を別課題として設計検討 | 高（設計判断） | Claude N-4 |

1〜5・7 は1〜数行の修正で完結する低難度の作業。6・8 は中程度。9 は別セッションで設計判断が必要。

---

## 次のアクション

上記統合優先順位に基づき、`_meta/changelog.md` に対処番号を付けて対処記録を追加しながら修正を進める。
