import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();

vi.mock("../src/db/pool", () => ({
  default: { query: (...args: unknown[]) => queryMock(...args) },
}));

const { listForSale, getById } = await import("../src/repositories/bookRepository");

describe("bookRepository", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  describe("listForSale", () => {
    it("maps rows to BookSummary and queries only books for sale in the expected order", async () => {
      queryMock.mockResolvedValue([
        [
          { id: 2, title: "Book B", author: "Author B", price: 1500, cover_image_url: null },
          { id: 1, title: "Book A", author: "Author A", price: 1200, cover_image_url: "https://example.com/a.png" },
        ],
      ]);

      const result = await listForSale();

      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining("WHERE is_for_sale = 1 ORDER BY created_at DESC, id DESC")
      );
      expect(result).toEqual([
        { id: 2, title: "Book B", author: "Author B", price: 1500, coverImageUrl: null },
        { id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: "https://example.com/a.png" },
      ]);
    });

    it("returns an empty array when there are no rows", async () => {
      queryMock.mockResolvedValue([[]]);

      const result = await listForSale();

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("returns the mapped book when a row is found", async () => {
      queryMock.mockResolvedValue([
        [
          {
            id: 1,
            title: "Book A",
            author: "Author A",
            price: 1200,
            description: "A great book",
            cover_image_url: null,
          },
        ],
      ]);

      const result = await getById(1);

      expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("WHERE id = ? AND is_for_sale = 1"), [1]);
      expect(result).toEqual({
        id: 1,
        title: "Book A",
        author: "Author A",
        price: 1200,
        description: "A great book",
        coverImageUrl: null,
      });
    });

    it("returns null when no row is found", async () => {
      queryMock.mockResolvedValue([[]]);

      const result = await getById(999);

      expect(result).toBeNull();
    });
  });
});
