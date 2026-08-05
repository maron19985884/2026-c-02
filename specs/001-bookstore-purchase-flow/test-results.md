# 単体テスト結果：個人運営オンライン書店（購買フロー特化版）

**実施日**: 2026-08-05
**実施方法**: ⚠️ **静的コードレビューのみ**（`npm test` の実機実行は未実施）

## 実施方法についての重要な注記

このセッションの実行環境（Bashサンドボックス／PowerShell）には Node.js・npm・Docker が一切インストールされておらず（PATH上・既知のインストール先のいずれにも存在しないことを確認済み）、`npm install` や `npm test`、`docker compose up` を実際に実行することができなかった。

そのため本結果は、以下のテストコードと実装コードを人手（Claude Code）で通し読みし、ロジックの整合性を确認した**静的レビューの記録**であり、**実際にテストランナーを実行して得たPASS/FAILの結果ではない**。憲法2章「テストのない実装はレビューで差し戻す」は満たすが、「カバレッジ目標80%以上」の数値としての実測はできていない。

**実機（Node.js/Docker環境）でのテスト実行を強く推奨する。** 実行手順は以下のとおり。

```bash
# バックエンド
cd backend
npm install
npm run lint
npm test

# フロントエンド
cd frontend
npm install
npm run lint
npm test
```

## 静的レビュー対象と結果

| ファイル | 対象 | 対応要件 | レビュー結果 |
|---|---|---|---|
| `backend/tests/unit/bookService.test.ts` | 一覧取得（description除外）／詳細取得／該当なし | FR-001, FR-002, FR-003, FR-004 | 実装（`bookService.ts`）とアサーションの対応関係を確認。矛盾なし |
| `backend/tests/unit/orderValidation.test.ts` | 必須チェック・メール形式チェック・items空チェック | FR-012, FR-013, FR-020 | 実装（`orderValidation.ts`）の分岐とテストケースが一致することを確認 |
| `backend/tests/unit/orderNumber.test.ts` | `ORD-YYYYMMDD-NNNN`形式・0埋め | research.md 6 | `generateOrderNumber`のpadStart処理とテスト期待値が一致することを確認 |
| `backend/tests/unit/orderService.test.ts` | 小計/合計計算・スナップショット保存・存在しない書籍でのエラー・同日連番 | FR-制約全般 | トランザクション内のINSERT順序、`nextOrderNumber`のLIKE検索ロジックを確認。2件目の注文で連番が+1されることをロジック上確認 |
| `frontend/tests/unit/cart.test.ts` | 追加（重複時は数量加算）／増減（下限1）／削除／合計 | FR-021, FR-022 | `lib/cart.ts`の純粋関数とテストケースの対応を確認 |
| `frontend/tests/unit/validation.test.ts` | 必須チェック・メール形式チェック | FR-013 | `lib/validation.ts`の正規表現・分岐とテストケースを確認 |
| `frontend/tests/unit/OrderCompleteMessage.test.tsx` | 注文なし時の文言／注文番号・完了メッセージ表示 | FR-016, FR-017 | コンポーネントの条件分岐とテストの期待テキストが一致することを確認 |

## 既知のリスク（実機実行前に注意）

- 各`package.json`に列挙した依存パッケージのバージョンは執筆時点の想定であり、実際に`npm install`した際にバージョン起因の非互換が発生する可能性がある
- TypeScriptコンパイラによる型チェックは未実施のため、型エラーが実機の`npm test`/`npm run build`で初めて顕在化する可能性がある
- `better-sqlite3`はネイティブモジュールのため、`node:20-alpine`イメージでのビルド時にビルドツール不足で失敗する可能性がある（発生した場合は`node:20`イメージへの切り替え、または`apk add python3 make g++`の追加を検討）

## 次のアクション

1. 実機で上記コマンドを実行し、実際のPASS/FAIL結果とカバレッジ数値を得る
2. 失敗したテスト・型エラー・ビルドエラーがあれば、このファイルを更新して修正内容を記録する
3. 全テストPASS・カバレッジ80%以上を確認できた時点で、憲法2章のテスト基準を満たしたものとして扱う
