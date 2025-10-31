// Activity Model Schema
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    calories: {
        type: Number,
        required: true,
        min: 0
    },
    distance: {
        type: Number,
        min: 0
    },
    intensity: {
        type: String,
        enum: ['light', 'moderate', 'vigorous'],
        default: 'moderate'
    },
    notes: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
activitySchema.index({ userId: 1, date: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

