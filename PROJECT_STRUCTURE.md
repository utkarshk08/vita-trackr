# VitaTrackr Project Structure

## 📁 Complete Project Structure

```
vitaTrackr/
├── config/
│   └── database.js              # MongoDB connection configuration
│
├── controllers/
│   ├── userController.js        # User authentication & profile logic
│   ├── activityController.js    # Activity CRUD operations
│   ├── mealController.js        # Meal CRUD operations
│   ├── weightController.js      # Weight tracking operations
│   └── recipeController.js      # Recipe management operations
│
├── models/
│   ├── userModel.js             # User schema (comprehensive profile)
│   ├── activityModel.js         # Activity schema
│   ├── mealModel.js             # Meal/Nutrition schema
│   ├── weightModel.js           # Weight tracking schema
│   └── recipeModel.js           # Recipe database schema
│
├── routes/
│   ├── userRoutes.js            # User API endpoints
│   ├── activityRoutes.js        # Activity API endpoints
│   ├── mealRoutes.js            # Meal API endpoints
│   ├── weightRoutes.js          # Weight API endpoints
│   └── recipeRoutes.js          # Recipe API endpoints
│
├── middleware/                  # Custom middleware (auth, error handling)
│
├── public/                      # Frontend static files
│   ├── index.html               # Main HTML file (SPA)
│   ├── styles/
│   │   └── main.css             # All CSS styles
│   └── scripts/
│       ├── main.js              # Frontend JavaScript logic
│       ├── database.js          # IndexedDB & database operations
│       └── smartRecommendations.js  # AI recommendation engine
│
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment variables template
├── server.js                    # Main Express server file
├── package.json                 # NPM dependencies
├── package-lock.json            # NPM lock file
├── README.md                    # Main documentation
├── GIT_SETUP.md                 # GitHub setup guide
├── MONGODB_SETUP.md             # MongoDB Atlas setup guide
└── PROJECT_STRUCTURE.md         # This file

```

## 🏗️ Architecture Overview

### Backend (Node.js + Express + MongoDB)

**MVC Pattern:**
- **Models**: Mongoose schemas define data structure
- **Controllers**: Business logic and data processing
- **Routes**: API endpoint definitions

**Key Components:**

1. **User Management** (`controllers/userController.js`, `models/userModel.js`)
   - Registration and authentication
   - Profile creation and updates
   - Dashboard statistics

2. **Activity Tracking** (`controllers/activityController.js`, `models/activityModel.js`)
   - Log physical activities
   - Calculate calories burned
   - Track progress over time

3. **Meal Logging** (`controllers/mealController.js`, `models/mealModel.js`)
   - Log meals with nutrition data
   - Track macros and calories
   - Meal history and analytics

4. **Weight Tracking** (`controllers/weightController.js`, `models/weightModel.js`)
   - Record weight entries
   - Track body composition changes
   - Generate progress charts

5. **Recipe Management** (`controllers/recipeController.js`, `models/recipeModel.js`)
   - Recipe database with tags and cuisine
   - Search and filter functionality
   - Nutrition information per recipe

### Frontend (HTML + CSS + JavaScript)

**Single-Page Application (SPA):**
- All pages in `index.html` with show/hide logic
- JavaScript handles all interactions
- LocalStorage/IndexedDB for offline support
- Fetches data from backend API when online

**Key Files:**

1. **index.html**: Main HTML structure
   - Login/Signup forms
   - Navigation bar
   - All page sections
   - Modals for details

2. **styles/main.css**: Complete styling
   - Glassmorphism design
   - Dark/Light mode themes
   - Responsive layout
   - Animations and transitions

3. **scripts/main.js**: Core JavaScript logic
   - Page navigation
   - Form submissions
   - Data manipulation
   - API integration

4. **scripts/database.js**: Database operations
   - IndexedDB setup
   - Recipe database
   - Local data caching

5. **scripts/smartRecommendations.js**: AI engine
   - Personalized dish suggestions
   - Health-based filtering
   - Tag matching algorithm

