-- ============================================================
-- オンライン書店 購買フロー スキーマ
-- 対象: specs/004-bookstore-purchase-flow/table-definition.md (TABLE-004)
-- docker-compose 起動時（データベースが空のとき）に自動実行されます
--
-- 文字コード: utf8mb4 / 照合順序: utf8mb4_unicode_ci
-- 作成順序は外部キーの依存関係に従い books -> orders -> order_items
-- ※ 憲法§1 に従い DROP / TRUNCATE 等の破壊的DDLは記述しない
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- TBL-001: books（書籍）
-- 初期データとして投入し、アプリケーションからは参照のみ（FR-001b）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title           VARCHAR(255) NOT NULL,
  author          VARCHAR(255) NOT NULL,
  price           INT UNSIGNED NOT NULL,
  description     TEXT         NOT NULL,
  cover_image_url VARCHAR(512) DEFAULT NULL,
  is_available    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_books_is_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='書籍。初期データとして投入し、アプリケーションからは参照のみ';

-- ------------------------------------------------------------
-- TBL-002: orders（注文）
-- 確定後は更新しない（追記のみ）。updated_at を持たない
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number     CHAR(26)     NOT NULL,
  customer_name    VARCHAR(100) NOT NULL,
  customer_address VARCHAR(255) NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  total_amount     INT UNSIGNED NOT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='注文ヘッダ。確定後は更新しない（追記のみ）';

-- ------------------------------------------------------------
-- TBL-003: order_items（注文明細）
-- title / unit_price は注文時点のスナップショット（FR-024 / SC-006）
-- book_id は NULL 可。書籍が削除されても注文記録を残すため
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id   INT UNSIGNED NOT NULL,
  book_id    INT UNSIGNED DEFAULT NULL,
  title      VARCHAR(255) NOT NULL,
  unit_price INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL,
  subtotal   INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_book_id (book_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT fk_order_items_book
    FOREIGN KEY (book_id) REFERENCES books (id)
    ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT chk_order_items_quantity CHECK (quantity >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='注文明細。title / unit_price は注文時点のスナップショット';
