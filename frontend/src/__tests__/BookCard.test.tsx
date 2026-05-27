import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import BookCard from '@/components/BookCard';
import type { Book } from '@/types';

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('@/components/BookCoverImage', () => {
  const MockImage = ({ alt }: { alt: string }) => <img alt={alt} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const book: Book = {
  id: '1',
  title: 'テスト書籍タイトル',
  author: 'テスト著者名',
  price: 1500,
  description: 'テスト用の説明文',
  coverImageUrl: '/cover.jpg',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('BookCard', () => {
  test('タイトル・著者・価格が表示されること', () => {
    render(<BookCard book={book} />);
    expect(screen.getByText('テスト書籍タイトル')).toBeInTheDocument();
    expect(screen.getByText('テスト著者名')).toBeInTheDocument();
    expect(screen.getByText('¥1,500')).toBeInTheDocument();
  });
});
