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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/type-race', {
  // @ts-expect-error mongoose connection options compatible
  useNewUrlParser: true,
  useUnifiedTopology: true,
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

function signJwt(payload: { userId: string; username: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authRequired(req: Request, res: Response, next: NextFunction) {
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

// Game state
type ActiveRace = {
  id: string;
  text: string;
  players: (RacePlayer & { socketId: string })[];
  status: 'active';
  startTime: number;
};

const activeRaces = new Map<string, ActiveRace>();
const waitingPlayers = new Map<string, { socketId: string; userId: string; username: string; joinedAt: number }>();
const botIntervals = new Map<string, NodeJS.Timeout[]>();

// Socket
io.on('connection', (socket: Socket) => {
  // Join waiting room
  socket.on('join-waiting', async (userData: { username: string }) => {
    try {
      const user = await User.findOneAndUpdate(
        { username: userData.username },
        { username: userData.username, $inc: { totalRaces: 1 } },
        { upsert: true, new: true }
      );
      if (!user) return;
      waitingPlayers.set(socket.id, { socketId: socket.id, userId: (user._id as Types.ObjectId).toString(), username: userData.username, joinedAt: Date.now() });
      socket.emit('waiting-status', { message: 'Хүлээж байна...', playersInQueue: waitingPlayers.size });
      if (waitingPlayers.size >= 2) startRace();
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
    race.players.forEach(player => {
      if (player.socketId === socket.id) {
        player.wpm = data.wpm;
        player.accuracy = data.accuracy;
        player.time = data.time;
        player.errors = data.errors;
        player.finished = true;
      }
    });
    const allFinished = race.players.every(p => p.finished);
    if (!allFinished) return;
    const rankings = [...race.players]
      .sort((a, b) => b.wpm - a.wpm)
      .map((p, index) => ({ ...p, rank: index + 1 }));

    const raceRecord = new Race({
      players: race.players.map(p => ({ userId: p.userId, username: p.username, wpm: p.wpm, accuracy: p.accuracy, time: p.time, errors: p.errors, finished: p.finished })),
      text: race.text,
      status: 'finished'
    });
    await raceRecord.save();

    for (const player of race.players) {
      if ((player as any).isBot) continue;
      const baseExp = Math.max(5, Math.floor(player.wpm / 2));
      const placeBonus = Math.max(0, 20 - (rankings.find(r => r.socketId === player.socketId)?.rank || 4) * 5);
      const expGain = baseExp + placeBonus;
      const coinsGain = Math.max(10, Math.floor(player.wpm));
      const updated = await User.findByIdAndUpdate(
        player.userId,
        { $max: { bestWpm: player.wpm }, $inc: { totalRaces: 1, exp: expGain, money: coinsGain } },
        { new: true }
      );
      if (updated) {
        const levelsGained = Math.floor(updated.exp / 100) - (updated.level - 1);
        if (levelsGained > 0) { updated.level += levelsGained; await updated.save(); }
      }
      await Transaction.create({ userId: new Types.ObjectId(player.userId), type: 'reward', amount: coinsGain, currency: 'coins' });
    }

    const winner = rankings[0];
    if (winner && (winner as any).userId && !(winner as any).isBot) {
      await User.findByIdAndUpdate((winner as any).userId, { $inc: { wins: 1 } });
    }

    // MMR adjustments
    for (const r of rankings) {
      if ((r as any).isBot) continue;
      const delta = calcMmrDelta((r as any).rank as number, rankings.length, (r as any).wpm as number);
      await User.findByIdAndUpdate((r as any).userId, { $inc: { mmr: delta } });
    }

    io.to(data.raceId).emit('race-results', { rankings });
    // Cleanup bot timers
    const timers = botIntervals.get(data.raceId) || [];
    timers.forEach(t => clearInterval(t));
    botIntervals.delete(data.raceId);
    activeRaces.delete(data.raceId);
  });

  socket.on('disconnect', () => {
    waitingPlayers.delete(socket.id);
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

function startRace() {
  const players = Array.from(waitingPlayers.values()).slice(0, 4);
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
    players: players.map(p => ({ ...p, progress: 0, currentWpm: 0, wpm: 0, accuracy: 0, time: 0, errors: 0, finished: false })),
    status: 'active',
    startTime: Date.now(),
  };
  activeRaces.set(raceId, race);
  players.forEach(p => {
    const s = io.sockets.sockets.get(p.socketId);
    if (s) {
      s.join(raceId);
      s.emit('race-started', {
        raceId,
        text: selectedText,
        players: race.players.map(pl => ({ username: pl.username, socketId: pl.socketId }))
      });
    }
  });
  players.forEach(p => waitingPlayers.delete(p.socketId));

  // Fill with bots if needed (target 4 players)
  const minPlayers = 4;
  const need = Math.max(0, minPlayers - race.players.length);
  if (need > 0) {
    addBotsToRace(raceId, need);
  }
}

function addBotsToRace(raceId: string, count: number) {
  const race = activeRaces.get(raceId);
  if (!race) return;
  const words = race.text.split(' ').length;
  const timers: NodeJS.Timeout[] = [];
  for (let i = 0; i < count; i++) {
    const botId = `bot_${raceId}_${i}`;
    const targetWpm = Math.floor(35 + Math.random() * 45); // 35-80 WPM
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
    // Notify clients about bot
    io.to(raceId).emit('player-progress', { playerId: botId, progress: 0, wpm: 0 });

    // Simulate typing
    let typedWords = 0;
    const tickMs = 500;
    const wps = targetWpm / 60;
    const timer = setInterval(async () => {
      const currentRace = activeRaces.get(raceId);
      if (!currentRace) { clearInterval(timer); return; }
      // Small variance
      const variance = (Math.random() - 0.5) * 0.2 * wps;
      typedWords += Math.max(0, (wps + variance) * (tickMs / 1000));
      const progress = Math.min(100, (typedWords / words) * 100);
      botPlayer.progress = progress;
      botPlayer.currentWpm = Math.round((typedWords / (Math.max(1, (Date.now() - currentRace.startTime)) / 60000)));
      io.to(raceId).emit('player-progress', { playerId: botId, progress, wpm: botPlayer.currentWpm });
      if (progress >= 100) {
        clearInterval(timer);
        botPlayer.finished = true;
        botPlayer.wpm = Math.round(targetWpm + (Math.random() - 0.5) * 6);
        botPlayer.time = (Date.now() - currentRace.startTime) / 1000;
        botPlayer.errors = Math.floor((1 - accuracy / 100) * words * 0.2);
        // Check completion like humans do: reuse end logic by emitting server-side
        const allFinished = currentRace.players.every(p => p.finished);
        if (allFinished) {
          // Trigger same path as race-complete aggregated end
          // Build rankings and emit end by calling helper
          finalizeRace(raceId);
        }
      }
    }, tickMs);
    timers.push(timer);
  }
  botIntervals.set(raceId, timers);
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

    // Economy updates (skip bots)
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
      if (updated) {
        const levelsGained = Math.floor((updated.exp || 0) / 100) - ((updated.level || 1) - 1);
        if (levelsGained > 0) {
          updated.level = (updated.level || 1) + levelsGained;
          await updated.save();
        }
      }
      await Transaction.create({ userId: new Types.ObjectId((player as any).userId), type: 'reward', amount: coinsGain, currency: 'coins' });
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
  } catch {
    // ignore persistence errors in finalize path to ensure race closes
  }

  io.to(raceId).emit('race-results', { rankings });
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
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'Email or username taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, passwordHash });
    const token = signJwt({ userId: (user._id as Types.ObjectId).toString(), username: user.username || '' });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ _id: user._id, email: user.email, username: user.username, level: user.level, money: user.money, exp: user.exp });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = (req.body || {}) as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt({ userId: (user._id as Types.ObjectId).toString(), username: user.username || '' });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ _id: user._id, email: user.email, username: user.username, level: user.level, money: user.money, exp: user.exp });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTS);
  return res.json({ ok: true });
});

