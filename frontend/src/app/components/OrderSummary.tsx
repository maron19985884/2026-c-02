export type OrderSummaryItem = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
};

export type OrderSummaryProps = {
  items: OrderSummaryItem[];
  totalAmount: number;
};

export default function OrderSummary({ items, totalAmount }: OrderSummaryProps) {
  return (
    <div className="order-summary">
      <ul className="order-summary__list">
        {items.map((item) => (
          <li key={item.bookId} className="order-summary__item">
            <span className="order-summary__title">{item.title}</span>
            <span className="order-summary__price">¥{item.price.toLocaleString("ja-JP")}</span>
            <span className="order-summary__quantity">数量: {item.quantity}</span>
            <span className="order-summary__subtotal">
              ¥{(item.price * item.quantity).toLocaleString("ja-JP")}
            </span>
          </li>
        ))}
      </ul>
      <p className="order-summary__total">
        合計: ¥{totalAmount.toLocaleString("ja-JP")}
      </p>
    </div>
  );
}
