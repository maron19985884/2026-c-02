-- ============================================================
-- 003-bookstore-purchase-flow / スキーマ定義
-- docker-entrypoint-initdb.d により初回起動時に自動実行される。
-- 破壊的 DDL（DROP / TRUNCATE）は置かない（憲法 §1）。
-- 参照: specs/003-bookstore-purchase-flow/table-definition.md
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- TBL-001: books  書籍カタログ（本機能からは参照のみ）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title           VARCHAR(255)    NOT NULL,
  author          VARCHAR(255)    NOT NULL,
  price           INT UNSIGNED    NOT NULL,
  cover_image_url VARCHAR(1024)   NOT NULL,
  description     TEXT            NOT NULL,
  status          ENUM('selling','unlisted') NOT NULL DEFAULT 'selling',
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_books_status_id (status, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TBL-002: orders  確定した注文（ヘッダ）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number     VARCHAR(32)     NOT NULL,
  customer_name    VARCHAR(255)    NOT NULL,
  customer_address VARCHAR(1000)   NOT NULL,
  customer_email   VARCHAR(255)    NOT NULL,
  total_amount     INT UNSIGNED    NOT NULL,
  ordered_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TBL-003: order_items  注文明細（注文時点の書名・単価をスナップショット）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id            BIGINT UNSIGNED NOT NULL,
  book_id             BIGINT UNSIGNED NULL,
  title_snapshot      VARCHAR(255)    NOT NULL,
  unit_price_snapshot INT UNSIGNED    NOT NULL,
  quantity            INT UNSIGNED    NOT NULL,
  subtotal            INT UNSIGNED    NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_book  FOREIGN KEY (book_id)  REFERENCES books (id)  ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_order_items_quantity CHECK (quantity BETWEEN 1 AND 99)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
