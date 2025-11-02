import { Response } from 'express';
import { AuthRequest } from '../types';
import { getCatalog, purchaseItem } from '../services/shopService';

export const catalog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await getCatalog();
    res.json({ items });
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
};

export const purchase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { itemId } = req.body;

    if (!itemId) {
      res.status(400).json({ error: 'Item ID is required' });
      return;
    }

    const result = await purchaseItem(req.user.id, itemId);

    res.json({
      message: 'Purchase successful',
      item: result.item,
      newBalance: result.newBalance
    });
  } catch (error) {
    console.error('Purchase error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to purchase item';
    res.status(400).json({ error: errorMessage });
  }
};

