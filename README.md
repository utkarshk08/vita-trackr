# VitaTrackr - Your Complete Health Companion

A modern, all-in-one health and wellness web application that combines **Gemini AI-powered recipe generation**, AI-powered personalized dish suggestions, and physical activity tracking in a beautiful, user-friendly interface with **IndexedDB** for robust data storage.

## Features

### 🏠 Home Page
- Welcome dashboard with feature overview
- Quick access to all main features
- Clean, modern design

### 👤 Comprehensive Profile Setup
**Complete health profile with organized sections:**

1. **Basic Details** (Required)
   - Name, Age, Gender
   - Weight and Height
   - **Auto-calculated BMI** with category
   - Body Fat % (Optional)
   - Waist-Hip Ratio (Optional)

2. **Health Information** (Required)
   - Existing Diseases/Conditions
   - Food Allergies
   - Dietary Preferences (Vegetarian, Vegan, Non-veg, Pescatarian)
   - Current Medications (Optional)
   - Average Sleep Hours (Optional)
   - Daily Water Intake (Optional)

3. **Activity & Lifestyle** (Required)
   - Occupation Type (Sedentary to Extremely Active)
   - Exercise Frequency (days/week)
   - Average Daily Steps (Optional)
   - Screen Time Tracking (Optional)

4. **Goal Tracking** (Required)
   - Goal Type (Weight Loss, Gain, Muscle Gain, Maintain)
   - Target Duration (weeks)
   - **Auto-calculated Daily Caloric Goal** based on BMR & TDEE
   - **Auto-calculated Macronutrient Split** (Carbs, Protein, Fats)

5. **Optional Enhancements**
   - Family History
   - Stress Level (1-10)
   - Blood Test Results
   - Food Dislikes
   - Preferred Cuisines

**Smart Calculations:**
- BMI calculation with health categories
- BMR (Basal Metabolic Rate) using Harris-Benedict equation
- TDEE (Total Daily Energy Expenditure) based on activity level
- Personalized caloric goals adjusted for your goal type
- Optimal macro splits for your specific goal

### 🍳 Recipe Generator (Powered by Gemini AI 🤖)
- **AI-Powered Generation**: Uses Google's Gemini AI to create unique, creative recipes
- **Dual search modes**:
  - Search by recipe name (database first, then AI-generated if not found)
  - Generate 3 different recipe variations from available ingredients
- **Personalized Intelligence**: Considers your health conditions and allergies
- **Smart fallback**: Multi-layer fallback (AI → Database → Basic templates)
- **Click any recipe card** to view full details in beautiful modal
- Step-by-step cooking instructions with complete ingredients list
- Complete nutritional information for each recipe
- See [GEMINI_SETUP.md](GEMINI_SETUP.md) for setup instructions

### 💡 Dish Suggestions (AI-POWERED AUTO-RECOMMENDATIONS)
- **Intelligent AI-powered recommendations** based on your complete health profile
- **Comprehensive recipe database** with multi-cuisine support (Indian, Mediterranean, Italian, Asian, Western)
- **Smart scoring algorithm** (100+ points) evaluating:
  - Cuisine preferences (40 points)
  - Health conditions (30 points)
  - Dietary preferences (25 points)
  - Available ingredients (15 points)
  - Nutritional goals (10 points)
  - Activity-based needs (5+ points)
  - Time-based suggestions (bonus)
- Intelligent diet type detection:
  - Low Sugar (for diabetes)
  - Low Sodium (for hypertension)
  - Low Carb (for weight management)
  - Low Fat (for high cholesterol)
  - High Protein (based on activity levels)
- **Comprehensive filtering**:
  - Allergen detection and blocking
  - Food dislike avoidance
  - Disease-specific contraindications
  - Real-time safety checks
- Complete nutritional info, prep time, cooking time, and tags for each dish
- **Click any suggested dish to view full recipe** with complete ingredients and step-by-step instructions
- Beautiful modal display with organized sections for easy cooking

### 🏃 Smart Activity Tracker
- **Automatic calorie calculation** based on activity type and duration
- **Personalized calculations** using your weight from profile
- **MET-based accuracy** (Medical Exercise Testing standards)
- **Editable calories** - Adjust auto-calculated values if needed
- Activity types: Running, Cycling, Swimming, Walking, Gym, Yoga
- View activity history with calories burned
- Delete activities
- Date-specific logging
- Visual feedback when calories are calculated

