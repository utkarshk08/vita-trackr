// User Routes
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserDashboard
} = require('../controllers/userController');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes
router.get('/:userId', getUserProfile);
router.put('/:userId', updateUserProfile);
router.get('/:userId/dashboard', getUserDashboard);

module.exports = router;

