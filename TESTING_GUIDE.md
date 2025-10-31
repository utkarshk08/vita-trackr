# 🧪 VitaTrackr Testing Guide

## ✅ Server is Running!

Your app should now be open in your browser at: **http://localhost:5000**

---

## 🎯 Quick Test Flow

### Step 1: Create an Account
1. You should see the **Login Screen** with VitaTrackr branding
2. Click **"Sign Up"** at the bottom
3. Fill in:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
   - **Password**: `password123`
   - **Confirm Password**: `password123`
4. Click **"Sign Up"** button

### Step 2: Create Your Profile
After signup, you'll be redirected to **Profile Setup**

Fill in the **Required Fields**:
- **Name**: Your name
- **Age**: 25
- **Gender**: Select one
- **Weight**: 70 (kg)
- **Height**: 175 (cm)
- **Dietary Preference**: Select one
- **Occupation**: Select activity level
- **Goal Type**: Select your goal

Optional fields:
- Add diseases, allergies, etc.
- Set family history
- Add stress level

Click **"Save Profile"**

### Step 3: Explore the App
You'll be redirected to the **Home Page** with feature cards:
- 🍳 **Recipe Generator**
- 🍽️ **Dish Suggestions**
- 🏃 **Activity Tracker**
- 🍎 **Meal Log**
- 📊 **Overview**
- 🏆 **Progress**
- 👤 **Profile**

### Step 4: Test Features

#### 🏃 **Activity Tracker**
1. Click "Activity Tracker"
2. Select activity type: Running
3. Enter duration: 30 minutes
4. Calories should auto-calculate
5. Click "Log Activity"
6. See it appear in your list

#### 🍎 **Meal Logging**
1. Click "Meal Log"
2. Select meal type: Breakfast
3. Enter dish name: e.g., "Oatmeal"
4. Set quantity
5. Click "Log Meal"
6. See it in your meal history

#### 📊 **Overview Dashboard**
1. Click "Overview"
2. See your statistics:
   - Total calories burned
   - Meals logged
   - Health score
3. View recent activities and meals

#### 🏆 **Progress & Achievements**
1. Click "Progress"
2. See your achievements
3. View activity streaks
4. Check charts and graphs

---

## 🔍 Verify Backend Connection

### Check MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Log in to your account
3. Select your cluster
4. Click "Browse Collections"
5. You should see:
   - `users` collection with your user
   - `activities` collection with logged activities
   - `meals` collection with logged meals
   - `weights` collection (empty until you log weight)

### Check Server Logs
In your terminal where the server is running, you should see:
```
✅ MongoDB Connected: ...
🚀 VitaTrackr server running on port 5000
📊 API: http://localhost:5000/api
🌐 Web: http://localhost:5000
```

When you interact with the app, you'll see API logs:
```
GET /api/users/...
POST /api/activities
```

---

## 🐛 Troubleshooting

### Problem: "Error loading data"
**Solution**: 
- Refresh the page
- Check server is running
- Check MongoDB connection

### Problem: "Login failed"
**Solution**:
- Ensure user exists in database
- Check username/password spelling
- Try registering again

### Problem: Page not loading
**Solution**:
```bash
# Stop server
Ctrl+C

# Restart server
npm start

# Open browser again
open http://localhost:5000
```

### Problem: MongoDB connection error
**Solution**:
- Check your `.env` file exists
- Verify connection string is correct
- Check MongoDB Atlas network access settings

---

## 📊 Expected Results

### ✅ Working Features
- ✅ User registration creates account in MongoDB
- ✅ Login authenticates successfully
- ✅ Profile creates document in users collection
- ✅ Activities saved to activities collection
- ✅ Meals saved to meals collection
- ✅ Data persists after page refresh
- ✅ Overview shows correct statistics
- ✅ Progress charts display data

### ⏭️ Features to Complete
- ⏭️ Recipe search from MongoDB
- ⏭️ Advanced dish suggestions
- ⏭️ Weight tracking sync
- ⏭️ Profile picture upload
- ⏭️ Export data functionality

---

## 🎉 What You Should See

### Login Screen
- Beautiful glassmorphism design
- VitaTrackr logo and branding
- Login and Sign Up forms
- Toggle between forms

### Home Page
- Welcome message
- 7 feature cards
- Dark/Light mode toggle
- "Pro" subscription badge
- Navigation bar

### Features Working
- Profile setup and update
- Activity logging with auto-calculated calories
- Meal logging with nutrition data
- Overview statistics
- Progress charts and achievements
- Theme switching

---

## 🚀 Next: Push to GitHub

Once you've tested everything:

```bash
# Check your changes
git status

# Add remote (if not done)
git remote add origin https://github.com/YOUR_USERNAME/vita-trackr.git

# Push to GitHub
git push -u origin main
```

---

## 📞 Need Help?

- Check `INTEGRATION_STATUS.md` for current status
- See `QUICKSTART.md` for setup instructions
- Review `PROJECT_STRUCTURE.md` for architecture
- Check server logs in terminal for errors

---

**Enjoy testing your VitaTrackr app! 🎉**

