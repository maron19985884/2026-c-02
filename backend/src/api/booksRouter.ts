import { Router } from "express";
import { fetchBookById, fetchBooks } from "../services/bookService";

const booksRouter = Router();

booksRouter.get("/", async (_req, res) => {
  try {
    const books = await fetchBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error("Failed to fetch books", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

booksRouter.get("/:id", async (req, res) => {
  try {
    const book = await fetchBookById(Number(req.params.id));
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Failed to fetch book", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

export default booksRouter;