## 🔗 API Endpoints

### Users
```
POST   /api/users/register              # Register new user
POST   /api/users/login                 # User login
GET    /api/users/:userId               # Get user profile
PUT    /api/users/:userId               # Update profile
GET    /api/users/:userId/dashboard     # Get dashboard stats
```

### Activities
```
GET    /api/activities/:userId          # Get all activities
GET    /api/activities/:userId/range    # Get by date range
POST   /api/activities                  # Create activity
PUT    /api/activities/:id              # Update activity
DELETE /api/activities/:id              # Delete activity
```

### Meals
```
GET    /api/meals/:userId               # Get all meals
GET    /api/meals/:userId/range         # Get by date range
GET    /api/meals/:userId/type/:type    # Get by meal type
POST   /api/meals                       # Create meal
PUT    /api/meals/:id                   # Update meal
DELETE /api/meals/:id                   # Delete meal
```

### Weights
```
GET    /api/weights/:userId             # Get all weights
GET    /api/weights/:userId/range       # Get by date range
GET    /api/weights/:userId/latest      # Get latest weight
POST   /api/weights                     # Create weight entry
PUT    /api/weights/:id                 # Update weight
DELETE /api/weights/:id                 # Delete weight
```

### Recipes
```
GET    /api/recipes                     # Get all recipes
GET    /api/recipes/search              # Search recipes
GET    /api/recipes/:id                 # Get recipe by ID
POST   /api/recipes                     # Create recipe (admin)
PUT    /api/recipes/:id                 # Update recipe (admin)
DELETE /api/recipes/:id                 # Delete recipe (admin)
```

## 📊 Database Schema

### User Collection
- Comprehensive user profile with health data
- Authentication credentials
- Activity, lifestyle, and goal information
- System fields (subscription, timestamps)

### Activity Collection
- User reference
- Activity type, duration, calories
- Date and metadata

### Meal Collection
- User reference
- Meal type, name, nutrition data
- Quantity and serving information
- Date tracking

### Weight Collection
- User reference
- Weight, body composition
- Progressive tracking

### Recipe Collection
- Recipe details
- Ingredients and instructions
- Nutrition information
- Tags and dietary info

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start Server**
   ```bash
   npm start          # Production
   npm run dev        # Development (with nodemon)
   ```

4. **Access Application**
   - Backend API: `http://localhost:5000/api`
   - Frontend: `http://localhost:5000`

## 📝 Development Notes

### Adding New Features

1. **New Model**: Create schema in `models/`
2. **New Controller**: Add logic in `controllers/`
3. **New Routes**: Define endpoints in `routes/`
4. **Update Server**: Import routes in `server.js`

### Frontend Integration

1. Update `scripts/main.js` to call new API endpoints
2. Add UI components in `index.html`
3. Style new components in `styles/main.css`
4. Test with backend API

## 🔐 Security Considerations

- ✅ Use environment variables for sensitive data
- ⏭️ Implement JWT authentication
- ⏭️ Hash passwords with bcrypt
- ⏭️ Validate inputs on both client and server
- ⏭️ Use HTTPS in production
- ⏭️ Rate limiting for API endpoints

## 📦 Deployment

### Prerequisites
- Node.js >= 14.0.0
- MongoDB Atlas account
- Environment variables configured

### Steps
1. Push code to GitHub
2. Deploy to hosting (Heroku, Vercel, etc.)
3. Configure MongoDB Atlas connection
4. Set environment variables on hosting platform
5. Update CORS settings if needed

## 🎯 Future Enhancements

- [ ] JWT authentication middleware
- [ ] Password hashing with bcrypt
- [ ] Email verification
- [ ] Social login integration
- [ ] Real-time notifications
- [ ] Mobile app API
- [ ] Advanced analytics
- [ ] Community features
- [ ] Admin dashboard
- [ ] Automated testing

---

**Built with ❤️ using Node.js, Express, MongoDB, HTML5, CSS3, and JavaScript**

