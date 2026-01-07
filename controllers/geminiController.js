// ChatGPT AI Controller for Recipe Generation and Activity Recommendations
// Ensure dotenv is loaded (in case controller is used standalone)
if (!process.env.OPENAI_API_KEY) {
    try {
        require('dotenv').config();
    } catch (e) {
        // dotenv might already be loaded by server.js
    }
}

const OpenAI = require('openai');

// Helper function to get environment-aware error message
const getApiKeyErrorMessage = () => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    if (isProduction) {
        return 'OpenAI API key not configured. Please add OPENAI_API_KEY as an environment variable in your Render dashboard (Settings > Environment Variables).';
    } else {
        return 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file and restart the server.';
    }
};

// Initialize OpenAI client
// Cache the OpenAI instance for efficiency
let cachedOpenAI = null;

const getOpenAI = () => {
    // Return cached instance if available
    if (cachedOpenAI) {
        return cachedOpenAI;
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    
        // Detailed validation and logging
        if (!apiKey) {
        console.error('[ChatGPT] API key not found in process.env.OPENAI_API_KEY');
            throw new Error(getApiKeyErrorMessage());
        }
        
    if (apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
        console.error('[ChatGPT] API key is placeholder or empty');
            throw new Error(getApiKeyErrorMessage());
        }
    
    // Log API key status (first few characters only for security)
    console.log(`[ChatGPT] Initializing with API key: ${apiKey.substring(0, 10)}...`);
    
    // Create and cache the instance
    try {
        cachedOpenAI = new OpenAI({ apiKey });
        console.log('[ChatGPT] OpenAI client created successfully');
        return cachedOpenAI;
    } catch (error) {
        console.error('[ChatGPT] Failed to create OpenAI client:', error.message);
        throw new Error(`Failed to initialize OpenAI: ${error.message}`);
    }
};

// Helper function to clean and parse JSON response
const cleanAndParseJSON = (text) => {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '');
    }
    return JSON.parse(cleaned);
};

// @desc    Generate recipe using ChatGPT AI
// @route   POST /api/gemini/generate-recipe
// @access  Public
const generateRecipeWithGemini = async (req, res) => {
    try {
        const { ingredients, recipeName, userProfile } = req.body;

        // Check if API key is configured (will throw error if not)
        let openai;
        try {
            openai = getOpenAI(); // This will validate the API key
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

        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`[ChatGPT] Generating recipe with model: ${modelName}`);
        
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: 'You are a recipe generation AI. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const recipeText = completion.choices[0].message.content;
        console.log(`[ChatGPT] Recipe generated successfully`);

        // Clean up and parse the response
        const recipe = cleanAndParseJSON(recipeText);

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        console.error('[ChatGPT API Error]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.OPENAI_API_KEY,
            apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
        });
        
        // Provide more detailed error messages
        let errorMessage = 'Failed to generate recipe with ChatGPT AI';
        if (error.message.includes('API key')) {
            errorMessage = 'OpenAI API key not configured or invalid';
        } else if (error.message.includes('model')) {
            errorMessage = 'OpenAI model not available. Please check API permissions.';
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
        let openai;
        try {
            openai = getOpenAI(); // This will validate the API key
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

        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`[ChatGPT] Generating ${count} recipes with model: ${modelName}`);
        
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: 'You are a recipe generation AI. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 3000
        });

        const recipesText = completion.choices[0].message.content;

        // Clean up and parse the response
        const recipes = cleanAndParseJSON(recipesText);

        console.log(`[ChatGPT] Generated ${Array.isArray(recipes) ? recipes.length : 1} recipe(s) successfully`);
        res.json({
            success: true,
            data: Array.isArray(recipes) ? recipes : [recipes]
        });
    } catch (error) {
        console.error('[ChatGPT API Error - Multiple Recipes]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.OPENAI_API_KEY,
            apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
            ingredients: req.body.ingredients
        });
        
        let errorMessage = 'Failed to generate recipes with ChatGPT AI';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'OpenAI model not available. Please check API permissions.';
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
        let openai;
        try {
            openai = getOpenAI(); // This will validate the API key
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

        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`[ChatGPT] Generating suggestions with model: ${modelName}, ingredients: ${ingredients && ingredients.length > 0 ? ingredients.join(', ') : 'none'}`);
        
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: 'You are a recipe suggestion AI. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const suggestionsText = completion.choices[0].message.content;

        // Clean up and parse the response
        const suggestions = cleanAndParseJSON(suggestionsText);

        // Ensure we only return 2-3 recipes (or empty array if no suitable recipes)
        let limitedSuggestions = [];
        if (Array.isArray(suggestions)) {
            // Filter out empty strings and null values
            limitedSuggestions = suggestions.filter(s => s && s.trim()).slice(0, 3);
        } else if (suggestions && typeof suggestions === 'string') {
            // If it's a single string, wrap it in array
            limitedSuggestions = [suggestions].slice(0, 3);
        }

        console.log(`[ChatGPT] Generated ${limitedSuggestions.length} recipe suggestions`);
        res.json({
            success: true,
            data: limitedSuggestions
        });
    } catch (error) {
        console.error('[ChatGPT API Error - Suggestions]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.OPENAI_API_KEY,
            ingredients: req.body.ingredients
        });
        
        let errorMessage = 'Failed to get recipe suggestions';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'OpenAI model not available. Please check API permissions.';
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
        let openai;
        try {
            openai = getOpenAI(); // This will validate the API key
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

        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`[ChatGPT] Generating activity recommendations with model: ${modelName}`);
        
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: 'You are a fitness AI assistant. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const recommendationsText = completion.choices[0].message.content;

        // Clean up and parse the response
        const recommendations = cleanAndParseJSON(recommendationsText);

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

        console.log(`[ChatGPT] Generated ${validRecommendations.length} activity recommendations`);
        res.json({
            success: true,
            data: validRecommendations
        });
    } catch (error) {
        console.error('[ChatGPT API Error - Activity Recommendations]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.OPENAI_API_KEY,
            userId: req.body.userId
        });
        
        let errorMessage = 'Failed to get activity recommendations';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'OpenAI model not available. Please check API permissions.';
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

