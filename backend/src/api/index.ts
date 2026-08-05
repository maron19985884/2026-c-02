import express, { Express } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createBooksRouter } from './books';
import { createOrdersRouter } from './orders';
import { BookService } from '../services/bookService';
import { OrderService } from '../services/orderService';

export function createApp(db: Database.Database): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const bookService = new BookService(db);
  const orderService = new OrderService(db);

  app.use('/api', createBooksRouter(bookService));
  app.use('/api', createOrdersRouter(orderService));

  return app;
}
