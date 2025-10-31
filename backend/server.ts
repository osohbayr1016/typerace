import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string; username: string };
  }
}

// App & IO
const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const io = new Server(server, {
  cors: { origin: clientOrigin, methods: ['GET', 'POST'], credentials: true }
});

// Middleware
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// DB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/type-race';
mongoose.connect(mongoUri);
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Schemas & Models
interface UserDoc extends Document {
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
  equipped?: { carSku?: string; skinSku?: string };
  friends?: Types.ObjectId[];
  teamId?: Types.ObjectId | null;
  createdAt: Date;
}

const UserSchema = new Schema<UserDoc>({
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
  equipped: { type: Object, default: {} },
  friends: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  createdAt: { type: Date, default: Date.now }
});

interface RacePlayer {
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
  finished: boolean;
  socketId?: string;
  progress?: number;
  currentWpm?: number;
  isBot?: boolean;
}

interface RaceDoc extends Document {
  players: RacePlayer[];
  text: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: Date;
}

const RaceSchema = new Schema<RaceDoc>({
  players: [{
    userId: String,
    username: String,
    wpm: Number,
    accuracy: Number,
    time: Number,
    errors: Number,
    finished: Boolean
  }],
  text: String,
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now }
});

interface ShopItemDoc extends Document {
  sku: string;
  name: string;
  type: 'car' | 'skin' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  currency: 'coins';
  meta: Record<string, unknown>;
}

const ShopItemSchema = new Schema<ShopItemDoc>({
  sku: { type: String, unique: true },
  name: String,
  type: { type: String, enum: ['car', 'skin', 'boost'] },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  price: { type: Number, default: 0 },
  currency: { type: String, enum: ['coins'], default: 'coins' },
  meta: { type: Object, default: {} }
});

interface InventoryDoc extends Document {
  userId: Types.ObjectId;
  items: { sku: string; acquiredAt: Date }[];
}

const InventorySchema = new Schema<InventoryDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  items: [{ sku: String, acquiredAt: { type: Date, default: Date.now } }]
});

interface TransactionDoc extends Document {
  userId: Types.ObjectId;
  type: 'reward' | 'purchase';
  amount: number;
  currency: 'coins';
  sku?: string | null;
  createdAt: Date;
}

const TransactionSchema = new Schema<TransactionDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['reward', 'purchase'], index: true },
  amount: Number,
  currency: { type: String, enum: ['coins'], default: 'coins' },
  sku: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

interface TaskClaimDoc extends Document {
  userId: Types.ObjectId;
  taskKey: string;
  periodStart: Date;
  claimedAt: Date;
}

const TaskClaimSchema = new Schema<TaskClaimDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  taskKey: { type: String, index: true },
  periodStart: { type: Date, index: true },
  claimedAt: { type: Date, default: Date.now }
});

interface AchievementUnlockDoc extends Document {
  userId: Types.ObjectId;
  achievementKey: string;
  unlockedAt: Date;
}

const AchievementUnlockSchema = new Schema<AchievementUnlockDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  achievementKey: { type: String, index: true },
  unlockedAt: { type: Date, default: Date.now }
});

const User: Model<UserDoc> = mongoose.model('User', UserSchema);
const Race: Model<RaceDoc> = mongoose.model('Race', RaceSchema);
const ShopItem: Model<ShopItemDoc> = mongoose.model('ShopItem', ShopItemSchema);
const Inventory: Model<InventoryDoc> = mongoose.model('Inventory', InventorySchema);
const Transaction: Model<TransactionDoc> = mongoose.model('Transaction', TransactionSchema);
const TaskClaim: Model<TaskClaimDoc> = mongoose.model('TaskClaim', TaskClaimSchema);
const AchievementUnlock: Model<AchievementUnlockDoc> = mongoose.model('AchievementUnlock', AchievementUnlockSchema);

// Teams
interface TeamDoc extends Document {
  name: string;
  ownerId: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
}