// @desc    Generate personalized daily plan using ChatGPT AI
// @route   POST /api/gemini/daily-plan
// @access  Public
const generateDailyPlan = async (req, res) => {
    try {
        const { userId, previousActivities, previousMeals, userProfile } = req.body;

        // Check if API key is configured (will throw error if not)
        let openai;
        try {
            openai = getOpenAI(); // This will validate the API key
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
   - Water intake recommendations

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
    "waterIntake": {
        "liters": 2.5,
        "reason": "Brief explanation"
    },
    "summary": "Brief summary of the daily plan"
}

Return ONLY the JSON object, no markdown formatting, no additional text.`;

        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`[ChatGPT] Generating daily plan with model: ${modelName}`);
        
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: 'You are a health and fitness AI assistant. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const planText = completion.choices[0].message.content;

        // Clean up and parse the response
        const dailyPlan = cleanAndParseJSON(planText);

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

        console.log(`[ChatGPT] Generated daily plan successfully`);
        res.json({
            success: true,
            data: dailyPlan
        });
    } catch (error) {
        console.error('[ChatGPT API Error - Daily Plan]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.OPENAI_API_KEY,
            userId: req.body.userId
        });
        
        let errorMessage = 'Failed to generate daily plan';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'OpenAI model not available. Please check API permissions.';
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

// @desc    Get AI-powered dish suggestions based on health, goals, activities, and enhancements
// @route   POST /api/gemini/dish-suggestions
// @access  Public
const getDishSuggestions = async (req, res) => {
    try {
        const { userProfile, activities = [], meals = [] } = req.body;

        if (!userProfile) {
            return res.status(400).json({
                success: false,
                error: 'User profile is required'
            });
        }

        // Check if API key is configured
        let openai;
        try {
            openai = getOpenAI();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Build context from activities (last 7 days)
        let activityContext = '';
        if (activities && activities.length > 0) {
            const recentActivities = activities.slice(-7);
            const activityCounts = {};
            let totalCalories = 0;
            let totalDuration = 0;
            
            recentActivities.forEach(activity => {
                activityCounts[activity.type] = (activityCounts[activity.type] || 0) + 1;
                totalCalories += activity.calories || 0;
                totalDuration += activity.duration || 0;
            });

            activityContext = `Recent Activity (last 7 days):\n`;
            activityContext += `- Activities logged: ${recentActivities.length}\n`;
            activityContext += `- Total calories burned: ${totalCalories} kcal\n`;
            activityContext += `- Total duration: ${totalDuration} minutes\n`;
            activityContext += `- Activity types: ${Object.entries(activityCounts).map(([type, count]) => `${type} (${count}x)`).join(', ')}\n`;
            activityContext += `- Most frequent activity: ${Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'}\n`;
        } else {
            activityContext = 'No recent activities logged.\n';
        }

        // Build user profile context
        let profileContext = 'User Profile:\n';
        if (userProfile.age) profileContext += `- Age: ${userProfile.age}\n`;
        if (userProfile.gender) profileContext += `- Gender: ${userProfile.gender}\n`;
        if (userProfile.weight) profileContext += `- Weight: ${userProfile.weight} kg\n`;
        if (userProfile.height) profileContext += `- Height: ${userProfile.height} cm\n`;
        if (userProfile.bmi) profileContext += `- BMI: ${userProfile.bmi}\n`;
        if (userProfile.goalType) profileContext += `- Goal: ${userProfile.goalType}\n`;
        if (userProfile.diseases && userProfile.diseases.length > 0) {
            profileContext += `- Health Conditions: ${userProfile.diseases.join(', ')}\n`;
        }
        if (userProfile.allergies && userProfile.allergies.length > 0) {
            profileContext += `- Allergies: ${userProfile.allergies.join(', ')}\n`;
        }
        if (userProfile.dietaryPreference) {
            profileContext += `- Dietary Preference: ${userProfile.dietaryPreference}\n`;
        }
        if (userProfile.exerciseFrequency) {
            profileContext += `- Exercise Frequency: ${userProfile.exerciseFrequency} days/week\n`;
        }
        if (userProfile.occupation) {
            profileContext += `- Activity Level: ${userProfile.occupation}\n`;
        }
        if (userProfile.caloricGoal) {
            profileContext += `- Daily Caloric Goal: ${userProfile.caloricGoal} kcal\n`;
        }
        if (userProfile.macroSplit) {
            profileContext += `- Macro Split: Carbs ${userProfile.macroSplit.carbs}%, Protein ${userProfile.macroSplit.protein}%, Fats ${userProfile.macroSplit.fats}%\n`;
        }
        
        // Optional enhancements
        if (userProfile.sleepHours) {
            profileContext += `- Sleep Hours: ${userProfile.sleepHours} hours/day\n`;
        }
        if (userProfile.stressLevel) {
            profileContext += `- Stress Level: ${userProfile.stressLevel}/10\n`;
        }
        if (userProfile.foodDislikes) {
            profileContext += `- Food Dislikes: ${userProfile.foodDislikes}\n`;
        }
        if (userProfile.preferredCuisines) {
            profileContext += `- Preferred Cuisines: ${userProfile.preferredCuisines}\n`;
        }
        if (userProfile.bloodReports) {
            profileContext += `- Blood Reports Notes: ${userProfile.bloodReports}\n`;
        }

        // Build the prompt
        const prompt = `You are a nutrition and health AI assistant. Suggest 5-6 personalized dish/meal recommendations based on the user's comprehensive profile.

${profileContext}

${activityContext}

IMPORTANT REQUIREMENTS:
1. Focus primarily on:
   - Health information (diseases, conditions, allergies)
   - Goal tracking (weight-loss, muscle-gain, maintain, etc.)
   - Activity logs (what activities they do, how much they exercise)
   - Optional enhancements (sleep, stress, preferences)

2. Consider their activity patterns - if they do high-intensity activities, suggest protein-rich meals. If they're sedentary, suggest lighter options.

3. Respect dietary preferences (vegetarian, vegan, etc.) and allergies - DO NOT suggest foods they're allergic to.

4. Consider their health conditions - suggest appropriate foods (e.g., low sugar for diabetes, low sodium for hypertension).

5. Consider their goals - if weight loss, suggest lower calorie options; if muscle gain, suggest high protein.

6. Make suggestions practical and achievable.

Return ONLY a JSON array of dish suggestions in this format:
[
    {
        "name": "Dish Name",
        "description": "Brief description of the dish and why it's recommended",
        "cuisine": "Cuisine type (e.g., Indian, Mediterranean, Italian)",
        "nutrition": {
            "Calories": "XXX",
            "Protein": "XXg",
            "Carbs": "XXg",
            "Fat": "XXg",
            "Fiber": "XXg"
        },
        "prepTime": "XX min",
        "cookTime": "XX min",
        "tags": ["tag1", "tag2", "tag3"],
        "reason": "Why this dish is recommended based on their profile"
    },
    ...
]

Return ONLY the JSON array, no markdown formatting, no additional text.`;

        const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        console.log(`[ChatGPT] Generating dish suggestions with model: ${modelName}`);
        
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: 'system', content: 'You are a nutrition AI assistant. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const suggestionsText = completion.choices[0].message.content;

        // Clean up and parse the response
        const suggestions = cleanAndParseJSON(suggestionsText);

        console.log(`[ChatGPT] Generated ${Array.isArray(suggestions) ? suggestions.length : 1} dish suggestion(s)`);
        res.json({
            success: true,
            data: Array.isArray(suggestions) ? suggestions : [suggestions]
        });
    } catch (error) {
        console.error('[ChatGPT API Error - Dish Suggestions]', {
            message: error.message,
            stack: error.stack,
            apiKeySet: !!process.env.OPENAI_API_KEY
        });
        
        let errorMessage = 'Failed to get dish suggestions';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('model')) {
            errorMessage = 'OpenAI model not available. Please check API permissions.';
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
    generateDailyPlan,
    getDishSuggestions
};
