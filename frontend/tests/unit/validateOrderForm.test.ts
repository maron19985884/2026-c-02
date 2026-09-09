import { validateOrderForm } from "@/lib/validateOrderForm";
import type { CustomerInfo } from "@/types/order";

const validInfo: CustomerInfo = {
  name: "山田花子",
  address: "東京都千代田区1-1-1",
  email: "hanako@example.com",
};

describe("validateOrderForm", () => {
  it("returns no errors when all fields are valid", () => {
    expect(validateOrderForm(validInfo)).toEqual({});
  });

  it("returns an error when name is empty", () => {
    const errors = validateOrderForm({ ...validInfo, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("returns an error when name is only whitespace", () => {
    const errors = validateOrderForm({ ...validInfo, name: "   " });
    expect(errors.name).toBeDefined();
  });

  it("returns an error when address is empty", () => {
    const errors = validateOrderForm({ ...validInfo, address: "" });
    expect(errors.address).toBeDefined();
  });

  it("returns an error when email is empty", () => {
    const errors = validateOrderForm({ ...validInfo, email: "" });
    expect(errors.email).toBeDefined();
  });

  it("returns an error when email does not contain an @", () => {
    const errors = validateOrderForm({ ...validInfo, email: "invalid-email" });
    expect(errors.email).toBeDefined();
  });

  it("returns errors for every invalid field at once", () => {
    const errors = validateOrderForm({ name: "", address: "", email: "" });
    expect(errors).toEqual({
      name: expect.any(String),
      address: expect.any(String),
      email: expect.any(String),
    });
  });
});
