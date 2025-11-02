# 🚀 Quick Start Deployment Guide

Your Type Race app is **production-ready**! Here's how to deploy it in 5 minutes.

---

## ⚡ Super Quick Version

### Backend → Render
1. Go to https://dashboard.render.com
2. New + → Web Service → Connect GitHub
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm start`
4. Add Environment Variables (see below)
5. Deploy!

### Frontend → Vercel
1. Go to https://vercel.com
2. Add New → Project → Import from GitHub
3. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. Add Environment Variable: `NEXT_PUBLIC_BACKEND_URL` (see below)
5. Deploy!

---

## 🔑 Environment Variables

### For Render (Backend)

**Get these values ready before starting:**

1. **MongoDB Atlas URI**
   - Sign up at https://cloud.mongodb.com
   - Create free cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0`
   - Get connection string
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/typeracer?retryWrites=true&w=majority`

2. **JWT Secret**
   - Generate secure secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
   - Example: `gX8P3kL9mN6qR4tV2wY7zA1bC5dE0fH8jK3lM9nP4qR7tU1vW5xZ9aB2cD6eF`

3. **Frontend URL** (Will set after Vercel deployment)
   - You'll get this after deploying frontend
   - Example: `https://your-app.vercel.app`

**Add to Render:**
```bash
NODE_ENV=production
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-generated-secret>
FRONTEND_URL=<will-update-after-vercel-deploy>
```

---

### For Vercel (Frontend)

**Get from Render:**

After deploying backend to Render, you'll get a URL like:
`https://your-backend.onrender.com`

**Add to Vercel:**
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

---

## 📋 Step-by-Step Deployment

### Part 1: Backend on Render (5 minutes)

#### Step 1: Setup MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Click "Sign Up" or "Log In"
3. Create organization and project
4. Click "Build a Database"
5. Choose **FREE** tier (M0 Sandbox)
6. Pick a cloud provider and region
7. Click "Create"

**Create Database User:**
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `typeracer_user` (or whatever you want)
5. Click "Autogenerate Secure Password"
6. **COPY THE PASSWORD** (you'll need it!)
7. Click "Add User"

**Network Access:**
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Click "Confirm"

**Get Connection String:**
1. Go to "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `typeracer`
7. Example:
   ```
   mongodb+srv://typeracer_user:YourPassword123@cluster0.xxxxx.mongodb.net/typeracer?retryWrites=true&w=majority
   ```

#### Step 2: Deploy to Render

1. **Create Account**
   - Go to https://dashboard.render.com
   - Sign up or log in with GitHub

2. **New Web Service**
   - Click "New +" button
   - Choose "Web Service"
   - Connect your GitHub account if needed
   - Select the `type-race` repository
   - Click "Connect"

3. **Configure Service**
   - Name: `type-race-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable" for each:

   ```bash
   # Variable 1
   Key: NODE_ENV
   Value: production

   # Variable 2
   Key: MONGODB_URI
   Value: <your-mongodb-connection-string-here>

   # Variable 3
   Key: JWT_SECRET
   Value: <your-generated-jwt-secret>

   # Variable 4 (we'll update this later)
   Key: FRONTEND_URL
   Value: placeholder
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (2-3 minutes)
   - Copy your Render backend URL (looks like `https://type-race-backend.onrender.com`)

#### Step 3: Verify Backend

1. Open: `https://your-backend.onrender.com/health`
2. Should see: `{"status":"ok","timestamp":"..."}`

**Check Logs:**
1. In Render dashboard, click "Logs" tab
2. Should see: "✅ MongoDB connected successfully"
3. Should see: "🚀 Server running on port..."

---

### Part 2: Frontend on Vercel (3 minutes)

#### Step 1: Deploy to Vercel

1. **Create Account**
   - Go to https://vercel.com/dashboard
   - Sign up or log in with GitHub

2. **New Project**
   - Click "Add New" → "Project"
   - Import the `type-race` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `frontend`
   - **Build Command:** (leave default: `npm run build`)
   - **Output Directory:** (leave default: `.next`)
   - **Install Command:** (leave default: `npm install`)

4. **Add Environment Variable**
   - Scroll to "Environment Variables"
   - Click "Add"
   - Key: `NEXT_PUBLIC_BACKEND_URL`
   - Value: `https://your-backend.onrender.com` (from Render)
   - Environment: Check "Production"
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for build (1-2 minutes)
   - Copy your Vercel frontend URL (looks like `https://type-race.vercel.app`)

#### Step 2: Update Backend CORS

Go back to Render and update the environment variable:

1. In Render dashboard, click your backend service
2. Go to "Environment" tab
3. Find `FRONTEND_URL` variable
4. Click "Edit"
5. Update value to your Vercel URL: `https://your-app.vercel.app`
6. Click "Save Changes"
7. Render will automatically redeploy

---

### Part 3: Test Everything (2 minutes)

1. **Open Frontend**
   - Go to your Vercel URL
   - Should load without errors

2. **Open Browser Console**
   - Press F12 or right-click → Inspect
   - Click "Console" tab
   - Should see no errors

3. **Test Features**
   - Try clicking around the site
   - Try multiplayer game
   - Should work without errors

4. **Check Backend Health**
   - Open: `https://your-backend.onrender.com/health`
   - Should return JSON with status

---

## ✅ You're Live! 🎉

Your Type Race app is now live on the internet!

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.onrender.com
- **Database:** MongoDB Atlas

---

## 🔧 Troubleshooting

### Issue: Frontend can't connect to backend

**Solution:**
1. Check `NEXT_PUBLIC_BACKEND_URL` in Vercel matches your Render backend URL
2. Check backend CORS allows your frontend URL
3. Verify FRONTEND_URL in Render matches your Vercel URL

### Issue: MongoDB connection failed

**Solution:**
1. Check MONGODB_URI is correct
2. Verify IP whitelist has `0.0.0.0/0`
3. Check username and password are correct
4. Make sure database name is included in URI

### Issue: CORS errors in browser

**Solution:**
1. Ensure FRONTEND_URL in Render matches Vercel URL exactly
2. Include `https://` protocol
3. No trailing slash
4. Redeploy backend after updating

### Issue: Environment variable not working

**Solution:**
1. Variable names are case-sensitive
2. Make sure you saved the variables
3. Redeploy after adding variables
4. For frontend, variables starting with `NEXT_PUBLIC_` are required

---

## 📚 Need More Help?

- **Full Environment Guide:** See `ENVIRONMENT_VARIABLES.md`
- **Troubleshooting:** See `backend/DEPLOYMENT_TROUBLESHOOTING.md`
- **Deployment Guide:** See `DEPLOYMENT_READY.md`

---

## 🎊 Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created and password saved
- [ ] IP whitelist configured
- [ ] Backend deployed to Render
- [ ] Backend health check working
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] Frontend loads without errors
- [ ] No CORS errors in console
- [ ] Multiplayer game works
- [ ] App is live and playable!

**Congratulations! You've deployed a full-stack production application!** 🚀🎮

