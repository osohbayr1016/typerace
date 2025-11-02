# 🔧 Deployment Troubleshooting Guide

## 🎯 If You're Getting 500 Errors on Render

This guide will help you diagnose and fix deployment issues.

---

## ✅ Step 1: Check Your Logs

The most important first step is to **look at your Render logs**. 

1. Go to your Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors

### What You Should See (Success):

```
🔍 Environment check:
   NODE_ENV: production
   PORT: 10000
   MONGODB_URI: ✅ set
   JWT_SECRET: ✅ set
   FRONTEND_URL: https://your-frontend.com

🔌 Attempting to connect to MongoDB...
✅ MongoDB connected successfully
   Database: typeracer

✅ Shop items seeded successfully
🚀 Server running on port 10000
📡 WebSocket server ready
🌐 Environment: production
```

### Common Error Messages:

#### Error 1: Missing Environment Variables
```
❌ Missing required environment variables in production:
   - MONGODB_URI
💡 Please set these variables in your Render dashboard:
   1. Go to your Render dashboard
   2. Select your service
   3. Go to "Environment" tab
   4. Add the missing variables
```

**Fix:** Add missing environment variables in Render dashboard.

#### Error 2: MongoDB Connection Failed
```
❌ Failed to connect to MongoDB
   Error details: MongoNetworkError
💡 Troubleshooting tips:
   1. Check MONGODB_URI is correct in Render dashboard
   2. Verify IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
   3. Ensure database user has proper permissions
   4. Check MongoDB connection string format
```

**Fix:** 
1. Check MongoDB URI is correct
2. Add `0.0.0.0/0` to IP whitelist in MongoDB Atlas
3. Verify username/password are correct

#### Error 3: JWT_SECRET Invalid
```
❌ JWT_SECRET must be set to a secure value in production
💡 Generate a secure JWT_SECRET using:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Fix:** Generate a new JWT_SECRET and set it in Render.

---

## ✅ Step 2: Verify Environment Variables

### Required Variables for Render:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=<32-character-random-string>
FRONTEND_URL=https://your-frontend-domain.com
```

### How to Set Environment Variables in Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your web service
3. Go to "Environment" tab in the left sidebar
4. Click "Add Environment Variable"
5. Add each variable with its value
6. Click "Save Changes"
7. Render will automatically redeploy

---

## ✅ Step 3: MongoDB Atlas Setup

### If Using MongoDB Atlas:

1. **Create Cluster** (if not done):
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster

2. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username/Password authentication
   - Set username and password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Whitelist IP Addresses**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Click "Confirm"

4. **Get Connection String**:
   - Go to "Database"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `typeracer` (or your database name)

Example connection string:
```
mongodb+srv://username:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/typeracer?retryWrites=true&w=majority
```

---

## ✅ Step 4: Generate JWT_SECRET

### Option 1: Using Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 2: Using OpenSSL (Mac/Linux)
```bash
openssl rand -base64 32
```

### Option 3: Using PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Option 4: Online Generator
Use https://randomkeygen.com/ (Base64 key 32 bytes)

**Important:** Keep this secret secure and NEVER commit it to Git!

---

## ✅ Step 5: Verify Build and Deployment

### Render Configuration Should Be:

```yaml
Build Command: npm install --include=dev && npm run build
Start Command: npm start
Root Directory: backend
Environment: Node
Node Version: 18 or higher
```

### Expected Build Output:

```
✅ npm install           → 251 packages installed
✅ TypeScript compilation → 19 files compiled  
✅ npm start            → Server starting
✅ MongoDB connected
✅ Server running
```

---

## ✅ Step 6: Test After Deploy

### Health Check:

After deployment, test the health endpoint:

```bash
curl https://your-backend.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Signup (Optional):

```bash
curl -X POST https://your-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "username": "testuser",
    "password": "test123"
  }'
```

Should return user data if working.

---

## ❌ Common Issues and Solutions

### Issue 1: "Internal Server Error" 500

**Diagnosis:**
- Check Render logs
- Look for MongoDB connection errors
- Check environment variables are set

**Solution:**
1. Verify all environment variables in Render
2. Check MongoDB Atlas IP whitelist
3. Ensure MongoDB URI format is correct
4. Check JWT_SECRET is set and valid

### Issue 2: "Cannot connect to database"

**Diagnosis:**
- MongoDB connection string incorrect
- IP not whitelisted
- Username/password wrong

**Solution:**
1. Double-check connection string
2. Add `0.0.0.0/0` to MongoDB Atlas whitelist
3. Verify username/password
4. Test connection string locally first

### Issue 3: "Missing environment variable"

**Diagnosis:**
- Variable not set in Render
- Typo in variable name
- Variable value is empty

**Solution:**
1. Check variable name is exact: `MONGODB_URI` (not `MONGODB_URL`)
2. Verify value is not empty
3. Save and redeploy

### Issue 4: "CORS error" from frontend

**Diagnosis:**
- FRONTEND_URL not matching exactly
- HTTPS vs HTTP mismatch

**Solution:**
1. Ensure FRONTEND_URL includes `https://` (not `http://`)
2. No trailing slash in FRONTEND_URL
3. Exact match with frontend domain

### Issue 5: Build fails

**Diagnosis:**
- TypeScript compilation errors
- Missing dependencies
- Node version mismatch

**Solution:**
1. Check build logs for TypeScript errors
2. Verify Node version in Render (>=18)
3. Ensure all dependencies in package.json
4. Try clean build: delete node_modules, reinstall

---

## 🔍 Debug Checklist

When troubleshooting, check these in order:

- [ ] **Render logs** show what error?
- [ ] **Environment variables** all set correctly?
- [ ] **MongoDB Atlas** IP whitelist includes 0.0.0.0/0?
- [ ] **MongoDB connection string** correct format?
- [ ] **JWT_SECRET** generated securely?
- [ ] **FRONTEND_URL** includes https://?
- [ ] **Build command** correct?
- [ ] **Start command** correct?
- [ ] **Root directory** set to `backend`?
- [ ] **Node version** >= 18?
- [ ] **Health endpoint** returns 200?

---

## 📞 Getting More Help

If you've tried everything above and still have issues:

1. **Check the logs** - This is your best resource
2. **Take a screenshot** of the error
3. **Note the environment** (production vs development)
4. **Share the error message** exactly as it appears

### Quick Debug Commands:

```bash
# Test MongoDB connection locally
cd backend
npm run dev

# Check what's in your environment
# (In render logs, you'll see the environment check output)

# Verify your build locally
npm run build
npm start
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Render logs show: "✅ MongoDB connected successfully"
2. ✅ Render logs show: "🚀 Server running on port..."
3. ✅ Health endpoint returns 200 OK
4. ✅ Frontend can connect to backend
5. ✅ No CORS errors in browser console
6. ✅ Signup/Login works from frontend

---

## 🎉 You're Done!

If all the above is working, your deployment is successful!

Your backend should now be:
- ✅ Running on Render
- ✅ Connected to MongoDB
- ✅ Accessible from your frontend
- ✅ Secure with JWT authentication

Happy racing! 🏁

