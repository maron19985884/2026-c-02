import { fireEvent, render, screen } from "@testing-library/react";
import OrderForm from "@/components/OrderForm";

describe("OrderForm", () => {
  it("renders name, address, and email inputs", () => {
    render(<OrderForm onValidSubmit={jest.fn()} />);

    expect(screen.getByLabelText("氏名")).toBeInTheDocument();
    expect(screen.getByLabelText("住所")).toBeInTheDocument();
    expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
  });

  it("reflects typed values in each field", () => {
    render(<OrderForm onValidSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田花子" } });
    fireEvent.change(screen.getByLabelText("住所"), { target: { value: "東京都千代田区1-1-1" } });
    fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "hanako@example.com" } });

    expect(screen.getByLabelText("氏名")).toHaveValue("山田花子");
    expect(screen.getByLabelText("住所")).toHaveValue("東京都千代田区1-1-1");
    expect(screen.getByLabelText("メールアドレス")).toHaveValue("hanako@example.com");
  });

  it("shows an error per empty field and does not call onValidSubmit", () => {
    const onValidSubmit = jest.fn();
    render(<OrderForm onValidSubmit={onValidSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  it("shows an email format error and does not call onValidSubmit", () => {
    const onValidSubmit = jest.fn();
    render(<OrderForm onValidSubmit={onValidSubmit} />);

    fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田花子" } });
    fireEvent.change(screen.getByLabelText("住所"), { target: { value: "東京都千代田区1-1-1" } });
    fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "invalid-email" } });
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  it("calls onValidSubmit with the entered values when all fields are valid", () => {
    const onValidSubmit = jest.fn();
    render(<OrderForm onValidSubmit={onValidSubmit} />);

    fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田花子" } });
    fireEvent.change(screen.getByLabelText("住所"), { target: { value: "東京都千代田区1-1-1" } });
    fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "hanako@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onValidSubmit).toHaveBeenCalledWith({
      name: "山田花子",
      address: "東京都千代田区1-1-1",
      email: "hanako@example.com",
    });
  });

  it("clears the error for a field once it is corrected and resubmitted", () => {
    const onValidSubmit = jest.fn();
    render(<OrderForm onValidSubmit={onValidSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "注文する" }));
    expect(screen.getAllByRole("alert")).toHaveLength(3);

    fireEvent.change(screen.getByLabelText("氏名"), { target: { value: "山田花子" } });
    fireEvent.change(screen.getByLabelText("住所"), { target: { value: "東京都千代田区1-1-1" } });
    fireEvent.change(screen.getByLabelText("メールアドレス"), { target: { value: "hanako@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "注文する" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onValidSubmit).toHaveBeenCalledTimes(1);
  });
});
