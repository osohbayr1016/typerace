import { Response } from 'express';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Item } from '../models/Item';

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const items = await Item.find({ sku: { $in: user.inventory } });

    res.json({
      inventory: items,
      equippedCar: user.equippedCar,
      equippedSkin: user.equippedSkin
    });
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const equipItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { carSku, skinSku } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (carSku !== undefined) {
      if (carSku && !user.inventory.includes(carSku)) {
        res.status(400).json({ error: 'You do not own this car' });
        return;
      }
      user.equippedCar = carSku || null;
    }

    if (skinSku !== undefined) {
      if (skinSku && !user.inventory.includes(skinSku)) {
        res.status(400).json({ error: 'You do not own this skin' });
        return;
      }
      user.equippedSkin = skinSku || null;
    }

    await user.save();

    res.json({
      message: 'Item equipped successfully',
      equippedCar: user.equippedCar,
      equippedSkin: user.equippedSkin
    });
  } catch (error) {
    console.error('Equip error:', error);
    res.status(500).json({ error: 'Failed to equip item' });
  }
};

