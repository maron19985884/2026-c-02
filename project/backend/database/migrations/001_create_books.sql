-- 書籍テーブル作成
CREATE TABLE IF NOT EXISTS books (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255) NOT NULL,
  price       INT          NOT NULL,
  description TEXT,
  image_url   VARCHAR(500)
);
