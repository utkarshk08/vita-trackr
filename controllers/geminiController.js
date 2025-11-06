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
        throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file and restart the server.');
    }
    
    if (apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
        console.error('[Gemini] API key is placeholder or empty');
        throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file and restart the server.');
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
                error: error.message || 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file and restart the server.'
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
                error: error.message || 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file and restart the server.'
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
            errorMessage = 'Gemini API key not configured or invalid. Please add GEMINI_API_KEY to your .env file and restart the server.';
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
                error: error.message || 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file and restart the server.'
            });
        }

        // Build prompt for recipe name suggestions only
        let prompt = '';
        if (ingredients && ingredients.length > 0) {
            prompt = `Suggest 2-3 creative recipe names that can be made using these ingredients: ${ingredients.join(', ')}.
            
Return ONLY a JSON array of recipe names (strings), like this:
["Recipe Name 1", "Recipe Name 2", "Recipe Name 3"]

Make the names creative, appetizing, and suitable for the given ingredients. Return ONLY the JSON array, no markdown formatting, no additional text.`;
        } else {
            prompt = `Suggest 2-3 popular and delicious recipe names that are commonly enjoyed.

Return ONLY a JSON array of recipe names (strings), like this:
["Recipe Name 1", "Recipe Name 2", "Recipe Name 3"]

Make the names creative and appetizing. Return ONLY the JSON array, no markdown formatting, no additional text.`;
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

        // Ensure we only return 2-3 recipes
        const limitedSuggestions = Array.isArray(suggestions) 
            ? suggestions.slice(0, 3) 
            : [suggestions].slice(0, 3);

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
            errorMessage = 'Gemini API key not configured or invalid. Please add GEMINI_API_KEY to your .env file and restart the server.';
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
    suggestRecipeNames
};

