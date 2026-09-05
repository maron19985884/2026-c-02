"use client";

import { MAX_QUANTITY, MIN_QUANTITY } from "@/lib/cart";
import styles from "./QuantityStepper.module.css";

/**
 * 数量の増減（FR-015 / research D-03）。
 * 下限 MIN_QUANTITY(1) で「−」が無効化、上限 MAX_QUANTITY(99) で「＋」が無効化。
 * それ以下にしたい場合は削除操作を使う。
 */
export default function QuantityStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label?: string;
}) {
  const dec = () => onChange(Math.max(MIN_QUANTITY, value - 1));
  const inc = () => onChange(Math.min(MAX_QUANTITY, value + 1));

  return (
    <span className={styles.stepper} role="group" aria-label={label ?? "数量"}>
      <button
        type="button"
        className={styles.btn}
        onClick={dec}
        disabled={value <= MIN_QUANTITY}
        aria-label="数量を1減らす"
      >
        −
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={inc}
        disabled={value >= MAX_QUANTITY}
        aria-label="数量を1増やす"
      >
        ＋
      </button>
    </span>
  );
}
