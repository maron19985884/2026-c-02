import { render, screen } from "@testing-library/react";

import HomePage from "@/app/page";
import BookDetailPage from "@/app/books/[id]/page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: "1" }),
  usePathname: () => "/",
}));

jest.mock("@/lib/api", () => ({
  api: { getBooks: jest.fn(), getBook: jest.fn() },
  ApiError: class ApiError extends Error {
    code: string;
    constructor(status: number, code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

const mockedApi = api as unknown as { getBooks: jest.Mock; getBook: jest.Mock };

describe("通信エラー時の表示（FR-032 / CL-007）", () => {
  beforeEach(() => jest.clearAllMocks());

  it("一覧取得が失敗すると汎用エラー表示（再試行ボタンなし）", async () => {
    mockedApi.getBooks.mockRejectedValue(new Error("boom"));
    render(<HomePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("通信に失敗しました");
    expect(screen.queryByRole("button", { name: /再試行|リトライ/ })).not.toBeInTheDocument();
  });

  it("詳細取得が失敗（NOT_FOUND 以外）すると汎用エラー表示＋一覧へ戻る導線", async () => {
    mockedApi.getBook.mockRejectedValue(new Error("boom"));
    render(<BookDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("通信に失敗しました");
    expect(screen.getByRole("link", { name: /商品一覧へ戻る/ })).toBeInTheDocument();
  });
});
