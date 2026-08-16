# Research: 商品一覧・商品詳細

`docs/tech-stack-template.md`で技術は確定済みのため、`[NEEDS CLARIFICATION]`項目は残っていない。以下は実装方式に関する補足決定事項。

## 1. フロントエンドのテスト構成

**Decision**: Vitest + React Testing Library（`environment: "jsdom"`）を使用する。

**Rationale**: Next.js 14はVitestとの組み合わせが公式にサポートされており、バックエンド（後述）と共通のテストランナーで運用を統一できる。

**Alternatives considered**: Jest（Next.jsの従来標準）。バックエンドと異なるテスト設定・依存関係を持つことになり、運用の一貫性が下がるため見送った。

## 2. バックエンドAPIの統合テスト

**Decision**: Supertestを使用し、Expressアプリに対してHTTPリクエストを直接発行する形でテストする。

**Rationale**: サーバープロセスを別途起動せずにルーティング・レスポンス形状を検証できる、軽量な統合テスト手法。

**Alternatives considered**: 実サーバーを起動してのE2Eテスト。環境構築コストが高く、本機能の規模（読み取り専用API2本）には見合わないため見送った。

## 3. カート追加操作の保持先

**Decision**: ブラウザの`localStorage`にクライアント側でのみ保持する。サーバー側の永続化は行わない。

**Rationale**: spec.mdのAssumptionsで「カートの中身確認・数量変更・削除・合計金額表示は別機能（カート画面）の範囲」と明記されている。本機能はカートへの追加操作の起点のみを提供すればよく、YAGNI原則に従い、未着手のカート機能のためにサーバー側セッション基盤を先取りして構築しない。

**Alternatives considered**: サーバー側セッション／DBテーブルでのカート永続化。本機能のスコープを超えるため却下。次のカート機能（REQ-007〜011）を実装する際に、この`cartStore.ts`を読み書きする形で本格化させる想定。

## 4. MySQL接続方式

**Decision**: `mysql2/promise`によるコネクションプール（`createPool()`）を使用する。

**Rationale**: Node.js向けMySQLドライバとして実績があり、Promiseベースの非同期処理と親和性が高い。

**Alternatives considered**: Sequelize等のORM。本機能は読み取り専用の単純なクエリ2種類のみであり、ORM導入のオーバーヘッドが見合わないため見送った。
