/**
 * Automatic Jest manual mock for src/db/pool.ts
 *
 * When a test calls jest.mock('../db/pool') or jest.mock('./pool'),
 * Jest will use this file automatically (sibling __mocks__ directory).
 *
 * Exposes named mock functions so tests can configure return values
 * and verify calls.
 */

const mockQuery = jest.fn();
const mockExecute = jest.fn();
const mockBeginTransaction = jest.fn().mockResolvedValue(undefined);
const mockCommit = jest.fn().mockResolvedValue(undefined);
const mockRollback = jest.fn().mockResolvedValue(undefined);
const mockRelease = jest.fn();

const mockConnection = {
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

export {
  mockQuery,
  mockExecute,
  mockBeginTransaction,
  mockCommit,
  mockRollback,
  mockRelease,
  mockConnection,
};

export default pool;
