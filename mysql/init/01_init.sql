SET NAMES utf8mb4;

-- ============================================================
-- 書籍テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)   NOT NULL,
  author      VARCHAR(255)   NOT NULL,
  price       INT            NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 注文テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_name    VARCHAR(100)   NOT NULL,
  customer_address VARCHAR(500)   NOT NULL,
  customer_email   VARCHAR(255)   NOT NULL,
  total_amount     INT            NOT NULL CHECK (total_amount >= 0),
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 注文明細テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT  NOT NULL,
  book_id    INT  NOT NULL,
  quantity   INT  NOT NULL CHECK (quantity > 0),
  unit_price INT  NOT NULL CHECK (unit_price >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id)  REFERENCES books(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- サンプル書籍データ
-- ============================================================
INSERT INTO books (title, author, price, description, image_url) VALUES
  ('JavaScript 第7版',        'David Flanagan',   4840, 'JavaScriptの決定版テキスト。言語仕様から実践的な使い方まで網羅した定番書。', 'https://placehold.co/200x280?text=Book1'),
  ('リーダブルコード',          'Dustin Boswell',   2640, 'より良いコードを書くための実践的なテクニックを解説。読みやすさの哲学を学ぶ一冊。', 'https://placehold.co/200x280?text=Book2'),
  ('Clean Architecture',     'Robert C. Martin', 4180, 'ソフトウェア設計の原則と実践。保守性・拡張性の高いシステムを構築するための指針。', 'https://placehold.co/200x280?text=Book3'),
  ('プログラミングTypeScript', 'Boris Cherny',     3520, 'TypeScriptの型システムを徹底解説。安全で堅牢なコードを書くための実践ガイド。', 'https://placehold.co/200x280?text=Book4'),
  ('SQLアンチパターン',        'Bill Karwin',      3520, 'データベース設計・クエリにおける25のアンチパターンとその回避策を解説。', 'https://placehold.co/200x280?text=Book5'),
  ('ゼロから作るDeep Learning', '斎藤 康毅',        3740, 'Pythonで実装しながら学ぶディープラーニング入門。理論と実装を橋渡しする良書。', 'https://placehold.co/200x280?text=Book6'),
  ('達人プログラマー 熟達に向けたあなたの旅', 'David Thomas / Andrew Hunt', 3520, 'ソフトウェア開発のプロを目指すための実践哲学。長く読み継がれるプログラマー必読書。', 'https://placehold.co/200x280?text=Book7'),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', 5500, '大規模データシステムの設計原則を体系的に解説。分散システム設計の標準参考書。', 'https://placehold.co/200x280?text=Book8');
