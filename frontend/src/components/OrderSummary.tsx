interface OrderSummaryItem {
  title: string;
  quantity: number;
  subtotal: number;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  totalAmount: number;
}

export default function OrderSummary({ items, totalAmount }: OrderSummaryProps) {
  return (
    <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <h2 className="font-bold text-gray-900 text-base mb-4">注文内容</h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start justify-between gap-2">
            <span className="text-sm text-gray-800 flex-1 leading-snug">
              {item.title}
            </span>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-gray-500 block">
                ×{item.quantity}冊
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ¥{item.subtotal.toLocaleString('ja-JP')}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <hr className="my-4 border-gray-300" />
      <p className="flex justify-between items-center font-bold text-gray-900">
        <span>合計</span>
        <span className="text-lg text-blue-600">
          ¥{totalAmount.toLocaleString('ja-JP')}
        </span>
      </p>
    </section>
  );
}
