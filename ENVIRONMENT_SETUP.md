# 🔧 Environment Configuration Guide

This guide explains all environment variables for both frontend and backend.

## ✅ Status

- ✅ Backend `.env` - **CREATED**
- ✅ Frontend `.env.local` - **CREATED**
- ✅ Both example files - **CREATED**

---

## 🔙 Backend Environment Variables

**File**: `/backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer
JWT_SECRET=typeracer-super-secret-jwt-key-change-this-in-production-2024
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Variable Descriptions

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `5000` | Port where backend server runs |
| `MONGODB_URI` | Your MongoDB connection string | Database connection URL |
| `JWT_SECRET` | Secret key for JWT | Used to sign authentication tokens (change in production!) |
| `NODE_ENV` | `development` or `production` | Environment mode |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS configuration |

### 🔒 Security Notes

- ⚠️ **IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!
- 🔐 The MongoDB URI contains your database password - keep it secret!
- 🚫 Never commit `.env` to git (it's in `.gitignore`)

### Generate a Secure JWT Secret (for production)

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -base64 64

# Or online: https://www.uuidgenerator.net/
```

---

## 🎨 Frontend Environment Variables

**File**: `/frontend/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Variable Descriptions

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:5000` | Backend API URL for HTTP requests and Socket.io |

### 📝 Notes

- The `NEXT_PUBLIC_` prefix makes this variable available in the browser
- This is used by `/frontend/app/lib/api.ts` for API calls
- Socket.io also uses this URL for WebSocket connections

---

## 🌐 Different Environment Configurations

### Development (Local)

**Backend** `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer
JWT_SECRET=dev-secret-key-local
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Production (Example with Render/Vercel)

**Backend** `.env` (on Render/Railway/etc):
```env
PORT=5000
MONGODB_URI=mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer
JWT_SECRET=SUPER-LONG-RANDOM-SECRET-KEY-HERE-CHANGE-THIS
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Frontend** `.env.production` (on Vercel):
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

---

## 🚀 Quick Start

### 1. Verify Environment Files Exist

```bash
# Check backend
ls -la backend/.env

# Check frontend
ls -la frontend/.env.local
```

✅ Both files should exist now!

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
✅ Shop items seeded successfully
🚀 Server running on port 5000
📡 WebSocket server ready
🌐 Frontend URL: http://localhost:3000
```

### 3. Start Frontend (in another terminal)

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in Xs
```

### 4. Test Connection

Open browser: `http://localhost:3000`

The frontend should now be able to:
- ✅ Make API calls to backend
- ✅ Connect via Socket.io for multiplayer
- ✅ Signup/login users
- ✅ Shop and inventory features

---

## 🔍 Troubleshooting

### Backend won't start

**Error**: `MONGODB_URI is not defined`
- **Fix**: Make sure `/backend/.env` exists and contains `MONGODB_URI`

**Error**: `Port 5000 already in use`
- **Fix**: Change `PORT=5001` in `.env` or kill the process:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

**Error**: `MongooseServerSelectionError`
- **Fix**: Check MongoDB URI is correct and your IP is whitelisted in MongoDB Atlas

### Frontend can't connect to backend

**Error**: `Failed to fetch` or `CORS error`
- **Fix**: Verify `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000` in frontend `.env.local`
- **Fix**: Make sure backend is running on port 5000
- **Fix**: Check `FRONTEND_URL=http://localhost:3000` in backend `.env`

**Error**: `Socket.io connection failed`
- **Fix**: Check Socket.io is connecting to the same URL as `NEXT_PUBLIC_BACKEND_URL`
- **Fix**: Make sure backend Socket.io CORS allows your frontend URL

### Authentication issues

**Error**: `Invalid or expired token`
- **Fix**: Clear browser cookies and try logging in again
- **Fix**: Make sure `JWT_SECRET` is the same between restarts

---

## 📂 File Locations

```
typerace/
├── backend/
│   ├── .env                    ✅ CREATED (your actual config)
│   └── .env.example            ✅ CREATED (example template)
│
└── frontend/
    ├── .env.local              ✅ CREATED (your actual config)
    └── .env.example            ✅ CREATED (example template)
```

---

## 🔄 Environment Variables Reference

### Backend uses these internally:

1. **Express server**: `PORT`, `FRONTEND_URL` (for CORS)
2. **MongoDB**: `MONGODB_URI` (in `src/config/database.ts`)
3. **JWT Auth**: `JWT_SECRET` (in `src/middleware/auth.ts` and `src/controllers/authController.ts`)
4. **Socket.io**: `FRONTEND_URL` (in `src/config/socket.ts`)

### Frontend uses these in browser:

1. **API calls**: `NEXT_PUBLIC_BACKEND_URL` (in `app/lib/api.ts`)
2. **Socket.io**: `NEXT_PUBLIC_BACKEND_URL` (in `app/components/MultiplayerGame.tsx`)

---

## ✅ Checklist

Before running the application:

- [x] Backend `.env` file created
- [x] Frontend `.env.local` file created
- [x] MongoDB URI is correct
- [x] JWT_SECRET is set
- [x] Frontend URL matches actual frontend URL
- [x] Backend URL matches actual backend URL
- [ ] Install backend dependencies (`cd backend && npm install`)
- [ ] Install frontend dependencies (`cd frontend && npm install`)
- [ ] Start backend (`cd backend && npm run dev`)
- [ ] Start frontend (`cd frontend && npm run dev`)
- [ ] Test the application in browser

---

## 🎉 You're Ready!

Both environment files are now configured. You can start your application:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:3000** 🚀

Happy racing! 🏁

