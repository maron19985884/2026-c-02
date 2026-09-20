/**
 * 共通の空状態表示。
 *
 * 詳細設計書 DETAIL-004 §2.12 / FR-004 / FR-014 に対応。
 * データ0件をエラーとして扱わず、次にとれる行動を示す（憲法§3）。
 */
import Link from "next/link";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  /** 空であることを伝える主文 */
  message: string;
  /** 補足説明（任意） */
  description?: string;
  /** 導線のリンク先（任意） */
  actionHref?: string;
  /** 導線のラベル（`actionHref` と併用） */
  actionLabel?: string;
}

export default function EmptyState({
  message,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.message}>{message}</p>
      {description && <p className={styles.description}>{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className={styles.action}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
