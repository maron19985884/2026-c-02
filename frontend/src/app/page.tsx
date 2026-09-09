import BookGrid from "@/components/BookGrid";
import ErrorNotice from "@/components/ErrorNotice";
import { fetchBooks } from "@/lib/api/books";
import styles from "./page.module.css";

export default async function Home() {
  try {
    const books = await fetchBooks();

    return (
      <main className={styles.main}>
        <h1 className={styles.heading}>商品一覧</h1>
        <BookGrid books={books} />
      </main>
    );
  } catch {
    return (
      <main className={styles.main}>
        <h1 className={styles.heading}>商品一覧</h1>
        <ErrorNotice message="書籍の取得に失敗しました。しばらくしてから再度お試しください。" />
      </main>
    );
  }
}
