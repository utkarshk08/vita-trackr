// Nutrition API Controller for Food Nutrition Lookups
// Supports multiple nutrition APIs: Edamam, Spoonacular, Nutritionix, or custom API

// Node.js 18+ has built-in fetch, no need for external library

/**
 * Get nutrition information for a food item
 * Supports multiple API providers
 */
const getFoodNutrition = async (req, res) => {
    try {
        const { foodName, quantity = 100, quantityType = 'grams' } = req.body;

        if (!foodName) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a food name'
            });
        }

        // Try different API providers based on what's configured
        let nutritionData = null;

        // Option 1: Edamam Food Database API
        if (process.env.EDAMAM_APP_ID && process.env.EDAMAM_APP_KEY) {
            nutritionData = await getNutritionFromEdamam(foodName, quantity);
        }
        // Option 2: Spoonacular API
        else if (process.env.SPOONACULAR_API_KEY) {
            nutritionData = await getNutritionFromSpoonacular(foodName, quantity);
        }
        // Option 3: Nutritionix API
        else if (process.env.NUTRITIONIX_APP_ID && process.env.NUTRITIONIX_API_KEY) {
            nutritionData = await getNutritionFromNutritionix(foodName, quantity);
        }
        // Option 4: Custom API endpoint
        else if (process.env.CUSTOM_NUTRITION_API_URL && process.env.CUSTOM_NUTRITION_API_KEY) {
            nutritionData = await getNutritionFromCustomAPI(foodName, quantity);
        }
        // Option 5: Use ChatGPT AI as fallback
        else if (process.env.OPENAI_API_KEY) {
            nutritionData = await getNutritionFromChatGPT(foodName, quantity);
        }

        if (!nutritionData) {
            return res.status(404).json({
                success: false,
                error: 'Nutrition data not found. Please configure a nutrition API or add the food to your database.'
            });
        }

        // Adjust nutrition based on quantity type
        if (quantityType === 'servings' && nutritionData.servingSize) {
            const multiplier = quantity / nutritionData.servingSize;
            nutritionData.calories = Math.round(nutritionData.calories * multiplier);
            nutritionData.protein = Math.round(nutritionData.protein * multiplier * 10) / 10;
            nutritionData.carbs = Math.round(nutritionData.carbs * multiplier * 10) / 10;
            nutritionData.fats = Math.round(nutritionData.fats * multiplier * 10) / 10;
            if (nutritionData.fiber) nutritionData.fiber = Math.round(nutritionData.fiber * multiplier * 10) / 10;
            if (nutritionData.sugar) nutritionData.sugar = Math.round(nutritionData.sugar * multiplier * 10) / 10;
        }

        res.json({
            success: true,
            data: nutritionData
        });
    } catch (error) {
        console.error('Nutrition API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get nutrition information'
        });
    }
};

// Edamam Food Database API
async function getNutritionFromEdamam(foodName, quantity) {
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;
    const url = `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(foodName)}&app_id=${appId}&app_key=${appKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.hints && data.hints.length > 0) {
        const food = data.hints[0].food;
        const nutrients = food.nutrients;

        // Calculate per 100g values
        const multiplier = quantity / 100;

        return {
            name: food.label,
            calories: Math.round(nutrients.ENERC_KCAL * multiplier),
            protein: Math.round(nutrients.PROCNT * multiplier * 10) / 10,
            carbs: Math.round(nutrients.CHOCDF * multiplier * 10) / 10,
            fats: Math.round(nutrients.FAT * multiplier * 10) / 10,
            fiber: nutrients.FIBTG ? Math.round(nutrients.FIBTG * multiplier * 10) / 10 : 0,
            sugar: nutrients.SUGAR ? Math.round(nutrients.SUGAR * multiplier * 10) / 10 : 0,
            servingSize: 100
        };
    }

    return null;
}

// Spoonacular API
async function getNutritionFromSpoonacular(foodName, quantity) {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(foodName)}&apiKey=${apiKey}&number=1`;

    const searchResponse = await fetch(url);
    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
        const ingredientId = searchData.results[0].id;
        const nutritionUrl = `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=${quantity}&unit=grams&apiKey=${apiKey}`;

        const nutritionResponse = await fetch(nutritionUrl);
        const nutritionData = await nutritionResponse.json();

        if (nutritionData.nutrition) {
            const nutrients = nutritionData.nutrition;
            return {
                name: nutritionData.name,
                calories: Math.round(nutrients.calories || 0),
                protein: Math.round((nutrients.protein || 0) * 10) / 10,
                carbs: Math.round((nutrients.carbs || 0) * 10) / 10,
                fats: Math.round((nutrients.fat || 0) * 10) / 10,
                fiber: nutrients.fiber ? Math.round(nutrients.fiber * 10) / 10 : 0,
                sugar: nutrients.sugar ? Math.round(nutrients.sugar * 10) / 10 : 0,
                servingSize: quantity
            };
        }
    }

    return null;
}

