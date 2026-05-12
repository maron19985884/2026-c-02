'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header style={{ background: '#2c3e50', color: '#fff', padding: '0.9rem 0', marginBottom: '2rem' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
          オンライン書店
        </Link>
        <Link href="/cart" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          カート
          {count > 0 && (
            <span style={{
              background: '#e74c3c', color: '#fff', borderRadius: '999px',
              padding: '0 0.5rem', fontSize: '0.8rem', fontWeight: 700,
            }}>
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
