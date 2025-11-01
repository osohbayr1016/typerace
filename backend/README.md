# TypeRacer Backend

A multiplayer typing race game backend built with Node.js, Express, Socket.io, MongoDB, and TypeScript.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Socket.io)
│   │   ├── database.ts
│   │   └── socket.ts
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   ├── inventoryController.ts
│   │   └── shopController.ts
│   ├── middleware/      # Express middleware
│   │   └── auth.ts
│   ├── models/          # Mongoose schemas
│   │   ├── Item.ts
│   │   ├── Race.ts
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── inventoryRoutes.ts
│   │   └── shopRoutes.ts
│   ├── services/        # Business logic
│   │   ├── raceCompletion.ts
│   │   ├── raceService.ts
│   │   └── shopService.ts
│   ├── types/           # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/           # Helper functions
│   │   ├── raceTexts.ts
│   │   └── rewardCalculator.ts
│   └── server.ts        # Entry point
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your actual values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)
   - `FRONTEND_URL`: Your frontend URL (default: http://localhost:3000)

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (requires auth)

### Shop
- `GET /api/shop/catalog` - Get all shop items
- `POST /api/shop/purchase` - Purchase item (requires auth)

### Inventory
- `GET /api/inventory` - Get user inventory (requires auth)
- `POST /api/inventory/equip` - Equip car/skin (requires auth)

### Health Check
- `GET /health` - Server health status

## 🎮 Socket.io Events

### Client → Server
- `update-progress` - Send player progress, WPM, errors

### Server → Client
- `waiting-state` - Lobby status and player list
- `race-starting` - Race countdown started
- `race-started` - Race begins with text and players
- `player-progress` - Another player's progress update
- `player-finished-reward` - Immediate reward when finishing
- `placement-bonus` - Bonus exp after all players finish
- `race-results` - Final results with placements

## 🎯 Features

### Authentication
- JWT-based authentication with httpOnly cookies
- Bcrypt password hashing
- Protected routes with middleware

### Multiplayer Racing
- Real-time lobby system
- Auto-matchmaking (2+ players)
- 10-second countdown before race starts
- 3-second grace period after race starts
- Live progress tracking
- WPM calculation
- Reward system (coins + exp)
- Placement bonuses (1st, 2nd, 3rd)
- Level progression

### Shop System
- Car and skin items
- Rarity system (common, rare, epic, legendary)
- Purchase validation
- Pre-seeded items

### Inventory Management
- Track owned items
- Equip/unequip cars and skins
- Persistent across sessions

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- CORS configured for frontend origin
- Input validation on all endpoints
- Authentication middleware

## 🛠️ Development

### Project Structure

The codebase follows clean architecture principles:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define database schemas
- **Middleware**: Handle cross-cutting concerns
- **Routes**: Define API endpoints
- **Utils**: Helper functions

### Code Style

- TypeScript strict mode enabled
- Files kept under 160 lines per user preferences
- Proper separation of concerns
- Type-safe interfaces

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | Required |
| JWT_SECRET | Secret key for JWT signing | Required |
| NODE_ENV | Environment (development/production) | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure MongoDB is running if using local instance

### Socket.io Connection Issues
- Check CORS settings match your frontend URL
- Verify frontend is connecting to correct port
- Check firewall settings

### Authentication Issues
- Ensure JWT_SECRET is set in .env
- Check cookie settings (httpOnly, sameSite)
- Verify frontend is sending credentials

## 📦 Production Deployment

1. Build the project: `npm run build`
2. Set environment variables on your hosting platform
3. Ensure MongoDB URI is for production database
4. Update FRONTEND_URL to production frontend URL
5. Use a strong JWT_SECRET
6. Set NODE_ENV=production
7. Run: `npm start`

## 🤝 Contributing

This is a personal project. Feel free to fork and modify as needed.

## 📄 License

ISC

