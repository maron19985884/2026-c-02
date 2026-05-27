import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../data');

export async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
