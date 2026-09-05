import { findSellingById, findSellingPage } from "../../src/repositories/bookRepository";
import { getSellingBook, listSellingBooks, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "../../src/services/bookService";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("../../src/repositories/bookRepository");

const mockedFindSellingPage = findSellingPage as jest.MockedFunction<typeof findSellingPage>;
const mockedFindSellingById = findSellingById as jest.MockedFunction<typeof findSellingById>;

const row = (id: number) => ({
  id,
  title: `Book ${id}`,
  author: "Author",
  price: 100 * id,
  cover_image_url: "/images/books/placeholder.svg",
  description: "",
  status: "selling" as const,
});

describe("bookService.listSellingBooks", () => {
  beforeEach(() => jest.resetAllMocks());

  it("既定値（page=1, pageSize=12）でページングする", async () => {
    mockedFindSellingPage.mockResolvedValue({ rows: [row(1), row(2)], totalItems: 2 });

    const result = await listSellingBooks({});

    expect(mockedFindSellingPage).toHaveBeenCalledWith(1, 12);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(12);
    expect(result.totalItems).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).not.toHaveProperty("description");
  });

  it("pageSize が範囲外(0)なら 400", async () => {
    await expect(listSellingBooks({ pageSize: "0" })).rejects.toMatchObject({ status: 400 });
  });

  it(`pageSize が範囲外(${MAX_PAGE_SIZE + 1})なら 400`, async () => {
    await expect(listSellingBooks({ pageSize: String(MAX_PAGE_SIZE + 1) })).rejects.toMatchObject({
      status: 400,
    });
  });

  it("page が範囲外(999)なら最終ページへ丸める", async () => {
    mockedFindSellingPage
      .mockResolvedValueOnce({ rows: [], totalItems: 25 })
      .mockResolvedValueOnce({ rows: [row(25)], totalItems: 25 });

    const result = await listSellingBooks({ page: "999", pageSize: "12" });

    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(3);
    expect(mockedFindSellingPage).toHaveBeenNthCalledWith(2, 3, 12);
  });

  it("販売中0件なら items=[] totalPages=0", async () => {
    mockedFindSellingPage.mockResolvedValue({ rows: [], totalItems: 0 });

    const result = await listSellingBooks({});

    expect(result.items).toEqual([]);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("page が整数でなければ 400", async () => {
    await expect(listSellingBooks({ page: "abc" })).rejects.toBeInstanceOf(AppError);
  });

  it(`pageSize=${MIN_PAGE_SIZE} は許可される`, async () => {
    mockedFindSellingPage.mockResolvedValue({ rows: [row(1)], totalItems: 1 });
    const result = await listSellingBooks({ pageSize: String(MIN_PAGE_SIZE) });
    expect(result.pageSize).toBe(MIN_PAGE_SIZE);
  });
});

describe("bookService.getSellingBook", () => {
  beforeEach(() => jest.resetAllMocks());

  it("整数かつ実在すれば description を含めて返す", async () => {
    mockedFindSellingById.mockResolvedValue({ ...row(1), description: "説明文" });
    const result = await getSellingBook("1");
    expect(result.description).toBe("説明文");
  });

  it("非整数の id は 400", async () => {
    await expect(getSellingBook("abc")).rejects.toMatchObject({ status: 400 });
  });

  it("存在しない id は 404", async () => {
    mockedFindSellingById.mockResolvedValue(null);
    await expect(getSellingBook("999")).rejects.toMatchObject({ status: 404 });
  });
});
