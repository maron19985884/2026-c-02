import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bookRoutes from "./routes/books";
import orderRoutes from "./routes/orders";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Backend 起動確認 🚀" });
});

app.use("/books", bookRoutes);
app.use("/orders", orderRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on port ${PORT}`);
});
