import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import BookDetailPage from "../src/app/books/[id]/page";
import * as booksApi from "../src/app/lib/booksApi";

describe("BookDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a not-found message and a link back to the list when the book does not exist", async () => {
    vi.spyOn(booksApi, "getBook").mockResolvedValue(null);

    render(<BookDetailPage params={{ id: "999" }} />);

    await waitFor(() => {
      expect(screen.getByText("書籍が見つかりません")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /一覧へ戻る/ })).toBeInTheDocument();
  });

  it("shows the book details and a link back to the list when the book is found", async () => {
    vi.spyOn(booksApi, "getBook").mockResolvedValue({
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1200,
      description: "A great book",
      coverImageUrl: null,
    });

    render(<BookDetailPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Book A")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /一覧へ戻る/ })).toBeInTheDocument();
  });
});
