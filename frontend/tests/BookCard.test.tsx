/**
 * BookCard の単体テスト（T025）。
 *
 * 検証対象:
 * - 必須項目（タイトル・著者・価格）の描画（FR-002）
 * - 書影あり／なしの表示（Edge Cases）
 * - 詳細ページへのリンク先が /books/[id] であること（FR-003）
 */
import { render, screen } from "@testing-library/react";
import BookCard from "@/components/BookCard";
import type { BookSummary } from "@/lib/apiClient";

const BOOK_WITH_COVER: BookSummary = {
  id: 1,
  title: "吾輩は猫である",
  author: "夏目漱石",
  price: 880,
  coverImageUrl: "https://example.com/1.png",
};

const BOOK_WITHOUT_COVER: BookSummary = {
  id: 2,
  title: "銀河鉄道の夜",
  author: "宮沢賢治",
  price: 660,
  coverImageUrl: null,
};

describe("BookCard", () => {
  it("タイトル・著者・価格を表示する", () => {
    render(<BookCard book={BOOK_WITH_COVER} />);

    expect(screen.getByText("吾輩は猫である")).toBeInTheDocument();
    expect(screen.getByText("夏目漱石")).toBeInTheDocument();
    expect(screen.getByText("880 円")).toBeInTheDocument();
  });

  it("書影がある場合は画像を代替テキスト付きで表示する", () => {
    render(<BookCard book={BOOK_WITH_COVER} />);

    const img = screen.getByAltText("吾輩は猫である の書影");
    expect(img).toHaveAttribute("src", "https://example.com/1.png");
  });

  it("書影がない場合は代替表示に切り替える", () => {
    render(<BookCard book={BOOK_WITHOUT_COVER} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("書影なし")).toBeInTheDocument();
    // 書影がなくてもタイトル・著者・価格は表示され続ける
    expect(screen.getByText("銀河鉄道の夜")).toBeInTheDocument();
    expect(screen.getByText("660 円")).toBeInTheDocument();
  });

  it("カード全体が /books/[id] へのリンクになっている", () => {
    render(<BookCard book={BOOK_WITH_COVER} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/books/1");
  });

  it("価格は3桁区切りで表示する", () => {
    render(
      <BookCard book={{ ...BOOK_WITH_COVER, price: 12345 }} />,
    );

    expect(screen.getByText("12,345 円")).toBeInTheDocument();
  });
});
