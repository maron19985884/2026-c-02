"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./AddToCartButton.module.css";

const DEFAULT_LABEL = "カートに追加";
const ADDED_LABEL = "追加しました";
const RESET_DELAY_MS = 1500;

interface AddToCartButtonProps {
  book: {
    id: number;
    title: string;
    price: number;
    imageUrl: string | null;
  };
}

export default function AddToCartButton({ book }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleClick() {
    addItem(book);
    setLabel(ADDED_LABEL);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setLabel(DEFAULT_LABEL);
    }, RESET_DELAY_MS);
  }

  return (
    <button type="button" className={styles.button} onClick={handleClick}>
      {label}
    </button>
  );
}
