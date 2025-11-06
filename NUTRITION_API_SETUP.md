# 🍎 Nutrition API Integration Guide

## Overview

VitaTrackr now supports multiple nutrition APIs for automatic food nutrition lookups. When you log a meal, if the food isn't found in the local database, the system will automatically query a nutrition API to get accurate nutritional information.

## Supported APIs

The system supports the following nutrition APIs (configure one or more):

1. **Edamam Food Database API** - Free tier available
2. **Spoonacular API** - Free tier available  
3. **Nutritionix API** - Free tier available
4. **Custom API** - Use your own nutrition API endpoint
5. **Gemini AI** - Fallback option (uses your existing Gemini API key)

## Configuration

### Step 1: Choose Your API Provider

Choose one of the supported APIs and get your API keys:

#### Option 1: Edamam (Recommended for Free Tier)
1. Go to https://www.edamam.com/
2. Sign up for a free account
3. Get your App ID and App Key from the dashboard
4. Add to `.env`:
   ```
   EDAMAM_APP_ID=your_app_id_here
   EDAMAM_APP_KEY=your_app_key_here
   ```

#### Option 2: Spoonacular
1. Go to https://spoonacular.com/food-api
2. Sign up for a free account (150 points/day)
3. Get your API key
4. Add to `.env`:
   ```
   SPOONACULAR_API_KEY=your_api_key_here
   ```

#### Option 3: Nutritionix
1. Go to https://www.nutritionix.com/business/api
2. Sign up for a free account
3. Get your App ID and API Key
4. Add to `.env`:
   ```
   NUTRITIONIX_APP_ID=your_app_id_here
   NUTRITIONIX_API_KEY=your_api_key_here
   ```

#### Option 4: Custom API
If you have your own nutrition API:
1. Add to `.env`:
   ```
   CUSTOM_NUTRITION_API_URL=https://your-api-endpoint.com/nutrition
   CUSTOM_NUTRITION_API_KEY=your_api_key_here
   ```

#### Option 5: Use Gemini AI (No Additional Setup)
If you already have `GEMINI_API_KEY` configured, it will be used as a fallback automatically. No additional configuration needed!

### Step 2: Update Your .env File

Open your `.env` file and add the API keys for your chosen provider. The system will automatically detect and use the first available API in this order:

1. Edamam (if configured)
2. Spoonacular (if configured)
3. Nutritionix (if configured)
4. Custom API (if configured)
5. Gemini AI (fallback)

### Step 3: Restart Your Server

After adding API keys, restart your server:

```bash
npm start
# or
npm run dev
```

## How It Works

### Automatic Nutrition Lookup

1. **User enters meal name** in the meal logging form
2. **System checks local database** first (fast, offline)
3. **If not found**, automatically queries nutrition API
4. **Nutrition data is auto-filled** in the form
5. **User can adjust** quantity and values update automatically

### API Priority

The system uses APIs in this priority order:
- Local database (fastest, no API calls)
- Configured nutrition API (Edamam/Spoonacular/Nutritionix/Custom)
- Gemini AI (fallback, uses existing API key)

## Features

✅ **Automatic Lookup** - No manual entry needed for common foods  
✅ **Multiple API Support** - Choose the API that works best for you  
✅ **Smart Fallback** - Always has a backup option  
✅ **Quantity Scaling** - Automatically adjusts nutrition based on quantity  
✅ **Grams & Servings** - Supports both measurement types  
✅ **Real-time Updates** - Nutrition updates as you type quantity  

## API Endpoint

The nutrition API is available at:

```
POST /api/nutrition/lookup
```

**Request Body:**
```json
{
  "foodName": "chicken breast",
  "quantity": 100,
  "quantityType": "grams"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "chicken breast",
    "calories": 165,
    "protein": 31.0,
    "carbs": 0.0,
    "fats": 3.6,
    "fiber": 0,
    "sugar": 0,
    "servingSize": 100
  }
}
```

## Testing

1. Start your server
2. Go to the Meal Logging page
3. Enter a food name (e.g., "apple", "chicken breast", "rice")
4. Watch as nutrition data is automatically filled in
5. Adjust quantity to see values update automatically

## Troubleshooting

### "Nutrition data not found" Error

- Check that your API keys are correctly set in `.env`
- Verify your API key is valid and has remaining quota
- Try a different food name
- Check server logs for API errors

### API Rate Limits

Free tiers have rate limits:
- **Edamam**: 10,000 requests/month (free)
- **Spoonacular**: 150 points/day (free)
- **Nutritionix**: 500 requests/day (free)

If you hit rate limits, the system will fall back to Gemini AI.

### Using Gemini as Primary

If you prefer to use Gemini AI for all nutrition lookups:
1. Don't configure other APIs
2. Ensure `GEMINI_API_KEY` is set in `.env`
3. Gemini will be used for all lookups

## Security Notes

- ✅ API keys are stored in `.env` (not committed to git)
- ✅ All API calls are made server-side (keys never exposed to frontend)
- ✅ `.env` is in `.gitignore` for security

## Next Steps

1. Choose your preferred API provider
2. Get your API keys
3. Add them to `.env`
4. Restart your server
5. Start logging meals with automatic nutrition lookup!

---

**Need Help?** Check the server logs for detailed error messages if something doesn't work.

