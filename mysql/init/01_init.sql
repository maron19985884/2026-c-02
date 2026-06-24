SET NAMES utf8mb4;

-- ============================================================
-- 書籍マスタ
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255) NOT NULL,
  price       INT          NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 注文ヘッダ
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(20)  NOT NULL UNIQUE,
  customer_name   VARCHAR(100) NOT NULL,
  address         VARCHAR(500) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  total_amount    INT          NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 注文明細
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  book_id      INT NOT NULL,
  quantity     INT NOT NULL,
  price        INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (book_id)  REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- サンプルデータ
-- ============================================================
INSERT INTO books (title, author, price, description, image_url) VALUES
('Clean Code', 'Robert C. Martin', 3200, '読みやすく保守しやすいコードを書くための実践的なガイド。命名・関数・コメント・テストなど、プロが知るべき原則を網羅。', 'https://placehold.co/300x400?text=Clean+Code'),
('リーダブルコード', 'Dustin Boswell / Trevor Foucher', 2640, 'より良いコードを書くためのシンプルで実践的な原則集。コードは他の人が読むために書くという視点から解説。', 'https://placehold.co/300x400?text=Readable+Code'),
('ドメイン駆動設計', 'Eric Evans', 6600, 'ソフトウェアの複雑さに立ち向かうための設計手法。ユビキタス言語・境界づけられたコンテキストなどの概念を解説。', 'https://placehold.co/300x400?text=DDD'),
('Design Patterns', 'Gang of Four', 5280, 'ソフトウェア設計の23のパターンを解説した古典的名著。オブジェクト指向設計の共通言語として世界中で読まれている。', 'https://placehold.co/300x400?text=Design+Patterns'),
('プロを目指す人のためのTypeScript入門', '鈴木僚太', 3300, 'TypeScriptの型システムを基礎から丁寧に解説。実務で通用するTypeScriptの書き方が身につく一冊。', 'https://placehold.co/300x400?text=TypeScript'),
('独学プログラマー', 'Cory Althoff', 2200, 'プログラミング未経験者がPythonを学びながらプロのエンジニアになるまでのロードマップを示す。', 'https://placehold.co/300x400?text=Self-Taught');
