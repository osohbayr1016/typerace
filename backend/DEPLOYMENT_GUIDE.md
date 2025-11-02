# Backend Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Make sure ALL of these are set in your deployment platform (Render, Railway, Heroku, etc.):

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typeracer?retryWrites=true&w=majority
JWT_SECRET=<generate-a-strong-random-secret-minimum-32-characters>
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000 (optional - platform usually sets this)
```

### 2. Generate a Secure JWT_SECRET
**IMPORTANT:** Use a strong, random secret key. You can generate one using:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Verify Frontend URL
- Must include the full URL with `https://`
- No trailing slash
- Example: `https://your-app.vercel.app` or `https://yourdomain.com`

### 4. MongoDB Connection
- Use MongoDB Atlas or your MongoDB connection string
- Ensure the database user has proper permissions
- Whitelist your deployment platform's IP addresses in MongoDB Atlas

## 🚀 Deployment Steps

### For Render.com

1. **Connect your repository** to Render
2. **Create a new Web Service**
3. **Configure the service:**
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** `Node`
   - **Node Version:** `18` or higher

4. **Set Environment Variables:**
   - Go to Environment tab
   - Add all required variables listed above
   - Save changes

5. **Deploy**
   - Render will automatically build and deploy
   - Check logs for any errors

### For Railway.app

1. **Create new project** from GitHub
2. **Add variables** in the Variables tab
3. **Set Root Directory** to `backend` (if deploying only backend)
4. **Build settings** are usually auto-detected
5. **Deploy**

### For Heroku

1. **Install Heroku CLI** and login
2. **Create app:** `heroku create your-app-name`
3. **Set buildpack:** `heroku buildpacks:set heroku/nodejs`
4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-connection-string
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://your-frontend.com
   ```
5. **Deploy:** `git push heroku main`

## 🔍 Verification

After deployment, verify the server is running:

1. **Health Check:**
   ```bash
   curl https://your-backend-url.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Logs:**
   - Look for: `✅ MongoDB connected successfully`
   - Look for: `🚀 Server running on port...`
   - Should NOT see any environment variable errors

3. **Test API Endpoints:**
   ```bash
   # Test signup
   curl -X POST https://your-backend-url.com/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","username":"testuser","password":"test123"}'
   ```

## ❌ Common Issues

### Issue: "Missing required environment variables"
**Solution:** Double-check all environment variables are set in your deployment platform.

### Issue: "JWT_SECRET must be set to a secure value"
**Solution:** Make sure JWT_SECRET is set and is NOT "fallback-secret-key". Generate a new secure secret.

### Issue: "MongoDB connection failed"
**Solution:** 
- Check MongoDB connection string
- Verify IP whitelist includes your deployment platform
- Check MongoDB user permissions

### Issue: CORS errors from frontend
**Solution:**
- Verify FRONTEND_URL is set correctly (must match exactly)
- Include protocol (https://)
- No trailing slash

### Issue: Cookies not working
**Solution:**
- Frontend must use HTTPS in production
- Backend must use HTTPS in production
- Verify FRONTEND_URL includes https://

## 📝 Build Process

The deployment build process:
1. `npm install` - Install dependencies
2. `npm run build` - Compile TypeScript to JavaScript
3. `npm start` - Run the compiled server from `dist/server.js`

## 🔐 Security Notes

- Never commit `.env` files
- Use different JWT_SECRET for production vs development
- Keep MongoDB connection strings private
- Enable HTTPS in production
- Regularly rotate secrets

## 📞 Troubleshooting

If deployment fails:
1. Check build logs for TypeScript errors
2. Check runtime logs for environment variable errors
3. Verify all dependencies are in `package.json` (not just devDependencies)
4. Ensure Node.js version matches `engines` field (>=18.0.0)

