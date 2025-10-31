// Activity Controller
const Activity = require('../models/activityModel');

// @desc    Get all activities for a user
// @route   GET /api/activities/:userId
// @access  Private
const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.params.userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get activities within date range
// @route   GET /api/activities/:userId/range
// @access  Private
const getActivitiesByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.params.userId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const activities = await Activity.find(query)
            .sort({ date: -1 });

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
    try {
        const activity = await Activity.create(req.body);

        res.status(201).json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Activity not found'
            });
        }

        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Activity not found'
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
    getActivities,
    getActivitiesByRange,
    createActivity,
    updateActivity,
    deleteActivity
};

