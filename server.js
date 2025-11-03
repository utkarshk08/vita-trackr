// Main Server File
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/weights', require('./routes/weightRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/gemini', require('./routes/geminiRoutes'));

// Serve index.html for all non-API routes (for SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 VitaTrackr server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`🌐 Web: http://localhost:${PORT}`);
});

module.exports = app;
