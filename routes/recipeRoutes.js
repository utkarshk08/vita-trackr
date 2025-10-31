// Recipe Routes
const express = require('express');
const router = express.Router();
const {
    getRecipes,
    getRecipeById,
    searchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe
} = require('../controllers/recipeController');

router.get('/', getRecipes);
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;

