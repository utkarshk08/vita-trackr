// Intelligent Recipe Recommendation System

// Score-based matching algorithm
function getRecommendedRecipes(userProfile, availableIngredients = []) {
    // console.log('🤖 AI Recommendation System Starting...');
    
    // Log current state (disabled to reduce console spam)
    // console.log('User Profile:', {
    //     goalType: userProfile.goalType,
    //     cuisines: userProfile.preferredCuisines,
    //     dietaryPreference: userProfile.dietaryPreference
    // });
    
    return getRecipesFromDB().then(recipes => {
        if (!recipes || recipes.length === 0) {
            console.error('No recipes found!');
            return [];
        }
        
        // console.log(`📚 Found ${recipes.length} recipes to analyze`);

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

            // 8. Previous Day Activity Analysis (15 points)
            const previousDayActivity = analyzePreviousDayActivity();
            if (previousDayActivity.highCalories && recipe.tags.includes('high-protein')) {
                score += 15;
                reasons.push('High protein for your active yesterday');
            }
            if (previousDayActivity.lightActivity && recipe.tags.includes('light')) {
                score += 10;
                reasons.push('Light meal for your less active day');
            }

            // 9. Previous Day Diet Analysis (20 points) - Balance nutrients
            const previousDayNutrition = analyzePreviousDayNutrition();
            if (previousDayNutrition.needsProtein && recipe.tags.includes('high-protein')) {
                score += 20;
                reasons.push('Protein boost - you had less protein yesterday');
            }
            if (previousDayNutrition.needsFiber && recipe.tags.includes('high-fiber')) {
                score += 15;
                reasons.push('Fiber boost - balance your nutrition');
            }
            if (previousDayNutrition.highCarbs && recipe.tags.includes('low-carb')) {
                score += 10;
                reasons.push('Lower carbs to balance yesterday');
            }

            // 10. Goal-based Recommendations (25 points for primary goal)
            const goalScore = calculateGoalBasedScore(recipe, userProfile);
            score += goalScore;
            if (goalScore > 0) {
                reasons.push(`${userProfile.goalType} goal aligned`);
            }

            // 11. 7-Day Activity Trend Analysis (20 points)
            const weeklyActivity = analyzeWeeklyActivityTrend();
            if (weeklyActivity.increasingActivity && recipe.tags.includes('high-protein')) {
                score += 20;
                reasons.push('Your activity is increasing - protein support needed');
            }
            if (weeklyActivity.decreasingActivity && recipe.tags.includes('moderate-calorie')) {
                score += 15;
                reasons.push('Balanced calories for your decreasing activity');
            }

            // 12. 7-Day Nutrition Balance (15 points)
            const weeklyNutrition = analyzeWeeklyNutritionTrend();
            if (weeklyNutrition.proteinDeficit && recipe.tags.includes('high-protein')) {
                score += 15;
                reasons.push('Your weekly protein is low - boost needed');
            }
            if (weeklyNutrition.fiberDeficit && recipe.tags.includes('high-fiber')) {
                score += 12;
                reasons.push('Weekly fiber needs improvement');
            }

            // 13. Calorie Goal Alignment (25 points)
            const calorieAlignment = checkCalorieGoalAlignment(recipe, userProfile);
            score += calorieAlignment.score;
            if (calorieAlignment.reason) {
                reasons.push(calorieAlignment.reason);
            }

            // 14. Time-based preferences (bonus)
            const currentHour = new Date().getHours();
            if ((currentHour >= 6 && currentHour < 10) && recipe.tags.includes('breakfast')) {
                score += 10;
                reasons.push('Perfect for breakfast time');
            } else if ((currentHour >= 10 && currentHour < 14) && recipe.tags.includes('lunch')) {
                score += 10;
                reasons.push('Great lunch option');
            } else if ((currentHour >= 14 && currentHour < 18) && recipe.tags.includes('snack')) {
                score += 8;
                reasons.push('Perfect snack time');
            } else if ((currentHour >= 18 && currentHour < 22) && recipe.tags.includes('dinner')) {
                score += 10;
                reasons.push('Ideal dinner choice');
            }

            // 15. Variety Bonus - avoid recently eaten dishes (10 points)
            const varietyBonus = checkVarietyBonus(recipe);
            if (varietyBonus) {
                score += 10;
                reasons.push('New dish for variety');
            }

            return { recipe, score, reasons };
        });

        // Filter negative scores and sort by score
        const filteredScored = scoredRecipes
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
        
        // console.log(`✅ Top 6 recommendations selected from ${filteredScored.length} scored recipes`);
        // console.log('Top recommendations:', filteredScored.slice(0, 3).map(r => ({
        //     name: r.recipe.title,
        //     score: r.score,
        //     reasons: r.reasons.slice(0, 3)
        // })));
        
        return filteredScored.slice(0, 6); // Return top 6 recommendations
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
    
    // Fixed goal type values to match backend schema
    switch (userProfile.goalType) {
        case 'weight-loss':
            if (recipeTags.includes('low-carb') || recipeTags.includes('low-fat')) {
                score += 10;
            }
            break;
        case 'weight-gain':
            if (recipeTags.includes('high-protein') || recipeTags.includes('balanced')) {
                score += 10;
            }
            break;
        case 'muscle-gain':
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

// Analyze previous day's activity
function analyzePreviousDayActivity() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayActivities = activities.filter(act => act.date === yesterdayStr);
    const totalCalories = yesterdayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    const totalDuration = yesterdayActivities.reduce((sum, act) => sum + (act.duration || 0), 0);
    
    // Log for debugging (disabled to reduce console spam)
    // console.log('Previous day activity analysis:', {
    //     date: yesterdayStr,
    //     activitiesCount: yesterdayActivities.length,
    //     totalCalories: totalCalories,
    //     highActivity: totalCalories > 300,
    //     lightActivity: totalCalories < 100
    // });
    
    return {
        highCalories: totalCalories > 300,  // More than 300 calories burned
        lightActivity: totalCalories < 100,  // Less than 100 calories
        totalCalories: totalCalories,
        totalDuration: totalDuration
    };
}

// Analyze previous day's nutrition
function analyzePreviousDayNutrition() {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayMeals = meals.filter(meal => meal.date === yesterdayStr);
    
    const totalProtein = yesterdayMeals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0);
    const totalCarbs = yesterdayMeals.reduce((sum, meal) => sum + (parseFloat(meal.carbs) || 0), 0);
    const totalCalories = yesterdayMeals.reduce((sum, meal) => sum + (parseFloat(meal.calories) || 0), 0);
    
    // Analyze nutritional gaps
    const avgProtein = totalProtein / Math.max(1, yesterdayMeals.length);
    const avgCarbs = totalCarbs / Math.max(1, yesterdayMeals.length);
    
    // Log for debugging (disabled to reduce console spam)
    // console.log('Previous day nutrition analysis:', {
    //     date: yesterdayStr,
    //     mealsCount: yesterdayMeals.length,
    //     totalProtein: totalProtein,
    //     totalCarbs: totalCarbs,
    //     totalCalories: totalCalories,
    //     needsProtein: totalProtein < 50 || avgProtein < 15,
    //     highCarbs: totalCarbs > 200 || avgCarbs > 50
    // });
    
    return {
        needsProtein: totalProtein < 50 || avgProtein < 15,  // Less than 50g total or 15g per meal
        needsFiber: true,  // Always good to have more fiber
        highCarbs: totalCarbs > 200 || avgCarbs > 50,  // More than 200g total or 50g per meal
        totalCalories: totalCalories,
        totalProtein: totalProtein,
        totalCarbs: totalCarbs
    };
}

