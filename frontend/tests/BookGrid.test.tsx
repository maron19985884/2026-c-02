import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BookGrid from "../src/app/components/BookGrid";
import type { BookSummary } from "../src/app/lib/booksApi";

const books: BookSummary[] = [
  { id: 1, title: "Book A", author: "Author A", price: 1200, coverImageUrl: null },
  { id: 2, title: "Book B", author: "Author B", price: 1500, coverImageUrl: "https://example.com/b.png" },
];

describe("BookGrid", () => {
  it("renders a card for each book", () => {
    render(<BookGrid books={books} />);

    expect(screen.getByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("Book B")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no books", () => {
    render(<BookGrid books={[]} />);

    expect(screen.getByText("現在販売中の書籍はありません")).toBeInTheDocument();
  });
});
