-- ============================================================
-- MySQL 初期化スクリプト
-- 個人運営オンライン書店（購買フロー特化版）
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- 書籍テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL COMMENT '書名',
  author      VARCHAR(255) NOT NULL COMMENT '著者',
  price       INT          NOT NULL COMMENT '価格（税込・円）',
  description TEXT                  COMMENT '書籍説明',
  image_url   VARCHAR(500)          COMMENT '書影URL',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 注文テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(50)  NOT NULL UNIQUE COMMENT '注文番号',
  customer_name    VARCHAR(100) NOT NULL COMMENT '氏名',
  customer_email   VARCHAR(255) NOT NULL COMMENT 'メールアドレス',
  customer_address TEXT         NOT NULL COMMENT '住所',
  total_amount     INT          NOT NULL COMMENT '合計金額（円）',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 注文明細テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT          NOT NULL COMMENT '注文ID',
  book_id    INT          NOT NULL COMMENT '書籍ID',
  title      VARCHAR(255) NOT NULL COMMENT '書名（注文時スナップショット）',
  price      INT          NOT NULL COMMENT '単価（注文時スナップショット）',
  quantity   INT          NOT NULL DEFAULT 1 COMMENT '数量',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- サンプル書籍データ
-- ============================================================
INSERT INTO books (title, author, price, description, image_url) VALUES
(
  'Clean Code　―　アジャイルソフトウェア達人の技',
  'Robert C. Martin',
  3520,
  'コードの品質とは何か。優れたコードを書くための原則・パターン・プラクティスを豊富な実例とともに解説する名著。読みやすいコードを書くためのエッセンスが詰まっています。',
  '/images/clean-code.svg'
),
(
  'リファクタリング　―　既存のコードを安全に改善する',
  'Martin Fowler',
  4180,
  'コードの動作を変えずに内部構造を改善する「リファクタリング」の決定版。70以上のリファクタリング手法をカタログ形式で体系的に解説。現場エンジニア必携の一冊。',
  '/images/refactoring.svg'
),
(
  'ドメイン駆動設計　―　エリック・エヴァンスのドメイン駆動設計',
  'Eric Evans',
  4950,
  '複雑なソフトウェアを設計するための思想と手法を体系化したDDDのバイブル。ユビキタス言語・境界づけられたコンテキスト・集約など、核心的な概念を詳しく解説。',
  '/images/ddd.svg'
),
(
  'プログラマー脳　―　優れたプログラマーになるための認知科学に基づくアプローチ',
  'Felienne Hermans',
  2860,
  '認知科学の知見をプログラミング学習に活かす方法を解説。コードの読み方・書き方・理解の仕方を科学的に分析し、効率よくスキルアップする手法を紹介します。',
  '/images/programmer-brain.svg'
),
(
  'ソフトウェアアーキテクチャの基礎　―　エンジニアリングに基づく体系的アプローチ',
  'Mark Richards / Neal Ford',
  4400,
  'アーキテクトとして必要な判断力と設計指針を網羅。マイクロサービス・イベント駆動・スペースベースなど主要アーキテクチャパターンをわかりやすく整理します。',
  '/images/sw-architecture.svg'
),
(
  ' 良いコード／悪いコードで学ぶ設計入門　―　保守しやすい　成長し続けるコードの書き方',
  '仙塲大也',
  3520,
  'Javaを題材に、読みやすく変更しやすいコードとはどういうものかを対比形式で解説。オブジェクト指向の基本から設計パターンまで、実践的な内容が詰まっています。',
  '/images/good-code.svg'
),
(
  'テスト駆動開発',
  'Kent Beck',
  3080,
  'TDDの創始者Kent Beckによる決定版。テストを先に書くことで設計が改善し、品質が向上するプロセスを豊富なコード例と共に学べます。',
  '/images/tdd.svg'
),
(
  'Webを支える技術　―　HTTP、URI、HTML、そしてREST',
  '山本 陽平',
  3080,
  'WebとHTTPの仕組みをREST設計の観点から丁寧に解説。URI設計・HTTPメソッドの使い分け・ステータスコードの意味など、Web APIを正しく設計するための基礎知識が身につきます。',
  '/images/web-tech.svg'
);
