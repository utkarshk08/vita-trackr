# 🚀 VitaTrackr Quick Start Guide

## ✅ Project Setup Complete!

Your VitaTrackr backend is fully configured and connected to MongoDB Atlas!

## 📁 Current Project Structure

```
vitaTrackr/
├── config/
│   └── database.js           # MongoDB connection ✅
├── controllers/              # Business logic ✅
│   ├── userController.js
│   ├── activityController.js
│   ├── mealController.js
│   ├── weightController.js
│   └── recipeController.js
├── models/                   # Database schemas ✅
│   ├── userModel.js
│   ├── activityModel.js
│   ├── mealModel.js
│   ├── weightModel.js
│   └── recipeModel.js
├── routes/                   # API endpoints ✅
│   ├── userRoutes.js
│   ├── activityRoutes.js
│   ├── mealRoutes.js
│   ├── weightRoutes.js
│   └── recipeRoutes.js
├── public/                   # Frontend files ✅
│   ├── index.html
│   ├── styles/
│   └── scripts/
├── server.js                 # Main server ✅
├── package.json              # Dependencies ✅
└── .env                      # Environment variables ✅
```

## 🎯 Start Your Server

### 1. Start the Backend Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### 2. Access Your Application

- **Web App**: http://localhost:5000
- **API**: http://localhost:5000/api

### 3. Test MongoDB Connection

✅ Your MongoDB Atlas is already connected!

Connection String:
```
mongodb+srv://utkarshk0804:***@vitatrackr.vakekfy.mongodb.net/vitaTrackr
```

## 📡 Available API Endpoints

### Users
```
POST   /api/users/register           # Register new user
POST   /api/users/login              # User login
GET    /api/users/:userId            # Get user profile
PUT    /api/users/:userId            # Update profile
GET    /api/users/:userId/dashboard  # Get dashboard stats
```

### Activities
```
GET    /api/activities/:userId       # Get all activities
GET    /api/activities/:userId/range # Get by date range
POST   /api/activities               # Create activity
PUT    /api/activities/:id           # Update activity
DELETE /api/activities/:id           # Delete activity
```

### Meals
```
GET    /api/meals/:userId            # Get all meals
GET    /api/meals/:userId/range      # Get by date range
GET    /api/meals/:userId/type/:type # Get by meal type
POST   /api/meals                    # Create meal
PUT    /api/meals/:id                # Update meal
DELETE /api/meals/:id                # Delete meal
```

### Weights
```
GET    /api/weights/:userId          # Get all weights
GET    /api/weights/:userId/range    # Get by date range
GET    /api/weights/:userId/latest   # Get latest weight
POST   /api/weights                  # Create weight entry
PUT    /api/weights/:id              # Update weight
DELETE /api/weights/:id              # Delete weight
```

### Recipes
```
GET    /api/recipes                  # Get all recipes
GET    /api/recipes/search           # Search recipes
GET    /api/recipes/:id              # Get recipe by ID
POST   /api/recipes                  # Create recipe
PUT    /api/recipes/:id              # Update recipe
DELETE /api/recipes/:id              # Delete recipe
```

## 🧪 Test Your API

### Using cURL

```bash
# Test server
curl http://localhost:5000

# Register a user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get all recipes
curl http://localhost:5000/api/recipes
```

### Using Postman or Thunder Client

1. Create a new collection "VitaTrackr API"
2. Import the endpoints above
3. Test each endpoint

## 📊 Database Collections

Your MongoDB Atlas database has these collections:

1. **users** - User profiles and authentication
2. **activities** - Physical activity logs
3. **meals** - Meal and nutrition logs
4. **weights** - Weight tracking entries
5. **recipes** - Recipe database

## 🔄 Next Steps

### 1. Frontend Integration

Your frontend is in `public/` directory. You need to update `public/scripts/main.js` to:

```javascript
// Replace localStorage with API calls

// Before
localStorage.setItem('activities', JSON.stringify(activities));

// After
const response = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        ...activity,
        userId: currentUserId
    })
});
const savedActivity = await response.json();
```

### 2. Authentication Enhancement

Currently using plain text passwords. Implement:

1. **Password Hashing** with bcryptjs
2. **JWT Tokens** for authentication
3. **Middleware** to protect routes

See `MONGODB_SETUP.md` for implementation details.

### 3. Seed Initial Data

Create a seed script to populate recipes:

```bash
# Create scripts/seedRecipes.js
# Run: node scripts/seedRecipes.js
```

### 4. Deploy to Production

1. Push to GitHub (see `GIT_SETUP.md`)
2. Deploy backend (Heroku, Railway, etc.)
3. Configure environment variables
4. Enable MongoDB Atlas production settings

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
lsof -ti:5000

# Kill the process
lsof -ti:5000 | xargs kill -9
```

### MongoDB connection error
- Check your `.env` file
- Verify MongoDB Atlas network access
- Ensure database user has correct permissions

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **Complete Setup**: `MONGODB_SETUP.md`
- **Git Setup**: `GIT_SETUP.md`
- **Project Structure**: `PROJECT_STRUCTURE.md`
- **Main README**: `README.md`

## 🎉 You're All Set!

Your VitaTrackr backend is ready to use! Start the server and begin developing your health tracking application.

For questions or issues, refer to the documentation files or check MongoDB Atlas dashboard.

---

**Happy Coding! 💪**

