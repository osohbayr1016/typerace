# 📁 Backend Structure Overview

## Complete File Tree

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts              # MongoDB connection & error handling
│   │   └── socket.ts                # Socket.io setup with JWT auth
│   │
│   ├── controllers/
│   │   ├── authController.ts        # signup, login, logout, me
│   │   ├── inventoryController.ts   # getInventory, equipItem
│   │   └── shopController.ts        # catalog, purchase
│   │
│   ├── middleware/
│   │   └── auth.ts                  # JWT verification (authenticateToken, optionalAuth)
│   │
│   ├── models/
│   │   ├── User.ts                  # User schema (username, email, coins, exp, inventory)
│   │   ├── Item.ts                  # Shop items (cars, skins)
│   │   └── Race.ts                  # Race history
│   │
│   ├── routes/
│   │   ├── authRoutes.ts            # /api/auth/* routes
│   │   ├── inventoryRoutes.ts       # /api/inventory routes
│   │   └── shopRoutes.ts            # /api/shop/* routes
│   │
│   ├── services/
│   │   ├── raceService.ts           # Main race logic, lobby, countdown
│   │   ├── raceCompletion.ts        # Finish logic, rewards, placement
│   │   └── shopService.ts           # Purchase logic, shop seeding
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces (IUser, IItem, IRace, etc.)
│   │
│   ├── utils/
│   │   ├── raceTexts.ts             # 20 typing race texts
│   │   └── rewardCalculator.ts      # Coins/EXP calculation, leveling
│   │
│   └── server.ts                    # Main entry point
│
├── .env                             # Environment variables (YOU NEED TO CREATE)
├── .env.example                     # Example env file
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── start.sh                         # Quick start script
├── README.md                        # Full documentation
├── SETUP.md                         # Quick setup guide
└── BACKEND_STRUCTURE.md             # This file
```

## 📊 File Count & Lines

### By Category
- **Config**: 2 files (~90 lines)
- **Controllers**: 3 files (~320 lines)
- **Middleware**: 1 file (~50 lines)
- **Models**: 3 files (~140 lines)
- **Routes**: 3 files (~45 lines)
- **Services**: 3 files (~280 lines)
- **Types**: 1 file (~70 lines)
- **Utils**: 2 files (~70 lines)
- **Main**: 1 file (~90 lines)

**Total**: 19 TypeScript files, ~1,155 lines of code

✅ All files are under 160 lines per your requirements!

## 🎯 What Each File Does

### Config Layer
| File | Purpose |
|------|---------|
| `config/database.ts` | Connects to MongoDB, handles reconnection |
| `config/socket.ts` | Sets up Socket.io with CORS and JWT auth |

### Controller Layer (HTTP Request Handlers)
| File | Endpoints |
|------|-----------|
| `authController.ts` | POST /signup, /login, /logout; GET /me |
| `shopController.ts` | GET /catalog; POST /purchase |
| `inventoryController.ts` | GET /inventory; POST /equip |

### Middleware Layer
| File | Purpose |
|------|---------|
| `auth.ts` | JWT token verification, protect routes |

### Model Layer (Database Schemas)
| File | Schema |
|------|--------|
| `User.ts` | username, email, password, coins, exp, level, inventory |
| `Item.ts` | sku, name, type, price, rarity, stats |
| `Race.ts` | raceId, players, text, results, timestamps |

### Route Layer (API Endpoints)
| File | Mounts |
|------|--------|
| `authRoutes.ts` | Routes to authController |
| `shopRoutes.ts` | Routes to shopController |
| `inventoryRoutes.ts` | Routes to inventoryController |

### Service Layer (Business Logic)
| File | Purpose |
|------|---------|
| `raceService.ts` | Lobby, matchmaking, countdown, race start |
| `raceCompletion.ts` | Finish detection, rewards, placement bonuses |
| `shopService.ts` | Purchase validation, shop data seeding |

### Utils Layer (Helpers)
| File | Purpose |
|------|---------|
| `raceTexts.ts` | 20 typing texts, random selection |
| `rewardCalculator.ts` | Coins/EXP formulas, level calculation |

### Types Layer
| File | Contains |
|------|----------|
| `types/index.ts` | All TypeScript interfaces and types |

## 🔄 Request Flow

### HTTP Request (e.g., Login)
```
Client Request
    ↓
Express Middleware (CORS, JSON parser, cookies)
    ↓
Route (authRoutes.ts)
    ↓
Middleware (auth.ts) [if protected]
    ↓
Controller (authController.ts)
    ↓
Model (User.ts)
    ↓
MongoDB
    ↓
Response back to Client
```

### WebSocket Flow (Multiplayer Race)
```
Client connects via Socket.io
    ↓
