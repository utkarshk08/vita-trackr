// Weight Controller
const Weight = require('../models/weightModel');

// @desc    Get all weight entries for a user
// @route   GET /api/weights/:userId
// @access  Private
const getWeights = async (req, res) => {
    try {
        const weights = await Weight.find({ userId: req.params.userId })
            .sort({ date: -1 });

        res.json({
            success: true,
            count: weights.length,
            data: weights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get weight entries within date range
// @route   GET /api/weights/:userId/range
// @access  Private
const getWeightsByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.params.userId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const weights = await Weight.find(query)
            .sort({ date: -1 });

        res.json({
            success: true,
            count: weights.length,
            data: weights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get latest weight entry
// @route   GET /api/weights/:userId/latest
// @access  Private
const getLatestWeight = async (req, res) => {
    try {
        const weight = await Weight.findOne({ userId: req.params.userId })
            .sort({ date: -1 });

        if (!weight) {
            return res.status(404).json({
                success: false,
                error: 'No weight data found'
            });
        }

        res.json({
            success: true,
            data: weight
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Create a new weight entry
// @route   POST /api/weights
// @access  Private
const createWeight = async (req, res) => {
    try {
        const weight = await Weight.create(req.body);

        res.status(201).json({
            success: true,
            data: weight
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update a weight entry
// @route   PUT /api/weights/:id
// @access  Private
const updateWeight = async (req, res) => {
    try {
        const weight = await Weight.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!weight) {
            return res.status(404).json({
                success: false,
                error: 'Weight entry not found'
            });
        }

        res.json({
            success: true,
            data: weight
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete a weight entry
// @route   DELETE /api/weights/:id
// @access  Private
const deleteWeight = async (req, res) => {
    try {
        const weight = await Weight.findByIdAndDelete(req.params.id);

        if (!weight) {
            return res.status(404).json({
                success: false,
                error: 'Weight entry not found'
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
    getWeights,
    getWeightsByRange,
    getLatestWeight,
    createWeight,
    updateWeight,
    deleteWeight
};

