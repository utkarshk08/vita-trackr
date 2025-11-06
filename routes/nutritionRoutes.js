const express = require('express');
const router = express.Router();
const { getFoodNutrition } = require('../controllers/nutritionController');

// @route   POST /api/nutrition/lookup
// @desc    Get nutrition information for a food item
// @access  Public
router.post('/lookup', getFoodNutrition);

module.exports = router;

