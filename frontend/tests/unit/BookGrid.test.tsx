import { render, screen } from "@testing-library/react";
import BookGrid from "@/components/BookGrid";
import type { BookListItem } from "@/types/book";

const books: BookListItem[] = [
  { id: 1, title: "Book A", author: "Author A", price: 1000, imageUrl: null },
  { id: 2, title: "Book B", author: "Author B", price: 2000, imageUrl: "https://example.com/b.jpg" },
];

describe("BookGrid", () => {
  it("renders a card for each book", () => {
    render(<BookGrid books={books} />);

    expect(screen.getByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("Book B")).toBeInTheDocument();
  });

  it("renders an empty state when there are no books", () => {
    render(<BookGrid books={[]} />);

    expect(screen.getByText("販売中の書籍はまだありません。")).toBeInTheDocument();
  });
});