// Calculate goal-based score
function calculateGoalBasedScore(recipe, userProfile) {
    if (!userProfile.goalType) return 0;
    
    const recipeTags = recipe.tags || [];
    let score = 0;
    
    switch (userProfile.goalType) {
        case 'weight-loss':
            // For weight loss: prefer low-carb, low-fat, high-protein
            if (recipeTags.includes('low-carb')) score += 15;
            if (recipeTags.includes('low-fat')) score += 10;
            if (recipeTags.includes('high-protein')) score += 10;
            if (recipeTags.includes('low-calorie')) score += 10;
            break;
        case 'weight-gain':
            // For weight gain: prefer high-calorie, balanced, protein
            if (recipeTags.includes('balanced')) score += 15;
            if (recipeTags.includes('high-protein')) score += 10;
            if (recipeTags.includes('calorie-rich')) score += 15;
            break;
        case 'muscle-gain':
            // For muscle gain: heavily favor high-protein
            if (recipeTags.includes('high-protein')) score += 25;
            if (recipeTags.includes('balanced')) score += 5;
            break;
        case 'maintain':
            // For maintenance: prefer balanced nutrition
            if (recipeTags.includes('balanced')) score += 20;
            if (recipeTags.includes('high-fiber')) score += 10;
            break;
    }
    
    return score;
}

