// Meal Model Schema
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    quantityType: {
        type: String,
        required: true,
        enum: ['grams', 'servings'],
        default: 'grams'
    },
    calories: {
        type: Number,
        required: true,
        min: 0
    },
    protein: {
        type: Number,
        required: true,
        min: 0
    },
    carbs: {
        type: Number,
        required: true,
        min: 0
    },
    fats: {
        type: Number,
        required: true,
        min: 0
    },
    fiber: {
        type: Number,
        default: 0,
        min: 0
    },
    sugar: {
        type: Number,
        default: 0,
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
mealSchema.index({ userId: 1, date: -1 });
mealSchema.index({ userId: 1, createdAt: -1 });
mealSchema.index({ userId: 1, type: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);

