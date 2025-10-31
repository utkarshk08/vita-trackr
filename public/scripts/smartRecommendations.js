// Intelligent Recipe Recommendation System

// Score-based matching algorithm
function getRecommendedRecipes(userProfile, availableIngredients = []) {
    return getRecipesFromDB().then(recipes => {
        if (!recipes || recipes.length === 0) {
            return [];
        }

        // Score each recipe based on multiple factors
        const scoredRecipes = recipes.map(recipe => {
            let score = 0;
            const reasons = [];

            // 1. Cuisine Preference Match (40 points)
            const preferredCuisines = userProfile.preferredCuisines 
                ? userProfile.preferredCuisines.toLowerCase().split(',').map(c => c.trim())
                : [];
            
            if (preferredCuisines.some(cuisine => recipe.cuisine.toLowerCase().includes(cuisine))) {
                score += 40;
                reasons.push(`${recipe.cuisine} cuisine match`);
            }

            // 2. Health Condition Match (30 points)
            const autoRecommendation = determineAutoRecommendationFromProfile(userProfile);
            if (recipe.healthCondition && recipe.healthCondition.includes(autoRecommendation.type)) {
                score += 30;
                reasons.push('Health condition match');
            }

            // 3. Dietary Preference Match (25 points)
            if (recipe.dietaryPreference && recipe.dietaryPreference.includes(userProfile.dietaryPreference)) {
                score += 25;
                reasons.push('Dietary preference match');
            }

            // 4. Allergy & Disease Filter
            const allergies = userProfile.allergies || [];
            const diseases = userProfile.diseases || [];
            
            if (isRecipeSafe(recipe, allergies, diseases)) {
                // Continue scoring
            } else {
                return { recipe, score: -100, reasons: ['Contains allergens or incompatible ingredients'] };
            }

            // 5. Food Dislikes Filter
            const foodDislikes = userProfile.foodDislikes 
                ? userProfile.foodDislikes.toLowerCase().split(',').map(f => f.trim())
                : [];
            
            if (hasDislikedFood(recipe, foodDislikes)) {
                score -= 20;
                reasons.push('Contains disliked food');
            }

            // 6. Ingredient Availability (15 points)
            if (availableIngredients.length > 0) {
                const matchingIngredients = countMatchingIngredients(recipe.ingredients, availableIngredients);
                score += Math.min(15, matchingIngredients * 3);
                if (matchingIngredients > 0) {
                    reasons.push(`${matchingIngredients} matching ingredients`);
                }
            }

            // 7. Nutritional Alignment (10 points)
            const nutritionalAlignment = checkNutritionalAlignment(recipe, userProfile);
            score += nutritionalAlignment;
            if (nutritionalAlignment > 0) {
                reasons.push('Nutritional goals aligned');
            }

            // 8. Activity-based Protein Needs (5 points)
            const recentCalories = getRecentActivityCalories();
            if (recentCalories > 1500 && recipe.tags.includes('high-protein')) {
                score += 5;
                reasons.push('High protein for recovery');
            }

            // 9. Time-based preferences (bonus)
            const currentHour = new Date().getHours();
            if ((currentHour >= 6 && currentHour < 10) && recipe.tags.includes('breakfast')) {
                score += 10;
                reasons.push('Perfect for breakfast time');
            }

            return { recipe, score, reasons };
        });

        // Filter negative scores and sort by score
        return scoredRecipes
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6); // Return top 6 recommendations
    });
}

// Helper function: Check if recipe is safe for user
function isRecipeSafe(recipe, allergies, diseases) {
    const recipeTags = recipe.tags || [];
    const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase()).join(' ');
    
    // Check allergies
    for (const allergy of allergies) {
        const allergyLower = allergy.toLowerCase();
        if (recipeTags.includes(allergyLower) || recipeIngredients.includes(allergyLower)) {
            return false;
        }
    }

    // Check disease-specific contraindications
    const diseaseLower = diseases.map(d => d.toLowerCase());
    
    if (diseaseLower.includes('diabetes') && recipe.tags && recipe.tags.includes('high-sugar')) {
        return false;
    }
    
    if (diseaseLower.includes('hypertension') && recipe.tags && recipe.tags.includes('high-sodium')) {
        return false;
    }

    return true;
}

// Helper function: Check if recipe has disliked foods
function hasDislikedFood(recipe, dislikes) {
    const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase()).join(' ');
    return dislikes.some(dislike => recipeIngredients.includes(dislike.toLowerCase()));
}

