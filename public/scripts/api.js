// API Utility Functions for VitaTrackr
// Centralized API calls to backend

const API_BASE_URL = '/api';

// Global state
let currentUserId = localStorage.getItem('currentUserId') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== USER API ====================

async function registerUser(username, email, password) {
    const data = await apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    
    // Store user info
    currentUserId = data.data.userId;
    currentUser = data.data;
    localStorage.setItem('currentUserId', currentUserId);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return data.data;
}

async function loginUser(username, password) {
    const data = await apiCall('/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    
    // Store user info
    currentUserId = data.data.userId;
    currentUser = data.data;
    localStorage.setItem('currentUserId', currentUserId);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return data.data;
}

async function getUserProfile() {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/users/${currentUserId}`);
    return data.data;
}

async function updateUserProfile(profileData) {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/users/${currentUserId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
    return data.data;
}

async function getUserDashboard() {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/users/${currentUserId}/dashboard`);
    return data.data;
}

function logoutUser() {
    currentUserId = null;
    currentUser = {};
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
}

// ==================== ACTIVITY API ====================

async function getActivities() {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/activities/${currentUserId}`);
    return data.data;
}

async function getActivitiesByRange(startDate, endDate) {
    if (!currentUserId) throw new Error('No user logged in');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const data = await apiCall(`/activities/${currentUserId}/range?${params.toString()}`);
    return data.data;
}

async function createActivity(activityData) {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall('/activities', {
        method: 'POST',
        body: JSON.stringify({
            ...activityData,
            userId: currentUserId
        })
    });
    return data.data;
}

async function updateActivity(activityId, activityData) {
    const data = await apiCall(`/activities/${activityId}`, {
        method: 'PUT',
        body: JSON.stringify(activityData)
    });
    return data.data;
}

async function deleteActivity(activityId) {
    await apiCall(`/activities/${activityId}`, {
        method: 'DELETE'
    });
}

// ==================== MEAL API ====================

async function getMeals() {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/meals/${currentUserId}`);
    return data.data;
}

async function getMealsByRange(startDate, endDate) {
    if (!currentUserId) throw new Error('No user logged in');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const data = await apiCall(`/meals/${currentUserId}/range?${params.toString()}`);
    return data.data;
}

async function getMealsByType(type) {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/meals/${currentUserId}/type/${type}`);
    return data.data;
}

async function createMeal(mealData) {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall('/meals', {
        method: 'POST',
        body: JSON.stringify({
            ...mealData,
            userId: currentUserId
        })
    });
    return data.data;
}

async function updateMeal(mealId, mealData) {
    const data = await apiCall(`/meals/${mealId}`, {
        method: 'PUT',
        body: JSON.stringify(mealData)
    });
    return data.data;
}

async function deleteMeal(mealId) {
    await apiCall(`/meals/${mealId}`, {
        method: 'DELETE'
    });
}

// ==================== WEIGHT API ====================

async function getWeights() {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/weights/${currentUserId}`);
    return data.data;
}

async function getWeightsByRange(startDate, endDate) {
    if (!currentUserId) throw new Error('No user logged in');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const data = await apiCall(`/weights/${currentUserId}/range?${params.toString()}`);
    return data.data;
}

async function getLatestWeight() {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall(`/weights/${currentUserId}/latest`);
    return data.data;
}

async function createWeight(weightData) {
    if (!currentUserId) throw new Error('No user logged in');
    const data = await apiCall('/weights', {
        method: 'POST',
        body: JSON.stringify({
            ...weightData,
            userId: currentUserId
        })
    });
    return data.data;
}

async function updateWeight(weightId, weightData) {
    const data = await apiCall(`/weights/${weightId}`, {
        method: 'PUT',
        body: JSON.stringify(weightData)
    });
    return data.data;
}

async function deleteWeight(weightId) {
    await apiCall(`/weights/${weightId}`, {
        method: 'DELETE'
    });
}

// ==================== RECIPE API ====================

async function getRecipes() {
    const data = await apiCall('/recipes');
    return data.data;
}

async function getRecipeById(recipeId) {
    const data = await apiCall(`/recipes/${recipeId}`);
    return data.data;
}

async function searchRecipes(query) {
    const params = new URLSearchParams();
    if (query.name) params.append('name', query.name);
    if (query.cuisine) params.append('cuisine', query.cuisine);
    if (query.tags) params.append('tags', query.tags);
    
    const data = await apiCall(`/recipes/search?${params.toString()}`);
    return data.data;
}

// ==================== GEMINI AI API ====================

async function generateRecipeWithGemini(ingredients, recipeName, userProfile = null) {
    const data = await apiCall('/gemini/generate-recipe', {
        method: 'POST',
        body: JSON.stringify({ ingredients, recipeName, userProfile })
    });
    return data.data;
}

async function generateMultipleRecipesWithGemini(ingredients, count = 3) {
    const data = await apiCall('/gemini/generate-recipes', {
        method: 'POST',
        body: JSON.stringify({ ingredients, count })
    });
    return data.data;
}

async function suggestRecipeNames(ingredients = []) {
    try {
        const data = await apiCall('/gemini/suggest-recipes', {
            method: 'POST',
            body: JSON.stringify({ ingredients })
        });
        return data.data;
    } catch (error) {
        // Re-throw with more context
        if (error.message && error.message.includes('API key')) {
            throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file');
        }
        throw error;
    }
}

// ==================== NUTRITION API ====================

async function getFoodNutrition(foodName, quantity = 100, quantityType = 'grams') {
    const data = await apiCall('/nutrition/lookup', {
        method: 'POST',
        body: JSON.stringify({ foodName, quantity, quantityType })
    });
    return data.data;
}

// Export all functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // User
        registerUser,
        loginUser,
        getUserProfile,
        updateUserProfile,
        getUserDashboard,
        logoutUser,
        // Activity
        getActivities,
        getActivitiesByRange,
        createActivity,
        updateActivity,
        deleteActivity,
        // Meal
        getMeals,
        getMealsByRange,
        getMealsByType,
        createMeal,
        updateMeal,
        deleteMeal,
        // Weight
        getWeights,
        getWeightsByRange,
        getLatestWeight,
        createWeight,
        updateWeight,
        deleteWeight,
        // Recipe
        getRecipes,
        getRecipeById,
        searchRecipes,
        // Gemini AI
        generateRecipeWithGemini,
        generateMultipleRecipesWithGemini
    };
}

