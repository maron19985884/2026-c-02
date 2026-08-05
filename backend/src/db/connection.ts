import Database from 'better-sqlite3';

export function createConnection(dbPath: string): Database.Database {
  return new Database(dbPath);
}
