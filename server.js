// Main Server File
// Load environment variables FIRST before any other requires
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/weights', require('./routes/weightRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));

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
