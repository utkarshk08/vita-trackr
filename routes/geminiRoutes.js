const express = require('express');
const router = express.Router();
const {
    generateRecipeWithGemini,
    generateMultipleRecipesWithGemini,
    suggestRecipeNames
} = require('../controllers/geminiController');

// @route   POST /api/gemini/generate-recipe
router.post('/generate-recipe', generateRecipeWithGemini);

// @route   POST /api/gemini/generate-recipes
router.post('/generate-recipes', generateMultipleRecipesWithGemini);

// @route   POST /api/gemini/suggest-recipes
router.post('/suggest-recipes', suggestRecipeNames);

module.exports = router;

