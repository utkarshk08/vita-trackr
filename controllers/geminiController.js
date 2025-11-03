// Gemini AI Controller for Recipe Generation
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// @desc    Generate recipe using Gemini AI
// @route   POST /api/gemini/generate-recipe
// @access  Public
const generateRecipeWithGemini = async (req, res) => {
    try {
        const { ingredients, recipeName, userProfile } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key not configured'
            });
        }

        // Build the prompt
        let prompt = '';
        if (recipeName) {
            prompt = `Generate a detailed recipe for "${recipeName}"`;
        } else if (ingredients && ingredients.length > 0) {
            prompt = `Generate a detailed recipe using these ingredients: ${ingredients.join(', ')}`;
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

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let recipeText = response.text();

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
        console.error('Gemini API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate recipe with Gemini AI'
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

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key not configured'
            });
        }

        const prompt = `Generate ${count} different recipe variations using these ingredients: ${ingredients.join(', ')}.

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

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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

        res.json({
            success: true,
            data: Array.isArray(recipes) ? recipes : [recipes]
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate recipes with Gemini AI'
        });
    }
};

module.exports = {
    generateRecipeWithGemini,
    generateMultipleRecipesWithGemini
};

