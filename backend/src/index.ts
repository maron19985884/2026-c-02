import express from "express";
import cors from "cors";
import booksRouter from "./api/booksRouter";
import ordersRouter from "./api/ordersRouter";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 動作確認用エンドポイント
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend 起動確認 🚀" });
});

app.use("/api/books", booksRouter);
app.use("/api/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
