# Backend Deployment Guide

This guide covers deploying the TypeRace backend to various platforms.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (recommended) or local MongoDB
- Git repository with the backend code

## Required Environment Variables

Before deploying, ensure you have these environment variables configured:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/typeracer?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
COOKIE_NAME=auth_token
CLIENT_ORIGIN=http://localhost:3000
```

## Build & Test Locally

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start

# Or run in development mode
npm run dev
```

## Deployment Platforms

### Render.com

1. **Create a new Web Service** on Render
2. Connect your GitHub repository
3. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. Add all required environment variables
5. Deploy!

Alternatively, use the `render.yaml` file:
- Upload this file to your repository root
- Render will auto-detect and use it

### Railway

1. **Create a new project** on Railway
2. Connect your GitHub repository
3. Add a new service from GitHub
4. Select the `backend` directory
5. Railway will auto-detect the Node.js project
6. Add environment variables in the service settings
7. Deploy!

The `railway.json` file is already configured for optimal settings.

### Heroku

1. Install Heroku CLI
2. Create a Heroku app: `heroku create your-app-name`
3. Add buildpacks:
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_connection_string
   heroku config:set JWT_SECRET=your_secret
   heroku config:set CLIENT_ORIGIN=your_frontend_url
   ```
5. Deploy: `git push heroku main`

Note: You'll need a `Procfile` for Heroku:
```
web: npm start
```

### DigitalOcean App Platform

1. Create a new App on DigitalOcean
2. Connect your GitHub repository
3. Set up your app:
   - **Type**: Web Service
   - **Source**: backend directory
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
4. Add environment variables
5. Deploy!

### Vercel

Note: Vercel is optimized for serverless functions. For a traditional Express server with Socket.IO, consider:
- Using Vercel's Edge Functions
- Or using a different platform (Render/Railway recommended)

If deploying to Vercel:
1. Create `vercel.json` in the backend directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.ts"
    }
  ]
}
```

## Common Issues & Solutions

### Build Fails

**Problem**: TypeScript compilation errors

**Solution**: 
- Ensure all TypeScript dependencies are installed
- Check that `tsconfig.json` is properly configured
- Run `npm run build` locally to test

### Server Won't Start

**Problem**: Module not found errors

**Solution**:
- Ensure `dist/` directory is generated
- Check that dependencies are listed in `dependencies` (not `devDependencies`)
- Verify `tsconfig.json` settings

### Port Already in Use

**Problem**: `EADDRINUSE` error

**Solution**:
- Let the platform assign the PORT dynamically
- Remove hardcoded PORT in your code
- Server already uses `process.env.PORT || 5000`

### MongoDB Connection Fails

**Problem**: Can't connect to database

**Solution**:
- Verify MongoDB Atlas IP whitelist includes all IPs (0.0.0.0/0)
- Check connection string is correct
- Ensure MONGODB_URI environment variable is set

### Socket.IO CORS Issues

**Problem**: Socket.IO connections blocked

**Solution**:
- Set CLIENT_ORIGIN to your frontend URL
- Update CORS settings in production
- Verify credentials are properly configured

## Health Checks

All platforms should use `/` as the health check path. The server responds with a successful HTTP status when running.

## Monitoring

Recommended monitoring:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, DataDog)

## Database Migration

After deployment, run database migrations:

```bash
# SSH into your server or use a one-off command
npx ts-node migrate.ts
```

**Note**: Only run migration once or when schema changes!

## SSL/HTTPS

Most platforms (Render, Railway, Heroku) provide SSL certificates automatically. Ensure your environment uses HTTPS in production.

## Scaling

For scaling considerations:
- Use MongoDB Atlas for database scaling
- Consider Redis for session storage if needed
- Implement rate limiting for API endpoints
- Use a load balancer if deploying multiple instances

## Support

For deployment issues, check:
- Platform documentation
- Server logs (most platforms provide log viewers)
- GitHub Issues for known problems

