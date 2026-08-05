import Database from 'better-sqlite3';

interface SeedBook {
  title: string;
  author: string;
  price: number;
  description: string;
  imageUrl: string;
}

const SEED_BOOKS: SeedBook[] = [
  { title: '海辺の図書館', author: '山田 陽子', price: 1800, description: '小さな港町の図書館を舞台にした心温まる物語。', imageUrl: 'https://placehold.co/240x320?text=Book+1' },
  { title: '星を数える夜', author: '佐藤 健太', price: 1500, description: '天文台で働く青年と少女の一年間を描く青春小説。', imageUrl: 'https://placehold.co/240x320?text=Book+2' },
  { title: '朝のパン屋さん', author: '鈴木 真美', price: 1200, description: '下町のパン屋を営む家族三代の物語。', imageUrl: 'https://placehold.co/240x320?text=Book+3' },
  { title: '雨上がりの街で', author: '田中 誠', price: 1600, description: '再開発が進む街を舞台にした短編集。', imageUrl: 'https://placehold.co/240x320?text=Book+4' },
  { title: '旅する図鑑', author: '高橋 恵', price: 2200, description: '世界各地の風景を紹介するビジュアル図鑑。', imageUrl: 'https://placehold.co/240x320?text=Book+5' },
  { title: '記憶の断片', author: '伊藤 大輔', price: 1700, description: '失われた記憶を辿るミステリー小説。', imageUrl: 'https://placehold.co/240x320?text=Book+6' },
  { title: '静かな湖畔にて', author: '渡辺 舞', price: 1400, description: '湖畔の別荘を舞台にした群像劇。', imageUrl: 'https://placehold.co/240x320?text=Book+7' },
  { title: 'コーヒーと本のある暮らし', author: '中村 直樹', price: 1300, description: '珈琲豆と本にまつわるエッセイ集。', imageUrl: 'https://placehold.co/240x320?text=Book+8' },
  { title: '深海の記録', author: '小林 洋一', price: 2500, description: '深海探査の記録をまとめたノンフィクション。', imageUrl: 'https://placehold.co/240x320?text=Book+9' },
  { title: '風の便り', author: '加藤 さくら', price: 1500, description: '離れて暮らす家族の手紙を通じた物語。', imageUrl: 'https://placehold.co/240x320?text=Book+10' },
  { title: '古都の四季', author: '吉田 隆', price: 1900, description: '京都の四季を写真とともに綴った紀行文。', imageUrl: 'https://placehold.co/240x320?text=Book+11' },
  { title: '小さな発明家たち', author: '山本 明', price: 1350, description: '子供たちの自由研究をめぐる連作短編。', imageUrl: 'https://placehold.co/240x320?text=Book+12' },
];

export function seedBooks(db: Database.Database): void {
  const row = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };
  if (row.count > 0) return;

  const insert = db.prepare(
    'INSERT INTO books (title, author, price, description, image_url) VALUES (@title, @author, @price, @description, @imageUrl)'
  );
  const insertMany = db.transaction((books: SeedBook[]) => {
    for (const book of books) insert.run(book);
  });
  insertMany(SEED_BOOKS);
}
