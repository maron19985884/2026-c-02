import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const listForSaleMock = vi.fn();
const getByIdMock = vi.fn();

vi.mock("../src/repositories/bookRepository", () => ({
  listForSale: (...args: unknown[]) => listForSaleMock(...args),
  getById: (...args: unknown[]) => getByIdMock(...args),
}));

const { default: app } = await import("../src/index");

describe("GET /api/books", () => {
  beforeEach(() => {
    listForSaleMock.mockReset();
    getByIdMock.mockReset();
  });

  it("returns the books provided by the repository", async () => {
    listForSaleMock.mockResolvedValue([
      { id: 2, title: "Book B", author: "Author B", price: 1500, coverImageUrl: null },
      { id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: "https://example.com/a.png" },
    ]);

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      books: [
        { id: 2, title: "Book B", author: "Author B", price: 1500, coverImageUrl: null },
        { id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: "https://example.com/a.png" },
      ],
    });
  });

  it("returns an empty array when there are no books for sale", async () => {
    listForSaleMock.mockResolvedValue([]);

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ books: [] });
  });

  it("returns 500 without leaking internal error details when the repository throws", async () => {
    listForSaleMock.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).get("/api/books");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal_server_error" });
  });
});

describe("GET /api/books/:id", () => {
  beforeEach(() => {
    listForSaleMock.mockReset();
    getByIdMock.mockReset();
  });

  it("returns the book when found", async () => {
    getByIdMock.mockResolvedValue({
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1200,
      description: "A great book",
      coverImageUrl: null,
    });

    const res = await request(app).get("/api/books/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1200,
      description: "A great book",
      coverImageUrl: null,
    });
    expect(getByIdMock).toHaveBeenCalledWith(1);
  });

  it("returns 400 when the id is not a number", async () => {
    const res = await request(app).get("/api/books/not-a-number");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "invalid_id" });
    expect(getByIdMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the book does not exist or is not for sale", async () => {
    getByIdMock.mockResolvedValue(null);

    const res = await request(app).get("/api/books/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "book_not_found" });
  });

  it("returns 500 without leaking internal error details when the repository throws", async () => {
    getByIdMock.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).get("/api/books/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "internal_server_error" });
  });
});
