-- 注文テーブル作成
CREATE TABLE IF NOT EXISTS orders (
  id               INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(50)  NOT NULL UNIQUE,
  customer_name    VARCHAR(255) NOT NULL,
  customer_address TEXT         NOT NULL,
  customer_email   VARCHAR(255) NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 注文アイテムテーブル作成
CREATE TABLE IF NOT EXISTS order_items (
  id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  book_id     INT NOT NULL,
  quantity    INT NOT NULL,
  unit_price  INT NOT NULL,
  CONSTRAINT chk_quantity CHECK (quantity > 0),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (book_id)  REFERENCES books(id)
);
