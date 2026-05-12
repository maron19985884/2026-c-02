// エラーメッセージの統一表示コンポーネント
// Server Component として使用する

type Props = {
  message: string;
};

export default function ErrorMessage({ message }: Props) {
  return (
    <div
      role="alert"
      style={{
        padding:      '1rem',
        marginBottom: '1rem',
        backgroundColor: '#fee2e2',
        border:       '1px solid #fca5a5',
        borderRadius: '0.375rem',
        color:        '#b91c1c',
      }}
    >
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
