import cors from "cors";
import express, { Express } from "express";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { booksRouter } from "./routes/books";
import { ordersRouter } from "./routes/orders";

/**
 * Express アプリを組み立てる。
 * listen はしない（テストから supertest で import できるようにするため）。
 */
export const createApp = (): Express => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/books", booksRouter);
  app.use("/api/orders", ordersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
