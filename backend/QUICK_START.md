# Quick Start - Deploy in 5 Minutes

## TL;DR

Your backend deployment is now fixed and ready to deploy! Just follow the steps below.

## What Was Fixed

✅ TypeScript configuration updated  
✅ Build process optimized  
✅ Deployment configs created for Render, Railway, Heroku  
✅ Migration files excluded from production build  
✅ Node.js engine requirements specified

## Deploy Now

### Option 1: Render.com (Easiest)

1. **Go to**: https://render.com
2. **Sign up / Log in**
3. **Click**: "New Web Service"
4. **Connect**: Your GitHub repository
5. **Configure**:
   - Name: `typeracer-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Add Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_here
   CLIENT_ORIGIN=https://your-frontend.com
   ```
7. **Click**: "Create Web Service"
8. **Wait**: ~5 minutes for deployment
9. **Done**: Your backend is live!

### Option 2: Railway

1. **Go to**: https://railway.app
2. **Sign up / Log in**
3. **Click**: "New Project" > "Deploy from GitHub"
4. **Select**: Your repository
5. **Railway will**: Auto-detect backend directory
6. **Add Environment Variables**:
   - MongoDB URI
   - JWT Secret
   - Client Origin
7. **Deploy**: Automatic!
8. **Done**: Your backend is live!

### Option 3: Heroku

```bash
# Install Heroku CLI first
heroku login
heroku create typeracer-backend
cd backend
heroku git:remote -a typeracer-backend
heroku config:set MONGODB_URI=your_uri JWT_SECRET=your_secret CLIENT_ORIGIN=your_url
git push heroku main
```

## Test Locally First

Before deploying, test that everything works:

```bash
cd backend
npm install
npm run build
npm start
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

If you see errors, check:
1. MongoDB is accessible
2. .env file exists with correct values
3. Node version is 18+

## Get Your MongoDB URI

1. Go to https://mongodb.com/atlas
2. Create a cluster (free tier works)
3. Get connection string
4. Replace `<password>` with your actual password
5. Add to environment variables

## Generate JWT Secret

```bash
# Use a random string generator or:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use a long random string as your JWT_SECRET.

## Frontend Configuration

Update your frontend to point to your deployed backend:

```javascript
// In your frontend api.ts or config
const API_URL = 'https://your-backend.onrender.com'
const SOCKET_URL = 'https://your-backend.onrender.com'
```

## Common Issues

### Build Fails
- Make sure you're in the `backend` directory
- Check Node version: `node --version` (should be 18+)

### Server Won't Start
- Check logs in your deployment dashboard
- Verify environment variables are set correctly
- Make sure MongoDB URI is accessible

### MongoDB Connection Error
- Whitelist all IPs in MongoDB Atlas (0.0.0.0/0)
- Verify connection string format
- Check username/password are correct

## Next Steps

1. ✅ Deploy backend (you are here)
2. ⬜ Deploy frontend
3. ⬜ Update environment variables
4. ⬜ Test full application
5. ⬜ Configure custom domain (optional)

## Need Help?

- Read: `DEPLOYMENT.md` for detailed docs
- Check: `DEPLOYMENT_CHECKLIST.md` for common issues
- Review: Deployment platform logs

## Success!

Once deployed, you should have:
- ✅ Backend API running
- ✅ Socket.IO server running
- ✅ MongoDB connected
- ✅ All routes responding
- ✅ Ready for production use

---

**Questions?** Check the full `DEPLOYMENT.md` file for comprehensive guidance.

