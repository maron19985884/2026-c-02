-- ============================================================
-- books テーブル定義＋初期データ
-- docker-compose 起動時に自動実行されます
-- ============================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  author      VARCHAR(255) NOT NULL,
  price       INT NOT NULL,
  description TEXT NULL,
  image_url   VARCHAR(512) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO books (title, author, price, description, image_url) VALUES
  ('はじめてのTypeScript', '山田太郎', 2800, 'TypeScriptの基礎から実践までを解説する入門書。', 'https://example.com/covers/typescript.jpg'),
  ('オンライン書店の作り方', '佐藤花子', 3200, 'Next.jsとExpressで作るオンライン書店の設計・実装ガイド。', NULL),
  ('データベース設計の教科書', '鈴木一郎', 2600, 'リレーショナルデータベースの設計原則をやさしく解説。', 'https://example.com/covers/db-design.jpg'),
  ('Reactではじめるフロントエンド開発', '高橋実', 3000, 'コンポーネント設計から状態管理までを網羅した実践書。', 'https://example.com/covers/react.jpg'),
  ('APIデザインの原則', '田中さくら', 2400, 'REST APIの設計・命名・バージョニングの考え方をまとめた一冊。', NULL);