Socket middleware (auth from token)
    ↓
raceService.ts handles connection
    ↓
Add to lobby → Start countdown → Start race
    ↓
Client emits 'update-progress'
    ↓
raceService receives, broadcasts to all
    ↓
Player finishes → raceCompletion.ts
    ↓
Calculate rewards → Update User in DB
    ↓
Emit rewards to client
    ↓
All finish → Race results → Reset lobby
```

## 🔐 Authentication Flow

1. User signs up/logs in → Password hashed with bcrypt
2. Server creates JWT token with user data
3. Token stored in httpOnly cookie (secure, can't be accessed by JS)
4. Future requests include cookie automatically
5. Middleware verifies token on protected routes
6. Socket.io gets token from handshake, verifies, attaches user

## 💰 Reward System

### Immediate Rewards (On Finish)
- Base: WPM × 2 coins, WPM × 3 exp
- Accuracy bonus:
  - 95%+: +50 coins, +75 exp
  - 90-94%: +30 coins, +50 exp
  - 85-89%: +15 coins, +25 exp

### Placement Bonus (After All Finish)
- 1st: +200 coins, +300 exp
- 2nd: +100 coins, +150 exp
- 3rd: +50 coins, +75 exp

### Level Calculation
```
level = floor(sqrt(exp / 100)) + 1
```

## 🎮 Socket.io Events

### Server → Client
| Event | Data | When |
|-------|------|------|
| `waiting-state` | {players, countdownEndsAt} | Player joins/leaves lobby |
| `race-starting` | {startsInMs} | Countdown begins (2+ players) |
| `race-started` | {raceId, text, players, startsInMs} | Race begins |
| `player-progress` | {playerId, progress, wpm} | Player types |
| `player-finished-reward` | {coins, exp, levelUp} | You finish |
| `placement-bonus` | {exp, levelUp} | Everyone finishes |
| `race-results` | {results[]} | Final standings |

### Client → Server
| Event | Data | Purpose |
|-------|------|---------|
| `update-progress` | {progress, wpm, errors} | Send your typing progress |

## 🚦 Race States

```
WAITING
  ↓ (2+ players join)
COUNTDOWN (10 seconds)
  ↓
RACING (3 second grace period)
  ↓ (all players finish)
FINISHED
  ↓ (5 seconds delay)
WAITING (reset, loop)
```

## 📦 Dependencies

### Production
- `express` - Web framework
- `socket.io` - Real-time WebSocket
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `cors` - CORS handling
- `dotenv` - Environment variables
- `cookie-parser` - Parse cookies
- `uuid` - Generate race IDs

### Development
- `typescript` - Type safety
- `ts-node-dev` - Dev server with auto-reload
- `@types/*` - Type definitions

## ✅ Features Implemented

- ✅ User authentication (signup, login, logout)
- ✅ JWT-based sessions with httpOnly cookies
- ✅ Shop system with cars and skins
- ✅ Purchase validation and coin deduction
- ✅ Inventory management
- ✅ Equipment system (equip cars/skins)
- ✅ Real-time multiplayer lobby
- ✅ Auto-matchmaking (2+ players)
- ✅ Countdown timer before race
- ✅ Grace period after race start
- ✅ Live progress tracking
- ✅ WPM calculation
- ✅ Reward system (coins + exp)
- ✅ Placement bonuses
- ✅ Level progression
- ✅ Race history storage
- ✅ 20 pre-written race texts
- ✅ Guest user support
- ✅ Error handling
- ✅ CORS configuration
- ✅ Health check endpoint

## 🎨 Design Principles

1. **Separation of Concerns**: Each layer has specific responsibility
2. **DRY (Don't Repeat Yourself)**: Shared logic in utils/services
3. **Type Safety**: Full TypeScript coverage
4. **Clean Code**: Files under 160 lines
5. **Scalability**: Easy to add new features
6. **Security**: Hashed passwords, JWT, httpOnly cookies
7. **Real-time**: Socket.io for instant updates

## 🔧 Customization Points

Want to modify the game? Here's where to look:

- **Change reward amounts**: `utils/rewardCalculator.ts`
- **Add more race texts**: `utils/raceTexts.ts`
- **Change countdown time**: `services/raceService.ts` (COUNTDOWN_DURATION)
- **Change minimum players**: `services/raceService.ts` (MIN_PLAYERS)
- **Add new shop items**: `services/shopService.ts` (seedShopItems)
- **Modify user stats**: `models/User.ts`
- **Add new API endpoints**: Create new controller/route/service

## 📝 Notes

- All files are properly typed with TypeScript
- Error handling on all async operations
- Database indexes for performance
- Graceful shutdown handling
- Development-friendly with hot reload
- Production-ready with build script

