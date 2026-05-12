-- ============================================================
-- MySQL 初期化スクリプト
-- docker-compose 起動時に自動実行されます
-- スキーマ変更時は docker compose down -v してから再起動してください
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- products テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          INT           NOT NULL AUTO_INCREMENT,
  title       VARCHAR(255)  NOT NULL,
  author      VARCHAR(255)  NOT NULL,
  price       INT           NOT NULL CHECK (price >= 0),
  image_url   TEXT          NULL,
  description TEXT          NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NULL     DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- orders テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               INT           NOT NULL AUTO_INCREMENT,
  order_number     VARCHAR(20)   NOT NULL,
  customer_name    VARCHAR(100)  NOT NULL,
  customer_address TEXT          NOT NULL,
  customer_email   VARCHAR(255)  NOT NULL,
  total_amount     INT           NOT NULL CHECK (total_amount >= 0),
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NULL     DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- order_items テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         INT          NOT NULL AUTO_INCREMENT,
  order_id   INT          NOT NULL,
  product_id INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  price      INT          NOT NULL,
  quantity   INT          NOT NULL CHECK (quantity >= 1),
  subtotal   INT          NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order_id
    FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_order_items_product_id
    FOREIGN KEY (product_id) REFERENCES products (id),
  INDEX idx_order_items_order_id   (order_id),
  INDEX idx_order_items_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- サンプルデータ（開発・動作確認用）
-- ============================================================
INSERT INTO products (title, author, price, description) VALUES
  ('Clean Code', 'Robert C. Martin', 3520, 'プログラマのためのクリーンコード入門。読みやすく保守しやすいコードを書くためのプラクティスを解説。'),
  ('Design Patterns', 'Gang of Four', 4950, 'オブジェクト指向設計における23のデザインパターンを解説した古典的名著。'),
  ('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 3080, 'ソフトウェア開発者としての実践的な思考法とツールを網羅した必読書。'),
  ('Refactoring', 'Martin Fowler', 4180, 'レガシーコードを安全かつ段階的に改善するためのリファクタリング手法を解説。'),
  ('Structure and Interpretation of Computer Programs', 'Harold Abelson, Gerald Jay Sussman', 3960, 'コンピュータサイエンスの古典。計算の本質を関数型の視点から丁寧に解説。');
