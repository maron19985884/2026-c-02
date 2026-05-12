import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT || 4000;

// ミドルウェア設定
// フロントエンド（http://localhost:3000）からのアクセスのみ許可する
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ルーター登録
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// 動作確認エンドポイント
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
