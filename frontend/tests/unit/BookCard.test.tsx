import { render, screen } from "@testing-library/react";
import BookCard from "@/components/BookCard";
import type { BookListItem } from "@/types/book";

describe("BookCard", () => {
  it("renders title, author, and price", () => {
    const book: BookListItem = {
      id: 1,
      title: "Book A",
      author: "Author A",
      price: 1000,
      imageUrl: "https://example.com/a.jpg",
    };

    render(<BookCard book={book} />);

    expect(screen.getByText("Book A")).toBeInTheDocument();
    expect(screen.getByText("Author A")).toBeInTheDocument();
    expect(screen.getByText("¥1,000")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/a.jpg");
  });

  it("falls back to the common placeholder image when imageUrl is missing", () => {
    const book: BookListItem = { id: 2, title: "Book B", author: "Author B", price: 2000, imageUrl: null };

    render(<BookCard book={book} />);

    expect(screen.getByRole("img")).toHaveAttribute("src", "/images/book-placeholder.png");
  });

  it("links to the detail page for the clicked book", () => {
    const book: BookListItem = { id: 42, title: "Book C", author: "Author C", price: 3000, imageUrl: null };

    render(<BookCard book={book} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/books/42");
  });
});
