// User Controller
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Meal = require('../models/mealModel');
const Weight = require('../models/weightModel');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username or email already exists' 
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password // TODO: Hash password before saving
        });

        res.status(201).json({
            success: true,
            data: {
                userId: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                isSetupComplete: user.isSetupComplete,
                subscriptionStatus: user.subscriptionStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/:userId/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.params.userId;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        const [user, activities, meals, weight] = await Promise.all([
            User.findById(userId).select('-password'),
            Activity.find({ userId, date: { $gte: startDate } }),
            Meal.find({ userId, date: { $gte: startDate } }),
            Weight.findOne({ userId }).sort({ date: -1 })
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Calculate stats
        const totalCaloriesBurned = activities.reduce((sum, a) => sum + a.calories, 0);
        const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
        const avgProtein = meals.length > 0 
            ? meals.reduce((sum, m) => sum + m.protein, 0) / meals.length 
            : 0;

        res.json({
            success: true,
            data: {
                user,
                stats: {
                    totalActivities: activities.length,
                    totalMeals: meals.length,
                    totalCaloriesBurned,
                    totalCaloriesConsumed,
                    calorieBalance: totalCaloriesConsumed - totalCaloriesBurned,
                    avgProteinPerMeal: avgProtein,
                    currentWeight: weight ? weight.weight : user.weight
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserDashboard
};

