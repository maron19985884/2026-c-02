import { GetServerSideProps } from "next";
import { Book } from "../types/api";
import { fetchBooks } from "../services/bookApi";
import BookCard from "../components/BookCard";

interface Props {
  books: Book[];
}

export default function HomePage({ books }: Props) {
  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>📚 書籍一覧</h1>
      {books.length === 0 ? (
        <p>書籍が登録されていません。</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const books = await fetchBooks();
    return { props: { books } };
  } catch {
    return { props: { books: [] } };
  }
};
