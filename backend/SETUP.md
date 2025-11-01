# 🚀 Quick Setup Guide

## Step 1: Create Environment File

Create a `.env` file in the backend directory with these contents:

```env
PORT=5000
MONGODB_URI=mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer
JWT_SECRET=typeracer-super-secret-jwt-key-2024
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

## Step 3: Start the Server

### Option A: Using npm script
```bash
npm run dev
```

### Option B: Using start script (Unix/Mac)
```bash
./start.sh
```

### Option C: Production build
```bash
npm run build
npm start
```

## Expected Output

When the server starts successfully, you should see:

```
✅ MongoDB connected successfully
✅ Shop items seeded successfully
🚀 Server running on port 5000
📡 WebSocket server ready
🌐 Frontend URL: http://localhost:3000
```

## Troubleshooting

### Can't connect to MongoDB
- Check if your IP is whitelisted in MongoDB Atlas
- Verify the connection string is correct
- Make sure the database name is 'typeracer'

### Port already in use
- Change the PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### Module not found errors
- Make sure you ran `npm install`
- Delete `node_modules` and run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Testing the API

### Test health endpoint
```bash
curl http://localhost:5000/health
```

### Test signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"test123"}'
```

### Test catalog
```bash
curl http://localhost:5000/api/shop/catalog
```

## File Structure Created

```
backend/
├── src/
│   ├── config/          ✅ Database & Socket.io config
│   ├── controllers/     ✅ Auth, Shop, Inventory controllers
│   ├── middleware/      ✅ JWT authentication
│   ├── models/          ✅ User, Item, Race models
│   ├── routes/          ✅ API routes
│   ├── services/        ✅ Race & Shop business logic
│   ├── types/           ✅ TypeScript interfaces
│   ├── utils/           ✅ Helpers & race texts
│   └── server.ts        ✅ Main entry point
├── .env                 ⚠️  You need to create this
├── .gitignore           ✅
├── package.json         ✅
├── tsconfig.json        ✅
├── README.md            ✅ Full documentation
└── SETUP.md             ✅ This file
```

## Next Steps

1. ✅ Create .env file with your MongoDB URI
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Test the API endpoints
5. ✅ Connect your frontend to http://localhost:5000
6. ✅ Start racing! 🏎️

## Socket.io Events to Implement on Frontend

Make sure your frontend connects to `http://localhost:5000` and listens for:
- `waiting-state` - Lobby updates
- `race-starting` - Countdown started
- `race-started` - Race begins
- `player-progress` - Other players' progress
- `player-finished-reward` - Your rewards
- `placement-bonus` - Placement bonus
- `race-results` - Final results

And emits:
- `update-progress` - Your typing progress

Happy racing! 🏁

