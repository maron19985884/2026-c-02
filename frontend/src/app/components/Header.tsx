'use client';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { totalCount } = useCart();
  return (
    <header style={{ background: '#2563eb', color: '#fff', padding: '0 1rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
          BookStore
        </Link>
        <Link href="/cart" style={{ color: '#fff', fontWeight: 600 }}>
          カート {totalCount > 0 && (
            <span style={{ background: '#ef4444', borderRadius: '50%', padding: '2px 7px', fontSize: '0.8rem', marginLeft: 4 }}>
              {totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
