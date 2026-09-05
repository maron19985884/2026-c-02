import styles from "./EmptyState.module.css";

/**
 * 空状態の共通表示（FR-004 / FR-016 / FR-027）。
 * data 0 件・カート空などで使う。任意で子要素に導線（一覧へ戻る等）を渡せる。
 */
export default function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <p className={styles.message}>{message}</p>
      {children}
    </div>
  );
}
