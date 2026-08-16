const PLACEHOLDER_COVER = "/images/placeholder-book.svg";

export type CartItemRowProps = {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
  coverImageUrl: string | null;
  isAvailable: boolean;
  onQuantityChange: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
};

export default function CartItemRow({
  bookId,
  title,
  price,
  quantity,
  coverImageUrl,
  isAvailable,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const subtotal = price * quantity;

  return (
    <div className={`cart-item${isAvailable ? "" : " cart-item--unavailable"}`}>
      <img
        src={coverImageUrl ?? PLACEHOLDER_COVER}
        alt={title}
        className="cart-item__cover"
      />
      <div className="cart-item__info">
        <p className="cart-item__title">{title}</p>
        {isAvailable ? (
          <>
            <p className="cart-item__price">¥{price.toLocaleString("ja-JP")}</p>
            <div className="qty-control">
              <button
                type="button"
                className="qty-control__button"
                aria-label="数量を減らす"
                disabled={quantity <= 1}
                onClick={() => onQuantityChange(bookId, quantity - 1)}
              >
                −
              </button>
              <span className="cart-item__quantity">{quantity}</span>
              <button
                type="button"
                className="qty-control__button"
                aria-label="数量を増やす"
                onClick={() => onQuantityChange(bookId, quantity + 1)}
              >
                ＋
              </button>
            </div>
            <p className="cart-item__subtotal">¥{subtotal.toLocaleString("ja-JP")}</p>
          </>
        ) : (
          <p className="state-message state-message--error">この書籍は販売を終了しました</p>
        )}
        <button
          type="button"
          className="cart-item__remove"
          onClick={() => onRemove(bookId)}
        >
          削除
        </button>
      </div>
    </div>
  );
}
