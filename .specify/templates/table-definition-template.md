# テーブル定義書テンプレート

> **位置づけ**: `/speckit.design table` を実行すると AI が本テンプレートをもとにテーブル定義書を生成します。
> 生成後、人間がレビューし内容を承認してください。
> 本ファイルを直接編集する必要はありません。
>
> 関連: [憲法 §7](../memory/constitution.md) / [利用指南書 §4-7](../../README.md)

---

<!-- AI生成時の指示: 本テンプレートに従い、HTMLベースのテーブル定義書を生成すること。data-model.md のエンティティ定義を元データとする。 -->

## メタ情報

| 項目 | 内容 |
|---|---|
| ドキュメントID | TABLE-[連番] |
| 対象フィーチャー | （`specs/[###-feature-name]/` へのリンク） |
| 元データ | `specs/[###]/data-model.md` |
| 作成日 | |
| 作成者 | AI生成（`/speckit.design table`） |
| 承認者 | |
| 承認日 | |
| バージョン | 1.0 |

---

## 1. テーブル一覧

| テーブルID | テーブル名（物理名） | テーブル名（論理名） | 概要 |
|---|---|---|---|
| TBL-001 | | | |
| TBL-002 | | | |

---

## 2. テーブル定義詳細

> テーブルごとに以下のセクションを繰り返す。

### 2.1 [テーブル名（物理名）] / [テーブル名（論理名）]

**テーブル概要**: （このテーブルが管理するデータを1〜2行で説明）

#### カラム定義

| # | カラム名（物理） | カラム名（論理） | データ型 | 長さ | NOT NULL | デフォルト値 | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | id | ID | BIGINT | | ✓ | AUTO_INCREMENT | PK |
| 2 | created_at | 作成日時 | DATETIME | | ✓ | CURRENT_TIMESTAMP | |
| 3 | updated_at | 更新日時 | DATETIME | | ✓ | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

#### インデックス

| インデックス名 | 種別 | 対象カラム | 用途 |
|---|---|---|---|
| PRIMARY | PRIMARY KEY | id | |
| idx_... | UNIQUE / INDEX | | |

#### 制約

| 制約名 | 種別 | 対象カラム | 参照先 |
|---|---|---|---|
| fk_... | FOREIGN KEY | [カラム名] | [テーブル名].[カラム名] |
| chk_... | CHECK | [カラム名] | [条件] |

---

## 3. ER 図（HTMLベース）

```html
<!-- ここにHTMLベースのER図を生成する -->
<!-- エンティティ間の主キー・外部キー関係を図示する -->
```

---

## 4. DDL（参考）

> ⚠️ 本 DDL は設計確認用の参考情報です。本番環境への適用はマイグレーションスクリプト経由で行い、
> `DROP` / `TRUNCATE` 等の破壊的DDLは生成しないこと（憲法§1参照）。

```sql
-- TBL-001: [テーブル名]
CREATE TABLE IF NOT EXISTS table_name (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

---

## 5. 承認

| 役割 | 氏名 | 承認日 | 判定（承認／差し戻し） |
|---|---|---|---|
| 作成者（AI生成確認者） | | | — |
| アーキテクト / テックリード / DB担当 | | | |
| PM / プロジェクトリーダー | | | |
