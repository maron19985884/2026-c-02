export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
}

export type BookListItem = Pick<Book, "id" | "title" | "author" | "price" | "imageUrl">;
