import { useRouter } from "next/router";
import { Book } from "../types/api";

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/books/${book.id}`)}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.12)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")
      }
    >
      <img
        src={book.imageUrl}
        alt={book.title}
        width={150}
        height={200}
        style={{ objectFit: "cover", borderRadius: "4px", alignSelf: "center" }}
      />
      <h3 style={{ margin: 0, fontSize: "0.95rem" }}>{book.title}</h3>
      <p style={{ margin: 0, color: "#555", fontSize: "0.85rem" }}>{book.author}</p>
      <p style={{ margin: 0, fontWeight: "bold", color: "#c00" }}>
        ¥{book.price.toLocaleString()}
      </p>
    </div>
  );
}
