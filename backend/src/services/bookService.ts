import { validationError, notFound } from "../middleware/errorHandler";
import {
  findSellingById,
  findSellingPage,
  type BookRow,
} from "../repositories/bookRepository";

export const DEFAULT_PAGE_SIZE = 12;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 48;

export interface BookSummaryDto {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
}

export interface BooksListDto {
  items: BookSummaryDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface BookDetailDto extends BookSummaryDto {
  description: string;
}

function toSummary(row: BookRow): BookSummaryDto {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    coverImageUrl: row.cover_image_url,
  };
}

interface RawQuery {
  page?: unknown;
  pageSize?: unknown;
}

function parseIntStrict(value: unknown, fallback: number, label: string): number {
  if (value === undefined || value === "") return fallback;
  const s = String(value);
  if (!/^-?\d+$/.test(s)) {
    throw validationError(`${label} must be an integer`);
  }
  return Number.parseInt(s, 10);
}

/** GET /api/books のクエリを検証・正規化し、ページングして返す。 */
export async function listSellingBooks(query: RawQuery): Promise<BooksListDto> {
  const pageSize = parseIntStrict(query.pageSize, DEFAULT_PAGE_SIZE, "pageSize");
  if (pageSize < MIN_PAGE_SIZE || pageSize > MAX_PAGE_SIZE) {
    throw validationError(`pageSize must be between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`);
  }

  let page = parseIntStrict(query.page, 1, "page");
  if (page < 1) {
    throw validationError("page must be >= 1");
  }

  // 総数を知るため一旦取得
  const first = await findSellingPage(page, pageSize);
  const totalItems = first.totalItems;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

  let rows = first.rows;
  // 範囲外ページは最終ページへ丸めて再取得（CL-006）
  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
    rows = (await findSellingPage(page, pageSize)).rows;
  }

  return {
    items: rows.map(toSummary),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

/** GET /api/books/:id。非整数は 400、非実在・unlisted は 404。 */
export async function getSellingBook(idParam: string): Promise<BookDetailDto> {
  if (!/^\d+$/.test(idParam)) {
    throw validationError("id must be an integer");
  }
  const id = Number.parseInt(idParam, 10);
  const row = await findSellingById(id);
  if (!row) {
    throw notFound("book not found");
  }
  return { ...toSummary(row), description: row.description };
}
