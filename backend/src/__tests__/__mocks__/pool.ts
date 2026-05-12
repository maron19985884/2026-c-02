/**
 * Manual mock for src/db/pool.ts
 * Exposes jest.fn() stubs for pool.query and pool.getConnection.
 * Individual tests override return values with mockResolvedValueOnce.
 */

const mockQuery = jest.fn();
const mockExecute = jest.fn();
const mockBeginTransaction = jest.fn().mockResolvedValue(undefined);
const mockCommit = jest.fn().mockResolvedValue(undefined);
const mockRollback = jest.fn().mockResolvedValue(undefined);
const mockRelease = jest.fn();

export const mockConnection = {
  beginTransaction: mockBeginTransaction,
  execute: mockExecute,
  query: mockQuery,
  commit: mockCommit,
  rollback: mockRollback,
  release: mockRelease,
};

const pool = {
  query: mockQuery,
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

export { mockQuery, mockExecute, mockBeginTransaction, mockCommit, mockRollback, mockRelease };

export default pool;
