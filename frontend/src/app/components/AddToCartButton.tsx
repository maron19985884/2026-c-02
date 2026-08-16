"use client";

import { useState } from "react";
import { addItem } from "../lib/cartStore";

type Props = {
  bookId: number;
};

type ButtonState = "idle" | "added" | "failed";

export default function AddToCartButton({ bookId }: Props) {
  const [state, setState] = useState<ButtonState>("idle");

  const handleClick = () => {
    const success = addItem(bookId);
    setState(success ? "added" : "failed");
  };

  return (
    <div className="add-to-cart">
      <button type="button" className="button button--primary" onClick={handleClick}>
        {state === "added" ? "カートに追加しました" : "カートに追加"}
      </button>
      {state === "failed" && (
        <p className="state-message state-message--error" role="alert">
          カートに追加できませんでした
        </p>
      )}
    </div>
  );
}
