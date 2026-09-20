/**
 * apiClient の単体テスト。
 *
 * 検証対象（research.md D-11 / contracts/README.md）:
 * - 各エンドポイントの呼び出し
 * - エラー応答 { error: { code, message, details } } のパース
 * - ネットワーク断・JSON 不正時のフォールバック
 * - 注文作成で金額を送らないこと（FR-024）
 */
import {
  ApiClientError,
  createOrder,
  fetchBook,
  fetchBooks,
} from "@/lib/apiClient";

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("fetchBooks", () => {
  it("books 配列を返す", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ books: [{ id: 1, title: "A" }] }),
    );

    await expect(fetchBooks()).resolves.toEqual([{ id: 1, title: "A" }]);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/books");
  });

  it("0件でも空配列を返す（エラーにしない）", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ books: [] }));

    await expect(fetchBooks()).resolves.toEqual([]);
  });
});

describe("fetchBook", () => {
  it("指定した id を URL に含める", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ book: { id: 5 } }));

    await fetchBook(5);

    expect(mockFetch.mock.calls[0][0]).toContain("/api/books/5");
  });

  it("404 のとき BOOK_NOT_FOUND の ApiClientError を投げる", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "BOOK_NOT_FOUND", message: "該当の書籍が見つかりません" } },
        404,
      ),
    );

    await expect(fetchBook(99)).rejects.toMatchObject({
      name: "ApiClientError",
      status: 404,
      code: "BOOK_NOT_FOUND",
      message: "該当の書籍が見つかりません",
    });
  });
});

describe("createOrder", () => {
  const CUSTOMER = {
    name: "小林 景大",
    address: "東京都",
    email: "user@example.com",
  };

  it("POST で customer と items のみを送る（金額を送らない）", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ order: { orderNumber: "X", totalAmount: 100, items: [] } }, 201),
    );

    await createOrder(CUSTOMER, [{ bookId: 1, quantity: 2 }]);

    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string);
    expect(Object.keys(body).sort()).toEqual(["customer", "items"]);
    expect(body.items).toEqual([{ bookId: 1, quantity: 2 }]);
    expect(JSON.stringify(body)).not.toContain("totalAmount");
    expect(JSON.stringify(body)).not.toContain("unitPrice");
  });

  it("201 のとき order を返す", async () => {
    const order = { orderNumber: "X", totalAmount: 100, items: [] };
    mockFetch.mockResolvedValueOnce(jsonResponse({ order }, 201));

    await expect(createOrder(CUSTOMER, [])).resolves.toEqual(order);
  });

  it("400 のとき details.fields を保持した例外を投げる", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "入力内容に誤りがあります",
            details: { fields: { email: "INVALID_FORMAT" } },
          },
        },
        400,
      ),
    );

    await expect(createOrder(CUSTOMER, [])).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: { fields: { email: "INVALID_FORMAT" } },
    });
  });

  it("409 のとき unavailableBookIds を保持した例外を投げる", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: "BOOKS_UNAVAILABLE",
            message: "ご注文いただけない書籍が含まれています",
            details: { unavailableBookIds: [2] },
          },
        },
        409,
      ),
    );

    await expect(createOrder(CUSTOMER, [])).rejects.toMatchObject({
      code: "BOOKS_UNAVAILABLE",
      details: { unavailableBookIds: [2] },
    });
  });
});

describe("エラーのフォールバック", () => {
  it("ネットワーク断は status 0 の INTERNAL_ERROR にする", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(fetchBooks()).rejects.toMatchObject({
      status: 0,
      code: "INTERNAL_ERROR",
    });
  });

  it("エラー本文が JSON でない場合も既定のメッセージで例外にする", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    await expect(fetchBooks()).rejects.toBeInstanceOf(ApiClientError);
  });

  it("未知のエラーコードは INTERNAL_ERROR に丸める", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: { code: "SOMETHING_NEW", message: "?" } }, 500),
    );

    await expect(fetchBooks()).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
  });
});
