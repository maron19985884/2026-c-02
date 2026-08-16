import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "../src/app/page";
import * as booksApi from "../src/app/lib/booksApi";

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the books once loaded", async () => {
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: null },
    ]);

    render(<HomePage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Book A")).toBeInTheDocument();
    });
  });

  it("shows the empty state when there are no books", async () => {
    vi.spyOn(booksApi, "listBooks").mockResolvedValue([]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("現在販売中の書籍はありません")).toBeInTheDocument();
    });
  });

  it("shows a generic error message when the request fails", async () => {
    vi.spyOn(booksApi, "listBooks").mockRejectedValue(new Error("network down"));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
