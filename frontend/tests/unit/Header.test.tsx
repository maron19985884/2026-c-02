import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

describe("Header", () => {
  it("renders a link to the cart", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "カート" })).toHaveAttribute("href", "/cart");
  });

  it("renders a link back to the product list", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "オンライン書店" })).toHaveAttribute("href", "/");
  });
});
