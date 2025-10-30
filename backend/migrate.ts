import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schemas
interface UserDoc extends mongoose.Document {
  email?: string;
  username?: string;
  passwordHash?: string;
  level: number;
  exp: number;
  money: number;
  mmr: number;
  wins: number;
  bestWpm: number;
  totalRaces: number;
  averageAccuracy: number;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<UserDoc>({
  email: { type: String, index: true, unique: true, sparse: true },
  username: { type: String, index: true, unique: true, sparse: true },
  passwordHash: { type: String },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  money: { type: Number, default: 0 },
  mmr: { type: Number, default: 1000 },
  wins: { type: Number, default: 0 },
  bestWpm: { type: Number, default: 0 },
  totalRaces: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

interface ShopItemDoc extends mongoose.Document {
  sku: string;
  name: string;
  type: 'car' | 'skin' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  currency: 'coins';
  meta: Record<string, unknown>;
}

const ShopItemSchema = new mongoose.Schema<ShopItemDoc>({
  sku: { type: String, unique: true },
  name: String,
  type: { type: String, enum: ['car', 'skin', 'boost'] },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  price: { type: Number, default: 0 },
  currency: { type: String, enum: ['coins'], default: 'coins' },
  meta: { type: Object, default: {} }
});

interface SeasonDoc extends mongoose.Document {
  seasonId: string;
  theme?: string;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
}

const SeasonSchema = new mongoose.Schema<SeasonDoc>({
  seasonId: { type: String, unique: true },
  theme: { type: String },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

const User = mongoose.model('User', UserSchema);
const ShopItem = mongoose.model('ShopItem', ShopItemSchema);
const Season = mongoose.model('Season', SeasonSchema);

async function migrate() {
  try {
    const mongoUri = 'mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB - typeracer database');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await ShopItem.deleteMany({});
    await Season.deleteMany({});
    console.log('Cleared existing data');

    // Seed users
    console.log('Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        email: 'admin@typerace.mn',
        username: 'Admin',
        passwordHash: hashedPassword,
        level: 50,
        exp: 5000,
        money: 10000,
        mmr: 1800,
        wins: 150,
        bestWpm: 120,
        totalRaces: 300,
        averageAccuracy: 95,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'speedster@typerace.mn',
        username: 'Speedster',
        passwordHash: hashedPassword,
        level: 45,
        exp: 4500,
        money: 8500,
        mmr: 1700,
        wins: 120,
        bestWpm: 115,
        totalRaces: 280,
        averageAccuracy: 94,
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'champion@typerace.mn',
        username: 'Champion',
        passwordHash: hashedPassword,
        level: 40,
        exp: 4000,
        money: 7000,
        mmr: 1600,
        wins: 100,
        bestWpm: 110,
        totalRaces: 250,
        averageAccuracy: 93,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'racer@typerace.mn',
        username: 'Racer',
        passwordHash: hashedPassword,
        level: 35,
        exp: 3500,
        money: 5500,
        mmr: 1500,
        wins: 80,
        bestWpm: 105,
        totalRaces: 200,
        averageAccuracy: 92,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'typer@typerace.mn',
        username: 'Typer',
        passwordHash: hashedPassword,
        level: 30,
        exp: 3000,
        money: 4500,
        mmr: 1400,
        wins: 60,
        bestWpm: 100,
        totalRaces: 180,
        averageAccuracy: 91,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'fast@typerace.mn',
        username: 'Fast',
        passwordHash: hashedPassword,
        level: 25,
        exp: 2500,
        money: 3500,
        mmr: 1300,
        wins: 45,
        bestWpm: 95,
        totalRaces: 150,
        averageAccuracy: 90,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'novice@typerace.mn',
        username: 'Novice',
        passwordHash: hashedPassword,
        level: 20,
        exp: 2000,
        money: 2500,
        mmr: 1200,
        wins: 30,
        bestWpm: 90,
        totalRaces: 120,
        averageAccuracy: 88,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'beginner@typerace.mn',
        username: 'Beginner',
        passwordHash: hashedPassword,
        level: 15,
        exp: 1500,
        money: 1800,
        mmr: 1100,
        wins: 20,
        bestWpm: 85,
        totalRaces: 90,
        averageAccuracy: 86,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'newbie@typerace.mn',
        username: 'Newbie',
        passwordHash: hashedPassword,
        level: 10,
        exp: 1000,
        money: 1200,
        mmr: 1050,
        wins: 12,
        bestWpm: 80,
        totalRaces: 60,
        averageAccuracy: 84,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'fresh@typerace.mn',
        username: 'Fresh',
        passwordHash: hashedPassword,
        level: 5,
        exp: 500,
        money: 800,
        mmr: 1000,
        wins: 5,
        bestWpm: 70,
        totalRaces: 30,
        averageAccuracy: 82,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        email: 'guest1@typerace.mn',
        username: 'Guest1',
        level: 1,
        exp: 0,
        money: 0,
        mmr: 1000,
        wins: 0,
        bestWpm: 0,
        totalRaces: 0,
        averageAccuracy: 0,
        createdAt: new Date()
      },
      {
        email: 'guest2@typerace.mn',
        username: 'Guest2',
        level: 1,
        exp: 0,
        money: 0,
        mmr: 1000,
        wins: 0,
        bestWpm: 0,
        totalRaces: 0,
        averageAccuracy: 0,
        createdAt: new Date()
      }
    ]);
    console.log(`Created ${users.length} users`);

    // Seed shop items
    console.log('Creating shop items...');
    const shopItems = await ShopItem.insertMany([
      { sku: 'car.basic', name: 'Starter Car', type: 'car', rarity: 'common', price: 100, currency: 'coins', meta: { speed: 1 } },
      { sku: 'car.sport', name: 'Sportster', type: 'car', rarity: 'rare', price: 500, currency: 'coins', meta: { speed: 2 } },
      { sku: 'car.racer', name: 'Racer X', type: 'car', rarity: 'rare', price: 800, currency: 'coins', meta: { speed: 3 } },
      { sku: 'car.speed', name: 'Speed Demon', type: 'car', rarity: 'epic', price: 1200, currency: 'coins', meta: { speed: 4 } },
      { sku: 'car.nitro', name: 'Nitro Beast', type: 'car', rarity: 'legendary', price: 2000, currency: 'coins', meta: { speed: 5 } },
      { sku: 'skin.flame', name: 'Flame Skin', type: 'skin', rarity: 'epic', price: 300, currency: 'coins', meta: { effect: 'fire' } },
      { sku: 'skin.ice', name: 'Ice Skin', type: 'skin', rarity: 'epic', price: 350, currency: 'coins', meta: { effect: 'ice' } },
      { sku: 'skin.rainbow', name: 'Rainbow Skin', type: 'skin', rarity: 'legendary', price: 500, currency: 'coins', meta: { effect: 'rainbow' } },
      { sku: 'boost.exp', name: 'XP Booster', type: 'boost', rarity: 'common', price: 50, currency: 'coins', meta: { multiplier: 1.5 } },
      { sku: 'boost.coins', name: 'Coin Doubler', type: 'boost', rarity: 'rare', price: 100, currency: 'coins', meta: { multiplier: 2 } },
    ]);
    console.log(`Created ${shopItems.length} shop items`);

    // Seed season
    console.log('Creating current season...');
    const now = new Date();
    const currentSeason = await Season.create({
      seasonId: `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`,
      theme: 'Winter Championship',
      startsAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)),
      endsAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)),
      active: true
    });
    console.log(`Created season: ${currentSeason.seasonId}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Email: admin@typerace.mn');
    console.log('Password: password123');
    console.log('\n(Use these credentials for any seeded user)');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

migrate();

