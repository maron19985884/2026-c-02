import Database from 'better-sqlite3';
import { Book, BookSummary } from '../models/book';

interface BookRow {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
}

type BookSummaryRow = Omit<BookRow, 'description'>;

function toBookSummary(row: BookSummaryRow): BookSummary {
  return { id: row.id, title: row.title, author: row.author, price: row.price, imageUrl: row.image_url };
}

function toBook(row: BookRow): Book {
  return { ...toBookSummary(row), description: row.description };
}

export class BookService {
  constructor(private db: Database.Database) {}

  listBooks(): BookSummary[] {
    const rows = this.db
      .prepare('SELECT id, title, author, price, image_url FROM books ORDER BY id')
      .all() as BookSummaryRow[];
    return rows.map(toBookSummary);
  }

  getBookById(id: number): Book | undefined {
    const row = this.db.prepare('SELECT * FROM books WHERE id = ?').get(id) as BookRow | undefined;
    return row ? toBook(row) : undefined;
  }
}
