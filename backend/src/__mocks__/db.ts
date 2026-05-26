// DB接続のモック（テスト時に実際のMySQLに接続しない）
const pool = {
  query: jest.fn(),
  getConnection: jest.fn(),
};
export default pool;
