// Meal Controller
const Meal = require('../models/mealModel');

// @desc    Get all meals for a user
// @route   GET /api/meals/:userId
// @access  Private
const getMeals = async (req, res) => {
    try {
        const meals = await Meal.find({ userId: req.params.userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: meals.length,
            data: meals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get meals within date range
// @route   GET /api/meals/:userId/range
// @access  Private
const getMealsByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.params.userId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const meals = await Meal.find(query)
            .sort({ date: -1 });

        res.json({
            success: true,
            count: meals.length,
            data: meals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get meals by type
// @route   GET /api/meals/:userId/type/:type
// @access  Private
const getMealsByType = async (req, res) => {
    try {
        const meals = await Meal.find({
            userId: req.params.userId,
            type: req.params.type
        })
        .sort({ date: -1 });

        res.json({
            success: true,
            count: meals.length,
            data: meals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create a new meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res) => {
    try {
        const meal = await Meal.create(req.body);

        res.status(201).json({
            success: true,
            data: meal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res) => {
    try {
        const meal = await Meal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!meal) {
            return res.status(404).json({
                success: false,
                error: 'Meal not found'
            });
        }

        res.json({
            success: true,
            data: meal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
    try {
        const meal = await Meal.findByIdAndDelete(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                error: 'Meal not found'
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
    getMeals,
    getMealsByRange,
    getMealsByType,
    createMeal,
    updateMeal,
    deleteMeal
};

