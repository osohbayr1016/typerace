import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  coins: {
    type: Number,
    default: 1000
  },
  exp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  inventory: [{
    type: String,
    default: []
  }],
  equippedCar: {
    type: String,
    default: null
  },
  equippedSkin: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);

