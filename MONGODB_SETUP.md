# MongoDB Atlas Setup Guide for VitaTrackr

This guide will help you connect your VitaTrackr application to MongoDB Atlas (cloud database).

## Prerequisites
- MongoDB Atlas account (free tier available)
- Node.js and npm installed on your system
- Basic understanding of backend development

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Cluster

1. Log in to MongoDB Atlas
2. Click "Build a Database"
3. Choose "FREE" (M0 Sandbox) cluster
4. Select a cloud provider and region closest to you
5. Give your cluster a name (e.g., "VitaTrackr-Cluster")
6. Click "Create"

## Step 3: Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Set authentication method to "Password"
4. Enter username and password (SAVE THESE!)
5. User privileges: "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - ⚠️ For production, add only your server IP
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select driver: "Node.js" and version: "4.1 or later"
5. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

## Step 6: Setup Backend Server

Since your current app is client-side only (HTML/CSS/JS), you need to create a Node.js backend.

### Option A: Quick Setup with Express.js

Create a new file `server.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve your static files

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'your-connection-string-here';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    profile: Object,
    createdAt: { type: Date, default: Date.now }
});

const activitySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    duration: Number,
    calories: Number,
    date: Date,
    timestamp: { type: Date, default: Date.now }
});

const mealSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    name: String,
    date: Date,
    quantity: Number,
    quantityType: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    timestamp: { type: Date, default: Date.now }
});

const weightSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    weight: Number,
    date: Date,
    timestamp: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Meal = mongoose.model('Meal', mealSchema);
const Weight = mongoose.model('Weight', weightSchema);

// API Routes

// Get user activities
app.get('/api/activities/:userId', async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.params.userId });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add activity
app.post('/api/activities', async (req, res) => {
    try {
        const activity = new Activity(req.body);
        await activity.save();
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user meals
app.get('/api/meals/:userId', async (req, res) => {
    try {
        const meals = await Meal.find({ userId: req.params.userId });
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add meal
app.post('/api/meals', async (req, res) => {
    try {
        const meal = new Meal(req.body);
        await meal.save();
        res.json(meal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user weights
app.get('/api/weights/:userId', async (req, res) => {
    try {
        const weights = await Weight.find({ userId: req.params.userId });
        res.json(weights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add weight
app.post('/api/weights', async (req, res) => {
    try {
        const weight = new Weight(req.body);
        await weight.save();
        res.json(weight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User registration/login
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const user = new User({ username, password });
        await user.save();
        res.json({ userId: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({ userId: user._id, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Create `package.json`:

```json
{
  "name": "vita-trackr",
  "version": "1.0.0",
  "description": "Complete health tracking web application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["health", "tracking", "nutrition", "fitness"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Create `.env` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vitrackr?retryWrites=true&w=majority
PORT=3000
```

**⚠️ Replace `username`, `password`, and `cluster0.xxxxx` with your actual MongoDB credentials!**

## Step 7: Install Dependencies and Run

```bash
npm install
npm start
```

Your server will run on `http://localhost:3000`

## Step 8: Update Frontend to Use API

You'll need to modify your `scripts/main.js` to:
1. Replace `localStorage` calls with API fetch calls
2. Add `userId` to all data operations
3. Handle async operations properly

Example for activities:

```javascript
// Before (localStorage)
activities.push(activity);
localStorage.setItem('activities', JSON.stringify(activities));

// After (MongoDB via API)
try {
    const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...activity,
            userId: currentUserId
        })
    });
    const savedActivity = await response.json();
    activities.push(savedActivity);
} catch (error) {
    console.error('Error saving activity:', error);
}
```

## Security Considerations

1. **Never commit `.env` file** - Already added to `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Implement proper authentication** (JWT tokens)
4. **Hash passwords** using bcrypt
5. **Validate inputs** on both client and server
6. **Use HTTPS** in production

## Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Create backend server
3. ✅ Update frontend API calls
4. ⏭️ Add authentication
5. ⏭️ Deploy to hosting (Heroku, Vercel, etc.)

## Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [VitaTrackr GitHub Repository](https://github.com/yourusername/vita-trackr)

---

**Need Help?** Check out the [VitaTrackr README](README.md) for more information!

