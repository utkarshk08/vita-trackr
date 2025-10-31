// Recipe Controller
const Recipe = require('../models/recipeModel');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ isActive: true })
            .sort({ name: 1 });

        res.json({
            success: true,
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe || !recipe.isActive) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Search recipes by name
// @route   GET /api/recipes/search
// @access  Public
const searchRecipes = async (req, res) => {
    try {
        const { name, cuisine, tags } = req.query;
        const query = { isActive: true };

        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (cuisine) {
            query.cuisine = { $regex: cuisine, $options: 'i' };
        }
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        const recipes = await Recipe.find(query).sort({ name: 1 });

        res.json({
            success: true,
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private (Admin only - to be implemented)
const createRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.create(req.body);

        res.status(201).json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private (Admin only - to be implemented)
const updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Admin only - to be implemented)
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                error: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getRecipes,
    getRecipeById,
    searchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe
};

