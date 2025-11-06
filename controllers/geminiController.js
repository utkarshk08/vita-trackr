// Gemini AI Controller for Recipe Generation
// Ensure dotenv is loaded (in case controller is used standalone)
if (!process.env.GEMINI_API_KEY) {
    try {
        require('dotenv').config();
    } catch (e) {
        // dotenv might already be loaded by server.js
    }
}

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper function to get environment-aware error message
const getApiKeyErrorMessage = () => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    if (isProduction) {
        return 'Gemini API key not configured. Please add GEMINI_API_KEY as an environment variable in your Render dashboard (Settings > Environment Variables).';
    } else {
        return 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file and restart the server.';
    }
};

// Initialize Gemini with API key from environment
// Cache the genAI instance for efficiency
let cachedGenAI = null;

const getGenAI = () => {
    // Return cached instance if available
    if (cachedGenAI) {
        return cachedGenAI;
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    
        // Detailed validation and logging
        if (!apiKey) {
            console.error('[Gemini] API key not found in process.env.GEMINI_API_KEY');
            throw new Error(getApiKeyErrorMessage());
        }
        
        if (apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
            console.error('[Gemini] API key is placeholder or empty');
            throw new Error(getApiKeyErrorMessage());
        }
    
    // Log API key status (first few characters only for security)
    console.log(`[Gemini] Initializing with API key: ${apiKey.substring(0, 10)}...`);
    
    // Create and cache the instance
    try {
        cachedGenAI = new GoogleGenerativeAI(apiKey);
        console.log('[Gemini] GoogleGenerativeAI instance created successfully');
        return cachedGenAI;
    } catch (error) {
        console.error('[Gemini] Failed to create GoogleGenerativeAI instance:', error.message);
        throw new Error(`Failed to initialize Gemini AI: ${error.message}`);
    }
};

// Helper function to get model - explicitly sets model name
// Use newer 2.x model names that are supported in current API
const getModelWithFallback = (genAI, preferredModel = null) => {
    // Get model from environment variable or use default
    // Current supported models: gemini-2.5-flash (fast, recommended) or gemini-2.5-pro (more advanced)
    // Note: 1.5 models are deprecated, use 2.0/2.5 models
    const modelName = process.env.MODEL || preferredModel || "gemini-2.5-flash";
    
    // Explicitly create model with model name
    const model = genAI.getGenerativeModel({ 
        model: modelName
    });
    
    console.log(`[Gemini] Using model: ${modelName}`);
    return { model, modelName };
};

// @desc    Generate recipe using Gemini AI
// @route   POST /api/gemini/generate-recipe
// @access  Public
const generateRecipeWithGemini = async (req, res) => {
    try {
        const { ingredients, recipeName, userProfile } = req.body;

        // Check if API key is configured (will throw error if not)
        try {
            getGenAI(); // This will validate the API key
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Build the prompt
        let prompt = '';
        if (recipeName) {
            prompt = `Generate a detailed recipe for "${recipeName}"`;
        } else if (ingredients && ingredients.length > 0) {
            prompt = `CRITICAL REQUIREMENT: Generate a detailed recipe that PRIMARILY uses ALL of these ingredients: ${ingredients.join(', ')}.

IMPORTANT CONSTRAINTS:
1. The recipe MUST prominently feature and use ALL the listed ingredients as main components
2. You may only add minimal basic pantry staples (salt, pepper, oil, water) that are absolutely essential
3. DO NOT add major additional ingredients that aren't in the list (e.g., don't add eggs when only chicken is listed)
4. The dish should make logical culinary sense with the provided ingredients
5. Focus on using the exact ingredients listed as the star of the dish`;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Please provide either a recipe name or ingredients'
            });
        }

        // Add user context if available
        if (userProfile && userProfile.diseases && userProfile.diseases.length > 0) {
            prompt += `\n\nNote: The user has these health conditions: ${userProfile.diseases.join(', ')}. Please ensure the recipe is suitable for them.`;
        }

        if (userProfile && userProfile.allergies && userProfile.allergies.length > 0) {
            prompt += `\n\nImportant: The user has allergies to: ${userProfile.allergies.join(', ')}. DO NOT include any of these ingredients.`;
        }

        prompt += `\n\nPlease provide the recipe in the following JSON format:
{
    "title": "Recipe Name",
    "ingredients": ["ingredient1", "ingredient2", ...],
    "instructions": [
        "Step 1",
        "Step 2",
        ...
    ],
    "nutrition": {
        "Calories": "XXX",
        "Protein": "XXg",
        "Carbs": "XXg",
        "Fat": "XXg",
        "Fiber": "XXg"
    },
    "prepTime": "XX min",
    "cookTime": "XX min",
    "cuisine": "Cuisine Type",
    "tags": ["tag1", "tag2", ...],
    "description": "Brief description of the recipe"
}

Ensure all nutrition values are realistic and the recipe is practical to cook. Return ONLY the JSON, no markdown formatting.`;

        // Get the generative model - explicitly set model name
        const genAI = getGenAI();
        const { model, modelName } = getModelWithFallback(genAI);

        // Explicitly call generateContent with the model
        console.log(`[Gemini] Generating recipe with model: ${modelName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let recipeText = response.text();
        console.log(`[Gemini] Recipe generated successfully`);

        // Clean up the response (remove markdown code blocks if present)
        recipeText = recipeText.trim();
        if (recipeText.startsWith('```json')) {
            recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (recipeText.startsWith('```')) {
            recipeText = recipeText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const recipe = JSON.parse(recipeText);

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        console.error('[Gemini API Error]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
        });
        
        // Provide more detailed error messages
        let errorMessage = 'Failed to generate recipe with Gemini AI';
        if (error.message.includes('API key')) {
            errorMessage = 'Gemini API key not configured or invalid';
        } else if (error.message.includes('model')) {
            errorMessage = 'Gemini model not available. Please check API permissions.';
        } else if (error.message.includes('quota') || error.message.includes('rate')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else {
            errorMessage = error.message || errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Generate multiple recipe variations
// @route   POST /api/gemini/generate-recipes
// @access  Public
const generateMultipleRecipesWithGemini = async (req, res) => {
    try {
        const { ingredients, count = 3 } = req.body;

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide ingredients'
            });
        }

        // Check if API key is configured (will throw error if not)
        try {
            getGenAI(); // This will validate the API key
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        const prompt = `CRITICAL REQUIREMENT: Generate ${count} different recipe variations that PRIMARILY use ALL of these ingredients: ${ingredients.join(', ')}.

IMPORTANT CONSTRAINTS:
1. Each recipe MUST prominently feature and use ALL the listed ingredients as main components
2. You may only add minimal basic pantry staples (salt, pepper, oil, water) that are absolutely essential
3. DO NOT add major additional ingredients that aren't in the list (e.g., don't add eggs when only chicken is listed)
4. Each dish should make logical culinary sense with the provided ingredients
5. Focus on using the exact ingredients listed as the star of each dish
6. Create truly different variations - different cooking methods, seasonings, or presentations

Please provide each recipe in the following JSON array format:
[
    {
        "title": "Recipe Name 1",
        "ingredients": ["ingredient1", "ingredient2", ...],
        "instructions": ["Step 1", "Step 2", ...],
        "nutrition": {
            "Calories": "XXX",
            "Protein": "XXg",
            "Carbs": "XXg",
            "Fat": "XXg",
            "Fiber": "XXg"
        },
        "prepTime": "XX min",
        "cookTime": "XX min",
        "cuisine": "Cuisine Type",
        "tags": ["tag1", "tag2"],
        "description": "Brief description"
    },
    ...
]

Ensure all recipes are different and creative. Return ONLY the JSON array, no markdown formatting.`;

        // Get the generative model - explicitly set model name
        const genAI = getGenAI();
        const { model, modelName } = getModelWithFallback(genAI);
        
        console.log(`[Gemini] Generating ${count} recipes with model: ${modelName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let recipesText = response.text();

        // Clean up the response
        recipesText = recipesText.trim();
        if (recipesText.startsWith('```json')) {
            recipesText = recipesText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (recipesText.startsWith('```')) {
            recipesText = recipesText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const recipes = JSON.parse(recipesText);

        console.log(`[Gemini] Generated ${Array.isArray(recipes) ? recipes.length : 1} recipe(s) successfully`);
        res.json({
            success: true,
            data: Array.isArray(recipes) ? recipes : [recipes]
        });
    } catch (error) {
        console.error('[Gemini API Error - Multiple Recipes]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
            ingredients: req.body.ingredients
        });
        
        let errorMessage = 'Failed to generate recipes with Gemini AI';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'Gemini model not available. Please check that Generative Language API is enabled in Google Cloud Console.';
        } else if (error.message.includes('quota') || error.message.includes('rate')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else {
            errorMessage = error.message || errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Get recipe name suggestions (only names, 2-3 recipes)
// @route   POST /api/gemini/suggest-recipes
// @access  Public
const suggestRecipeNames = async (req, res) => {
    try {
        const { ingredients } = req.body;

        // Check if API key is configured (will throw error if not)
        try {
            getGenAI(); // This will validate the API key
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Build prompt for recipe name suggestions only
        let prompt = '';
        if (ingredients && ingredients.length > 0) {
            prompt = `Suggest 2-3 BASIC recipe names that can be made using these ingredients: ${ingredients.join(', ')}.

IMPORTANT REQUIREMENTS:
1. Suggest ONLY basic, simple, and common recipe names (e.g., "Chicken Curry", "Tomato Pasta", "Onion Soup")
2. The recipes MUST be possible to make with the provided ingredients (you may assume basic pantry staples like salt, oil, water are available)
3. Prioritize recipes that use the listed ingredients as main components
4. Keep names simple and straightforward - avoid elaborate or fancy names
5. If no suitable recipes can be made from the ingredients, return an empty array []

Return ONLY a JSON array of recipe names (strings), like this:
["Basic Recipe Name 1", "Basic Recipe Name 2", "Basic Recipe Name 3"]

Return ONLY the JSON array, no markdown formatting, no additional text.`;
        } else {
            prompt = `Suggest 2-3 basic and popular recipe names that are commonly enjoyed.

Return ONLY a JSON array of recipe names (strings), like this:
["Basic Recipe Name 1", "Basic Recipe Name 2", "Basic Recipe Name 3"]

Keep names simple and straightforward. Return ONLY the JSON array, no markdown formatting, no additional text.`;
        }

        // Get the generative model - explicitly set model name
        const genAI = getGenAI();
        const { model, modelName } = getModelWithFallback(genAI);

        console.log(`[Gemini] Generating suggestions with model: ${modelName}, ingredients: ${ingredients.length > 0 ? ingredients.join(', ') : 'none'}`);
        // Explicitly call generateContent with the model
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let suggestionsText = response.text();

        // Clean up the response
        suggestionsText = suggestionsText.trim();
        if (suggestionsText.startsWith('```json')) {
            suggestionsText = suggestionsText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (suggestionsText.startsWith('```')) {
            suggestionsText = suggestionsText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const suggestions = JSON.parse(suggestionsText);

        // Ensure we only return 2-3 recipes (or empty array if no suitable recipes)
        let limitedSuggestions = [];
        if (Array.isArray(suggestions)) {
            // Filter out empty strings and null values
            limitedSuggestions = suggestions.filter(s => s && s.trim()).slice(0, 3);
        } else if (suggestions && typeof suggestions === 'string') {
            // If it's a single string, wrap it in array
            limitedSuggestions = [suggestions].slice(0, 3);
        }
        // If empty array or no valid suggestions, return empty array

        console.log(`[Gemini] Generated ${limitedSuggestions.length} recipe suggestions`);
        res.json({
            success: true,
            data: limitedSuggestions
        });
    } catch (error) {
        console.error('[Gemini API Error - Suggestions]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.GEMINI_API_KEY,
            ingredients: req.body.ingredients
        });
        
        let errorMessage = 'Failed to get recipe suggestions';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'Gemini model not available. Please check that Generative Language API is enabled in Google Cloud Console.';
        } else if (error.message.includes('quota') || error.message.includes('rate')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else {
            errorMessage = error.message || errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Get AI-powered activity recommendations
// @route   POST /api/gemini/recommend-activities
// @access  Public
const recommendActivities = async (req, res) => {
    try {
        const { userId, previousActivities, previousMeals, userProfile } = req.body;

        // Check if API key is configured (will throw error if not)
        try {
            getGenAI(); // This will validate the API key
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Available activity types (must match frontend options)
        const availableActivityTypes = ['running', 'cycling', 'swimming', 'walking', 'gym', 'yoga'];

        // Build context from previous activities (last 7-14 days)
        let activityContext = '';
        if (previousActivities && previousActivities.length > 0) {
            const activityCounts = {};
            let totalCalories = 0;
            let totalDuration = 0;
            
            previousActivities.forEach(activity => {
                activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
                totalCalories += activity.calories || 0;
                totalDuration += activity.duration || 0;
            });

            activityContext = `Previous Activities (last ${previousActivities.length} activities):\n`;
            activityContext += `- Most frequent: ${Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'}\n`;
            activityContext += `- Total calories burned: ${totalCalories} kcal\n`;
            activityContext += `- Total duration: ${totalDuration} minutes\n`;
            activityContext += `- Activity breakdown: ${Object.entries(activityCounts).map(([type, count]) => `${type} (${count}x)`).join(', ')}\n`;
        } else {
            activityContext = 'No previous activities logged.\n';
        }

        // Build context from previous meals (last 7-14 days)
        let mealContext = '';
        if (previousMeals && previousMeals.length > 0) {
            const totalCaloriesConsumed = previousMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
            const avgCaloriesPerMeal = totalCaloriesConsumed / previousMeals.length;
            const avgProtein = previousMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0) / previousMeals.length;
            
            mealContext = `Previous Meals (last ${previousMeals.length} meals):\n`;
            mealContext += `- Total calories consumed: ${totalCaloriesConsumed} kcal\n`;
            mealContext += `- Average calories per meal: ${Math.round(avgCaloriesPerMeal)} kcal\n`;
            mealContext += `- Average protein per meal: ${Math.round(avgProtein)}g\n`;
        } else {
            mealContext = 'No previous meals logged.\n';
        }

        // Build user profile context
        let profileContext = '';
        if (userProfile) {
            profileContext = 'User Profile:\n';
            if (userProfile.age) profileContext += `- Age: ${userProfile.age}\n`;
            if (userProfile.gender) profileContext += `- Gender: ${userProfile.gender}\n`;
            if (userProfile.weight) profileContext += `- Weight: ${userProfile.weight} kg\n`;
            if (userProfile.height) profileContext += `- Height: ${userProfile.height} cm\n`;
            if (userProfile.goalType) profileContext += `- Goal: ${userProfile.goalType}\n`;
            if (userProfile.occupation) profileContext += `- Activity level: ${userProfile.occupation}\n`;
            if (userProfile.exerciseFrequency) profileContext += `- Exercise frequency: ${userProfile.exerciseFrequency} days/week\n`;
            if (userProfile.diseases && userProfile.diseases.length > 0) {
                profileContext += `- Health conditions: ${userProfile.diseases.join(', ')}\n`;
            }
            if (userProfile.allergies && userProfile.allergies.length > 0) {
                profileContext += `- Allergies: ${userProfile.allergies.join(', ')}\n`;
            }
        }

        // Build the prompt
        const prompt = `You are a fitness and health AI assistant. Recommend 1-3 activities for the user based on their profile, previous activities, and meal logs.

${profileContext}

${activityContext}

${mealContext}

IMPORTANT CONSTRAINTS:
1. You MUST only recommend activities from this exact list: ${availableActivityTypes.join(', ')}
2. Consider the user's health conditions - avoid activities that could be harmful
3. Consider their previous activity patterns - suggest variety to avoid overuse injuries
4. Consider their meal logs - if they've consumed high calories, suggest more intense activities; if low calories, suggest moderate activities
5. Consider their fitness goals (weight-loss, muscle-gain, maintain, etc.)
6. Consider their current activity level and exercise frequency
7. Suggest appropriate duration (in minutes) and intensity (light, moderate, vigorous) for each activity
8. Provide a brief reason for each recommendation

Return ONLY a JSON array of activity recommendations, like this:
[
    {
        "type": "running",
        "duration": 30,
        "intensity": "moderate",
        "reason": "Brief explanation why this activity is recommended"
    },
    {
        "type": "yoga",
        "duration": 45,
        "intensity": "light",
        "reason": "Brief explanation why this activity is recommended"
    }
]

Return ONLY the JSON array, no markdown formatting, no additional text.`;

        // Get the generative model
        const genAI = getGenAI();
        const { model, modelName } = getModelWithFallback(genAI);

        console.log(`[Gemini] Generating activity recommendations with model: ${modelName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let recommendationsText = response.text();

        // Clean up the response
        recommendationsText = recommendationsText.trim();
        if (recommendationsText.startsWith('```json')) {
            recommendationsText = recommendationsText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (recommendationsText.startsWith('```')) {
            recommendationsText = recommendationsText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const recommendations = JSON.parse(recommendationsText);

        // Validate and filter recommendations to only include available activity types
        const validRecommendations = Array.isArray(recommendations)
            ? recommendations
                .filter(rec => rec && rec.type && availableActivityTypes.includes(rec.type.toLowerCase()))
                .map(rec => ({
                    type: rec.type.toLowerCase(),
                    duration: rec.duration || 30,
                    intensity: rec.intensity || 'moderate',
                    reason: rec.reason || 'Recommended based on your profile and activity history'
                }))
                .slice(0, 3) // Limit to 3 recommendations
            : [];

        console.log(`[Gemini] Generated ${validRecommendations.length} activity recommendations`);
        res.json({
            success: true,
            data: validRecommendations
        });
    } catch (error) {
        console.error('[Gemini API Error - Activity Recommendations]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.GEMINI_API_KEY,
            userId: req.body.userId
        });
        
        let errorMessage = 'Failed to get activity recommendations';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'Gemini model not available. Please check that Generative Language API is enabled in Google Cloud Console.';
        } else if (error.message.includes('quota') || error.message.includes('rate')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else {
            errorMessage = error.message || errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Generate personalized daily plan using Gemini AI
// @route   POST /api/gemini/daily-plan
// @access  Public
const generateDailyPlan = async (req, res) => {
    try {
        const { userId, previousActivities, previousMeals, userProfile } = req.body;

        // Check if API key is configured (will throw error if not)
        try {
            getGenAI(); // This will validate the API key
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Available activity types (must match frontend options)
        const availableActivityTypes = ['running', 'cycling', 'swimming', 'walking', 'gym', 'yoga'];

        // Build context from previous activities (last 14 days)
        let activityContext = '';
        if (previousActivities && previousActivities.length > 0) {
            const activityCounts = {};
            let totalCalories = 0;
            let totalDuration = 0;
            
            previousActivities.forEach(activity => {
                activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
                totalCalories += activity.calories || 0;
                totalDuration += activity.duration || 0;
            });

            activityContext = `Previous Activities (last ${previousActivities.length} activities):\n`;
            activityContext += `- Most frequent: ${Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'}\n`;
            activityContext += `- Total calories burned: ${totalCalories} kcal\n`;
            activityContext += `- Total duration: ${totalDuration} minutes\n`;
            activityContext += `- Activity breakdown: ${Object.entries(activityCounts).map(([type, count]) => `${type} (${count}x)`).join(', ')}\n`;
        } else {
            activityContext = 'No previous activities logged.\n';
        }

        // Build context from previous meals (last 14 days)
        let mealContext = '';
        if (previousMeals && previousMeals.length > 0) {
            const totalCaloriesConsumed = previousMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
            const avgCaloriesPerMeal = totalCaloriesConsumed / previousMeals.length;
            const avgProtein = previousMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0) / previousMeals.length;
            const avgCarbs = previousMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0) / previousMeals.length;
            const avgFats = previousMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0) / previousMeals.length;
            
            mealContext = `Previous Meals (last ${previousMeals.length} meals):\n`;
            mealContext += `- Total calories consumed: ${totalCaloriesConsumed} kcal\n`;
            mealContext += `- Average calories per meal: ${Math.round(avgCaloriesPerMeal)} kcal\n`;
            mealContext += `- Average protein per meal: ${Math.round(avgProtein)}g\n`;
            mealContext += `- Average carbs per meal: ${Math.round(avgCarbs)}g\n`;
            mealContext += `- Average fats per meal: ${Math.round(avgFats)}g\n`;
        } else {
            mealContext = 'No previous meals logged.\n';
        }

        // Build user profile context
        let profileContext = '';
        if (userProfile) {
            profileContext = 'User Profile:\n';
            if (userProfile.age) profileContext += `- Age: ${userProfile.age}\n`;
            if (userProfile.gender) profileContext += `- Gender: ${userProfile.gender}\n`;
            if (userProfile.weight) profileContext += `- Weight: ${userProfile.weight} kg\n`;
            if (userProfile.height) profileContext += `- Height: ${userProfile.height} cm\n`;
            if (userProfile.goalType) profileContext += `- Goal: ${userProfile.goalType}\n`;
            if (userProfile.occupation) profileContext += `- Activity level: ${userProfile.occupation}\n`;
            if (userProfile.exerciseFrequency) profileContext += `- Exercise frequency: ${userProfile.exerciseFrequency} days/week\n`;
            if (userProfile.caloricGoal) profileContext += `- Daily caloric goal: ${userProfile.caloricGoal} kcal\n`;
            if (userProfile.diseases && userProfile.diseases.length > 0) {
                profileContext += `- Health conditions: ${userProfile.diseases.join(', ')}\n`;
            }
            if (userProfile.allergies && userProfile.allergies.length > 0) {
                profileContext += `- Allergies: ${userProfile.allergies.join(', ')}\n`;
            }
        }

        // Build the prompt
        const prompt = `You are a personalized health and fitness AI assistant. Create a comprehensive daily plan for the user based on their profile, previous activities, and meal logs.

${profileContext}

${activityContext}

${mealContext}

IMPORTANT REQUIREMENTS:
1. Create a personalized daily plan that includes:
   - Recommended activities for today (only from: ${availableActivityTypes.join(', ')})
   - Meal suggestions (breakfast, lunch, dinner, snacks)
   - Health tips and reminders
   - Water intake recommendations
   - Rest/recovery suggestions if needed

2. Consider the user's health conditions - avoid activities or foods that could be harmful
3. Consider their previous activity patterns - suggest variety to avoid overuse injuries
4. Consider their meal logs - suggest meals that balance their nutrition
5. Consider their fitness goals (weight-loss, muscle-gain, maintain, etc.)
6. Consider their current activity level and exercise frequency
7. Make the plan realistic and achievable
8. Provide specific recommendations with durations, intensities, and meal ideas

Return ONLY a JSON object with this structure:
{
    "activities": [
        {
            "type": "running",
            "duration": 30,
            "intensity": "moderate",
            "time": "Morning",
            "reason": "Brief explanation"
        }
    ],
    "meals": {
        "breakfast": {
            "suggestion": "Meal name/idea",
            "calories": 400,
            "protein": 25,
            "reason": "Brief explanation"
        },
        "lunch": {
            "suggestion": "Meal name/idea",
            "calories": 600,
            "protein": 35,
            "reason": "Brief explanation"
        },
        "dinner": {
            "suggestion": "Meal name/idea",
            "calories": 500,
            "protein": 30,
            "reason": "Brief explanation"
        },
        "snacks": ["Snack idea 1", "Snack idea 2"]
    },
    "healthTips": [
        "Tip 1",
        "Tip 2",
        "Tip 3"
    ],
    "waterIntake": {
        "liters": 2.5,
        "reason": "Brief explanation"
    },
    "summary": "Brief summary of the daily plan"
}

Return ONLY the JSON object, no markdown formatting, no additional text.`;

        // Get the generative model
        const genAI = getGenAI();
        const { model, modelName } = getModelWithFallback(genAI);

        console.log(`[Gemini] Generating daily plan with model: ${modelName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let planText = response.text();

        // Clean up the response
        planText = planText.trim();
        if (planText.startsWith('```json')) {
            planText = planText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (planText.startsWith('```')) {
            planText = planText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const dailyPlan = JSON.parse(planText);

        // Validate activities to only include available activity types
        if (dailyPlan.activities && Array.isArray(dailyPlan.activities)) {
            dailyPlan.activities = dailyPlan.activities
                .filter(act => act && act.type && availableActivityTypes.includes(act.type.toLowerCase()))
                .map(act => ({
                    type: act.type.toLowerCase(),
                    duration: act.duration || 30,
                    intensity: act.intensity || 'moderate',
                    time: act.time || 'Anytime',
                    reason: act.reason || 'Recommended for your goals'
                }));
        }

        console.log(`[Gemini] Generated daily plan successfully`);
        res.json({
            success: true,
            data: dailyPlan
        });
    } catch (error) {
        console.error('[Gemini API Error - Daily Plan]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.GEMINI_API_KEY,
            userId: req.body.userId
        });
        
        let errorMessage = 'Failed to generate daily plan';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'Gemini model not available. Please check that Generative Language API is enabled in Google Cloud Console.';
        } else if (error.message.includes('quota') || error.message.includes('rate')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else {
            errorMessage = error.message || errorMessage;
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

module.exports = {
    generateRecipeWithGemini,
    generateMultipleRecipesWithGemini,
    suggestRecipeNames,
    recommendActivities,
    generateDailyPlan
};

