# 🚀 VitaTrackr Deployment Guide

Complete step-by-step guide to deploy your VitaTrackr application to production.

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
5. [Testing Production](#testing-production)

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:
- [x] MongoDB Atlas is set up and working
- [x] Your code is pushed to GitHub
- [x] You have a GitHub account
- [x] `.env` file has your MongoDB connection string

**Your MongoDB URI:**
```
mongodb+srv://utkarshk0804:utkarshK%4008@vitatrackr.vakekfy.mongodb.net/vitaTrackr?retryWrites=true&w=majority
```

---

## 🔧 Backend Deployment (Render)

**Why Render?** Free tier, easy setup, automatic SSL, perfect for Node.js APIs.

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Sign Up" → Use your GitHub account
3. Verify your email

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository `vita-trackr`
3. Select the `vita-trackr` repository

### Step 3: Configure Web Service
Fill in these details:

**Basic Settings:**
- **Name:** `vita-trackr-backend` (or any name you like)
- **Region:** Choose closest to you (e.g., Singapore, Oregon)
- **Branch:** `main`
- **Root Directory:** Leave empty (or `./` if required)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
Click "Advanced" → Add these environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://utkarshk0804:utkarshK%4008@vitatrackr.vakekfy.mongodb.net/vitaTrackr?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

**⚠️ IMPORTANT:** Render uses port 10000 by default!

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Watch the build logs - you should see:
   ```
   ✅ MongoDB Connected: xxxxxx.mongodb.net
   Server running on port 10000
   ```

### Step 5: Get Your Backend URL
Once deployed, you'll get a URL like:
```
https://vita-trackr-backend-xxxxx.onrender.com
```

**Save this URL!** You'll need it for the frontend.

---

## 🎨 Frontend Deployment (Vercel)

**Why Vercel?** Best for static sites, automatic SSL, instant deployments.

### Option 1: Deploy Both Frontend + Backend (Simpler)

Since your project serves both API and frontend from the same server, you can deploy the entire project to Render:

1. **Create another Web Service** on Render
2. **Use the same GitHub repo** `vita-trackr`
3. **Settings:**
   - Name: `vita-trackr-full`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `MONGODB_URI`: Your MongoDB URI
     - `NODE_ENV`: `production`
     - `PORT`: `10000`

4. **Done!** Your full app will be live at: `https://vita-trackr-full-xxxxx.onrender.com`

### Option 2: Separate Frontend + Backend (Advanced)

If you want Vercel for frontend + Render for backend:

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import project `vita-trackr`
4. Configure:
   - Framework Preset: **Other**
   - Root Directory: `public`
   - Build Command: (leave empty)
   - Output Directory: `public`

**⚠️ Note:** With separate deployments, you'll need to update `api.js` to point to your Render backend URL.

---

## 🔗 Connecting Frontend to Backend

If you used **Option 1** (full deployment on Render), you're done! Everything works automatically.

If you used **Option 2** (separate deployments), you need to update the API base URL.

### Update Frontend API Configuration

Edit `public/scripts/api.js`:

**Before:**
```javascript
const API_BASE_URL = '/api';
```

**After (for separate deployments):**
```javascript
const API_BASE_URL = 'https://vita-trackr-backend-xxxxx.onrender.com/api';
```

Then commit and push to GitHub. Vercel will auto-deploy the changes.

---

## 🧪 Testing Production

### 1. Test Backend API
Open in browser:
```
https://your-backend-url.onrender.com/api/users/test
```

You should see:
```json
{"message": "User routes working"}
```

### 2. Test Full Application
1. Visit your deployed URL
2. Try to register a new account
3. Create your profile
4. Log some activities and meals
5. Check if data saves to MongoDB Atlas

### 3. Check MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Navigate to your cluster → Collections
3. You should see data in `users`, `activities`, `meals`, `weights`

---

## 🔒 Security Checklist

Before going live, ensure:
- [x] MongoDB Atlas has IP whitelist set to `0.0.0.0/0` (allow all IPs)
- [ ] Consider adding rate limiting to prevent abuse
- [ ] Add password hashing (currently plain text - TODO)
- [ ] Consider adding JWT authentication
- [ ] Add CORS configuration for your specific domain

### Update MongoDB IP Whitelist
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" → Add

---

## 📊 Monitoring

### Render Dashboard
- View logs: Click your service → "Logs"
- Check metrics: CPU, Memory, Response Time
- Auto-redeploy: On every Git push

### Vercel Dashboard
- View deployments: See all deployments
- Check analytics: Page views, performance
- Custom domains: Add your own domain

---

## 🆘 Troubleshooting

### "Cannot GET /" on Render
- ✅ Add wildcard route: `app.get('*', ...)` in server.js
- ✅ Make sure `public` folder is served correctly

### "MongoDB connection timeout"
- ✅ Check MongoDB Atlas network settings (allow all IPs)
- ✅ Verify `MONGODB_URI` is correct in environment variables

### "CORS error" in browser console
- ✅ Ensure `cors()` middleware is enabled in `server.js`
- ✅ For separate deployments, configure CORS origins

### Backend takes 30+ seconds to respond
- ⚠️ Render free tier "spins down" after 15 minutes of inactivity
- First request will be slow (~30s), subsequent requests are fast
- **Solution:** Upgrade to paid tier ($7/mo) or use a "pinging service"

### Charts not loading
- ✅ Check Chart.js CDN link is correct in `index.html`
- ✅ Ensure Chart.js v4.4.0 is loaded
- ✅ Check browser console for errors

---

## 🎉 Success!

Once deployed, share your app with:
- Friends and family
- LinkedIn / Twitter
- Portfolio website

**Example Deployment URLs:**
- Full App: `https://vita-trackr-full.onrender.com`
- Backend API: `https://vita-trackr-backend.onrender.com`
- MongoDB: `https://cloud.mongodb.com`

---

## 📝 Next Steps

### Free Enhancements:
1. Add custom domain (free on Vercel)
2. Set up monitoring with UptimeRobot (free)
3. Add Google Analytics
4. Implement password hashing with bcrypt
5. Add JWT authentication

### Paid Enhancements:
1. Upgrade Render ($7/mo) for no spin-down
2. Add Redis caching
3. Set up CI/CD with GitHub Actions
4. Add automated testing
5. Implement email verification

---

## 🆘 Need Help?

If you get stuck:
1. Check Render logs: Your service → Logs
2. Check browser console: F12 → Console
3. Check MongoDB Atlas: Network Access & Database Access
4. Google the specific error message

**Common fixes:**
- Clear browser cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check environment variables are set correctly
- Verify MongoDB connection string

---

## ✅ Deployment Checklist

- [ ] Render account created
- [ ] Backend deployed successfully
- [ ] MongoDB connected
- [ ] Environment variables set
- [ ] Tested registration/login
- [ ] Tested activity logging
- [ ] Tested meal logging
- [ ] Charts loading correctly
- [ ] Dish suggestions working
- [ ] Shared with friends! 🎉

---

**Good luck with your deployment! 🚀**