### 🍎 Meal Logging & Nutrition Tracking
- **Smart meal logging** with automatic nutrition lookup
- **Dual quantity input**:
  - By servings (0.25x, 0.5x, 1x, 2x, etc.)
  - By weight in grams (10g, 100g, 250g, etc.)
- **Automatic database lookup** from comprehensive recipe database
- **Editable nutrition** - Adjust auto-filled values if needed
- **Complete tracking**: Calories, Protein, Carbs, Fats for every meal
- **Visual feedback** when nutrition data is found and loaded
- Meal history with quantity display
- Food icons by meal type (breakfast, lunch, dinner, snack)

### 📊 Enhanced Overview Dashboard
- **8 comprehensive statistics**:
  - Activity calories burned
  - Total activity minutes
  - Meals logged (all-time)
  - Health score calculation
  - Average daily calories
  - Total protein consumed
  - Total carbs consumed
  - This week's activities
- Recent activities and meals display
- **Intelligent nutrition insights** based on meals and activities
- Progress tracking with meal bonus scoring

### 🌓 Dark/Light Mode Toggle
- **Seamless theme switching** with one click
- Beautiful light mode with redesigned color scheme
- Persistent theme preference saved in localStorage
- Smooth animations and transitions

### 🔐 Professional Login & Sign Up System
- Beautiful login and sign up interface
- Toggle between login and registration
- Automatic profile creation after sign up
- Secure user authentication
- Modern glassmorphism design

### ⭐ Active Subscription Badge
- Pro subscription indicator
- Visible throughout the application

## Getting Started

1. Open `index.html` in a modern web browser
2. **Sign up for a new account** or login (demo mode)
   - If signing up, you'll be automatically directed to create your profile
3. **Complete your comprehensive profile setup**:
   - **Required**: Name, Age, Gender, Weight, Height, Dietary Preference, Occupation, Goal Type
   - **Optional**: Add diseases, allergies, medications, activity tracking, and more
   - **Watch the magic**: BMI, caloric goals, and macro splits auto-calculate as you enter data!
4. Explore the features:
   - **Recipe Generator**: Enter ingredients to get multiple recipes with expandable instructions
   - **Dish Suggestions**: Automatic recommendations based on your complete health profile
   - **Activity Tracker**: Log your physical activities and monitor progress
   - **Overview**: View comprehensive health statistics and insights
   - **Profile**: Update your health information anytime

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB (Atlas), Mongoose ODM
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)
- **AI**: Google Gemini AI for recipe generation
- **Icons**: Font Awesome
- **Storage**: IndexedDB + LocalStorage for offline support
- **Deployment**: GitHub, Render.com compatible

## Design Features

- Responsive design for all screen sizes
- Modern glassmorphism UI
- Smooth animations and transitions
- Beautiful gradient backgrounds
- Professional color scheme
- Intuitive navigation

## Data Storage

All data is stored locally in your browser using **IndexedDB** and **LocalStorage**:
- **Recipe database** with comprehensive tagging system (IndexedDB)
- **User profiles** with complete health information (IndexedDB)
- **Activity logs** with full history tracking (IndexedDB + LocalStorage)
- **Smart recommendations** cache for faster loading
- **Offline-first architecture** - works without internet

## Browser Compatibility

Works best with modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Technical Features

- **IndexedDB** for robust client-side data storage
- **Smart Matching Algorithm** with multi-factor scoring system (100+ points)
- **Comprehensive Tagging System** for recipes and preferences
- **Real-time BMI, BMR, TDEE calculations**
- **MET-based calorie calculations** for accurate activity tracking
- **Nutrition database** with automatic lookup and scaling
- **Offline-first architecture** with localStorage fallback
- **Responsive design** for all devices

## Recipe Database

Includes curated recipes across multiple cuisines:
- 🇮🇳 **Indian**: Dal, Paneer Tikka, Chicken Curry, Biryani
- 🇬🇷 **Mediterranean**: Greek Salad, Grilled Salmon, Quinoa Bowls
- 🇮🇹 **Italian**: Pasta Primavera, Caprese Salad
- 🍜 **Asian**: Stir-Fry, Teriyaki Bowls
- 🌍 **Western**: Avocado Toast, Smoothie Bowls

Each recipe includes: tags, nutritional info, prep/cook time, dietary preferences, and health condition tags.

## Future Enhancements

- Backend integration for cloud storage
- Machine learning for improved recommendations
- Social sharing features
- Meal planning calendar
- Integration with fitness trackers
- Advanced nutrition analysis
- Community recipes and ratings
- Recipe images and videos

## License

This project is open source and available for personal use.

---

**Built with ❤️ for better health and wellness**

