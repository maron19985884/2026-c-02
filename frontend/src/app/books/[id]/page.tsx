import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ErrorNotice from "@/components/ErrorNotice";
import { fetchBookById } from "@/lib/api/books";
import styles from "./page.module.css";

const PLACEHOLDER_IMAGE = "/images/book-placeholder.png";

interface BookDetailPageProps {
  params: { id: string };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  try {
    const book = await fetchBookById(params.id);
    const imageSrc = book.imageUrl || PLACEHOLDER_IMAGE;

    return (
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>
          ← 一覧へ戻る
        </Link>
        <div className={styles.layout}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={book.title} className={styles.cover} />
          <div className={styles.info}>
            <h1 className={styles.title}>{book.title}</h1>
            <p className={styles.author}>{book.author}</p>
            <p className={styles.price}>¥{book.price.toLocaleString()}</p>
            <div className={styles.actions}>
              <AddToCartButton
                book={{ id: book.id, title: book.title, price: book.price, imageUrl: book.imageUrl }}
              />
            </div>
            <p className={styles.description}>{book.description}</p>
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>
          ← 一覧へ戻る
        </Link>
        <ErrorNotice message="書籍の取得に失敗しました。しばらくしてから再度お試しください。" />
      </main>
    );
  }
}
