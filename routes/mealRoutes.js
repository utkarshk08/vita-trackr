// Meal Routes
const express = require('express');
const router = express.Router();
const {
    getMeals,
    getMealsByRange,
    getMealsByType,
    createMeal,
    updateMeal,
    deleteMeal
} = require('../controllers/mealController');

router.get('/:userId', getMeals);
router.get('/:userId/range', getMealsByRange);
router.get('/:userId/type/:type', getMealsByType);
router.post('/', createMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;

