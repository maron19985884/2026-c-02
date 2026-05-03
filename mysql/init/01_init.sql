SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)  NOT NULL,
  author      VARCHAR(100)  NOT NULL,
  price       INT           NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30)  NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  address      TEXT         NOT NULL,
  email        VARCHAR(255) NOT NULL,
  total_amount INT          NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT          NOT NULL,
  book_id  INT          NOT NULL,
  title    VARCHAR(200) NOT NULL,
  price    INT          NOT NULL,
  quantity INT          NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO books (title, author, price, description, image_url) VALUES
  ('プログラミング入門',
   '山田 太郎',
   2800,
   'プログラミングの基礎から丁寧に学べる入門書。変数・ループ・関数などの概念をわかりやすく解説します。',
   'https://placehold.co/200x280/4A90E2/ffffff?text=Programming'),
  ('Webデザインの教科書',
   '鈴木 花子',
   3200,
   'HTML/CSS/JavaScriptを使ったモダンなWebデザインの技術を全網羅。実践的なサンプルを多数収録。',
   'https://placehold.co/200x280/E24A4A/ffffff?text=Web+Design'),
  ('データサイエンス実践',
   '田中 一郎',
   3800,
   'Pythonを使ったデータ分析・機械学習の実践的な手法を解説。Pandas、scikit-learnを活用した演習付き。',
   'https://placehold.co/200x280/27AE60/ffffff?text=Data+Science'),
  ('アジャイル開発入門',
   '佐藤 次郎',
   2500,
   'スクラム・カンバンなどアジャイル手法の基本原則から実践まで。チーム開発の現場で役立つ知識を凝縮。',
   'https://placehold.co/200x280/E2A84A/ffffff?text=Agile'),
  ('クラウドインフラ構築',
   '中村 三郎',
   4200,
   'AWS/GCPを活用したスケーラブルなクラウドインフラの設計と構築。IaCによる自動化手法も詳しく解説。',
   'https://placehold.co/200x280/9B4AE2/ffffff?text=Cloud'),
  ('セキュリティ基礎知識',
   '小林 四郎',
   2900,
   'サイバーセキュリティの基礎から実践的な防御策まで。OWASP Top 10を中心にわかりやすく解説。',
   'https://placehold.co/200x280/E24A9B/ffffff?text=Security');
