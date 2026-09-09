-- ============================================================
-- orders / order_items テーブル定義
-- docker-compose 起動時に自動実行されます（01_init.sql の後に実行）
-- ============================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  order_number      VARCHAR(26) NOT NULL UNIQUE,
  customer_name     VARCHAR(255) NOT NULL,
  customer_address  VARCHAR(512) NOT NULL,
  customer_email    VARCHAR(255) NOT NULL,
  total_amount      INT NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  book_id     INT NOT NULL,
  book_title  VARCHAR(255) NOT NULL,
  unit_price  INT NOT NULL,
  quantity    INT NOT NULL,
  subtotal    INT NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_book FOREIGN KEY (book_id) REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
