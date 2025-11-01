# Deployment Checklist

## Pre-Deployment

- [x] TypeScript compiles without errors
- [x] Build creates `dist/server.js` only (no migration files)
- [x] Package.json has correct scripts
- [x] Engine specifications added
- [x] Deployment configuration files created

## Platform Setup

### Environment Variables
- [ ] MONGODB_URI configured
- [ ] JWT_SECRET configured (strong random string)
- [ ] CLIENT_ORIGIN configured (frontend URL)
- [ ] PORT configured (or left to platform default)
- [ ] COOKIE_NAME configured (optional, defaults to auth_token)

### Render.com
- [ ] Connected GitHub repository
- [ ] Root directory set to `backend`
- [ ] render.yaml uploaded
- [ ] All environment variables added
- [ ] Deployed successfully

### Railway
- [ ] Connected GitHub repository
- [ ] Service created from `backend` directory
- [ ] railway.json detected
- [ ] All environment variables added
- [ ] Deployed successfully

### Heroku
- [ ] Heroku CLI installed
- [ ] App created
- [ ] Buildpacks configured
- [ ] Procfile detected
- [ ] Environment variables set via CLI
- [ ] Deployed successfully

## Post-Deployment Verification

- [ ] Server starts without errors
- [ ] Health check endpoint responds (GET /)
- [ ] MongoDB connection successful
- [ ] Socket.IO server running
- [ ] Logs show "Connected to MongoDB"
- [ ] Logs show "Server running on port X"

## Testing

- [ ] Frontend can connect to backend
- [ ] Authentication works (signup/login)
- [ ] Socket.IO connections work
- [ ] Multiplayer races function correctly
- [ ] Database operations work
- [ ] CORS configured correctly

## Security

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials secure
- [ ] CORS only allows your frontend domain
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Environment variables not in code

## Monitoring

- [ ] Logs accessible
- [ ] Error tracking set up (optional)
- [ ] Uptime monitoring configured (optional)
- [ ] Performance monitoring set up (optional)

## Rollback Plan

- [ ] Know how to rollback on your platform
- [ ] Previous deployment kept as backup
- [ ] Database migrations tested separately

## Issues to Watch For

### Common Problems

1. **Build Fails**
   - Check Node version (should be >=18)
   - Verify TypeScript dependencies installed
   - Check tsconfig.json syntax

2. **Server Won't Start**
   - Verify dist/server.js exists
   - Check PORT is available
   - Review server logs for errors

3. **MongoDB Connection Fails**
   - Verify MONGODB_URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Ensure connection string format is correct

4. **Socket.IO Issues**
   - Check CLIENT_ORIGIN matches frontend URL
   - Verify CORS settings
   - Check credentials are enabled

5. **Module Not Found Errors**
   - Ensure all dependencies in dependencies (not devDependencies)
   - Verify node_modules installed correctly
   - Check package-lock.json is committed

### Getting Help

1. Check deployment platform logs first
2. Review DEPLOYMENT.md for platform-specific issues
3. Test locally to replicate the problem
4. Check GitHub issues or community forums
5. Contact platform support if needed

