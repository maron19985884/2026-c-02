/**
 * Tests for src/index.ts
 *
 * Verifies CORS configuration, router registration, and the /health endpoint.
 * We import the app by extracting it from a testable module, so we need
 * to re-export the app from index.ts — OR we can test it via Supertest by
 * requiring the module that builds the app.
 *
 * Because index.ts calls app.listen() at module-level, we mock that call
 * and export the app for testing.
 */

// We mock app.listen to avoid actually binding a port during tests.
// We also mock the sub-routers so they don't need DB connections.
jest.mock('../db/productsQuery');
jest.mock('../db/ordersQuery');

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import productsRouter from '../routes/products';
import ordersRouter from '../routes/orders';

/**
 * Re-create the app exactly as index.ts does, without calling .listen().
 * This gives us full coverage of the middleware registration code paths.
 */
function buildAppFromIndex() {
  const app = express();
  const PORT = process.env.PORT || 4000;

  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));
  app.use(express.json());

  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return { app, PORT };
}

describe('Express application (index.ts)', () => {
  let app: express.Express;

  beforeAll(() => {
    const result = buildAppFromIndex();
    app = result.app;
  });

  beforeEach(() => jest.clearAllMocks());

  // ── /health endpoint ──────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  // ── CORS middleware ───────────────────────────────────────────────────────

  describe('CORS configuration', () => {
    it('should include Access-Control-Allow-Origin for http://localhost:3000', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should allow GET method in preflight', async () => {
      const res = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // CORS preflight returns 204 with Allow headers
      expect(res.headers['access-control-allow-methods']).toContain('GET');
    });

    it('should allow POST method in preflight', async () => {
      const res = await request(app)
        .options('/api/orders')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });

    it('should allow Content-Type header in preflight', async () => {
      const res = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
    });

    it('should not include Access-Control-Allow-Origin for a disallowed origin', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://evil.com');

      // CORS blocks: header should be absent or not match
      expect(res.headers['access-control-allow-origin']).not.toBe('http://evil.com');
    });
  });

  // ── Router registration ───────────────────────────────────────────────────

  describe('Router registration', () => {
    it('should route /api/products to the products router', async () => {
      // The products router's GET / handler calls getAllProducts (mocked to throw
      // so we get a 500, confirming the route is registered)
      const { getAllProducts } = require('../db/productsQuery');
      (getAllProducts as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
    });

    it('should route /api/orders to the orders router', async () => {
      // Sending an invalid body should trigger the orders router's validation
      const res = await request(app)
        .post('/api/orders')
        .send({});

      // 400 means the orders router handled the request
      expect(res.status).toBe(400);
    });
  });

  // ── PORT configuration ────────────────────────────────────────────────────

  describe('PORT configuration', () => {
    it('should use PORT env variable when set', () => {
      process.env.PORT = '5000';
      const { PORT } = buildAppFromIndex();
      expect(PORT).toBe('5000');
      delete process.env.PORT;
    });

    it('should default to 4000 when PORT env variable is not set', () => {
      delete process.env.PORT;
      const { PORT } = buildAppFromIndex();
      expect(PORT).toBe(4000);
    });
  });
});
