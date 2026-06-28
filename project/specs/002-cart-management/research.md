# Research: カート機能（追加・変更・削除）

**Feature**: 002-cart-management
**Date**: 2026-06-28

## 1. カート状態管理の場所とスコープ

**Decision**: フロントエンドのReact Context のみで完結。バックエンドAPIは不要。

**Rationale**:
- 仕様（spec.md 前提条件）に「カートの保持はセッション単位（ブラウザを閉じると消去）」と明記
- サーバー永続化不要のため、DBテーブルもバックエンドAPIも実装しない
- React ContextはNext.js Pages Routerで標準的に使用でき、外部ライブラリ不要

**Alternatives considered**:
- Redux / Zustand: 学習用途でオーバースペック。Context APIで十分
- localStorage: ブラウザを閉じてもデータが残るため、仕様（セッション単位）に反する
- バックエンドセッションAPI: 不要な複雑性を追加し、スコープ外の実装になる

## 2. リアルタイム更新（数量変更・削除時の合計更新）

**Decision**: CartContextのstateから毎回 `useMemo` または計算関数で合計金額を算出し、React の再レンダリングで即時更新する

**Rationale**:
- 数量変更・削除で `setState` を呼ぶと自動的に再レンダリングが走り、合計金額が即時更新される
- 「リアルタイム更新」「即時更新」の要件はReactの標準的なstate更新で実現できる
- 追加ライブラリや非同期処理は不要

**Alternatives considered**:
- debounce を挟んだ更新: 遅延が発生し「即時」要件を満たせない
- APIを経由して合計をサーバーで計算: 不要な複雑性

## 3. 同一書籍の重複追加防止（数量加算）

**Decision**: `addToCart` 関数内で `cartItems.find(item => item.bookId === newItem.bookId)` を使って既存エントリを探し、存在する場合は `quantity + 1` にする

**Rationale**:
- spec.md FR-002・業務ルール「同一書籍を追加した場合、数量を加算する」に準拠
- シンプルな配列操作で実現できる
- 常に新エントリ追加を防ぐ防御的コーディング

**Alternatives considered**:
- 常に新エントリを追加してUIで集計: データの重複が発生し管理が複雑になる

## 4. 数量の下限制御（FR-010: 1未満への減算禁止）

**Decision**: 減算ボタンは数量が1のとき disabled にする（または押下を無視する）

**Rationale**:
- spec.md FR-010「数量の下限は1とし、1未満への減算操作は受け付けない」に準拠
- 削除は別の削除ボタンで実施するため、数量0→削除の変換は不要

**Alternatives considered**:
- 数量0になったら自動削除: spec.mdの「削除ボタンを使用する」という前提に反する