// Nutritionix API
async function getNutritionFromNutritionix(foodName, quantity) {
    const appId = process.env.NUTRITIONIX_APP_ID;
    const apiKey = process.env.NUTRITIONIX_API_KEY;
    const url = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-app-id': appId,
            'x-app-key': apiKey
        },
        body: JSON.stringify({
            query: `${quantity}g ${foodName}`
        })
    });

    const data = await response.json();

    if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        return {
            name: food.food_name,
            calories: Math.round(food.nf_calories || 0),
            protein: Math.round((food.nf_protein || 0) * 10) / 10,
            carbs: Math.round((food.nf_total_carbohydrate || 0) * 10) / 10,
            fats: Math.round((food.nf_total_fat || 0) * 10) / 10,
            fiber: food.nf_dietary_fiber ? Math.round(food.nf_dietary_fiber * 10) / 10 : 0,
            sugar: food.nf_sugars ? Math.round(food.nf_sugars * 10) / 10 : 0,
            servingSize: food.serving_weight_grams || quantity
        };
    }

    return null;
}

// Custom API endpoint
async function getNutritionFromCustomAPI(foodName, quantity) {
    const apiUrl = process.env.CUSTOM_NUTRITION_API_URL;
    const apiKey = process.env.CUSTOM_NUTRITION_API_KEY;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey
        },
        body: JSON.stringify({
            food: foodName,
            quantity: quantity
        })
    });

    if (!response.ok) {
        throw new Error(`Custom API returned ${response.status}`);
    }

    const data = await response.json();

    // Expect format: { calories, protein, carbs, fats, fiber?, sugar? }
    if (data.calories !== undefined) {
        return {
            name: data.name || foodName,
            calories: Math.round(data.calories || 0),
            protein: Math.round((data.protein || 0) * 10) / 10,
            carbs: Math.round((data.carbs || 0) * 10) / 10,
            fats: Math.round((data.fats || 0) * 10) / 10,
            fiber: data.fiber ? Math.round(data.fiber * 10) / 10 : 0,
            sugar: data.sugar ? Math.round(data.sugar * 10) / 10 : 0,
            servingSize: data.servingSize || quantity
        };
    }

    return null;
}

// ChatGPT AI fallback for nutrition estimation
async function getNutritionFromChatGPT(foodName, quantity) {
    const OpenAI = require('openai');
    
    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key not configured');
    }
    
    const openai = new OpenAI({ apiKey });

    const prompt = `Estimate the nutritional information for ${quantity}g of ${foodName}. 

Return ONLY a JSON object in this exact format:
{
    "calories": number,
    "protein": number (in grams),
    "carbs": number (in grams),
    "fats": number (in grams),
    "fiber": number (in grams, optional),
    "sugar": number (in grams, optional)
}

Make realistic estimates based on common nutritional values. Return ONLY the JSON, no markdown formatting.`;

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
            { role: 'system', content: 'You are a nutrition estimation AI. Always respond with valid JSON only.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500
    });

    let nutritionText = completion.choices[0].message.content.trim();

    // Clean up response
    if (nutritionText.startsWith('```json')) {
        nutritionText = nutritionText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (nutritionText.startsWith('```')) {
        nutritionText = nutritionText.replace(/```\n?/g, '');
    }

    const nutrition = JSON.parse(nutritionText);

    return {
        name: foodName,
        calories: Math.round(nutrition.calories || 0),
        protein: Math.round((nutrition.protein || 0) * 10) / 10,
        carbs: Math.round((nutrition.carbs || 0) * 10) / 10,
        fats: Math.round((nutrition.fats || 0) * 10) / 10,
        fiber: nutrition.fiber ? Math.round(nutrition.fiber * 10) / 10 : 0,
        sugar: nutrition.sugar ? Math.round(nutrition.sugar * 10) / 10 : 0,
        servingSize: quantity
    };
}

module.exports = {
    getFoodNutrition
};

