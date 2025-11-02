# 🔧 CORS Fix Guide

## 🐛 If You're Getting CORS Errors

You're seeing errors like:
```
Access to fetch at 'https://typerace-9p8k.onrender.com/api/auth/login' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

---

## ✅ Solution: Fix Environment Variables in Render

The issue is that your **frontend URL is not properly set** in your Render backend environment variables.

### Step-by-Step Fix:

#### 1. Get Your Frontend URL

Your frontend is deployed on Vercel. Get the URL:
- Go to your Vercel dashboard
- Click on your project
- Copy the deployment URL
- It will look like: `https://your-app.vercel.app` or `https://type-race-xxxxx.vercel.app`

#### 2. Update Render Environment Variable

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (e.g., `typerace-9p8k`)
3. Go to **"Environment"** tab in the left sidebar
4. Find the `FRONTEND_URL` variable
5. Click on it to edit
6. Update the value to your Vercel frontend URL:
   ```
   https://your-app.vercel.app
   ```
   
   **Important:**
   - Must include `https://`
   - No trailing slash `/` at the end
   - Exact match with your Vercel URL
   
7. Click **"Save Changes"**

#### 3. Render Will Redeploy

- Render will automatically redeploy your backend
- Wait for deployment to complete (1-2 minutes)
- Check logs to verify it worked

#### 4. Check Logs

In Render logs, you should now see:
```
🔍 Environment check:
   FRONTEND_URL: https://your-app.vercel.app

🌐 CORS allowed origins: [ 'https://your-app.vercel.app' ]
```

---

## 🔍 Verify It's Working

### Test the Fix:

1. **Open your frontend** on Vercel
2. **Open browser DevTools** (F12)
3. **Go to Console** tab
4. **Try to login or signup**
5. **You should see:** No CORS errors!

### Check Backend Logs:

When you make a request from your frontend, you should see in Render logs:
```
🔍 CORS request from origin: https://your-app.vercel.app
✅ Origin allowed: https://your-app.vercel.app
```

If you see this, CORS is working! ✅

---

## ❌ Common Mistakes

### Mistake 1: Missing `https://`
```
❌ Wrong: your-app.vercel.app
✅ Correct: https://your-app.vercel.app
```

### Mistake 2: Trailing Slash
```
❌ Wrong: https://your-app.vercel.app/
✅ Correct: https://your-app.vercel.app
```

### Mistake 3: Wrong URL
```
❌ Wrong: https://typerace-9p8k.onrender.com (this is your backend!)
✅ Correct: https://your-app.vercel.app (this is your frontend!)
```

### Mistake 4: Environment Variable Not Saved
- Make sure you **saved** the environment variable
- Make sure you **redeployed** after saving

---

## 🧪 Manual Test

You can test your CORS configuration with curl:

```bash
# Test with your frontend URL as origin
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://typerace-9p8k.onrender.com/api/auth/login \
     -v
```

You should see in the response:
```
Access-Control-Allow-Origin: https://your-app.vercel.app
```

---

## 📋 Complete Checklist

To fix CORS issues:

- [ ] Identified your Vercel frontend URL
- [ ] Went to Render dashboard
- [ ] Opened Environment tab
- [ ] Updated `FRONTEND_URL` with correct value
- [ ] Value includes `https://`
- [ ] No trailing slash
- [ ] Saved the changes
- [ ] Render redeployed successfully
- [ ] Logs show correct CORS origins
- [ ] Tested login from frontend
- [ ] No CORS errors in browser console

---

## 🔧 Debugging

If it's still not working after the fix:

### Step 1: Check Logs

In Render logs, look for:
```
🌐 CORS allowed origins: [...]
```

What origins are listed? If it's empty `[]`, then `FRONTEND_URL` is not set correctly.

### Step 2: Check Request Origin

In Render logs, look for:
```
🔍 CORS request from origin: https://...
```

What origin is being sent? Copy this exact value.

### Step 3: Compare

Compare:
- **Request origin** (from logs)
- **Allowed origins** (from logs)
- **FRONTEND_URL** (in environment variables)

They must match **exactly** (including protocol, no trailing slash, etc.)

### Step 4: Fix Mismatch

If they don't match, update `FRONTEND_URL` to match the exact request origin and redeploy.

---

## 🎯 Your Specific URLs

Based on your error messages:

- **Backend:** `https://typerace-9p8k.onrender.com`
- **Frontend:** You need to provide this from Vercel

Once you have your Vercel URL, set it as `FRONTEND_URL` in Render!

---

## ✅ Success!

When CORS is fixed, you should be able to:
- ✅ Login from frontend
- ✅ Signup from frontend
- ✅ Make API calls from frontend
- ✅ See no errors in browser console
- ✅ Everything works! 🎉

---

## 🆘 Still Having Issues?

If you're still getting CORS errors after following this guide:

1. **Double-check** your `FRONTEND_URL` in Render
2. **Verify** you saved and redeployed
3. **Check** Render logs for CORS messages
4. **Compare** the origin in logs with your `FRONTEND_URL`
5. **Make sure** they match exactly

If still stuck, share your Render logs showing:
- The CORS allowed origins
- The incoming request origin

Good luck! 🚀

