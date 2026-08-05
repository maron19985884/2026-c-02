import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema';
import { BookService } from '../../src/services/bookService';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  initSchema(db);
  return db;
}

function insertBook(db: Database.Database, overrides: Partial<Record<string, unknown>> = {}) {
  const book = {
    title: 'Title A',
    author: 'Author A',
    price: 1000,
    description: 'desc A',
    image_url: 'imgA',
    ...overrides,
  };
  db.prepare(
    'INSERT INTO books (title, author, price, description, image_url) VALUES (@title, @author, @price, @description, @image_url)'
  ).run(book);
}

describe('BookService', () => {
  it('lists books without description, ordered by id (FR-001, FR-002)', () => {
    const db = createTestDb();
    insertBook(db, { title: 'Title A' });
    insertBook(db, { title: 'Title B' });

    const books = new BookService(db).listBooks();

    expect(books).toHaveLength(2);
    expect(books[0]).toEqual({ id: 1, title: 'Title A', author: 'Author A', price: 1000, imageUrl: 'imgA' });
    expect((books[0] as Record<string, unknown>).description).toBeUndefined();
  });

  it('returns a book by id including description (FR-004)', () => {
    const db = createTestDb();
    insertBook(db);

    const book = new BookService(db).getBookById(1);

    expect(book).toEqual({
      id: 1,
      title: 'Title A',
      author: 'Author A',
      price: 1000,
      description: 'desc A',
      imageUrl: 'imgA',
    });
  });

  it('returns undefined for a non-existent id (FR-003 の 404 判定に使用)', () => {
    const db = createTestDb();
    expect(new BookService(db).getBookById(999)).toBeUndefined();
  });
});
