import { Router, Request, Response } from "express";
import { getAllBooks, getBookById } from "../services/bookService";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid book id" });
    return;
  }
  try {
    const book = await getBookById(id);
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

export default router;
