import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books';
import ordersRouter from './routes/orders';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);

export default app;
