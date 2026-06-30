import { Book } from "../types/api";

// API_URL (no NEXT_PUBLIC prefix) is available server-side only (Docker internal).
// Falls back to NEXT_PUBLIC_API_URL for local development outside Docker.
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${API_URL}/books`);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function fetchBookById(id: number): Promise<Book | null> {
  const res = await fetch(`${API_URL}/books/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch book");
  return res.json();
}
