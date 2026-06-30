import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Book } from "../../types/api";
import { fetchBookById } from "../../services/bookApi";
import { useCart } from "../../context/CartContext";

interface Props {
  book: Book | null;
}

export default function BookDetailPage({ book }: Props) {
  const router = useRouter();
  const { addItem } = useCart();

  if (!book) {
    return (
      <div>
        <p>書籍が見つかりませんでした。</p>
        <button onClick={() => router.push("/")}>一覧に戻る</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(book);
    router.push("/");
  };

  return (
    <div>
      <button
        onClick={() => router.push("/")}
        style={{ marginBottom: "1rem", cursor: "pointer" }}
      >
        ← 一覧に戻る
      </button>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <img
          src={book.imageUrl}
          alt={book.title}
          width={150}
          height={200}
          style={{ objectFit: "cover", borderRadius: "4px", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: "240px" }}>
          <h1 style={{ marginTop: 0 }}>{book.title}</h1>
          <p style={{ color: "#555" }}>著者: {book.author}</p>
          <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#c00" }}>
            ¥{book.price.toLocaleString()}
          </p>
          <p style={{ lineHeight: "1.7" }}>{book.description}</p>
          <button
            onClick={handleAddToCart}
            style={{
              padding: "0.75rem 2rem",
              background: "#e47911",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            カートに追加
          </button>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const id = Number(ctx.params?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return { props: { book: null } };
  }
  try {
    const book = await fetchBookById(id);
    return { props: { book } };
  } catch {
    return { props: { book: null } };
  }
};
