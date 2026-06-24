# Spec Kit 仕様駆動開発セットアップ スレッド記録

---

## Q. これらの指示を Spec Kit を使って仕様駆動開発にするとしたら、どのようなものが必要になりますか？

### A.

#### Spec Kit の仕組み

Spec Kit は「`/speckit.*` スラッシュコマンド」＋「ドキュメント群」＋「憲法ファイル」の3点セットで動きます。Claude Code が **常にドキュメントを読んでから動く** ように強制する仕組みです。

---

#### このプロジェクトで必要になるもの

**1. 憲法ファイル（最優先ルール）**
`.specify/memory/constitution.md`
Claude が絶対に破ってはいけないルールを書く。例：
- 仕様書にない機能を勝手に追加しない
- `DELETE`/`DROP` の実行コマンドを直接生成しない
- 不明点は推測せず人間に確認する

**2. プロジェクト情報ファイル**
`project/docs/project.md`
技術スタック・制約・ブランチ戦略などを記載。今回なら：
- フロント: Next.js / TypeScript（port 3000）
- バック: Express.js / TypeScript（port 4000）
- DB: MySQL on Docker
- 制約: Docker Compose 必須、etc.

**3. 要件定義書**
`project/docs/requirements/requirements.md`
現在 `user_requirements.md` にある内容を Spec Kit テンプレート形式に変換。U-01〜U-18 を `REQ-001` 形式の要件IDに対応させる。

**4. 機能仕様書（画面単位）**
`project/docs/specs/spec.md`（または画面ごとに分割）
各画面の入出力・処理フロー・業務ルールを記述。今回の5画面それぞれについて：
- 入力項目と型・必須/任意
- 正常系・異常系フロー
- 画面遷移先

**5. CLAUDE.md（Claude Code の振る舞い定義）**
`CLAUDE.md`
上記ドキュメントを `@参照` で読み込み、フェーズごとのスラッシュコマンドを案内する。

**6. フェーズ別ルールファイル（オプション）**
`.claude/rules/design.md`、`development.md`、`test.md`
設計・実装・テストそれぞれで Claude に課すルールを分離できる。

---

#### 作業フローのイメージ

```
/speckit.specify   ← 要件定義書・仕様書を読んで仕様を確認
      ↓
/speckit.plan      ← 設計書（API設計・DB設計）のたたき台を生成
      ↓
/speckit.tasks     ← 実装タスクを分解
      ↓
/speckit.implement ← タスク単位でコード生成（仕様書の範囲内のみ）
      ↓
/speckit.analyze   ← 実装と仕様の整合性チェック
```

---

#### 現状とのギャップ

| 必要なもの | 現状 |
|---|---|
| 憲法ファイル | なし（要作成） |
| `project.md` | なし（要作成） |
| 要件定義書（Spec Kit形式） | `user_requirements.md` あり → 変換が必要 |
| 機能仕様書 | なし（要作成） |
| `CLAUDE.md` | `maron19985884-speckit-setup` ブランチに雛形あり |

**一番の肝** は「要件定義書を Spec Kit テンプレートに移し替えること」と「憲法ファイルを書くこと」の2つ。雛形は既に `maron19985884-speckit-setup` ブランチに揃っているので、それを `feature/h1nakamu` に取り込んで中身を埋める形が最短ルート。

---

## 実施内容

以下のファイルを作成し、`feature/h1nakamu` ブランチにコミット・プッシュした。

### 作成ファイル一覧

```
（リポジトリルート）
├── CLAUDE.md                          ← Claude の振る舞い定義・各ドキュメントへの @ 参照
├── .specify/
│   └── memory/
│       └── constitution.md            ← 憲法（最優先ルール）
├── .claude/
│   └── rules/
│       ├── design.md                  ← 設計フェーズのルール
│       ├── development.md             ← 開発フェーズのルール
│       └── test.md                    ← テストフェーズのルール
├── project/
│   ├── docs/
│   │   ├── project.md                 ← 技術スタック・制約・開発ルール
│   │   ├── requirements/
│   │   │   └── requirements.md        ← 要件定義書（REQ-001〜018）
│   │   └── specs/
│   │       └── spec.md                ← 機能仕様書（5画面・API仕様・データモデル）
│   └── specs/
│       └── README.md                  ← Spec Kit 自動生成ファイルの置き場説明
└── notes/
    └── （上記と同じ構成でコピーを配置）
```

---

### 各ファイルの内容

---

#### CLAUDE.md

