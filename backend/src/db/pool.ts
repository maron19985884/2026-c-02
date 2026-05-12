import mysql from 'mysql2/promise';

// mysql2 の接続プールを生成する
// プールの再利用によりコネクション確立のオーバーヘッドを削減する
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME     || 'appdb',
  user:     process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'password',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

export default pool;
