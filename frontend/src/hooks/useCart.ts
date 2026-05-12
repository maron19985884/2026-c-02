'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '@/types';

// localStorageに使用するキー名
const CART_KEY = 'bookstore_cart';

/**
 * localStorageからカートを読み込む（ブラウザ環境専用）
 * SSR環境では呼び出さない
 */
function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * localStorageにカートを書き込む
 */
function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/**
 * カートのlocalStorage操作を集約したカスタムフック
 * SSR環境での localStorage アクセスエラーを防ぐため、
 * useEffect内でのみ読み書きを行う
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  // SSR/CSR不一致を防ぐためのハイドレーション完了フラグ
  const [initialized, setInitialized] = useState(false);

  // マウント時にlocalStorageから読み込む
  useEffect(() => {
    setItems(loadCart());
    setInitialized(true);
  }, []);

  // items 変更時にlocalStorageへ書き込む（初期化完了後のみ）
  useEffect(() => {
    if (initialized) {
      saveCart(items);
    }
  }, [items, initialized]);

  /**
   * カートに商品を追加する
   * 既存商品なら数量を1加算、新規なら数量1で追加する
   */
  const addItem = useCallback((product: { id: number; title: string; price: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        title:      product.title,
        price:      product.price,
        quantity:   1,
      }];
    });
  }, []);

  /**
   * 数量を変更する
   * 1未満の値は無視する（前提B: 数量「-」は quantity=1 のとき disabled）
   */
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(i => i.product_id === productId ? { ...i, quantity } : i)
    );
  }, []);

  /**
   * 商品をカートから削除する
   */
  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.product_id !== productId));
  }, []);

  /**
   * カートを空にする（注文完了後に呼び出す）
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /** 合計金額（各アイテムの price × quantity の総和） */
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  /** カート内の総アイテム数（各アイテムの quantity の合計） */
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    initialized,
    totalAmount,
    totalCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
