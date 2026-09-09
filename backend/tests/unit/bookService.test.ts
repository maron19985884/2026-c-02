import pool from "../../src/db/pool";
import { fetchBookById, fetchBooks } from "../../src/services/bookService";

jest.mock("../../src/db/pool", () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

const mockedQuery = pool.query as jest.Mock;

describe("bookService.fetchBooks", () => {
  afterEach(() => {
    mockedQuery.mockReset();
  });

  it("returns books sorted by id ascending, mapped to BookListItem", async () => {
    mockedQuery.mockResolvedValueOnce([
      [
        { id: 1, title: "Book A", author: "Author A", price: 1000, image_url: "https://example.com/a.jpg" },
        { id: 2, title: "Book B", author: "Author B", price: 2000, image_url: null },
      ],
    ]);

    const books = await fetchBooks();

    expect(mockedQuery).toHaveBeenCalledWith(expect.stringContaining("ORDER BY id ASC"));
    expect(books).toEqual([
      { id: 1, title: "Book A", author: "Author A", price: 1000, imageUrl: "https://example.com/a.jpg" },
      { id: 2, title: "Book B", author: "Author B", price: 2000, imageUrl: null },
    ]);
  });

  it("returns an empty array when there are no books", async () => {
    mockedQuery.mockResolvedValueOnce([[]]);

    const books = await fetchBooks();

    expect(books).toEqual([]);
  });
});

describe("bookService.fetchBookById", () => {
  afterEach(() => {
    mockedQuery.mockReset();
  });

  it("returns the book (including description) mapped to Book when found", async () => {
    mockedQuery.mockResolvedValueOnce([
      [
        {
          id: 1,
          title: "Book A",
          author: "Author A",
          price: 1000,
          description: "説明文A",
          image_url: "https://example.com/a.jpg",
        },
      ],
    ]);

    const book = await fetchBookById(1);

    expect(mockedQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE id = ?"), [1]);
    expect(book).toEqual({
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1000,
      description: "説明文A",
      imageUrl: "https://example.com/a.jpg",
    });
  });

  it("returns null when no book matches the given id", async () => {
    mockedQuery.mockResolvedValueOnce([[]]);

    const book = await fetchBookById(999);

    expect(book).toBeNull();
  });
});
