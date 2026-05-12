import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db';
import booksRouter from './routes/books';
import ordersRouter from './routes/orders';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);

app.get('/health', async (_req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ data: { status: 'ok', db: 'connected' }, error: null, message: 'Backend is running' });
  } catch (err) {
    res.status(500).json({ data: null, error: String(err), message: 'DB connection failed' });
  }
});

export default app;
