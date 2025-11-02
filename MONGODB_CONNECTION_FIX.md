# 🔧 MongoDB Connection Fix

## Your MongoDB Connection String

```
mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/e-sport-connection?retryWrites=true&w=majority
```

**Current database:** `e-sport-connection`  
**Need to use:** `typeracer`

---

## ✅ Fix: Update Connection String

Change the database name in the connection string from `e-sport-connection` to `typeracer`:

### Updated Connection String:

```
mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority
```

---

## 📝 How to Update in Render

### Step 1: Open Render Dashboard
1. Go to https://dashboard.render.com
2. Login
3. Click your backend service: **typerace-9p8k**

### Step 2: Update MONGODB_URI
1. Go to **"Environment"** tab
2. Find **MONGODB_URI** variable
3. Click to edit
4. Update the connection string to:

```
mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority
```

**Key Change:** Changed `e-sport-connection` → `typeracer`

5. Click **"Save Changes"**

### Step 3: Redeploy
- Render will automatically redeploy
- Wait for deployment to complete
- Check logs

### Step 4: Verify

After redeploy, logs should show:
```
✅ MongoDB connected successfully
   Database: typeracer
```

---

## 🧪 Test

After updating, test your connection:

1. Go to your frontend
2. Try to signup or login
3. Should work now!

---

## 📊 Complete Environment Variables for Render

Make sure all of these are set:

```bash
NODE_ENV=production

MONGODB_URI=mongodb+srv://osohbayar:5Fcy02ZLLpG7GYRO@mentormeet.xfipt6t.mongodb.net/typeracer?retryWrites=true&w=majority

JWT_SECRET=<your-generated-secret>

FRONTEND_URL=https://typerace-gamma.vercel.app
```

---

## ✅ Success!

When the connection string is updated with the correct database name, your app will connect to the `typeracer` collection and work correctly!

**That's it!** 🚀

