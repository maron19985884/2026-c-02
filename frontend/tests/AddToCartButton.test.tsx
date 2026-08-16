import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddToCartButton from "../src/app/components/AddToCartButton";
import * as cartStore from "../src/app/lib/cartStore";

describe("AddToCartButton", () => {
  it("shows a success label after a successful add", () => {
    vi.spyOn(cartStore, "addItem").mockReturnValue(true);

    render(<AddToCartButton bookId={1} />);
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByText("カートに追加しました")).toBeInTheDocument();
  });

  it("shows a failure message when addItem fails", () => {
    vi.spyOn(cartStore, "addItem").mockReturnValue(false);

    render(<AddToCartButton bookId={1} />);
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("alert")).toHaveTextContent("カートに追加できませんでした");
  });
});
