import { CreateOrderResponse } from '@/services/apiClient';

interface OrderCompleteMessageProps {
  order: CreateOrderResponse | null;
}

/** FR-016（完了メッセージ）・FR-017（注文番号）の表示ロジック */
export function OrderCompleteMessage({ order }: OrderCompleteMessageProps) {
  if (!order) {
    return <p>注文情報が見つかりませんでした。</p>;
  }

  return (
    <>
      <p>ご注文ありがとうございました。注文を受け付けました。</p>
      <p>
        注文番号: <strong>{order.orderNumber}</strong>
      </p>
    </>
  );
}
