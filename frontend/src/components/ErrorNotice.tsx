/**
 * 共通エラー表示。
 *
 * 詳細設計書 DETAIL-004 §2.12 / FR-030 に対応。
 * API のエラー応答を統一された見た目で表示し、画面ごとにエラー表示が
 * ばらつかないようにする（憲法§3）。
 */
import Link from "next/link";
import { ApiClientError } from "@/lib/apiClient";
import styles from "./ErrorNotice.module.css";

interface ErrorNoticeProps {
  /** 表示するエラー。ApiClientError 以外も受け取れるようにしておく */
  error: unknown;
  /** 「再試行」で呼ぶ処理。渡されたときのみボタンを出す */
  onRetry?: () => void;
  /** 一覧へ戻る導線を出すか */
  showBackToList?: boolean;
}

function toMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return "エラーが発生しました。時間をおいて再度お試しください";
}

export default function ErrorNotice({
  error,
  onRetry,
  showBackToList = false,
}: ErrorNoticeProps) {
  return (
    <div className={styles.notice} role="alert">
      <p className={styles.message}>{toMessage(error)}</p>
      {(onRetry || showBackToList) && (
        <div className={styles.actions}>
          {onRetry && (
            <button type="button" className={styles.button} onClick={onRetry}>
              再試行する
            </button>
          )}
          {showBackToList && (
            <Link href="/" className={styles.button}>
              商品一覧へ戻る
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
