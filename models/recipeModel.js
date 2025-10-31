// Recipe Model Schema
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    cuisine: {
        type: String,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    ingredients: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: String,
            required: true
        }
    }],
    instructions: {
        type: [String],
        required: true
    },
    servings: {
        type: Number,
        required: true,
        min: 1
    },
    prepTime: {
        type: Number,
        min: 0
    },
    cookTime: {
        type: Number,
        min: 0
    },
    nutrition: {
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
        sodium: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    dietaryInfo: {
        vegetarian: {
            type: Boolean,
            default: false
        },
        vegan: {
            type: Boolean,
            default: false
        },
        glutenFree: {
            type: Boolean,
            default: false
        },
        dairyFree: {
            type: Boolean,
            default: false
        },
        nutFree: {
            type: Boolean,
            default: false
        }
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ tags: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);

