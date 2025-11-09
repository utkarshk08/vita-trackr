# Gemini AI Integration Setup Guide

## Overview
VitaTrackr now uses Google's Gemini AI to generate creative, personalized recipes instead of just searching from a database. This makes the recipe generator much more powerful and flexible!

## Features
- **AI-Powered Recipe Generation**: Generate unique recipes from any ingredients or recipe name
- **Personalized Suggestions**: Takes into account your health conditions and allergies
- **Multiple Variations**: Get 3 different recipe ideas from the same set of ingredients
- **Smart Fallbacks**: If Gemini fails, falls back to database search or basic generation

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Create a new API key or use an existing one
5. Copy the API key (you'll need it in the next step)

### 2. Configure Environment Variable

Open your `.env` file in the root of the project and add:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with the actual API key you got from Google AI Studio.

Example:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart the Server

After adding the API key, restart your development server:

```bash
# Stop the current server (Ctrl+C if running in terminal)
# Then restart it
npm start
```

## How It Works

### Recipe Generator Page

1. **Search by Recipe Name**:
   - Enter a recipe name (e.g., "Butter Chicken")
   - First searches the local database
   - If not found, uses Gemini to generate the recipe

2. **Generate from Ingredients**:
   - Enter your available ingredients (comma-separated)
   - Gemini generates 3 different creative recipe variations
   - Each recipe is unique and tailored to your ingredients

### Personalization

The system automatically considers:
- **Health Conditions**: If you have diabetes, heart disease, etc., recipes are adjusted
- **Allergies**: Never includes ingredients you're allergic to
- **User Profile**: Considers your age, goals, and preferences

## Example Usage

### Example 1: Generate from Ingredients
```
Ingredients: chicken, rice, tomatoes, garlic
Result: 3 different recipes like:
- Asian Chicken Rice Bowl
- Spicy Chicken Risotto
- Chicken and Tomato Pilaf
```

### Example 2: Recipe by Name
```
Search: "Paneer Biryani"
Result: Complete recipe with:
- Ingredients list
- Step-by-step instructions
- Nutrition info
- Prep and cook times
```

## API Endpoints

### Generate Single Recipe
```
POST /api/gemini/generate-recipe
Body: {
  "ingredients": ["chicken", "rice"],
  "recipeName": "Chicken Rice",
  "userProfile": { ... }
}
```

### Generate Multiple Recipes
```
POST /api/gemini/generate-recipes
Body: {
  "ingredients": ["chicken", "rice", "tomatoes"],
  "count": 3
}
```

## Troubleshooting

### "Gemini API key not configured" Error

**Problem**: The `.env` file doesn't have `GEMINI_API_KEY` set properly.

**Solution**: 
1. Check your `.env` file has the correct API key
2. Restart the server after adding the key
3. Make sure there are no extra spaces around the `=` sign

### "Failed to generate recipe" Error

**Problem**: API request failed (invalid key, network issue, etc.)

**Solution**:
1. Verify your API key is valid at Google AI Studio
2. Check your internet connection
3. The system will automatically fallback to database recipes

### Recipes Not Showing

**Problem**: Server not running or API routes not registered.

**Solution**:
1. Make sure `npm start` is running
2. Check the console for any errors
3. Verify that the Gemini routes are loaded (check server.js)

## Fallback Behavior

The system has multiple fallback layers:

1. **Gemini AI** (Primary) - AI-generated recipes
2. **Database Search** (Fallback 1) - Search local recipe database
3. **Basic Generator** (Fallback 2) - Simple template-based recipes

This ensures you always get results, even if Gemini is temporarily unavailable.

## Cost Considerations

- **Free Tier**: Google provides a generous free tier for Gemini API
- **Pay-as-you-go**: Charges apply after free quota is exhausted
- **Rate Limits**: Be mindful of request limits in production

For development and moderate usage, the free tier should be sufficient.

## Security Notes

1. **Never commit API keys to Git**: The `.env` file is already in `.gitignore`
2. **Use environment variables**: In production (e.g., Render, Heroku), set environment variables securely
3. **API Key rotation**: Rotate keys periodically for security

## Next Steps

Once set up:
1. Try generating a recipe with your favorite ingredients
2. Test the personalization by adding health conditions to your profile
3. Experiment with different ingredient combinations

Enjoy your AI-powered recipe generator! 🍳✨

