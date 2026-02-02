// User Routes
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUserDashboard,
    checkUsernameAvailability,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require('../controllers/userController');

// Public routes
router.get('/check-username', checkUsernameAvailability);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Private routes
router.get('/:userId', getUserProfile);
router.put('/:userId', updateUserProfile);
router.get('/:userId/dashboard', getUserDashboard);

module.exports = router;

