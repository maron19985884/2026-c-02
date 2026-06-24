export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  image_url: string;
};

export type CartItem = {
  book: Book;
  quantity: number;
};
