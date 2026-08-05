import path from 'path';
import fs from 'fs';
import { createConnection } from './db/connection';
import { initSchema } from './db/schema';
import { seedBooks } from './db/seed';
import { createApp } from './api';

const PORT = Number(process.env.PORT ?? 4000);
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'bookstore.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = createConnection(DB_PATH);
initSchema(db);
seedBooks(db);

const app = createApp(db);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on port ${PORT}`);
});
