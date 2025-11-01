import { Request } from "express";
import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  coins: number;
  exp: number;
  level: number;
  inventory: string[];
  equippedCar: string | null;
  equippedSkin: string | null;
  createdAt: Date;
}

export interface IItem extends Document {
  sku: string;
  name: string;
  type: "car" | "skin";
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  stats?: {
    speed?: number;
    acceleration?: number;
  };
}

export interface IRace extends Document {
  raceId: string;
  players: {
    userId?: string;
    username: string;
    socketId: string;
    wpm: number;
    accuracy: number;
    placement: number;
    finishTime: number;
  }[];
  text: string;
  startedAt: Date;
  finishedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface SocketUser {
  id?: string;
  username: string;
  email?: string;
}

export interface Player {
  username: string;
  socketId: string;
  userId?: string;
  progress: number;
  wpm: number;
  finished: boolean;
  finishTime?: number;
  errors?: number;
}

export interface RaceData {
  raceId: string;
  text: string;
  players: Player[];
  startedAt: number;
  startsInMs?: number;
}
