import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import booksRouter from './api/books';
import ordersRouter from './api/orders';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);

// 404フォールバック（定義されていないAPIパスへのリクエスト）
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
