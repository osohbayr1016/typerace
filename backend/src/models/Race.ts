import mongoose, { Schema } from 'mongoose';
import { IRace } from '../types';

const raceSchema = new Schema<IRace>({
  raceId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: { type: String },
    username: { type: String, required: true },
    socketId: { type: String, required: true },
    wpm: { type: Number, default: 0 },
    accuracy: { type: Number, default: 100 },
    placement: { type: Number, default: 0 },
    finishTime: { type: Number, default: 0 }
  }],
  text: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  finishedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

raceSchema.index({ raceId: 1 });
raceSchema.index({ 'players.userId': 1 });

export const Race = mongoose.model<IRace>('Race', raceSchema);