// Analyze weekly activity trends
function analyzeWeeklyActivityTrend() {
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    const dailyCalories = last7Days.map(date => {
        const dayActivities = activities.filter(act => act.date === date);
        return dayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    });
    
    // Calculate trend
    const firstHalf = dailyCalories.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = dailyCalories.slice(3).reduce((a, b) => a + b, 0) / 4;
    
    const result = {
        increasingActivity: secondHalf > firstHalf * 1.2,  // 20% increase
        decreasingActivity: secondHalf < firstHalf * 0.8,   // 20% decrease
        averageDailyCalories: dailyCalories.reduce((a, b) => a + b, 0) / 7
    };
    
    // console.log('Weekly Activity Trend:', result);
    
    return result;
}

// Analyze weekly nutrition trends
function analyzeWeeklyNutritionTrend() {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalCalories = 0;
    let daysWithMeals = 0;
    
    last7Days.forEach(date => {
        const dayMeals = meals.filter(meal => meal.date === date);
        if (dayMeals.length > 0) {
            daysWithMeals++;
            totalProtein += dayMeals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0);
            totalCarbs += dayMeals.reduce((sum, meal) => sum + (parseFloat(meal.carbs) || 0), 0);
            totalCalories += dayMeals.reduce((sum, meal) => sum + (parseFloat(meal.calories) || 0), 0);
        }
    });
    
    const avgDailyProtein = daysWithMeals > 0 ? totalProtein / daysWithMeals : 0;
    
    const result = {
        proteinDeficit: avgDailyProtein < 60,  // Less than 60g protein per day average
        fiberDeficit: true,  // Always recommend fiber
        averageDailyCalories: daysWithMeals > 0 ? totalCalories / daysWithMeals : 0,
        avgDailyProtein: avgDailyProtein
    };
    
    // console.log('Weekly Nutrition Trend:', result);
    
    return result;
}

// Check calorie goal alignment
function checkCalorieGoalAlignment(recipe, userProfile) {
    if (!userProfile.caloricGoal || !recipe.nutrition || !recipe.nutrition.Calories) return { score: 0 };
    
    const mealCalories = parseInt(recipe.nutrition.Calories) || 0;
    const dailyGoal = parseInt(userProfile.caloricGoal) || 2000;
    const mealGoal = dailyGoal / 3; // Approximate per meal goal
    
    // For weight loss: prefer slightly lower calorie meals
    if (userProfile.goalType === 'weight-loss') {
        if (mealCalories <= mealGoal * 0.85) {
            return { score: 25, reason: 'Perfect calorie range for weight loss' };
        } else if (mealCalories <= mealGoal) {
            return { score: 15, reason: 'Good calorie control for your goal' };
        }
    }
    
    // For weight gain or muscle gain: need sufficient calories
    if (userProfile.goalType === 'weight-gain' || userProfile.goalType === 'muscle-gain') {
        if (mealCalories >= mealGoal * 1.1) {
            return { score: 20, reason: 'Calorie-dense for your goals' };
        } else if (mealCalories >= mealGoal) {
            return { score: 10, reason: 'Adequate calories for goals' };
        }
    }
    
    // For maintain: balanced calories
    if (userProfile.goalType === 'maintain') {
        if (mealCalories >= mealGoal * 0.9 && mealCalories <= mealGoal * 1.1) {
            return { score: 20, reason: 'Balanced calories for maintenance' };
        }
    }
    
    return { score: 0 };
}

// Check variety bonus (avoid recently eaten dishes)
function checkVarietyBonus(recipe) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    });
    
    // Check if this dish was eaten recently
    const recentlyEaten = meals.some(meal => 
        last7Days.includes(meal.date) && 
        meal.name && 
        meal.name.toLowerCase().includes(recipe.title.toLowerCase().split(' ')[0])
    );
    
    return !recentlyEaten;
}

