import { describe, it, expect, vi } from "vitest";

const fetchJsonMock = vi.fn();

vi.mock("../src/app/lib/apiClient", () => ({
  fetchJson: (...args: unknown[]) => fetchJsonMock(...args),
}));

const { listBooks, getBook } = await import("../src/app/lib/booksApi");

describe("booksApi", () => {
  describe("listBooks", () => {
    it("returns the books array from the response", async () => {
      fetchJsonMock.mockResolvedValue({
        books: [{ id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: null }],
      });

      const result = await listBooks();

      expect(fetchJsonMock).toHaveBeenCalledWith("/api/books");
      expect(result).toEqual([
        { id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: null },
      ]);
    });

    it("returns an empty array when the response is null", async () => {
      fetchJsonMock.mockResolvedValue(null);

      const result = await listBooks();

      expect(result).toEqual([]);
    });
  });

  describe("getBook", () => {
    it("requests the book by id and returns it", async () => {
      fetchJsonMock.mockResolvedValue({
        id: 1,
        title: "Book A",
        author: "Author A",
        price: 1200,
        description: "desc",
        coverImageUrl: null,
      });

      const result = await getBook(1);

      expect(fetchJsonMock).toHaveBeenCalledWith("/api/books/1");
      expect(result?.title).toBe("Book A");
    });

    it("returns null when the book is not found", async () => {
      fetchJsonMock.mockResolvedValue(null);

      const result = await getBook(999);

      expect(result).toBeNull();
    });
  });
});