```markdown
# CLAUDE.md — 書籍販売アプリ（Spec Kit 連携版）

## 最優先ルール（憲法）
@.specify/memory/constitution.md

## プロジェクト情報
@project/docs/project.md

## 要件定義書
@project/docs/requirements/requirements.md

## 機能仕様書
@project/docs/specs/spec.md

## Claude の基本姿勢
- 仕様書・要件定義書に記載のない内容を勝手に追加しない
- 不明点は推測せず「確認が必要です: [内容]」と伝えてから停止する
- 生成した成果物に不確かな箇所がある場合は <!-- 要確認: [理由] --> を付ける
- 最終判断（レビュー・合否・採否）は必ず人間が行う

## フェーズ別ルールとコマンド

| フェーズ | 読み込むルール | 主な成果物 | Spec Kit コマンド |
|---|---|---|---|
| 設計 | @.claude/rules/design.md | docs/design/ 配下 | /speckit.specify → /speckit.plan |
| 開発 | @.claude/rules/development.md | frontend/src/・backend/src/ | /speckit.tasks → /speckit.implement |
| テスト | @.claude/rules/test.md | テストコード | /speckit.analyze |

### コマンド使用手順
# 初回のみ
/speckit.constitution

# 設計フェーズ
/speckit.specify → /speckit.plan

# 開発フェーズ
/speckit.tasks → /speckit.implement

# テスト・整合性チェック
/speckit.analyze
```

---

#### .specify/memory/constitution.md（憲法）

```markdown
# 憲法 — Claude Code 行動原則（書籍販売アプリ）

## I章 基本姿勢
- 仕様書・要件定義書に記載のない機能を勝手に追加しない
- 不明点は推測せず「確認が必要です: [内容]」と伝えてから停止する
- 最終判断は必ず人間が行う
- 不確かな箇所には <!-- 要確認: [理由] --> を付ける

## II章 スコープ外機能（実装禁止）
- ログイン・会員管理
- 決済処理
- 在庫管理
- 管理画面
- レビュー・評価機能
- 検索・フィルター機能

## III章 破壊的操作の禁止
- DELETE/DROP/TRUNCATE 等は提案のみ行い、実行コマンドは生成しない
- 本番データへの直接接続・操作を行わない
- .env ファイルの内容を出力・記録しない

## IV章 コード品質
- マジックナンバーの直書き禁止
- 機密情報のコード直書き禁止
- TypeScript の any 多用禁止
```

---

#### project/docs/project.md

```markdown
# project.md — プロジェクト情報

## 1. プロジェクト概要
- システム名: 個人運営オンライン書店（サンプル）
- 目的: 書籍販売の購買フロー（商品閲覧→カート→注文）を提供する
- 対象業務領域: EC（eコマース）購買フロー

## 2. 技術スタック
- 言語: TypeScript
- フロントエンド: Next.js（port 3000）
- バックエンド: Express.js（port 4000）、REST API
- DB: MySQL 8.x（Docker コンテナ）
- インフラ: Docker / Docker Compose（Windows Docker Desktop）

## 3. 非機能要件
- 性能: 特定なし（開発・学習用途）
- 可用性: ローカル環境のみ
- セキュリティ: .env で認証情報を管理、コードへの直書き禁止

## 4. 制約条件
- Docker Compose で起動する構成を維持すること
- フロントエンド port 3000、バックエンド port 4000 を変更しない

## 5. 開発ルール
- ブランチ戦略: main / feature/<名前> 形式
- コミットメッセージ: feat: / fix: / chore: プレフィックス推奨
- 命名規則（ファイル）: キャメルケース（Next.js 慣例）
- 命名規則（変数・関数）: キャメルケース（TypeScript 慣例）
```

---

#### project/docs/requirements/requirements.md（要件定義書）

| 要件ID | 画面 | 要件名 | 内容 | 優先度 |
|---|---|---|---|---|
| REQ-001 | 商品一覧 | 書籍一覧表示 | グリッド形式で販売中の書籍を表示する | 高 |
| REQ-002 | 商品一覧 | 書籍基本情報表示 | 書影・タイトル・著者・価格を一覧上で表示する | 高 |
| REQ-003 | 商品一覧 | 詳細遷移 | 書籍をクリックすると商品詳細画面へ遷移する | 高 |
| REQ-004 | 商品詳細 | 詳細情報表示 | 書影・タイトル・著者・価格・説明文を表示する | 高 |
| REQ-005 | 商品詳細 | カート追加 | 「カートに追加」ボタンで書籍をカートに追加する | 高 |
| REQ-006 | 商品詳細 | 一覧へ戻る | カート追加後も一覧画面へ戻れる | 高 |
| REQ-007 | カート | カート内容表示 | カート内の書名・単価・数量・小計を表示する | 高 |
| REQ-008 | カート | 数量変更 | 数量を増減でき、小計と合計がリアルタイムに更新される | 高 |
| REQ-009 | カート | 書籍削除 | 書籍をカートから削除でき、合計が即時更新される | 高 |
| REQ-010 | カート | 合計表示 | カート内全商品の合計金額を表示する（送料は対象外） | 高 |
| REQ-011 | カート | 注文フォームへ遷移 | 「注文手続きへ」ボタンで注文フォーム画面へ遷移する | 高 |
| REQ-012 | 注文フォーム | 顧客情報入力 | 氏名・住所・メールアドレスを入力できる（3項目すべて必須） | 高 |
| REQ-013 | 注文フォーム | バリデーション | 未入力・形式不正の場合はエラーメッセージを表示する | 高 |
| REQ-014 | 注文フォーム | 注文内容確認 | 注文商品と合計金額を同一画面で確認できる | 高 |
| REQ-015 | 注文フォーム | 注文確定 | 「注文する」ボタン1つで注文を確定し完了画面へ遷移する | 高 |
| REQ-016 | 注文完了 | 完了メッセージ | 注文完了メッセージを表示する | 高 |
| REQ-017 | 注文完了 | 注文番号表示 | 注文番号を画面上に表示する | 高 |
| REQ-018 | 注文完了 | 一覧へ戻る | 商品一覧へ戻るリンクを表示する | 高 |

