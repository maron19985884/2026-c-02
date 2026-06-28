import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const { updateQuantity, removeFromCart } = useCart();
  const subtotal = item.unitPrice * item.quantity;

  return (
    <tr>
      <td style={{ padding: '8px' }}>{item.title}</td>
      <td style={{ padding: '8px' }}>¥{item.unitPrice.toLocaleString()}</td>
      <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label="数量を減らす"
        >
          −
        </button>
        <span style={{ margin: '0 8px' }}>{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
          aria-label="数量を増やす"
        >
          ＋
        </button>
      </td>
      <td style={{ padding: '8px' }}>¥{subtotal.toLocaleString()}</td>
      <td style={{ padding: '8px' }}>
        <button onClick={() => removeFromCart(item.bookId)}>削除</button>
      </td>
    </tr>
  );
}
