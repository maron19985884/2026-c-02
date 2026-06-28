interface Props {
  totalAmount: number;
}

export default function CartSummary({ totalAmount }: Props) {
  return (
    <div style={{ marginTop: '16px', textAlign: 'right' }}>
      <strong>合計金額（送料除く）: ¥{totalAmount.toLocaleString()}</strong>
    </div>
  );
}
