# 🌐 Environment Variables Setup Guide

## 📋 Complete Environment Variables List

This document lists all environment variables needed for **Render** (Backend) and **Vercel** (Frontend).

---

## 🔧 For Render (Backend Deployment)

### Required Environment Variables:

| Variable Name | Description | Example | Required |
|--------------|-------------|---------|----------|
| **NODE_ENV** | Environment type | `production` | ✅ Yes |
| **MONGODB_URI** | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority` | ✅ Yes |
| **JWT_SECRET** | Secret key for JWT tokens | `<32-character-random-string>` | ✅ Yes |
| **FRONTEND_URL** | Frontend deployment URL | `https://your-app.vercel.app` | ✅ Yes |
| **PORT** | Server port | Automatically set by Render | ⚠️ Auto |

### How to Set in Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service
3. Go to **"Environment"** tab in left sidebar
4. Click **"Add Environment Variable"**
5. Add each variable with its value
6. Click **"Save Changes"**
7. Render will **automatically redeploy**

### Example Values:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/typeracer?retryWrites=true&w=majority
JWT_SECRET=gX8P3kL9mN6qR4tV2wY7zA1bC5dE0fH8jK3lM9nP4qR7tU1vW5xZ9aB2cD6eF
FRONTEND_URL=https://your-type-race-app.vercel.app
```

**Note:** `PORT` is automatically set by Render. Don't add it manually unless you have a specific reason.

---

## 🌐 For Vercel (Frontend Deployment)

### Required Environment Variables:

| Variable Name | Description | Example | Required |
|--------------|-------------|---------|----------|
| **NEXT_PUBLIC_BACKEND_URL** | Backend API URL | `https://your-backend.onrender.com` | ✅ Yes |

### How to Set in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your frontend project
3. Go to **"Settings"** tab
4. Click **"Environment Variables"** in left sidebar
5. Add the variable with its value
6. Select **"Production"** environment
7. Click **"Save"**
8. **Redeploy** your application

### Example Values:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

---

## 🔐 Generate Secure Secrets

### Generate JWT_SECRET:

#### Option 1: Using Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Option 2: Using OpenSSL (Mac/Linux)
```bash
openssl rand -base64 32
```

#### Option 3: Using PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Option 4: Online Generator
Visit: https://randomkeygen.com/
Use the **Base64 Key (32 bytes)**

**⚠️ Important:** Keep this secret secure and **NEVER** commit it to Git!

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a **free account**
3. Create a **free cluster** (M0 Sandbox)

### Step 2: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Set authentication method: **Username/Password**
4. Enter username (e.g., `typeracer_user`)
5. Click **"Autogenerate Secure Password"** or create your own
6. Save the password! You'll need it for MONGODB_URI
7. Set database user privileges: **"Read and write to any database"**
8. Click **"Add User"**

### Step 3: Whitelist IP Addresses

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` to whitelist
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `typeracer` (or your preferred database name)

### Complete Example:

```
mongodb+srv://typeracer_user:MySecurePassword123@cluster0.abcd1.mongodb.net/typeracer?retryWrites=true&w=majority
```

---

## ✅ Complete Setup Example

### Backend (Render) - Environment Variables:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://typeracer_user:SecurePass123@cluster0.abcd1.mongodb.net/typeracer?retryWrites=true&w=majority
JWT_SECRET=gX8P3kL9mN6qR4tV2wY7zA1bC5dE0fH8jK3lM9nP4qR7tU1vW5xZ9aB2cD6eF
FRONTEND_URL=https://type-race-app.vercel.app
```

### Frontend (Vercel) - Environment Variables:

```bash
NEXT_PUBLIC_BACKEND_URL=https://type-race-backend.onrender.com
```

---

## 🔍 Verification Checklist

### Backend (Render):

- [ ] All 4 environment variables added
- [ ] NODE_ENV is `production`
- [ ] MONGODB_URI is a valid connection string
- [ ] JWT_SECRET is a secure random string
- [ ] FRONTEND_URL matches your Vercel deployment URL
- [ ] Deploy logs show no errors
- [ ] Health endpoint returns 200 OK: `https://your-backend.onrender.com/health`

### Frontend (Vercel):

- [ ] NEXT_PUBLIC_BACKEND_URL matches your Render backend URL
- [ ] Added to Production environment
- [ ] Redeployed after adding variables
- [ ] No CORS errors in browser console
- [ ] Can connect to backend

---

## 🧪 Test Your Deployment

### Test Backend:

```bash
# Health check
curl https://your-backend.onrender.com/health

# Should return:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Test Frontend:

1. Open your Vercel deployment URL
2. Open browser DevTools (F12)
3. Check Console for errors
4. Try to sign up or login
5. Should work without errors

---

## ❌ Common Issues and Solutions

### Issue 1: "Missing required environment variables"

**Problem:** Render logs show this error

**Solution:**
- Check all environment variables are added in Render
- Verify variable names are exact (case-sensitive)
- Make sure values are not empty
- Save and redeploy

### Issue 2: "MongoDB connection failed"

**Problem:** Cannot connect to MongoDB

**Solution:**
- Check MongoDB URI is correct
- Verify username/password are correct
- Ensure IP whitelist has `0.0.0.0/0`
- Check network connectivity in Render

### Issue 3: "CORS error" from frontend

**Problem:** Frontend can't connect to backend

**Solution:**
- Verify FRONTEND_URL matches your Vercel URL exactly
- Include `https://` in FRONTEND_URL
- No trailing slash in URL
- Redeploy both frontend and backend

### Issue 4: "JWT_SECRET must be set to a secure value"

**Problem:** JWT_SECRET is invalid

**Solution:**
- Generate a new JWT_SECRET using the methods above
- Make sure it's not "fallback-secret-key"
- Minimum 32 characters recommended
- Update in Render and redeploy

---

## 📝 Quick Reference

### Backend Environment Variables (Render):

```bash
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-generated-secret>
FRONTEND_URL=<your-vercel-frontend-url>
```

### Frontend Environment Variables (Vercel):

```bash
NEXT_PUBLIC_BACKEND_URL=<your-render-backend-url>
```

### Important Notes:

- ✅ Environment variables are case-sensitive
- ✅ No quotes needed around values (except for special characters)
- ✅ FRONTEND_URL must include `https://`
- ✅ NEXT_PUBLIC_BACKEND_URL must include `https://`
- ✅ Backend URL must match exactly what Render gives you
- ✅ Frontend URL must match exactly what Vercel gives you

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Render logs show: "✅ MongoDB connected successfully"
2. ✅ Render logs show: "🚀 Server running on port..."
3. ✅ Health endpoint returns 200 OK
4. ✅ Frontend can load without errors
5. ✅ Signup/Login works
6. ✅ No CORS errors in browser
7. ✅ Socket.io connections work
8. ✅ Multiplayer games function properly

---

## 🆘 Need Help?

If you still have issues:

1. Check **Render logs** for backend errors
2. Check **Vercel logs** for frontend build errors
3. Check **browser console** for runtime errors
4. Verify all environment variables are set correctly
5. Test health endpoint: `https://your-backend.onrender.com/health`

Your deployment should work! 🚀

