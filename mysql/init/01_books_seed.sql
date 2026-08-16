SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url VARCHAR(500) NULL,
  is_for_sale TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_books_forsale_created (is_for_sale, created_at DESC)
);

INSERT INTO books (title, author, price, description, cover_image_url, is_for_sale, created_at) VALUES
('データベース設計の教科書', '山田太郎', 2800, 'リレーショナルデータベースの設計手法を、正規化から実践的なアンチパターンまで幅広く解説する一冊。', NULL, 1, '2026-08-01 09:00:00'),
('TypeScript実践ガイド', '佐藤花子', 3200, '型システムの基礎から大規模アプリケーションでの設計パターンまでを、豊富なサンプルコードとともに紹介する。', NULL, 1, '2026-08-03 10:30:00'),
('Web APIの設計と実装', '鈴木一郎', 2600, 'REST APIの設計原則、エラーハンドリング、バージョニング戦略について、実務での知見をもとに解説する。', NULL, 1, '2026-08-05 14:00:00'),
('フロントエンド設計入門', '高橋次郎', 2400, 'コンポーネント設計、状態管理、テスト戦略など、フロントエンド開発における基礎的な考え方をまとめた入門書。', NULL, 1, '2026-08-07 11:15:00'),
('アジャイル開発の現場から', '田中三郎', 2200, 'スクラム・カンバンを中心に、実際のチーム運営で直面する課題とその対処法を事例とともに紹介する。', NULL, 0, '2026-08-08 16:45:00'),
('クラウドインフラ構築実践', '伊藤四郎', 3400, 'Dockerとコンテナオーケストレーションを軸に、スケーラブルなインフラ構築の勘所を解説する。', NULL, 1, '2026-08-10 08:20:00'),
('ソフトウェアテスト技法', '渡辺五郎', 2900, '単体テストから結合テスト、E2Eテストまで、品質を支えるテスト設計の考え方を体系的に説明する。', NULL, 0, '2026-08-11 13:00:00'),
('セキュアコーディング実践', '中村六郎', 3100, 'Webアプリケーションで起こりがちな脆弱性とその対策を、具体的なコード例とともに学べる一冊。', NULL, 1, '2026-08-12 17:30:00');
