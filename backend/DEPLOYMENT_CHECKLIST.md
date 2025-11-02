# 🚀 Deployment Checklist

## ✅ Pre-Deployment (Local Verification)

- [x] Code compiles successfully (`npm run build`)
- [x] Environment variable validation implemented
- [x] Security fixes applied (no fallback JWT_SECRET in production)
- [x] CORS configuration updated for production
- [x] Cookie settings fixed for cross-origin HTTPS

## 📋 Deployment Platform Setup

### Required Environment Variables

Before deploying, set these in your deployment platform:

1. **NODE_ENV** = `production`
2. **MONGODB_URI** = `your-mongodb-connection-string`
3. **JWT_SECRET** = `generate-strong-secret-min-32-chars` ⚠️ CRITICAL
4. **FRONTEND_URL** = `https://your-frontend-domain.com` (include https://)
5. **PORT** = `5000` (optional - platform usually sets automatically)

### Generate JWT_SECRET

Run this command to generate a secure secret:

```bash
# PowerShell (Windows)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or manually create a strong random string (minimum 32 characters)
```

## 🎯 Next Steps

1. **Go to your deployment platform** (Render, Railway, etc.)
2. **Set all environment variables** listed above
3. **Deploy your code** - it will automatically:
   - Run `npm install`
   - Run `npm run build`
   - Run `npm start`
4. **Check deployment logs** for:
   - ✅ `MongoDB connected successfully`
   - ✅ `Server running on port...`
   - ✅ No environment variable errors

## 🧪 Verify Deployment

1. **Health Check:**
   ```
   https://your-backend-url.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Logs:**
   - No errors about missing environment variables
   - Server started successfully
   - MongoDB connected

3. **Test API:**
   ```bash
   curl https://your-backend-url.com/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","username":"test","password":"test123"}'
   ```

## ⚠️ Common Deployment Issues

| Issue | Solution |
|-------|----------|
| "Missing required environment variables" | Set all variables in deployment platform |
| "JWT_SECRET must be set to a secure value" | Generate and set a new JWT_SECRET |
| "MongoDB connection failed" | Check connection string and IP whitelist |
| CORS errors | Verify FRONTEND_URL matches exactly (with https://) |

## 📝 Build Commands (Already Configured)

- **Build:** `cd backend && npm install && npm run build`
- **Start:** `cd backend && npm start`

The `render.yaml` file is already configured with these commands.

