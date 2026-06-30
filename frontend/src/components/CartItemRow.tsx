import { CartItem } from "../types/api";

interface Props {
  item: CartItem;
  onQuantityChange: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

export default function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
  const subtotal = item.book.price * item.quantity;
  return (
    <tr>
      <td style={{ padding: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={item.book.imageUrl}
            alt={item.book.title}
            width={50}
            height={66}
            style={{ objectFit: "cover", borderRadius: "2px" }}
          />
          <span>{item.book.title}</span>
        </div>
      </td>
      <td style={{ padding: "0.75rem", textAlign: "right" }}>
        ¥{item.book.price.toLocaleString()}
      </td>
      <td style={{ padding: "0.75rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
          <button
            onClick={() => onQuantityChange(item.book.id, item.quantity - 1)}
            style={{ width: "28px", height: "28px", cursor: "pointer" }}
          >
            −
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.book.id, item.quantity + 1)}
            style={{ width: "28px", height: "28px", cursor: "pointer" }}
          >
            ＋
          </button>
        </div>
      </td>
      <td style={{ padding: "0.75rem", textAlign: "right" }}>
        ¥{subtotal.toLocaleString()}
      </td>
      <td style={{ padding: "0.75rem", textAlign: "center" }}>
        <button
          onClick={() => onRemove(item.book.id)}
          style={{ color: "#c00", background: "none", border: "1px solid #c00", borderRadius: "4px", padding: "0.25rem 0.5rem", cursor: "pointer" }}
        >
          削除
        </button>
      </td>
    </tr>
  );
}
