import express from "express";
import cors from "cors";
import booksRouter from "./routes/books";
import ordersRouter from "./routes/orders";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", message: "Backend 起動確認 🚀" });
});

// ルーティング
app.use("/api/books", booksRouter);
app.use("/api/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
