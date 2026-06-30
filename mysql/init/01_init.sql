-- ============================================================
-- MySQL 初期化スクリプト（サンプル）
-- docker-compose 起動時に自動実行されます
-- ============================================================

-- 文字コード設定
SET NAMES utf8mb4;

-- サンプルテーブル（不要なら削除してください）
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