// Helper function: Count matching ingredients
function countMatchingIngredients(recipeIngredients, availableIngredients) {
    let matches = 0;
    const availableLower = availableIngredients.map(i => i.toLowerCase().trim());
    
    recipeIngredients.forEach(ingredient => {
        const ingredientLower = ingredient.toLowerCase().trim();
        if (availableLower.some(avail => avail.includes(ingredientLower) || ingredientLower.includes(avail))) {
            matches++;
        }
    });

    return matches;
}

// Helper function: Check nutritional alignment
function checkNutritionalAlignment(recipe, userProfile) {
    let score = 0;

    if (!userProfile.goalType) return 0;

    const recipeTags = recipe.tags || [];
    
    switch (userProfile.goalType) {
        case 'weightLoss':
            if (recipeTags.includes('low-carb') || recipeTags.includes('low-fat')) {
                score += 10;
            }
            break;
        case 'weightGain':
            if (recipeTags.includes('high-protein') || recipeTags.includes('balanced')) {
                score += 10;
            }
            break;
        case 'muscleGain':
            if (recipeTags.includes('high-protein')) {
                score += 10;
            }
            break;
        case 'maintain':
            if (recipeTags.includes('balanced')) {
                score += 10;
            }
            break;
    }

    return score;
}

// Helper function: Get recent activity calories
function getRecentActivityCalories() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return activities
        .filter(act => new Date(act.date) >= sevenDaysAgo)
        .reduce((sum, act) => sum + (act.calories || 0), 0);
}

// Helper function: Determine recommendation from profile
function determineAutoRecommendationFromProfile(userProfile) {
    const diseases = userProfile.diseases || [];
    
    let recommendationType = 'balanced';
    
    if (diseases.some(d => ['diabetes', 'diabetic'].includes(d.toLowerCase()))) {
        recommendationType = 'low-sugar';
    } else if (diseases.some(d => ['hypertension', 'high blood pressure'].includes(d.toLowerCase()))) {
        recommendationType = 'low-sodium';
    } else if (diseases.some(d => ['obesity', 'overweight', 'weight loss'].includes(d.toLowerCase()))) {
        recommendationType = 'low-carb';
    } else if (diseases.some(d => ['high cholesterol'].includes(d.toLowerCase()))) {
        recommendationType = 'low-fat';
    }

    const recentCalories = getRecentActivityCalories();
    if (recentCalories > 2000) {
        if (recommendationType === 'balanced') {
            recommendationType = 'high-protein';
        }
    }

    return { type: recommendationType };
}

// Generate smart dish suggestions based on profile
function generateSmartDishSuggestions(userProfile) {
    return getRecommendedRecipes(userProfile).then(recommendations => {
        return recommendations.map(rec => ({
            name: rec.recipe.title,
            description: generateSmartDescription(rec.recipe, rec.reasons),
            nutrition: rec.recipe.nutrition,
            cuisine: rec.recipe.cuisine,
            matchScore: rec.score,
            matchReasons: rec.reasons,
            tags: rec.recipe.tags,
            prepTime: rec.recipe.prepTime,
            cookTime: rec.recipe.cookTime
        }));
    });
}

// Generate intelligent description based on matching factors
function generateSmartDescription(recipe, reasons) {
    let description = '';
    
    if (reasons.some(r => r.includes('cuisine'))) {
        description += `Authentic ${recipe.cuisine} cuisine. `;
    }
    
    if (reasons.some(r => r.includes('Health condition'))) {
        description += 'Perfectly aligned with your health goals. ';
    }
    
    if (reasons.some(r => r.includes('ingredients'))) {
        description += 'Matches your available ingredients. ';
    }
    
    // Add nutritional highlights
    const tags = recipe.tags || [];
    if (tags.includes('high-protein')) {
        description += 'Rich in protein for muscle recovery. ';
    }
    if (tags.includes('high-fiber')) {
        description += 'High fiber for better digestion. ';
    }
    if (tags.includes('low-carb')) {
        description += 'Low carb for weight management. ';
    }
    if (tags.includes('quick')) {
        description += 'Quick to prepare. ';
    }

    return description.trim() || 'Delicious and nutritious meal option.';
}

// Get recipe details for display
function getRecipeDetails(recipeId) {
    return getRecipesFromDB().then(recipes => {
        return recipes.find(r => r.id === recipeId);
    });
}

