export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  imageUrl: string;
}

export type BookSummary = Omit<Book, 'description'>;
