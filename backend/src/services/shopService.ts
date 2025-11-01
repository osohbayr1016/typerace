import { User } from '../models/User';
import { Item } from '../models/Item';

export const getCatalog = async () => {
  const items = await Item.find();
  return items;
};

export const purchaseItem = async (userId: string, itemId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const item = await Item.findOne({ sku: itemId });
  if (!item) {
    throw new Error('Item not found');
  }

  if (user.inventory.includes(item.sku)) {
    throw new Error('You already own this item');
  }

  if (user.coins < item.price) {
    throw new Error('Insufficient coins');
  }

  user.coins -= item.price;
  user.inventory.push(item.sku);
  await user.save();

  return {
    item,
    newBalance: user.coins
  };
};

export const seedShopItems = async () => {
  const existingItems = await Item.countDocuments();
  if (existingItems > 0) {
    return;
  }

  const items = [
    // Cars
    { sku: 'car_basic_red', name: 'Red Racer', type: 'car', price: 0, rarity: 'common', stats: { speed: 5, acceleration: 5 } },
    { sku: 'car_sport_blue', name: 'Blue Lightning', type: 'car', price: 1500, rarity: 'rare', stats: { speed: 7, acceleration: 6 } },
    { sku: 'car_super_gold', name: 'Golden Thunder', type: 'car', price: 3000, rarity: 'epic', stats: { speed: 9, acceleration: 8 } },
    { sku: 'car_hyper_chrome', name: 'Chrome Fury', type: 'car', price: 5000, rarity: 'legendary', stats: { speed: 10, acceleration: 10 } },
    
    // Skins
    { sku: 'skin_default', name: 'Default Skin', type: 'skin', price: 0, rarity: 'common' },
    { sku: 'skin_flames', name: 'Flame Skin', type: 'skin', price: 800, rarity: 'rare' },
    { sku: 'skin_neon', name: 'Neon Glow', type: 'skin', price: 1200, rarity: 'epic' },
    { sku: 'skin_galaxy', name: 'Galaxy Skin', type: 'skin', price: 2000, rarity: 'legendary' }
  ];

  await Item.insertMany(items);
  console.log('✅ Shop items seeded successfully');
};

