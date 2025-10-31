// Weight Model Schema
const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 10,
        max: 500
    },
    bodyFat: {
        type: Number,
        min: 0,
        max: 100
    },
    muscleMass: {
        type: Number,
        min: 0
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
weightSchema.index({ userId: 1, date: -1 });
weightSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Weight', weightSchema);

