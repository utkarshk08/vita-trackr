// User Model Schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Authentication
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    
    // Email Verification (OTP-based)
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        type: String,
        default: null
    },
    emailVerificationOTPExpiry: {
        type: Date,
        default: null
    },
    // Legacy token support (for migration)
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationTokenExpiry: {
        type: Date,
        default: null
    },
    
    // Password Reset (OTP-based)
    passwordResetOTP: {
        type: String,
        default: null
    },
    passwordResetOTPExpiry: {
        type: Date,
        default: null
    },
    // Legacy token support (for migration)
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetTokenExpiry: {
        type: Date,
        default: null
    },
    
    // Basic Details
    name: {
        type: String,
        required: false,
        trim: true
    },
    age: {
        type: Number,
        required: false,
        min: 1,
        max: 150
    },
    gender: {
        type: String,
        required: false,
        enum: ['male', 'female', 'other']
    },
    weight: {
        type: Number,
        required: false,
        min: 10,
        max: 500
    },
    height: {
        type: Number,
        required: false,
        min: 50,
        max: 300
    },
    bmi: {
        type: Number,
        required: false
    },
    bodyFat: {
        type: Number,
        min: 0,
        max: 100
    },
    waistHipRatio: {
        type: Number,
        min: 0
    },
    
    // Health Information
    diseases: {
        type: [String],
        default: []
    },
    allergies: {
        type: [String],
        default: []
    },
    dietaryPreference: {
        type: String,
        required: false,
        enum: ['vegetarian', 'vegan', 'non-veg', 'pescatarian', 'omnivore'],
        default: 'omnivore'
    },
    medications: {
        type: String,
        default: ''
    },
    sleepHours: {
        type: Number,
        min: 0,
        max: 24
    },
    waterIntake: {
        type: Number,
        min: 0
    },
    
    // Activity & Lifestyle
    occupation: {
        type: String,
        required: false,
        enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active']
    },
    exerciseFrequency: {
        type: Number,
        min: 0,
        max: 7
    },
    stepCount: {
        type: Number,
        min: 0
    },
    screenTime: {
        type: Number,
        min: 0
    },
    
    // Goal Tracking
    goalType: {
        type: String,
        required: false,
        enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintain']
    },
    targetDuration: {
        type: Number,
        min: 1
    },
    caloricGoal: {
        type: Number,
        required: false
    },
    macroSplit: {
        carbs: {
            type: Number,
            required: false
        },
        protein: {
            type: Number,
            required: false
        },
        fats: {
            type: Number,
            required: false
        }
    },
    bmr: {
        type: Number,
        required: false
    },
    tdee: {
        type: Number,
        required: false
    },
    
    // Optional Enhancements
    familyHistory: {
        type: String,
        default: ''
    },
    stressLevel: {
        type: Number,
        min: 1,
        max: 10
    },
    bloodReports: {
        type: String,
        default: ''
    },
    foodDislikes: {
        type: String,
        default: ''
    },
    preferredCuisines: {
        type: String,
        default: ''
    },
    
    // System fields
    isSetupComplete: {
        type: Boolean,
        default: false
    },
    setupDate: {
        type: Date
    },
    subscriptionStatus: {
        type: String,
        enum: ['free', 'pro'],
        default: 'pro'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    // Connected Devices
    googleFitConnected: {
        type: Boolean,
        default: false
    },
    googleFitTokens: {
        accessToken: String,
        refreshToken: String,
        expiryDate: Date
    },
    googleFitConnectedAt: {
        type: Date,
        default: null
    },
    googleFitLastSync: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

