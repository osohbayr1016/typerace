# 🐛 Fix 500 Internal Server Error

Your backend is returning 500 errors. Here's how to fix it!

---

## 🔍 Check Render Logs First

1. Go to https://dashboard.render.com
2. Click your backend service
3. Click **"Logs"** tab
4. Look for error messages

The detailed logging will now show you exactly where it's failing!

---

## ✅ Most Common Causes

### Issue 1: MongoDB Connection Failed

**Symptoms:**
```
❌ Failed to connect to MongoDB
```

**Solution:**
1. Go to Render → Environment tab
2. Check `MONGODB_URI` is set correctly
3. Verify your MongoDB Atlas cluster is running
4. Check IP whitelist includes `0.0.0.0/0`
5. Verify username and password are correct

---

### Issue 2: JWT_SECRET Not Set

**Symptoms:**
```
❌ Missing required environment variables in production:
   - JWT_SECRET
```

**Solution:**
1. Go to Render → Environment tab
2. Check `JWT_SECRET` exists
3. Generate a new one if needed:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
4. Update `JWT_SECRET` in Render
5. Redeploy

---

### Issue 3: Environment Variables Not Loaded

**Symptoms:**
```
🔍 Environment check:
   FRONTEND_URL: not set (will use localhost:3000)
```

**Solution:**
All environment variables must be set in Render dashboard:

1. Go to Render → Environment tab
2. Add/update these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<your-secret>
   FRONTEND_URL=https://typerace-gamma.vercel.app
   ```
3. Click "Save Changes"
4. Wait for redeploy

---

## 🔍 Debugging with New Logs

After redeploying with the updated code, the logs will show you exactly what's happening:

### Successful Login:
```
🔐 Login attempt received
🔍 Looking up user: test@example.com
🔐 Validating password
✅ Password valid, generating token
✅ Login successful for: testuser
```

### Failed Login:
```
🔐 Login attempt received
🔍 Looking up user: test@example.com
❌ User not found: test@example.com
```

### MongoDB Error:
```
❌ Login error: MongoNetworkError: ...
Error details: failed to connect to server
Error stack: ...
```

---

## 📋 Complete Environment Variables Checklist

Make sure ALL of these are set in Render:

```bash
✅ NODE_ENV=production
✅ MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typeracer?retryWrites=true&w=majority
✅ JWT_SECRET=<32-character-secret>
✅ FRONTEND_URL=https://typerace-gamma.vercel.app
```

---

## 🔧 Step-by-Step Fix

### Step 1: Generate JWT_SECRET

If you don't have one, generate it:

```bash
# On local computer
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

### Step 2: Setup MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster (if not done)
3. Create database user:
   - Username: anything you want
   - Password: auto-generate or create
   - Save the password!
4. Network Access:
   - Add IP Address
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
5. Get connection string:
   - Database → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with actual password
   - Replace `<dbname>` with `typeracer`

### Step 3: Update Render Environment Variables

1. Go to Render dashboard
2. Your backend service → Environment tab
3. Update or add these:

```bash
NODE_ENV=production

MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/typeracer?retryWrites=true&w=majority

JWT_SECRET=<paste-your-generated-secret-here>

FRONTEND_URL=https://typerace-gamma.vercel.app
```

4. Click "Save Changes"
5. Wait for redeploy (1-2 minutes)

### Step 4: Check Logs

After redeploy, check logs:

You should see:
```
🔍 Environment check:
   NODE_ENV: production
   PORT: 10000
   MONGODB_URI: ✅ set
   JWT_SECRET: ✅ set
   FRONTEND_URL: https://typerace-gamma.vercel.app

🔌 Attempting to connect to MongoDB...
✅ MongoDB connected successfully

✅ Shop items seeded successfully
🚀 Server running on port 10000
```

---

## 🧪 Test

After fixing environment variables:

1. Wait for deployment to complete
2. Test health endpoint:
   ```bash
   curl https://typerace-9p8k.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. Test login from your frontend
4. Check browser console for errors
5. Should work! ✅

---

## ❌ If Still Not Working

If you're still getting 500 errors after setting all environment variables:

1. **Share the logs** from Render
2. **Check MongoDB Atlas** is accessible
3. **Verify JWT_SECRET** is set correctly
4. **Test MongoDB connection** using connection string in a tool like MongoDB Compass

---

## 📊 Expected Logs (Success)

When everything is working correctly:

```
🔍 Environment check:
   NODE_ENV: production
   PORT: 10000
   MONGODB_URI: ✅ set
   JWT_SECRET: ✅ set
   FRONTEND_URL: https://typerace-gamma.vercel.app

🌐 CORS allowed origins: ['https://typerace-gamma.vercel.app', ...]

🔌 Attempting to connect to MongoDB...
   URI format: mongodb+srv://...
✅ MongoDB connected successfully
   Database: typeracer

✅ Shop items seeded successfully
🚀 Server running on port 10000
📡 WebSocket server ready
🌐 Environment: production
```

When you make a request:

```
🔍 CORS request from origin: https://typerace-gamma.vercel.app
✅ Origin allowed: https://typerace-gamma.vercel.app

🔐 Login attempt received
🔍 Looking up user: test@example.com
✅ Password valid, generating token
✅ Login successful for: testuser
```

---

## ✅ Success!

Once logs show all checks passing and successful connections, your 500 error should be fixed!

**Good luck!** 🚀