app.get('/api/auth/me', authRequired, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).select('_id email username level exp money mmr bestWpm totalRaces averageAccuracy wins');
  if (!user) return res.status(404).json({ error: 'Not found' });
  return res.json(user);
});

app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const leaderboard = await User.find().sort({ bestWpm: -1 }).limit(10).select('username bestWpm totalRaces averageAccuracy wins');
    res.json(leaderboard);
  } catch {
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

// Shop & Inventory
app.get('/api/shop/catalog', async (req: Request, res: Response) => {
  try {
    const count = await ShopItem.countDocuments();
    if (count === 0) {
      await ShopItem.insertMany([
        { sku: 'car.basic', name: 'Starter Car', type: 'car', rarity: 'common', price: 100, currency: 'coins', meta: { speed: 1 } },
        { sku: 'car.sport', name: 'Sportster', type: 'car', rarity: 'rare', price: 500, currency: 'coins', meta: { speed: 2 } },
        { sku: 'skin.flame', name: 'Flame Skin', type: 'skin', rarity: 'epic', price: 300, currency: 'coins' }
      ]);
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

app.get('/api/inventory', authRequired, async (req: Request, res: Response) => {
  try {
    const inv = await Inventory.findOne({ userId: req.user!.userId });
    res.json(inv || { items: [] });
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

const BP_TIERS = [
  { xp: 0, reward: { coins: 0 } },
  { xp: 100, reward: { coins: 100 } },
  { xp: 250, reward: { coins: 200 } },
  { xp: 500, reward: { coins: 400 } },
];

app.get('/api/battlepass', authRequired, async (req: Request, res: Response) => {
  try {
    const seasonId = `${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}`;
    const user = await User.findById(req.user!.userId).select('exp');
    const xp = user?.exp || 0;
    res.json({ seasonId, tiers: BP_TIERS, xp });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});


