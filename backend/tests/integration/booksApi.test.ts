import express from "express";
import request from "supertest";
import booksRouter from "../../src/api/booksRouter";
import { fetchBookById, fetchBooks } from "../../src/services/bookService";

jest.mock("../../src/services/bookService");

const mockedFetchBooks = fetchBooks as jest.Mock;
const mockedFetchBookById = fetchBookById as jest.Mock;

function buildApp() {
  const app = express();
  app.use("/api/books", booksRouter);
  return app;
}

describe("GET /api/books", () => {
  afterEach(() => {
    mockedFetchBooks.mockReset();
  });

  it("returns 200 with books sorted by id ascending", async () => {
    mockedFetchBooks.mockResolvedValueOnce([
      { id: 1, title: "Book A", author: "Author A", price: 1000, imageUrl: null },
      { id: 2, title: "Book B", author: "Author B", price: 2000, imageUrl: "https://example.com/b.jpg" },
    ]);

    const res = await request(buildApp()).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, title: "Book A", author: "Author A", price: 1000, imageUrl: null },
      { id: 2, title: "Book B", author: "Author B", price: 2000, imageUrl: "https://example.com/b.jpg" },
    ]);
  });

  it("returns 200 with an empty array when there are no books", async () => {
    mockedFetchBooks.mockResolvedValueOnce([]);

    const res = await request(buildApp()).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 500 with an error body when fetching books fails", async () => {
    mockedFetchBooks.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await request(buildApp()).get("/api/books");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch books" });
  });
});

describe("GET /api/books/:id", () => {
  afterEach(() => {
    mockedFetchBookById.mockReset();
  });

  it("returns 200 with the book (including description) when found", async () => {
    mockedFetchBookById.mockResolvedValueOnce({
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1000,
      description: "説明文A",
      imageUrl: null,
    });

    const res = await request(buildApp()).get("/api/books/1");

    expect(mockedFetchBookById).toHaveBeenCalledWith(1);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1000,
      description: "説明文A",
      imageUrl: null,
    });
  });

  it("returns 404 with an error body when the book does not exist", async () => {
    mockedFetchBookById.mockResolvedValueOnce(null);

    const res = await request(buildApp()).get("/api/books/999999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Book not found" });
  });

  it("returns 500 with an error body when fetching the book fails", async () => {
    mockedFetchBookById.mockRejectedValueOnce(new Error("DB connection failed"));

    const res = await request(buildApp()).get("/api/books/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch book" });
  });
});