スコープ外: ログイン・会員管理 / 決済処理 / 在庫管理 / 管理画面 / レビュー・評価 / 検索・フィルター

---

#### project/docs/specs/spec.md（機能仕様書）

**データモデル**

| モデル | フィールド | 型 | 説明 |
|---|---|---|---|
| Book | id | number | 書籍ID |
| Book | title | string | タイトル |
| Book | author | string | 著者名 |
| Book | price | number | 価格（円、税込） |
| Book | imageUrl | string | 書影URL |
| Book | description | string | 説明文 |
| CartItem | bookId | number | 書籍ID |
| CartItem | quantity | number | 数量（1以上） |
| Order | orderId | string | 注文番号 |
| Order | customerName | string | 氏名 |
| Order | address | string | 住所 |
| Order | email | string | メールアドレス |
| Order | items | CartItem[] | 注文書籍一覧 |
| Order | totalAmount | number | 合計金額 |

**API 仕様**

| メソッド | パス | 概要 |
|---|---|---|
| GET | `/api/books` | 書籍一覧取得 |
| GET | `/api/books/:id` | 書籍詳細取得 |
| POST | `/api/orders` | 注文作成 → `{ orderId: string }` を返す |

**画面別 処理フロー（正常系）**

- SCR-01 商品一覧: `GET /api/books` → グリッド表示 → クリックで SCR-02 へ
- SCR-02 商品詳細: `GET /api/books/:id` → 詳細表示 → カート追加 → SCR-01 へ戻る
- SCR-03 カート: state から表示 → 数量増減・削除でリアルタイム更新 → SCR-04 へ
- SCR-04 注文フォーム: 入力 → バリデーション → `POST /api/orders` → SCR-05 へ
- SCR-05 注文完了: 注文番号表示 → SCR-01 へ戻りカートクリア

**バリデーション（SCR-04）**

| 項目 | 必須 | ルール |
|---|---|---|
| 氏名 | ○ | 1文字以上 |
| 住所 | ○ | 1文字以上 |
| メール | ○ | RFC準拠のメール形式 |

---

#### .claude/rules/design.md

```markdown
- docs/requirements/requirements.md を必ず読んでから設計を開始する
- 設計書は docs/design/ 配下に Mermaid 記法で図を含めて作成する
- スコープ外機能の設計は行わない
- API 設計は docs/specs/spec.md の API 仕様と整合すること
- DB テーブル設計は MySQL 8.x の構文に準拠すること
```

#### .claude/rules/development.md

```markdown
- docs/specs/spec.md を必ず読んでから実装を開始する
- 実装は仕様書に記載された画面・API の範囲のみ行う
- TypeScript の any 型は原則禁止
- フロントエンドの変更は frontend/src/ 配下に行う
- バックエンドの変更は backend/src/ 配下に行う
- 環境変数は .env で管理し、コードへの直書きを禁止する
- Docker Compose 構成（port 3000 / 4000）を変更しない
```

#### .claude/rules/test.md

```markdown
- docs/specs/spec.md の正常系・異常系フローを網羅すること
- バリデーション（REQ-013）は境界値テストを必ず含める
- カートの数量変更・合計計算（REQ-008〜010）は単体テストで確認する
- API エンドポイントは結合テストを作成する
- テストファイルは __tests__/ または .test.ts 形式で配置する
```

---

## 次のステップ

```
/speckit.constitution   ← 初回のみ（憲法・ドキュメントの読み込み）
/speckit.specify        ← 仕様確認
/speckit.plan           ← 設計書生成（DB・API設計）
/speckit.tasks          ← 実装タスク分解
/speckit.implement      ← コード生成
/speckit.analyze        ← 実装と仕様の整合性チェック
```
