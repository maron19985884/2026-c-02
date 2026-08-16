import express from "express";
import cors from "cors";
import booksRouter from "./routes/booksRoutes";
import ordersRouter from "./routes/ordersRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books", booksRouter);
app.use("/api/orders", ordersRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`backend listening on port ${port}`);
  });
}

export default app;
