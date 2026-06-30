-- ============================================================
-- 書籍シードデータ
-- ============================================================

SET NAMES utf8mb4;

INSERT INTO books (title, author, price, description, image_url) VALUES
(
  'TypeScriptではじめるWebアプリ開発',
  '山田 太郎',
  2800,
  'TypeScriptの基礎からNext.js・Expressを使ったフルスタック開発まで丁寧に解説。初心者でも実践的なWebアプリを作れるようになる一冊。',
  'https://placehold.jp/3d4070/ffffff/150x200.png?text=TS+Web'
),
(
  'Dockerコンテナ入門',
  '佐藤 花子',
  3200,
  'Docker・docker-composeの基礎から本番運用まで。コンテナ化のベストプラクティスをハンズオン形式で学べる実践書。',
  'https://placehold.jp/0070c0/ffffff/150x200.png?text=Docker'
),
(
  'Reactハンズオン学習',
  '鈴木 一郎',
  2500,
  'Reactの基本概念からContext・Hooks・Next.jsまで。実際のアプリを作りながらReactを体系的に習得する。',
  'https://placehold.jp/61dafb/333333/150x200.png?text=React'
),
(
  'MySQLパフォーマンスチューニング',
  '田中 美咲',
  3800,
  'クエリ最適化・インデックス設計・レプリケーション設定まで、MySQLを本番で使いこなすための実践的な知識を網羅。',
  'https://placehold.jp/00618a/ffffff/150x200.png?text=MySQL'
),
(
  'REST API設計ガイド',
  '伊藤 健太',
  2200,
  'RESTful APIの設計原則から認証・バージョニング・エラーハンドリングまで。現場で使えるAPI設計の知識を凝縮した実践的な入門書。',
  'https://placehold.jp/4caf50/ffffff/150x200.png?text=REST+API'
),
(
  'Node.js実践ガイド',
  '渡辺 さくら',
  2900,
  'Node.jsの非同期処理・ストリーム・モジュールシステムを基礎から学ぶ。Expressを使ったサーバーサイド開発の実践的なノウハウを解説。',
  'https://placehold.jp/3c873a/ffffff/150x200.png?text=Node.js'
);
