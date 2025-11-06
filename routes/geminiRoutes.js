const express = require('express');
const router = express.Router();
const {
    generateRecipeWithGemini,
    generateMultipleRecipesWithGemini,
    suggestRecipeNames,
    recommendActivities,
    generateDailyPlan
} = require('../controllers/geminiController');

// @route   POST /api/gemini/generate-recipe
router.post('/generate-recipe', generateRecipeWithGemini);

// @route   POST /api/gemini/generate-recipes
router.post('/generate-recipes', generateMultipleRecipesWithGemini);

// @route   POST /api/gemini/suggest-recipes
router.post('/suggest-recipes', suggestRecipeNames);

// @route   POST /api/gemini/recommend-activities
router.post('/recommend-activities', recommendActivities);

// @route   POST /api/gemini/daily-plan
router.post('/daily-plan', generateDailyPlan);

module.exports = router;

