import { Request, Response } from 'express';
import { getAllProducts, getProductById } from '../db/productsQuery';

/**
 * GET /api/products
 * 全商品一覧を取得して返す
 */
export async function getProducts(_req: Request, res: Response): Promise<void> {
  try {
    const products = await getAllProducts();
    res.status(200).json({ products });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/products/:id
 * 指定IDの商品詳細を取得して返す
 */
export async function getProductById_controller(req: Request, res: Response): Promise<void> {
  // IDを数値に変換してバリデーションする
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid product id' });
    return;
  }

  try {
    const product = await getProductById(id);
    if (product === undefined) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(200).json({ product });
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