const TeamSchema = new Schema<TeamDoc>({
  name: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Team: Model<TeamDoc> = mongoose.model('Team', TeamSchema);

// Season
interface SeasonDoc extends Document {
  seasonId: string;
  theme?: string;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
}

const SeasonSchema = new Schema<SeasonDoc>({
  seasonId: { type: String, unique: true },
  theme: { type: String },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

const Season: Model<SeasonDoc> = mongoose.model('Season', SeasonSchema);

// Leagues
const LEAGUES = [
  { id: 'Bronze', min: 0 },
  { id: 'Silver', min: 900 },
  { id: 'Gold', min: 1100 },
  { id: 'Platinum', min: 1300 },
  { id: 'Diamond', min: 1500 },
  { id: 'Challenger', min: 1700 },
] as const;

function leagueFor(mmr: number): string {
  let current: string = LEAGUES[0].id;
  for (const l of LEAGUES) if (mmr >= l.min) current = l.id;
  return current;
}

function calcMmrDelta(rank: number, total: number, playerWpm: number) {
  const base = (total - rank) * 10; // 1st in 4p: 30
  const wpmAdj = Math.max(-5, Math.min(5, Math.floor((playerWpm - 60) / 20))); // +-5 window
  return base + wpmAdj;
}

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const COOKIE_NAME = process.env.COOKIE_NAME || 'auth_token';
const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax' as const, secure: false };

const signJwt = (payload: { userId: string; username: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

const authRequired = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.cookies?.[COOKIE_NAME]) as string | undefined;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Leveling helpers - infinite progressive curve
// XP required to go from (level) -> (level + 1)
function xpForLevel(level: number): number {
  const base = 100; // base XP for level 1 -> 2
  const growth = 1.15; // 15% harder each level
  return Math.round(base * Math.pow(growth, Math.max(0, level - 1)));
}

function computeLevelProgress(totalExp: number): { level: number; expInLevel: number; nextLevelXp: number } {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalExp || 0));
  while (true) {
    const need = xpForLevel(level);
    if (remaining < need) {
      return { level, expInLevel: remaining, nextLevelXp: need };
    }
    remaining -= need;
    level += 1;
  }
}

// Game state
type ActiveRace = {
  id: string;
  text: string;
  players: (RacePlayer & { socketId: string })[];
  status: 'active';
  startTime: number;
};

const activeRaces = new Map<string, ActiveRace>();
const waitingPlayers = new Map<string, { socketId: string; userId: string; username: string; joinedAt: number; isBot?: boolean; botTargetWpm?: number; imageUrl?: string }>();
const botIntervals = new Map<string, ReturnType<typeof setInterval>[]>();
let lobbyBotSeedTimer: ReturnType<typeof setTimeout> | null = null;
let lobbyBotAddInterval: ReturnType<typeof setInterval> | null = null;

// Queue settings and countdown state
const MIN_PLAYERS = 3; // countdown allowed at 3+
const MAX_PLAYERS = 5; // cap lobby at 5 (fill with bots after start if needed)
const COUNTDOWN_MS = 2000; // 2s countdown when threshold met
const RACE_START_GRACE_MS = 2000; // extra modal countdown on race page
const BOT_START_DELAY_MS = 1000; // bots start 1s after countdown ends
let waitingCountdownTimer: ReturnType<typeof setTimeout> | null = null;
let countdownEndsAt: number | null = null;

async function resolveCarImageUrl(userId: string): Promise<string | undefined> {
  try {
    const user = await User.findById(userId).select('equipped');
    const carSku = (user as any)?.equipped?.carSku || 'car.basic';
    const item = await ShopItem.findOne({ sku: carSku }).select('meta');
    return (item as any)?.meta?.image;
  } catch {
    return undefined;
  }
}

const broadcastWaitingState = () => {
  const players = Array.from(waitingPlayers.values()).map(p => ({ username: p.username, socketId: p.socketId, imageUrl: (p as any).imageUrl }));
  io.emit('waiting-state', { players, count: players.length, countdownEndsAt });
}

const maybeStartWaitingCountdown = () => {
  if (waitingPlayers.size < MIN_PLAYERS) return;
  if (waitingCountdownTimer) return; // already counting down
  countdownEndsAt = Date.now() + COUNTDOWN_MS;
  io.emit('race-starting', { startsInMs: COUNTDOWN_MS });
  broadcastWaitingState();
  waitingCountdownTimer = setTimeout(() => {
    waitingCountdownTimer = null;
    countdownEndsAt = null;
    startRace();
  }, COUNTDOWN_MS);
}

async function computeBaselineWpm(): Promise<number> {
  try {
    const humanUsers = Array.from(waitingPlayers.values()).filter(p => !p.isBot);
    if (humanUsers.length === 0) return 50;
    const ids = humanUsers.map(h => h.userId).filter(Boolean);
    const users = await User.find({ _id: { $in: ids } }).select('bestWpm');
    const arr = users.map(u => (u.bestWpm || 0)).filter(n => n > 0);
    const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;
    return Math.max(30, Math.min(120, avg));
  } catch {
    return 50;
  }
}

function cancelLobbyBotTimers() {
  if (lobbyBotSeedTimer) { clearTimeout(lobbyBotSeedTimer); lobbyBotSeedTimer = null; }
  if (lobbyBotAddInterval) { clearInterval(lobbyBotAddInterval); lobbyBotAddInterval = null; }
}

async function startLobbyBotSeeding() {
  cancelLobbyBotTimers();
  lobbyBotSeedTimer = setTimeout(async () => {
    // Add one bot at a time until 5 players in lobby
    cancelLobbyBotTimers();
    lobbyBotAddInterval = setInterval(async () => {
      const total = waitingPlayers.size;
      if (total >= MAX_PLAYERS) {
        cancelLobbyBotTimers();
        // quick start if full
        if (waitingCountdownTimer) { clearTimeout(waitingCountdownTimer); waitingCountdownTimer = null; }
        countdownEndsAt = Date.now() + 1000;
        io.emit('race-starting', { startsInMs: 1000 });
        broadcastWaitingState();
        waitingCountdownTimer = setTimeout(() => { waitingCountdownTimer = null; countdownEndsAt = null; startRace(); }, 1000);
        return;
      }
      // Only seed if there is at least one human waiting
      const hasHuman = Array.from(waitingPlayers.values()).some(p => !p.isBot);
      if (!hasHuman) { cancelLobbyBotTimers(); return; }
      const baseline = await computeBaselineWpm();
      const variance = (Math.random() - 0.5) * 0.3; // +-15%
      const target = Math.round(Math.max(25, Math.min(140, baseline * (1 + variance))));
      const botId = `bot_wait_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      waitingPlayers.set(botId, { socketId: botId, userId: '0', username: `Bot_${Math.floor(Math.random() * 900) + 100}`, joinedAt: Date.now(), isBot: true, botTargetWpm: target });
      broadcastWaitingState();
      // If we just reached cap, the next loop iteration will trigger start
    }, 700);
  }, 2000);
}

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      (socket as any).userId = decoded.userId;
      (socket as any).authenticatedUsername = decoded.username;
    }
    next();
  } catch {
    next();
  }
});

// Socket
io.on('connection', (socket: Socket) => {
  // Join waiting room
  socket.on('join-waiting', async (userData: { username: string }) => {
    try {
      let user: any;
      const authenticatedUserId = (socket as any).userId;
      
      // If user is authenticated, use their account
      if (authenticatedUserId) {
        user = await User.findById(authenticatedUserId);
      } else {
        // Guest user - create/find by username (don't increment totalRaces here, it happens on race completion)
        user = await User.findOneAndUpdate(
          { username: userData.username },
          { username: userData.username },
          { upsert: true, new: true }
        );
      }
      
      if (!user) return;
      const userId = (user._id as Types.ObjectId).toString();
      const imageUrl = await resolveCarImageUrl(userId);
      waitingPlayers.set(socket.id, { socketId: socket.id, userId, username: user.username || userData.username, joinedAt: Date.now(), imageUrl });
      console.log(`[USER JOINED] Username: ${user.username}, UserID: ${userId}, Authenticated: ${!!authenticatedUserId}`);
      socket.emit('waiting-status', { message: 'Хүлээж байна...', playersInQueue: waitingPlayers.size });
      broadcastWaitingState();
      // Start seeding bots for lobby after 2s if not already
      if (!lobbyBotSeedTimer && !lobbyBotAddInterval) {
        await startLobbyBotSeeding();
      }
      // If room is full, start quickly; else start countdown only if threshold met
      if (waitingPlayers.size >= MAX_PLAYERS) {
        if (waitingCountdownTimer) {
          clearTimeout(waitingCountdownTimer);
          waitingCountdownTimer = null;
        }
        countdownEndsAt = Date.now() + 1000; // 1s grace before start
        io.emit('race-starting', { startsInMs: 1000 });
        broadcastWaitingState();
        waitingCountdownTimer = setTimeout(() => {
          waitingCountdownTimer = null;
          countdownEndsAt = null;
          startRace();
        }, 1000);
      } else if (waitingPlayers.size >= MIN_PLAYERS) {
        maybeStartWaitingCountdown();
      }
    } catch {
      socket.emit('error', { message: 'Алдаа гарлаа' });
    }
  });

  socket.on('typing-progress', (data: { raceId: string; progress: number; wpm: number }) => {
    const race = activeRaces.get(data.raceId);
    if (!race) return;
    race.players.forEach(p => {
      if (p.socketId === socket.id) {
        p.progress = data.progress;
        p.currentWpm = data.wpm;
      }
    });
    io.to(data.raceId).emit('player-progress', { playerId: socket.id, progress: data.progress, wpm: data.wpm });
  });

  socket.on('race-complete', async (data: { raceId: string; wpm: number; accuracy: number; time: number; errors: number }) => {
    const race = activeRaces.get(data.raceId);
    if (!race) return;
    
    // Find and update the player who just finished
    let finishedPlayer: RacePlayer | undefined;
    race.players.forEach(player => {
      if (player.socketId === socket.id) {
        player.wpm = data.wpm;
        player.accuracy = data.accuracy;
        player.time = data.time;
        player.errors = data.errors;
        player.finished = true;
        finishedPlayer = player;
      }
    });

    // Award coins and XP immediately to the player who just finished
    if (finishedPlayer && !(finishedPlayer as any).isBot) {
      const baseExp = Math.max(5, Math.floor((finishedPlayer.wpm || 0) / 2));
      const baseCoins = Math.max(10, Math.floor(finishedPlayer.wpm || 0));
      
      // Persist to DB immediately
      (async () => {
        try {
          const updated = await User.findByIdAndUpdate(
            finishedPlayer!.userId,
            { 
              $max: { bestWpm: finishedPlayer!.wpm || 0 }, 
              $inc: { totalRaces: 1, exp: baseExp, money: baseCoins } 
            },
            { new: true }
          );
          
          let levelsGained = 0;
          if (updated) {
            const beforeLevel = updated.level || 1;
            const { level: newLevel } = computeLevelProgress(updated.exp || 0);
            if (newLevel > beforeLevel) {
              levelsGained = newLevel - beforeLevel;
              updated.level = newLevel;
              await updated.save();
            }
          }
          
          await Transaction.create({ 
            userId: new Types.ObjectId(finishedPlayer!.userId), 
            type: 'reward', 
            amount: baseCoins, 
            currency: 'coins' 
          });
          
          // Notify player immediately about their rewards
          io.to(socket.id).emit('player-finished-reward', { 
            coins: baseCoins, 
            exp: baseExp, 
            levelUp: levelsGained 
          });
          io.to(socket.id).emit('economy-updated');
        } catch (err) {
          console.error('Error awarding immediate reward:', err);
        }
      })();
    }

    const allFinished = race.players.every(p => p.finished);
    if (!allFinished) return;
    const rankings = [...race.players]
      .sort((a, b) => b.wpm - a.wpm)
      .map((p, index) => ({ ...p, rank: index + 1 }));

    // Don't send rewards in race-results - they were already awarded immediately when each player finished
    // Just send the rankings for display
    io.to(data.raceId).emit('race-results', { rankings });

    // Persist race and award placement bonuses in background (base rewards already awarded)
    (async () => {
      try {
        const raceRecord = new Race({
          players: race.players.map(p => ({ userId: p.userId, username: p.username, wpm: p.wpm, accuracy: p.accuracy, time: p.time, errors: p.errors, finished: p.finished })),
          text: race.text,
          status: 'finished'
        });
        await raceRecord.save();
        console.log(`[RACE SAVED] ID: ${raceRecord._id}, Players: ${race.players.map((p: any) => `${p.username}(${p.userId})`).join(', ')}`);

        const userUpdates: Promise<any>[] = [];
        for (const player of race.players) {
          if ((player as any).isBot) continue;
          const rank = rankings.find(r => r.socketId === player.socketId)?.rank || 999;
          const placeBonus = Math.max(0, 20 - rank * 5);
          
          // Award placement bonus only (base coins/exp already given when they finished)
          if (placeBonus > 0) {
            userUpdates.push((async () => {
              const updated = await User.findByIdAndUpdate(
                player.userId,
                { $inc: { exp: placeBonus } },
                { new: true }
              );
              
              let levelsGained = 0;
              if (updated) {
                const beforeLevel = updated.level || 1;
                const { level: newLevel } = computeLevelProgress(updated.exp || 0);
                if (newLevel > beforeLevel) {
                  levelsGained = newLevel - beforeLevel;
                  updated.level = newLevel;
                  await updated.save();
                }
              }
              
              // Notify about placement bonus
              try { 
                io.to(player.socketId!).emit('placement-bonus', { exp: placeBonus, levelUp: levelsGained });
                io.to(player.socketId!).emit('economy-updated'); 
              } catch {}
            })());
          }
        }

        // Winner wins++ and MMR adjustments
        const winner = rankings[0];
        if (winner && (winner as any).userId && !(winner as any).isBot) {
          userUpdates.push(User.findByIdAndUpdate((winner as any).userId, { $inc: { wins: 1 } }));
        }
        for (const r of rankings) {
          if ((r as any).isBot) continue;
          const delta = calcMmrDelta((r as any).rank as number, rankings.length, (r as any).wpm as number);
          userUpdates.push(User.findByIdAndUpdate((r as any).userId, { $inc: { mmr: delta } }));
        }
        await Promise.allSettled(userUpdates);
      } catch (err) {
        console.error('[RACE SAVE ERROR]', err);
      }
    })();

    // Cleanup timers and race state immediately
    const timers = botIntervals.get(data.raceId) || [];
    timers.forEach(t => clearInterval(t));
    botIntervals.delete(data.raceId);
    activeRaces.delete(data.raceId);
  });

  socket.on('disconnect', () => {
    const removed = waitingPlayers.delete(socket.id);
    if (removed) {
      // If lobby empties, cancel countdown
      if (waitingPlayers.size === 0) {
        if (waitingCountdownTimer) { clearTimeout(waitingCountdownTimer); waitingCountdownTimer = null; }
        countdownEndsAt = null;
        cancelLobbyBotTimers();
      }
      broadcastWaitingState();
    }
    for (const [raceId, race] of activeRaces) {
      const idx = race.players.findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        race.players.splice(idx, 1);
        if (race.players.length === 0) {
          activeRaces.delete(raceId);
        } else {
          io.to(raceId).emit('player-left', { playerId: socket.id });
        }
        break;
      }
    }
  });
});

async function startRace() {
  const lobby = Array.from(waitingPlayers.values()).slice(0, MAX_PLAYERS);
  const humanPlayers = lobby.filter(p => !p.isBot);
  const lobbyBots = lobby.filter(p => p.isBot);
  const raceId = `race_${Date.now()}`;
  const texts = [
    'Монгол улс нь төв Азид орших бүрэн эрхт улс юм. Энэ улс нь маш том газар нутагтай бөгөөд хүн ам нь цөөхөн байдаг.',
    'Улаанбаатар хот нь Монгол улсын нийслэл хот юм. Энэ хот нь маш хурдацтай хөгжиж байгаа бөгөөд орчин үеийн технологийн дэвшилтэт байгууламжуудтай болжээ.',
    'Монголын түүх нь маш урт бөгөөд сонирхолтой юм. Чингис хаан нь дэлхийн түүхэнд хамгийн агуу цэргийн удирдагчдын нэг байсан.',
    'Монголын соёл урлаг нь маш баялаг бөгөөд онцлогтой юм. Морин хуур нь Монголчуудын хамгийн алдартай хөгжмийн зэмсэг юм.',
    'Монголын байгаль орчин нь маш сайхан бөгөөд эрүүл юм. Тэнд маш олон төрлийн амьтан амьдардаг бөгөөд тэдний дунд мал, ан амьтан, шувууд зэрэг орно.'
  ];
  const selectedText = texts[Math.floor(Math.random() * texts.length)];
  const race: ActiveRace = {
    id: raceId,
    text: selectedText,
    players: humanPlayers.map(p => ({ ...p, progress: 0, currentWpm: 0, wpm: 0, accuracy: 0, time: 0, errors: 0, finished: false })),
    status: 'active',
    startTime: Date.now(),
  };
  activeRaces.set(raceId, race);
  // Insert lobby bots into race with their existing IDs and start their timers
  if (lobbyBots.length > 0) {
    const words = selectedText.split(' ').length;
    lobbyBots.forEach(b => {
      const accuracy = Math.floor(92 + Math.random() * 7);
      const target = Math.max(25, Math.min(140, Math.round(b.botTargetWpm || 50)));
      const botPlayer: RacePlayer & { socketId: string } = {
        userId: '0',
        username: b.username,
        wpm: 0,
        accuracy,
        time: 0,
        errors: 0,
        finished: false,
        socketId: b.socketId,
        progress: 0,
        currentWpm: 0,
        isBot: true,
      };
      race.players.push(botPlayer);
      // do not start typing yet; will start after grace
    });
  }

  for (const p of humanPlayers) {
    const s = io.sockets.sockets.get(p.socketId);
    if (s) {
      s.join(raceId);
      const playersPayload = await Promise.all(race.players.map(async (pl: any) => ({ username: pl.username, socketId: pl.socketId, imageUrl: pl.isBot ? undefined : (await resolveCarImageUrl(pl.userId)) })));
      s.emit('race-started', {
        raceId,
        text: selectedText,
        players: playersPayload,
        startsInMs: RACE_START_GRACE_MS
      });
    }
  }
  lobby.forEach(p => waitingPlayers.delete(p.socketId));

  if (lobbyBots.length === 0) {
    // If no bots present but humans < 4, optionally fill to 4 with defaults
    const minPlayers = 4;
    const need = Math.max(0, minPlayers - race.players.length);
    if (need > 0) {
      // delay filler bots until grace completes, then start them after bot delay
      setTimeout(() => addBotsToRace(raceId, need, undefined, BOT_START_DELAY_MS), RACE_START_GRACE_MS);
    }
  }

  // Delay starting lobby bots until grace completes; also align race startTime
  setTimeout(() => {
    const current = activeRaces.get(raceId);
    if (!current) return;
    current.startTime = Date.now();
    // bots pushed earlier with startBotTyping already if lobbyBots.length>0
    if (lobbyBots.length > 0) {
      // timers are started in the insertion above; but we delayed them. We must actually start them now
      // Recreate timers for lobby bots now (ensure progress stays at 0 until now)
      const words = selectedText.split(' ').length;
      current.players.filter(p => (p as any).isBot).forEach((bp: any) => {
        // only start if not already moving
        if (!bp.finished && (bp.progress || 0) === 0) {
          const acc = Math.floor(92 + Math.random() * 7);
          const target = Math.max(25, Math.min(140, Math.round((bp.currentWpm || (bp.botTargetWpm || 50)) )));
          setTimeout(() => startBotTyping(raceId, bp, words, target, acc), BOT_START_DELAY_MS);
        }
      });
    }
  }, RACE_START_GRACE_MS);
}

function startBotTyping(raceId: string, botPlayer: RacePlayer & { socketId: string; isBot?: boolean }, wordsCount: number, targetWpm: number, accuracy: number) {
  const timers: ReturnType<typeof setInterval>[] = botIntervals.get(raceId) || [];
  let typedWords = 0;
  const tickMs = 500;
  const wps = targetWpm / 60;
  const timer = setInterval(() => {
    const currentRace = activeRaces.get(raceId);
    if (!currentRace) { clearInterval(timer); return; }
    const variance = (Math.random() - 0.5) * 0.2 * wps;
    typedWords += Math.max(0, (wps + variance) * (tickMs / 1000));
    const progress = Math.min(100, (typedWords / wordsCount) * 100);
    botPlayer.progress = progress;
    botPlayer.currentWpm = Math.round((typedWords / (Math.max(1, (Date.now() - currentRace.startTime)) / 60000)));
    io.to(raceId).emit('player-progress', { playerId: botPlayer.socketId, progress, wpm: botPlayer.currentWpm });
    if (progress >= 100) {
      clearInterval(timer);
      botPlayer.finished = true;
      botPlayer.wpm = Math.round(targetWpm + (Math.random() - 0.5) * 6);
      botPlayer.time = (Date.now() - currentRace.startTime) / 1000;
      botPlayer.errors = Math.floor((1 - accuracy / 100) * wordsCount * 0.2);
      const allFinished = currentRace.players.every(p => p.finished);
      if (allFinished) finalizeRace(raceId);
    }
  }, tickMs);
  timers.push(timer);
  botIntervals.set(raceId, timers);
}

function addBotsToRace(raceId: string, count: number, targetWpms?: number[], startDelayMs: number = 0) {
  const race = activeRaces.get(raceId);
  if (!race) return;
  const words = race.text.split(' ').length;
  for (let i = 0; i < count; i++) {
    const botId = `bot_${raceId}_${i}`;
    const targetWpm = targetWpms && targetWpms[i] != null ? targetWpms[i] : Math.floor(35 + Math.random() * 45); // default 35-80 WPM
    const accuracy = Math.floor(92 + Math.random() * 7); // 92-99%
    const botPlayer: RacePlayer & { socketId: string } = {
      userId: '0',
      username: `Bot_${Math.floor(Math.random() * 900) + 100}`,
      wpm: 0,
      accuracy,
      time: 0,
      errors: 0,
      finished: false,
      socketId: botId,
      progress: 0,
      currentWpm: 0,
      isBot: true,
    };
    race.players.push(botPlayer);
    // Notify clients about bot initial state
    io.to(raceId).emit('player-progress', { playerId: botId, progress: 0, wpm: 0 });
    setTimeout(() => startBotTyping(raceId, botPlayer, words, targetWpm, accuracy), Math.max(0, startDelayMs));
  }
}

async function finalizeRace(raceId: string) {
  const race = activeRaces.get(raceId);
  if (!race) return;
  const rankings = [...race.players]
    .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
    .map((p, index) => ({ ...p, rank: index + 1 }));

  // Persist race results
  try {
    const raceRecord = new Race({
      players: race.players.map(p => ({
        userId: (p as any).userId,
        username: p.username,
        wpm: p.wpm,
        accuracy: p.accuracy,
        time: p.time,
        errors: p.errors,
        finished: p.finished,
      })),
      text: race.text,
      status: 'finished'
    });
    await raceRecord.save();
    console.log(`[RACE FINALIZED] ID: ${raceRecord._id}, Players: ${race.players.map((p: any) => `${p.username}(${p.userId})`).join(', ')}`);

    // Economy updates (skip bots)
    const rewardsMap = new Map<string, { coins: number; exp: number; levelUp: number }>();
    for (const player of race.players) {
      if ((player as any).isBot) continue;
      const baseExp = Math.max(5, Math.floor((player.wpm || 0) / 2));
      const placeBonus = Math.max(0, 20 - (rankings.find(r => r.socketId === player.socketId)?.rank || 4) * 5);
      const expGain = baseExp + placeBonus;
      const coinsGain = Math.max(10, Math.floor(player.wpm || 0));
      const updated = await User.findByIdAndUpdate(
        (player as any).userId,
        { $max: { bestWpm: player.wpm || 0 }, $inc: { totalRaces: 1, exp: expGain, money: coinsGain } },
        { new: true }
      );
      let levelsGained = 0;
      if (updated) {
        const beforeLevel = updated.level || 1;
        const { level: newLevel } = computeLevelProgress(updated.exp || 0);
        if (newLevel > beforeLevel) {
          levelsGained = newLevel - beforeLevel;
          updated.level = newLevel;
          await updated.save();
        }
      }
      await Transaction.create({ userId: new Types.ObjectId((player as any).userId), type: 'reward', amount: coinsGain, currency: 'coins' });
      rewardsMap.set(player.socketId, { coins: coinsGain, exp: expGain, levelUp: levelsGained });
    }

    // Winner wins++ (skip bots)
    const winner = rankings[0];
    if (winner && (winner as any).userId && !(winner as any).isBot) {
      await User.findByIdAndUpdate((winner as any).userId, { $inc: { wins: 1 } });
    }

    // MMR adjustments (skip bots)
    for (const r of rankings) {
      if ((r as any).isBot) continue;
      const delta = calcMmrDelta((r as any).rank as number, rankings.length, (r as any).wpm as number);
      await User.findByIdAndUpdate((r as any).userId, { $inc: { mmr: delta } });
    }

    const rankingsWithRewards = rankings.map(r => {
      const rewards = rewardsMap.get(r.socketId) || { coins: 0, exp: 0, levelUp: 0 };
      return { ...r, rewards };
    });
    io.to(raceId).emit('race-results', { rankings: rankingsWithRewards });
  } catch (err) {
    console.error('[FINALIZE RACE ERROR]', err);
    // ignore persistence errors in finalize path to ensure race closes
    io.to(raceId).emit('race-results', { rankings });
  }
  // Cleanup timers
  const timers = botIntervals.get(raceId) || [];
  timers.forEach(t => clearInterval(t));
  botIntervals.delete(raceId);
  activeRaces.delete(raceId);
}

// Routes
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = (req.body || {}) as { email?: string; username?: string; password?: string };
    if (!email || !username || !password) return res.status(400).json({ error: 'Missing fields' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      if (existing.email === email) return res.status(409).json({ error: 'Email already taken' });
      if (existing.username === username) return res.status(409).json({ error: 'Username already taken' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, passwordHash });
    const token = signJwt({ userId: (user._id as Types.ObjectId).toString(), username: user.username || '' });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ _id: user._id, email: user.email, username: user.username, level: user.level, money: user.money, exp: user.exp });
  } catch (err: any) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({ error: `${field} already taken` });
    }
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = (req.body || {}) as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' });
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    
    const token = signJwt({ userId: (user._id as Types.ObjectId).toString(), username: user.username || '' });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ _id: user._id, email: user.email, username: user.username, level: user.level, money: user.money, exp: user.exp });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTS);
  return res.json({ ok: true });
});

app.get('/api/auth/me', authRequired, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).select('_id email username level exp money mmr bestWpm totalRaces averageAccuracy wins');
  if (!user) return res.status(404).json({ error: 'Not found' });
  const prog = computeLevelProgress(user.exp || 0);
  return res.json({
    _id: user._id,
    email: user.email,
    username: user.username,
    level: user.level,
    exp: user.exp,
    money: user.money,
    mmr: user.mmr,
    bestWpm: user.bestWpm,
    totalRaces: user.totalRaces,
    averageAccuracy: user.averageAccuracy,
    wins: user.wins,
    equipped: (user as any).equipped || {},
    nextLevelXp: prog.nextLevelXp,
    expInLevel: prog.expInLevel
  });
});

app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    // Only show users who have completed at least 1 race and have a valid username
    const leaderboard = await User.find({ 
      username: { $exists: true, $nin: [null, ''] },
      totalRaces: { $gt: 0 }
    }).sort({ bestWpm: -1 }).limit(10).select('username bestWpm totalRaces averageAccuracy wins');
    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Алдаа гарлаа' });
  }
});

// League & Season endpoints
app.get('/api/league', authRequired, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).select('mmr');
  if (!user) return res.status(404).json({ error: 'Not found' });
  const current = leagueFor(user.mmr || 0);
  res.json({ mmr: user.mmr || 0, league: current, thresholds: LEAGUES });
});

app.get('/api/season', async (req: Request, res: Response) => {
  const now = new Date();
  let season = await Season.findOne({ active: true, startsAt: { $lte: now }, endsAt: { $gte: now } });
  if (!season) {
    const seasonId = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
    const startsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    const endsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
    season = await Season.create({ seasonId, startsAt, endsAt, active: true });
  }
  res.json(season);
});

app.get('/api/stats/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Алдаа гарлаа' });
  }
});

app.get('/api/profile/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('_id username level exp money wins bestWpm totalRaces averageAccuracy equipped teamId');
    if (!user) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    let team: any = null;
    if (user.teamId) {
      const t = await Team.findById(user.teamId).select('_id name ownerId');
      if (t) team = { _id: t._id, name: t.name, ownerId: t.ownerId };
    }
    const friendsCount = await User.countDocuments({ _id: { $in: (user as any).friends || [] } });
    return res.json({
      _id: user._id,
      username: user.username,
      level: user.level,
      exp: user.exp,
      money: user.money,
      wins: user.wins,
      bestWpm: user.bestWpm,
      totalRaces: user.totalRaces,
      averageAccuracy: user.averageAccuracy,
      equipped: (user as any).equipped || {},
      team,
      friendsCount
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/leaderboard/:scope', async (req: Request, res: Response) => {
  try {
    const scope = req.params.scope; // daily|weekly|season
    const now = new Date();
    const start = new Date(now);
    if (scope === 'daily') {
      start.setUTCHours(0, 0, 0, 0);
    } else if (scope === 'weekly') {
      const day = now.getUTCDay();
      const diff = (day + 6) % 7;
      start.setUTCDate(now.getUTCDate() - diff);
      start.setUTCHours(0, 0, 0, 0);
    } else {
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
    }

    const winsTop = await Race.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $unwind: '$players' },
      { $sort: { 'players.wpm': -1 } },
      { $group: { _id: '$_id', winner: { $first: '$players' } } },
      { $group: { _id: '$winner.userId', wins: { $sum: 1 } } },
      { $sort: { wins: -1 } },
      { $limit: 10 }
    ]);

    const wpmTopAgg = await Race.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $unwind: '$players' },
      { $group: { _id: '$players.userId', bestWpm: { $max: '$players.wpm' } } },
      { $sort: { bestWpm: -1 } },
      { $limit: 10 }
    ]);

    const userIds = Array.from(new Set([...
      winsTop.map((w: any) => w._id?.toString()), ...wpmTopAgg.map((w: any) => w._id?.toString())
    ].filter(Boolean)));
    const users = await User.find({ _id: { $in: userIds } }).select('_id username');
    const idToName = new Map(users.map(u => [(u._id as Types.ObjectId).toString(), u.username]));
    const winsTopNamed = winsTop.map((w: any) => ({ userId: w._id, username: idToName.get(w._id?.toString() || '') || 'Unknown', wins: w.wins }));
    const wpmTop = wpmTopAgg.map((w: any) => ({ userId: w._id, username: idToName.get(w._id?.toString() || '') || 'Unknown', bestWpm: w.bestWpm }));
    return res.json({ scope, since: start, winsTop: winsTopNamed, wpmTop });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Flexible leaderboard: /api/leaderboard2?scope=daily|weekly|monthly|alltime&metric=speed|accuracy|games
// Debug endpoint to check race data
app.get('/api/debug/races', authRequired, async (req: Request, res: Response) => {
  try {
    const myId = req.user!.userId;
    const myRaces = await Race.find({ 'players.userId': myId }).limit(10).sort({ createdAt: -1 });
    const myUser = await User.findById(myId).select('username bestWpm totalRaces');
    return res.json({ 
      userId: myId,
      user: myUser,
      racesFound: myRaces.length,
      races: myRaces.map(r => ({
        id: r._id,
        createdAt: r.createdAt,
        players: r.players.map((p: any) => ({ userId: p.userId, username: p.username, wpm: p.wpm }))
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/leaderboard2', async (req: Request, res: Response) => {
  try {
    const scope = String(req.query.scope || 'alltime');
    const metric = String(req.query.metric || 'speed');
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 10)));
    const now = new Date();
    let start: Date | null = null;
    if (scope === 'daily') {
      start = new Date(now);
      start.setUTCHours(0, 0, 0, 0);
    } else if (scope === 'weekly') {
      start = new Date(now);
      const day = now.getUTCDay();
      const diff = (day + 6) % 7;
      start.setUTCDate(now.getUTCDate() - diff);
      start.setUTCHours(0, 0, 0, 0);
    } else if (scope === 'monthly') {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    } else {
      start = null; // all time
    }

    const matchStage: any = start ? { createdAt: { $gte: start } } : {};

    // Build aggregation based on metric (FILTER OUT BOTS: userId !== '0')
    let pipeline: any[] = [
      { $match: matchStage },
      { $unwind: '$players' },
      { $match: { 'players.userId': { $nin: ['0', null], $exists: true } } }, // Filter out bots
    ];
    if (metric === 'speed') {
      pipeline.push(
        { $group: { _id: '$players.userId', value: { $max: '$players.wpm' } } },
        { $sort: { value: -1 } }
      );
    } else if (metric === 'accuracy') {
      pipeline.push(
        { $group: { _id: '$players.userId', value: { $max: '$players.accuracy' } } },
        { $sort: { value: -1 } }
      );
    } else if (metric === 'games') {
      pipeline.push(
        { $group: { _id: '$players.userId', value: { $sum: 1 } } },
        { $sort: { value: -1 } }
      );
    } else {
      return res.status(400).json({ error: 'Invalid metric' });
    }
    pipeline.push({ $limit: limit });

    const agg = await Race.aggregate(pipeline);
    
    // Filter out invalid user IDs and convert to ObjectId
    const validUserIds: Types.ObjectId[] = [];
    for (const a of agg) {
      try {
        if (a._id && mongoose.Types.ObjectId.isValid(a._id)) {
          validUserIds.push(new Types.ObjectId(a._id));
        }
      } catch {}
    }
    
    const users = await User.find({ _id: { $in: validUserIds } }).select('_id username');
    const idToName = new Map(users.map(u => [ (u._id as Types.ObjectId).toString(), u.username ]));
    
    // Only include entries with valid usernames
    const entries = (agg || [])
      .map((a: any) => ({ 
        userId: a._id, 
        username: idToName.get(String(a._id)), 
        value: Math.round(a.value || 0) 
      }))
      .filter((e: any) => e.username); // Filter out entries without valid usernames

    // Include current user's rank/value if authenticated
    let me: any = null;
    try {
      const token = (req.cookies?.[COOKIE_NAME]) as string | undefined;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const myId = decoded.userId;
        // Compute my value (exclude bots)
        const myValueAgg = await Race.aggregate([
          { $match: matchStage },
          { $unwind: '$players' },
          { $match: { 'players.userId': myId } },
          ...(metric === 'speed' ? [{ $group: { _id: '$players.userId', value: { $max: '$players.wpm' } } }] :
             metric === 'accuracy' ? [{ $group: { _id: '$players.userId', value: { $max: '$players.accuracy' } } }] :
             [{ $group: { _id: '$players.userId', value: { $sum: 1 } } }]
          ),
        ]);
        const myValue = myValueAgg[0]?.value as number | undefined;
        if (myValue != null) {
          // Compute rank: count how many REAL players have strictly higher value (exclude bots)
          const rankAgg = await Race.aggregate([
            { $match: matchStage },
            { $unwind: '$players' },
            { $match: { 'players.userId': { $nin: ['0', null], $exists: true } } }, // Filter out bots
            ...(metric === 'speed' ? [{ $group: { _id: '$players.userId', value: { $max: '$players.wpm' } } }] :
               metric === 'accuracy' ? [{ $group: { _id: '$players.userId', value: { $max: '$players.accuracy' } } }] :
               [{ $group: { _id: '$players.userId', value: { $sum: 1 } } }]
            ),
            { $match: { value: { $gt: myValue } } },
            { $count: 'better' }
          ]);
          const better = rankAgg[0]?.better || 0;
          const user = await User.findById(myId).select('_id username');
          me = { userId: myId, username: user?.username || 'Me', value: Math.round(myValue), rank: better + 1 };
        }
      }
    } catch {}

    return res.json({ scope, metric, entries, me });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Shop & Inventory
app.get('/api/shop/catalog', async (req: Request, res: Response) => {
  try {
    const definitions = [
      // Cars (cheapest -> most expensive); first is default
      { sku: 'car.basic', name: 'Starter Car', type: 'car', rarity: 'common', price: 0, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__1_-removebg-preview_hrjhi8.png' },
      { sku: 'car.sport', name: 'Sportster', type: 'car', rarity: 'rare', price: 500, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__4_-removebg-preview_xs2b6h.png' },
      { sku: 'car.racer', name: 'Racer X', type: 'car', rarity: 'rare', price: 800, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__2_-removebg-preview_qead3u.png' },
      { sku: 'car.speed', name: 'Speed Demon', type: 'car', rarity: 'epic', price: 1200, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__9_-removebg-preview_xhijk0.png' },
      { sku: 'car.nitro', name: 'Nitro Beast', type: 'car', rarity: 'legendary', price: 2000, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__8_-removebg-preview_p95rlk.png' },
      // Skins mapped to Cloudinary car images for previews
      { sku: 'skin.flame', name: 'Flame Skin', type: 'skin', rarity: 'epic', price: 300, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888015/Untitled_Project__10_-removebg-preview_z7na2d.png' },
      { sku: 'skin.neon', name: 'Neon Glow', type: 'skin', rarity: 'rare', price: 250, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__7_-removebg-preview_iz5bl4.png' },
      { sku: 'skin.tiger', name: 'Tiger Stripes', type: 'skin', rarity: 'legendary', price: 700, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__3_-removebg-preview_hiawbt.png' },
      { sku: 'skin.ice', name: 'Ice Skin', type: 'skin', rarity: 'epic', price: 350, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888011/Untitled_Project__11_-removebg-preview_xgt6lm.png' },
      { sku: 'skin.rainbow', name: 'Rainbow Skin', type: 'skin', rarity: 'legendary', price: 500, currency: 'coins', image: 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888013/Untitled_Project__5_-removebg-preview_imugek.png' },
      // Boosts
      { sku: 'boost.exp', name: 'XP Booster', type: 'boost', rarity: 'common', price: 50, currency: 'coins', image: '' },
      { sku: 'boost.coins', name: 'Coin Doubler', type: 'boost', rarity: 'rare', price: 100, currency: 'coins', image: '' },
    ];
    const upserts = definitions.map(d => ({
      updateOne: {
        filter: { sku: d.sku },
        update: { $setOnInsert: { name: d.name, type: d.type, rarity: d.rarity, price: d.price, currency: d.currency, meta: {} }, $set: { 'meta.image': d.image } },
        upsert: true,
      }
    }));
    if (upserts.length) {
      try { await ShopItem.bulkWrite(upserts, { ordered: false }); } catch { /* ignore */ }
    }
    // Backfill images for cars (in case catalog existed before images were added)
    const CAR_IMAGES: Record<string, string> = {
      'car.basic': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__1_-removebg-preview_hrjhi8.png',
      // Legacy SKUs present in existing DB
      'car.sport': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__4_-removebg-preview_xs2b6h.png',
      'car.racer': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__2_-removebg-preview_qead3u.png',
      'car.speed': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__9_-removebg-preview_xhijk0.png',
      'car.nitro': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__8_-removebg-preview_p95rlk.png',
      'car.2': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__4_-removebg-preview_xs2b6h.png',
      'car.3': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__2_-removebg-preview_qead3u.png',
      'car.4': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888011/Untitled_Project-removebg-preview_q0v2ze.png',
      'car.5': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__3_-removebg-preview_hiawbt.png',
      'car.6': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888013/Untitled_Project__5_-removebg-preview_imugek.png',
      'car.7': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__7_-removebg-preview_iz5bl4.png',
      'car.8': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888011/Untitled_Project__11_-removebg-preview_xgt6lm.png',
      'car.9': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888013/Untitled_Project__5_-removebg-preview_imugek.png',
      'car.10': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888015/Untitled_Project__10_-removebg-preview_z7na2d.png',
      'car.11': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__8_-removebg-preview_p95rlk.png',
      'car.12': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__9_-removebg-preview_xhijk0.png',
    };
    const SKIN_IMAGES: Record<string, string> = {
      'skin.flame': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888015/Untitled_Project__10_-removebg-preview_z7na2d.png',
      'skin.neon': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888014/Untitled_Project__7_-removebg-preview_iz5bl4.png',
      'skin.tiger': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888012/Untitled_Project__3_-removebg-preview_hiawbt.png',
      'skin.ice': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888011/Untitled_Project__11_-removebg-preview_xgt6lm.png',
      'skin.rainbow': 'https://res.cloudinary.com/do4w2eaik/image/upload/v1761888013/Untitled_Project__5_-removebg-preview_imugek.png',
    };
    const ops = [
      ...Object.entries(CAR_IMAGES).map(([sku, url]) => ({
        updateOne: {
          filter: { sku, type: 'car' },
          update: { $set: { 'meta.image': url } },
          upsert: false,
        }
      })),
      ...Object.entries(SKIN_IMAGES).map(([sku, url]) => ({
        updateOne: {
          filter: { sku, type: 'skin' },
          update: { $set: { 'meta.image': url } },
          upsert: false,
        }
      })),
    ];
    if (ops.length) {
      try { await ShopItem.bulkWrite(ops, { ordered: false }); } catch { /* ignore */ }
    }
    const items = await ShopItem.find().select('-__v');
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/shop/purchase', authRequired, async (req: Request, res: Response) => {
  try {
    const { itemId } = (req.body || {}) as { itemId?: string };
    if (!itemId) return res.status(400).json({ error: 'Missing itemId' });
    const item = await ShopItem.findOne({ sku: itemId });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if ((user.money || 0) < item.price) return res.status(400).json({ error: 'Not enough coins' });
    user.money = (user.money || 0) - item.price;
    await user.save();
    await Transaction.create({ userId: user._id as Types.ObjectId, type: 'purchase', amount: -item.price, currency: 'coins', sku: item.sku });
    const inv = await Inventory.findOneAndUpdate(
      { userId: user._id },
      { $push: { items: { sku: item.sku } } },
      { upsert: true, new: true }
    );
    res.json({ ok: true, balance: user.money, inventory: inv });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Equip loadout (car/skin)
app.post('/api/equip', authRequired, async (req: Request, res: Response) => {
  try {
    const { carSku, skinSku } = (req.body || {}) as { carSku?: string; skinSku?: string };
    if (!carSku && !skinSku) return res.status(400).json({ error: 'Nothing to equip' });

    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate ownership using Inventory
    const inv = await Inventory.findOne({ userId: user._id });
    const owned = new Set((inv?.items || []).map(i => i.sku));

    const updates: { [k: string]: string } = {};
    if (carSku) {
      if (!owned.has(carSku) && carSku !== 'car.basic') {
        return res.status(400).json({ error: 'Car not owned' });
      }
      updates['equipped.carSku'] = carSku;
    }
    if (skinSku) {
      if (!owned.has(skinSku)) {
        return res.status(400).json({ error: 'Skin not owned' });
      }
      updates['equipped.skinSku'] = skinSku;
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
    return res.json({ equipped: (updated as any)?.equipped || {} });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/inventory', authRequired, async (req: Request, res: Response) => {
  try {
    const inv = await Inventory.findOne({ userId: req.user!.userId });
    res.json(inv || { items: [] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Friends endpoints
app.get('/api/friends', authRequired, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('friends');
    const friends = await User.find({ _id: { $in: user?.friends || [] } }).select('_id username');
    res.json(friends);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/friends/add', authRequired, async (req: Request, res: Response) => {
  try {
    const { username } = (req.body || {}) as { username?: string };
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const target = await User.findOne({ username });
    if (!target) return res.status(404).json({ error: 'User not found' });
    if ((target._id as Types.ObjectId).toString() === req.user!.userId) return res.status(400).json({ error: 'Cannot add self' });
    await User.findByIdAndUpdate(req.user!.userId, { $addToSet: { friends: target._id } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/friends/remove', authRequired, async (req: Request, res: Response) => {
  try {
    const { userId } = (req.body || {}) as { userId?: string };
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    await User.findByIdAndUpdate(req.user!.userId, { $pull: { friends: new Types.ObjectId(userId) } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Teams endpoints
app.post('/api/teams', authRequired, async (req: Request, res: Response) => {
  try {
    const { name } = (req.body || {}) as { name?: string };
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const team = await Team.create({ name, ownerId: new Types.ObjectId(req.user!.userId), members: [new Types.ObjectId(req.user!.userId)] });
    await User.findByIdAndUpdate(req.user!.userId, { $set: { teamId: team._id } });
    res.json(team);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/teams/join', authRequired, async (req: Request, res: Response) => {
  try {
    const { teamId } = (req.body || {}) as { teamId?: string };
    if (!teamId) return res.status(400).json({ error: 'Missing teamId' });
    const team = await Team.findByIdAndUpdate(teamId, { $addToSet: { members: new Types.ObjectId(req.user!.userId) } }, { new: true });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    await User.findByIdAndUpdate(req.user!.userId, { $set: { teamId: team._id } });
    res.json(team);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/teams/leave', authRequired, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('teamId');
    if (!user?.teamId) return res.status(400).json({ error: 'Not in a team' });
    await Team.findByIdAndUpdate(user.teamId, { $pull: { members: new Types.ObjectId(req.user!.userId) } });
    await User.findByIdAndUpdate(req.user!.userId, { $set: { teamId: null } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teams/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Not found' });
    const members = await User.find({ _id: { $in: team.members } }).select('_id username');
    res.json({ _id: team._id, name: team.name, ownerId: team.ownerId, members });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
// Tasks / Achievements / Battlepass
const TASK_DEFS = [
  { key: 'daily_races_3', title: 'Өдөрт 3 уралдаан', period: 'daily', goal: 3, rewardCoins: 50 },
  { key: 'daily_win_1', title: 'Өдөрт 1 удаа түрүүлэх', period: 'daily', goal: 1, rewardCoins: 100 }
];

const ACHIEVEMENTS = [
  { key: 'wpm_100', title: '100 WPM хүрэв', condition: { type: 'bestWpm', value: 100 }, rewardCoins: 300 },
  { key: 'wins_10', title: '10 түрүүлэв', condition: { type: 'wins', value: 10 }, rewardCoins: 500 },
  { key: 'races_50', title: '50 уралдаан', condition: { type: 'totalRaces', value: 50 }, rewardCoins: 200 }
];

function getPeriodStart(period: 'daily' | 'weekly') {
  const now = new Date();
  const start = new Date(now);
  if (period === 'daily') {
    start.setUTCHours(0, 0, 0, 0);
  } else {
    const day = now.getUTCDay();
    const diff = (day + 6) % 7;
    start.setUTCDate(now.getUTCDate() - diff);
    start.setUTCHours(0, 0, 0, 0);
  }
  return start;
}

app.get('/api/progress/tasks', authRequired, async (req: Request, res: Response) => {
  try {
    const results: any[] = [];
    for (const task of TASK_DEFS) {
      const periodStart = getPeriodStart(task.period as 'daily');
      let progress = 0;
      if (task.key === 'daily_races_3') {
        progress = await Race.countDocuments({ createdAt: { $gte: periodStart }, 'players.userId': req.user!.userId });
      } else if (task.key === 'daily_win_1') {
        const winsAgg = await Race.aggregate([
          { $match: { createdAt: { $gte: periodStart } } },
          { $unwind: '$players' },
          { $sort: { 'players.wpm': -1 } },
          { $group: { _id: '$_id', winner: { $first: '$players' } } },
          { $match: { 'winner.userId': new Types.ObjectId(req.user!.userId) } },
          { $count: 'wins' }
        ]);
        progress = (winsAgg[0]?.wins as number) || 0;
      }
      const claimed = await TaskClaim.findOne({ userId: req.user!.userId, taskKey: task.key, periodStart });
      results.push({ key: task.key, title: task.title, period: task.period, goal: task.goal, progress, claimable: progress >= task.goal && !claimed, claimed: !!claimed });
    }
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/progress/tasks/claim', authRequired, async (req: Request, res: Response) => {
  try {
    const { taskId } = (req.body || {}) as { taskId?: string };
    const task = TASK_DEFS.find(t => t.key === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const periodStart = getPeriodStart(task.period as 'daily');
    const already = await TaskClaim.findOne({ userId: req.user!.userId, taskKey: task.key, periodStart });
    if (already) return res.status(400).json({ error: 'Already claimed' });
    let progress = 0;
    if (task.key === 'daily_races_3') {
      progress = await Race.countDocuments({ createdAt: { $gte: periodStart }, 'players.userId': req.user!.userId });
    } else if (task.key === 'daily_win_1') {
      const winsAgg = await Race.aggregate([
        { $match: { createdAt: { $gte: periodStart } } },
        { $unwind: '$players' },
        { $sort: { 'players.wpm': -1 } },
        { $group: { _id: '$_id', winner: { $first: '$players' } } },
        { $match: { 'winner.userId': new Types.ObjectId(req.user!.userId) } },
        { $count: 'wins' }
      ]);
      progress = (winsAgg[0]?.wins as number) || 0;
    }
    if (progress < task.goal) return res.status(400).json({ error: 'Not completed' });
    await TaskClaim.create({ userId: new Types.ObjectId(req.user!.userId), taskKey: task.key, periodStart });
    const user = await User.findByIdAndUpdate(req.user!.userId, { $inc: { money: task.rewardCoins } }, { new: true });
    return res.json({ ok: true, rewardCoins: task.rewardCoins, balance: user?.money || 0 });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/progress/achievements', authRequired, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const unlocked = await AchievementUnlock.find({ userId: user._id });
    const unlockedKeys = new Set(unlocked.map(a => a.achievementKey));
    const result: any[] = [];
    for (const a of ACHIEVEMENTS) {
      let done = false;
      if ((a as any).condition.type === 'bestWpm') done = (user.bestWpm || 0) >= (a as any).condition.value;
      if ((a as any).condition.type === 'wins') done = (user.wins || 0) >= (a as any).condition.value;
      if ((a as any).condition.type === 'totalRaces') done = (user.totalRaces || 0) >= (a as any).condition.value;
      const isUnlocked = done || unlockedKeys.has((a as any).key);
      result.push({ key: (a as any).key, title: (a as any).title, done: isUnlocked, rewardCoins: (a as any).rewardCoins });
      if (done && !unlockedKeys.has((a as any).key)) {
        await AchievementUnlock.create({ userId: user._id as Types.ObjectId, achievementKey: (a as any).key });
        await User.findByIdAndUpdate(user._id, { $inc: { money: (a as any).rewardCoins } });
      }
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

function generateBattlepassTiers(): Array<{ xp: number; free: any; premium: any }> {
  // 30 tiers; XP thresholds are cumulative sums of xpForLevel with 15% growth
  const tiers: Array<{ xp: number; free: any; premium: any }> = [];
  let cumulative = 0;
  for (let i = 1; i <= 30; i++) {
    const need = xpForLevel(i); // base 100 with 1.15 growth
    cumulative += need;
    // Example rewards: free coins increasing; premium adds items/titles periodically
    const freeCoins = Math.min(500, Math.round(25 * i));
    const premiumCoins = Math.min(1000, Math.round(50 * i));
    const tier: any = {
      xp: cumulative,
      free: { coins: freeCoins },
      premium: { coins: premiumCoins },
    };
    if (i === 5) tier.premium.sku = 'skin.neon';
    if (i === 10) tier.premium.sku = 'car.sport';
    if (i === 15) tier.premium.sku = 'skin.tiger';
    if (i === 20) tier.premium.title = 'Racing Champion';
    if (i === 25) tier.premium.sku = 'skin.flame';
    tiers.push(tier);
  }
  return tiers;
}

app.get('/api/battlepass', authRequired, async (req: Request, res: Response) => {
  try {
    const seasonId = `${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}`;
    const periodStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
    const user = await User.findById(req.user!.userId).select('exp');
    const xp = user?.exp || 0;
    const TIERS = generateBattlepassTiers();

    // Get claimed tiers
    const claimed = await TaskClaim.find({ 
      userId: req.user!.userId, 
      taskKey: { $regex: `^(bp_${seasonId}_)|(bp_overflow_${seasonId}_)` },
      periodStart 
    });
    const claimedSet = new Set(claimed.map(c => c.taskKey));

    // Overflow computation beyond tier 30
    let overflowCount = 0;
    if (xp > (TIERS[TIERS.length - 1]?.xp || 0)) {
      let curXp = (TIERS[TIERS.length - 1]?.xp || 0);
      let level = 31;
      while (true) {
        const need = xpForLevel(level);
        curXp += need;
        if (xp >= curXp) { overflowCount++; level++; } else break;
        if (overflowCount > 1000) break; // safety
      }
    }

    res.json({ seasonId, tiers: TIERS, xp, claimed: Array.from(claimedSet), overflow: { count: overflowCount } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/battlepass/claim', authRequired, async (req: Request, res: Response) => {
  try {
    const seasonId = `${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}`;
    const { tier, track } = (req.body || {}) as { tier?: number; track?: 'free' | 'premium' | 'overflow' };
    if (typeof tier !== 'number' || !track) return res.status(400).json({ error: 'Missing tier xp or track' });
    const TIERS = generateBattlepassTiers();
    const def = TIERS.find(t => t.xp === tier);
    const user = await User.findById(req.user!.userId).select('exp money');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if ((user.exp || 0) < tier) return res.status(400).json({ error: 'Not enough XP' });

    // Reuse TaskClaim as battlepass claim tracker for the season
    const periodStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
    const key = track === 'overflow' ? `bp_overflow_${seasonId}_${tier}` : `bp_${seasonId}_${tier}_${track}`;
    const already = await TaskClaim.findOne({ userId: req.user!.userId, taskKey: key, periodStart });
    if (already) return res.status(400).json({ error: 'Already claimed' });

    await TaskClaim.create({ userId: new Types.ObjectId(req.user!.userId), taskKey: key, periodStart });

    let coinsGranted = 0;
    let skuGranted: string | undefined;
    let titleGranted: string | undefined;

    if (track === 'overflow') {
      coinsGranted = 1000; // per extra level beyond 30
    } else {
      const reward = (def as any)[track];
      if (!reward) return res.status(400).json({ error: 'Invalid track' });
      coinsGranted = reward.coins || 0;
      skuGranted = reward.sku;
      titleGranted = reward.title;
      if (skuGranted) {
        await Inventory.findOneAndUpdate(
          { userId: user._id },
          { $push: { items: { sku: skuGranted } } },
          { upsert: true }
        );
      }
    }

    const updated = coinsGranted ? await User.findByIdAndUpdate(req.user!.userId, { $inc: { money: coinsGranted } }, { new: true }) : user;
    return res.json({ ok: true, rewardCoins: coinsGranted, balance: updated?.money || user.money || 0, tier, track, sku: skuGranted, title: titleGranted });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});


