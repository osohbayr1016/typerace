import mongoose, { Schema } from 'mongoose';
import { IItem } from '../types';

const itemSchema = new Schema<IItem>({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['car', 'skin'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  stats: {
    speed: { type: Number, default: 0 },
    acceleration: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

itemSchema.index({ sku: 1 });
itemSchema.index({ type: 1 });

export const Item = mongoose.model<IItem>('Item', itemSchema);

