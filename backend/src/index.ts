import express from "express";
import cors from "cors";
import booksRouter from "./routes/books";
import ordersRouter from "./routes/orders";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/books", booksRouter);
app.use("/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
