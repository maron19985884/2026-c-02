export type BookSummary = {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string | null;
};

export type Book = BookSummary & {
  description: string;
};
