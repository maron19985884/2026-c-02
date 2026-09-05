import styles from "./ErrorNotice.module.css";

const DEFAULT_MESSAGE =
  "通信に失敗しました。しばらくしてからもう一度お試しください。";

/**
 * 汎用エラー表示（FR-032 / CL-007）。
 * 自動リトライや再試行ボタンは設けない。任意で子要素（一覧へ戻る等の導線）を渡せる。
 */
export default function ErrorNotice({
  message = DEFAULT_MESSAGE,
  children,
}: {
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.notice} role="alert">
      <p className={styles.title}>エラー</p>
      <p className={styles.body}>{message}</p>
      {children}
    </div>
  );
}
