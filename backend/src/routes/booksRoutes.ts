import { Router, Request, Response } from "express";
import * as bookRepository from "../repositories/bookRepository";

const booksRouter = Router();

booksRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const books = await bookRepository.listForSale();
    res.status(200).json({ books });
  } catch (error) {
    console.error("Failed to list books for sale", error);
    res.status(500).json({ error: "internal_server_error" });
  }
});

booksRouter.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  try {
    const book = await bookRepository.getById(id);
    if (!book) {
      res.status(404).json({ error: "book_not_found" });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Failed to get book by id", error);
    res.status(500).json({ error: "internal_server_error" });
  }
});

export default booksRouter;
