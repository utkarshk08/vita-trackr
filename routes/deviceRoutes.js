const express = require('express');
const router = express.Router();
const {
    initiateGoogleFitAuth,
    handleGoogleFitCallback,
    syncGoogleFitData,
    disconnectGoogleFit,
    getSyncStatus
} = require('../controllers/deviceController');

// @route   GET /api/devices/google-fit/auth
// @desc    Initiate Google Fit OAuth flow
// @access  Private
router.get('/google-fit/auth', initiateGoogleFitAuth);

// @route   GET /api/devices/google-fit/callback
// @desc    Handle Google Fit OAuth callback
// @access  Private
router.get('/google-fit/callback', handleGoogleFitCallback);

// @route   POST /api/devices/google-fit/sync
// @desc    Sync activity data from Google Fit
// @access  Private
router.post('/google-fit/sync', syncGoogleFitData);

// @route   POST /api/devices/google-fit/disconnect
// @desc    Disconnect Google Fit
// @access  Private
router.post('/google-fit/disconnect', disconnectGoogleFit);

// @route   GET /api/devices/status
// @desc    Get connection status for all devices
// @access  Private
router.get('/status', getSyncStatus);

module.exports = router;
