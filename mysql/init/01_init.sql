-- ============================================================
-- オンライン書店 スキーマ
-- docker-compose 起動時に自動実行されます
-- ============================================================

SET NAMES utf8mb4;

-- books: 販売書籍
CREATE TABLE IF NOT EXISTS books (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  author      VARCHAR(255)  NOT NULL,
  price       INT           NOT NULL,
  description TEXT          NOT NULL,
  image_url   VARCHAR(500)  NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- orders: 確定した注文
CREATE TABLE IF NOT EXISTS orders (
  id             INT           AUTO_INCREMENT PRIMARY KEY,
  order_number   VARCHAR(20)   NOT NULL UNIQUE,
  customer_name  VARCHAR(255)  NOT NULL,
  address        TEXT          NOT NULL,
  email          VARCHAR(255)  NOT NULL,
  total_amount   INT           NOT NULL,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- order_items: 注文明細
CREATE TABLE IF NOT EXISTS order_items (
  id          INT  AUTO_INCREMENT PRIMARY KEY,
  order_id    INT  NOT NULL,
  book_id     INT  NOT NULL,
  quantity    INT  NOT NULL,
  unit_price  INT  NOT NULL,
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_book  FOREIGN KEY (book_id)  REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
