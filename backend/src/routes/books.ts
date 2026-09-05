import { Router } from "express";

import { getSellingBook, listSellingBooks } from "../services/bookService";

export const booksRouter = Router();

// GET /api/books?page=&pageSize=
booksRouter.get("/", (req, res, next) => {
  listSellingBooks({ page: req.query.page, pageSize: req.query.pageSize })
    .then((result) => res.json(result))
    .catch(next);
});

// GET /api/books/:id
booksRouter.get("/:id", (req, res, next) => {
  getSellingBook(req.params.id)
    .then((book) => res.json(book))
    .catch(next);
});
