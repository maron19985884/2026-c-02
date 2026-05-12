/**
 * Tests for src/db/pool.ts
 *
 * pool.ts executes mysql.createPool() at module load time and exports the result.
 * We use jest.isolateModules() combined with jest.mock() inside the factory
 * to capture and inspect each call to createPool.
 */

describe('db/pool', () => {
  afterEach(() => {
    jest.resetModules();
  });

  /**
   * Helper: loads pool.ts inside an isolated module scope.
   * The mysql2/promise mock is registered fresh for each call so
   * we can capture what createPool was called with.
   */
  function loadPool(envOverrides: Record<string, string | undefined> = {}) {
    // Apply env overrides
    const original: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(envOverrides)) {
      original[k] = process.env[k];
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }

    const createPoolMock = jest.fn().mockReturnValue({ __pool: true });

    let poolExport: unknown;
    jest.isolateModules(() => {
      jest.mock('mysql2/promise', () => ({ createPool: createPoolMock }));
      poolExport = require('../db/pool').default;
    });

    // Restore env
    for (const [k, v] of Object.entries(original)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }

    return { createPoolMock, poolExport };
  }

  // ─── default values ────────────────────────────────────────────────────────

  describe('default connection values (no env vars set)', () => {
    it('should use host=localhost by default', () => {
      const { createPoolMock } = loadPool({
        DB_HOST: undefined, DB_PORT: undefined,
        DB_NAME: undefined, DB_USER: undefined, DB_PASSWORD: undefined,
      });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ host: 'localhost' })
      );
    });

    it('should use port=3306 by default', () => {
      const { createPoolMock } = loadPool({
        DB_HOST: undefined, DB_PORT: undefined,
        DB_NAME: undefined, DB_USER: undefined, DB_PASSWORD: undefined,
      });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ port: 3306 })
      );
    });

    it('should use database=appdb by default', () => {
      const { createPoolMock } = loadPool({
        DB_HOST: undefined, DB_PORT: undefined,
        DB_NAME: undefined, DB_USER: undefined, DB_PASSWORD: undefined,
      });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ database: 'appdb' })
      );
    });

    it('should use user=appuser by default', () => {
      const { createPoolMock } = loadPool({
        DB_HOST: undefined, DB_PORT: undefined,
        DB_NAME: undefined, DB_USER: undefined, DB_PASSWORD: undefined,
      });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'appuser' })
      );
    });

    it('should use password=password by default', () => {
      const { createPoolMock } = loadPool({
        DB_HOST: undefined, DB_PORT: undefined,
        DB_NAME: undefined, DB_USER: undefined, DB_PASSWORD: undefined,
      });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'password' })
      );
    });
  });

  // ─── env var overrides ─────────────────────────────────────────────────────

  describe('env var overrides', () => {
    it('should use DB_HOST when set', () => {
      const { createPoolMock } = loadPool({ DB_HOST: 'myhost' });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ host: 'myhost' })
      );
    });

    it('should use DB_PORT when set (converted to number)', () => {
      const { createPoolMock } = loadPool({ DB_PORT: '3307' });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ port: 3307 })
      );
    });

    it('should use DB_NAME when set', () => {
      const { createPoolMock } = loadPool({ DB_NAME: 'proddb' });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ database: 'proddb' })
      );
    });

    it('should use DB_USER when set', () => {
      const { createPoolMock } = loadPool({ DB_USER: 'admin' });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'admin' })
      );
    });

    it('should use DB_PASSWORD when set', () => {
      const { createPoolMock } = loadPool({ DB_PASSWORD: 'supersecret' });
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'supersecret' })
      );
    });
  });

  // ─── pool settings ─────────────────────────────────────────────────────────

  describe('pool settings', () => {
    it('should set waitForConnections=true', () => {
      const { createPoolMock } = loadPool();
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ waitForConnections: true })
      );
    });

    it('should set connectionLimit=10', () => {
      const { createPoolMock } = loadPool();
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ connectionLimit: 10 })
      );
    });

    it('should set queueLimit=0', () => {
      const { createPoolMock } = loadPool();
      expect(createPoolMock).toHaveBeenCalledWith(
        expect.objectContaining({ queueLimit: 0 })
      );
    });
  });

  // ─── export ─────────────────────────────────────────────────────────────────

  describe('exports', () => {
    it('should export the value returned by createPool', () => {
      const { poolExport } = loadPool();
      expect(poolExport).toEqual({ __pool: true });
    });

    it('should call createPool exactly once on module load', () => {
      const { createPoolMock } = loadPool();
      expect(createPoolMock).toHaveBeenCalledTimes(1);
    });
  });
});
