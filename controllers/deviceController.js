const { google } = require('googleapis');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');

// Google Fit OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_FIT_CLIENT_ID,
    process.env.GOOGLE_FIT_CLIENT_SECRET,
    process.env.GOOGLE_FIT_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:5000'}/api/devices/google-fit/callback`
);

// Scopes required for Google Fit
const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.location.read'
];

// @desc    Initiate Google Fit OAuth flow
// @route   GET /api/devices/google-fit/auth
// @access  Private
const initiateGoogleFitAuth = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }

        // Generate OAuth URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state: userId, // Pass userId in state for callback
            prompt: 'consent' // Force consent screen to get refresh token
        });

        res.json({
            success: true,
            authUrl: authUrl
        });
    } catch (error) {
        console.error('Error initiating Google Fit auth:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to initiate Google Fit authentication'
        });
    }
};

// @desc    Handle Google Fit OAuth callback
// @route   GET /api/devices/google-fit/callback
// @access  Private
const handleGoogleFitCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const userId = state;

        if (!code || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing authorization code or user ID'
            });
        }

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Save tokens to user document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.googleFitTokens = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date
        };
        user.googleFitConnected = true;
        user.googleFitConnectedAt = new Date();
        await user.save();

        // Redirect to frontend with success - use a page that will close the popup and notify parent
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Google Fit Connected</title>
            </head>
            <body>
                <script>
                    // Notify parent window of success
                    if (window.opener) {
                        window.opener.postMessage({ type: 'google-fit-connected', success: true }, '*');
                        window.close();
                    } else {
                        // If popup was blocked, redirect parent
                        window.location.href = '${frontendUrl}/connectedDevices?connected=google-fit';
                    }
                </script>
                <p>Google Fit connected successfully! This window will close automatically.</p>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error handling Google Fit callback:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        const errorMessage = (error.message || 'Unknown error').replace(/'/g, "\\'");
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Connection Failed</title>
            </head>
            <body>
                <script>
                    // Notify parent window of failure
                    if (window.opener) {
                        window.opener.postMessage({ type: 'google-fit-connected', success: false, error: '${errorMessage}' }, '*');
                        window.close();
                    } else {
                        window.location.href = '${frontendUrl}/connectedDevices?error=google-fit-auth-failed';
                    }
                </script>
                <p>Failed to connect Google Fit. This window will close automatically.</p>
            </body>
            </html>
        `);
    }
};

// @desc    Sync activity data from Google Fit
// @route   POST /api/devices/google-fit/sync
// @access  Private
const syncGoogleFitData = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }

        const user = await User.findById(userId);
        if (!user || !user.googleFitConnected) {
            return res.status(400).json({
                success: false,
                error: 'Google Fit not connected'
            });
        }

        // Set up OAuth2 client with user's tokens
        oauth2Client.setCredentials({
            access_token: user.googleFitTokens.accessToken,
            refresh_token: user.googleFitTokens.refreshToken,
            expiry_date: user.googleFitTokens.expiryDate
        });

        // Refresh token if expired
        if (user.googleFitTokens.expiryDate < Date.now()) {
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
            
            user.googleFitTokens.accessToken = credentials.access_token;
            user.googleFitTokens.expiryDate = credentials.expiry_date;
            if (credentials.refresh_token) {
                user.googleFitTokens.refreshToken = credentials.refresh_token;
            }
            await user.save();
        }

        // Initialize Google Fit API
        const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

        // Get today's date range (start and end of day in nanoseconds)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const startTimeNanos = startOfDay.getTime() * 1000000;
        const endTimeNanos = endOfDay.getTime() * 1000000;

        // Fetch step count
        const stepsResponse = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: {
                aggregateBy: [{
                    dataTypeName: 'com.google.step_count.delta',
                    dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
                }],
                bucketByTime: { durationMillis: 86400000 }, // 1 day
                startTimeMillis: startOfDay.getTime(),
                endTimeMillis: endOfDay.getTime()
            }
        });

        // Fetch activity segments (workouts)
        const activitiesResponse = await fitness.users.sessions.list({
            userId: 'me',
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString()
        });

        let syncedCount = 0;
        const syncedActivities = [];

        // Process step count
        if (stepsResponse.data.bucket && stepsResponse.data.bucket.length > 0) {
            const bucket = stepsResponse.data.bucket[0];
            if (bucket.dataset && bucket.dataset[0] && bucket.dataset[0].point) {
                const points = bucket.dataset[0].point;
                let totalSteps = 0;
                
                points.forEach(point => {
                    if (point.value && point.value[0]) {
                        totalSteps += parseInt(point.value[0].intVal || 0);
                    }
                });

                if (totalSteps > 0) {
                    // Estimate calories from steps (rough estimate: 0.04 calories per step)
                    const estimatedCalories = Math.round(totalSteps * 0.04);
                    
                    // Check if activity already exists for today
                    const existingActivity = await Activity.findOne({
                        userId: userId,
                        date: startOfDay,
                        type: 'walking',
                        source: 'google-fit'
                    });

                    let activity;
                    if (existingActivity) {
                        // Update existing activity with latest data
                        existingActivity.duration = Math.round(totalSteps / 100); // Rough estimate: 100 steps per minute
                        existingActivity.calories = estimatedCalories;
                        existingActivity.metadata = {
                            ...(existingActivity.metadata || {}),
                            steps: totalSteps
                        };
                        await existingActivity.save();
                        activity = existingActivity;
                    } else {
                        // Create new activity for today
                        activity = await Activity.create({
                            userId: userId,
                            type: 'walking',
                            name: 'Walking (Google Fit)',
                            duration: Math.round(totalSteps / 100),
                            calories: estimatedCalories,
                            date: startOfDay,
                            source: 'google-fit',
                            metadata: {
                                steps: totalSteps
                            }
                        });
                    }

                    syncedActivities.push(activity);
                    syncedCount++;
                }
            }
        }

        // Process workout activities
        if (activitiesResponse.data.session && activitiesResponse.data.session.length > 0) {
            for (const session of activitiesResponse.data.session) {
                const activityType = mapGoogleFitActivityType(session.activityType);
                const startTime = new Date(parseInt(session.startTimeMillis));
                const endTime = new Date(parseInt(session.endTimeMillis));
                const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes

                // Estimate calories (rough estimates based on activity type)
                const calories = estimateCalories(activityType, duration);
                
                // Check if activity already exists
                const existingActivity = await Activity.findOne({
                    userId: userId,
                    date: startTime,
                    type: activityType,
                    source: 'google-fit',
                    'metadata.sessionId': session.id
                });

                let activity;
                if (existingActivity) {
                    // Update existing workout with latest data
                    existingActivity.duration = duration;
                    existingActivity.calories = calories;
                    existingActivity.date = startTime;
                    existingActivity.metadata = {
                        ...(existingActivity.metadata || {}),
                        sessionId: session.id,
                        activityType: session.activityType
                    };
                    await existingActivity.save();
                    activity = existingActivity;
                } else {
                    // Create new workout activity
                    activity = await Activity.create({
                        userId: userId,
                        type: activityType,
                        name: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} (Google Fit)`,
                        duration: duration,
                        calories: calories,
                        date: startTime,
                        source: 'google-fit',
                        metadata: {
                            sessionId: session.id,
                            activityType: session.activityType
                        }
                    });
                }

                syncedActivities.push(activity);
                syncedCount++;
            }
        }

        // Update last sync time
        user.googleFitLastSync = new Date();
        await user.save();

        res.json({
            success: true,
            message: `Synced ${syncedCount} activities from Google Fit`,
            count: syncedCount,
            activities: syncedActivities.map(a => ({
                id: a._id,
                type: a.type,
                name: a.name,
                duration: a.duration,
                calories: a.calories,
                date: a.date
            }))
        });
    } catch (error) {
        console.error('Error syncing Google Fit data:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to sync Google Fit data'
        });
    }
};

// @desc    Disconnect Google Fit
// @route   POST /api/devices/google-fit/disconnect
// @access  Private
const disconnectGoogleFit = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.googleFitConnected = false;
        user.googleFitTokens = undefined;
        user.googleFitConnectedAt = undefined;
        user.googleFitLastSync = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Google Fit disconnected successfully'
        });
    } catch (error) {
        console.error('Error disconnecting Google Fit:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to disconnect Google Fit'
        });
    }
};

// @desc    Get sync status for all devices
// @route   GET /api/devices/status
// @access  Private
const getSyncStatus = async (req, res) => {
    try {
        const userId = req.query.userId || req.body.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            devices: {
                googleFit: {
                    connected: user.googleFitConnected || false,
                    connectedAt: user.googleFitConnectedAt,
                    lastSync: user.googleFitLastSync
                },
                appleHealth: {
                    connected: false, // Not implemented yet
                    connectedAt: null,
                    lastSync: null
                }
            }
        });
    } catch (error) {
        console.error('Error getting sync status:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get sync status'
        });
    }
};

// Helper function to map Google Fit activity types to our activity types
function mapGoogleFitActivityType(googleFitType) {
    const typeMap = {
        1: 'running',      // Running
        2: 'walking',      // Walking
        3: 'cycling',      // Biking
        4: 'swimming',     // Swimming
        5: 'running',      // Still (not used)
        6: 'running',      // Unknown
        7: 'running',      // In vehicle
        8: 'running',      // On bicycle
        9: 'running',      // On foot
        10: 'running',     // Tilting
        11: 'running',     // Walking
        12: 'running',     // Running
        16: 'running',     // In road vehicle
        17: 'running',     // In rail vehicle
        18: 'running',     // In two wheel vehicle
        19: 'running',     // In four wheel vehicle
        20: 'running',     // In vehicle (other)
        21: 'running',     // On foot (other)
        22: 'running',     // On bicycle (other)
        23: 'running',     // Still (other)
        24: 'running',     // Unknown (other)
        25: 'running',     // Running (other)
        26: 'running',     // Walking (other)
        27: 'running',     // In vehicle (other)
        28: 'running',     // On bicycle (other)
        29: 'running',     // Still (other)
        30: 'running',     // Unknown (other)
        31: 'running',     // Running (other)
        32: 'walking',     // Walking (other)
        33: 'cycling',     // Biking (other)
        34: 'swimming',    // Swimming (other)
        35: 'running',     // Still (other)
        36: 'running',     // Unknown (other)
        37: 'running',     // In vehicle (other)
        38: 'running',     // On bicycle (other)
        39: 'running',     // Still (other)
        40: 'running',     // Unknown (other)
        41: 'running',     // Running (other)
        42: 'walking',     // Walking (other)
        43: 'cycling',     // Biking (other)
        44: 'swimming',    // Swimming (other)
        45: 'running',     // Still (other)
        46: 'running',     // Unknown (other)
        47: 'running',     // In vehicle (other)
        48: 'running',     // On bicycle (other)
        49: 'running',     // Still (other)
        50: 'running',     // Unknown (other)
        51: 'running',     // Running (other)
        52: 'walking',     // Walking (other)
        53: 'cycling',     // Biking (other)
        54: 'swimming',    // Swimming (other)
        55: 'running',     // Still (other)
        56: 'running',     // Unknown (other)
        57: 'running',     // In vehicle (other)
        58: 'running',     // On bicycle (other)
        59: 'running',     // Still (other)
        60: 'running',     // Unknown (other)
        61: 'running',     // Running (other)
        62: 'walking',     // Walking (other)
        63: 'cycling',     // Biking (other)
        64: 'swimming',    // Swimming (other)
        65: 'running',     // Still (other)
        66: 'running',     // Unknown (other)
        67: 'running',     // In vehicle (other)
        68: 'running',     // On bicycle (other)
        69: 'running',     // Still (other)
        70: 'running',     // Unknown (other)
        71: 'running',     // Running (other)
        72: 'walking',     // Walking (other)
        73: 'cycling',     // Biking (other)
        74: 'swimming',    // Swimming (other)
        75: 'running',     // Still (other)
        76: 'running',     // Unknown (other)
        77: 'running',     // In vehicle (other)
        78: 'running',     // On bicycle (other)
        79: 'running',     // Still (other)
        80: 'running',     // Unknown (other)
        81: 'running',     // Running (other)
        82: 'walking',     // Walking (other)
        83: 'cycling',     // Biking (other)
        84: 'swimming',    // Swimming (other)
        85: 'running',     // Still (other)
        86: 'running',     // Unknown (other)
        87: 'running',     // In vehicle (other)
        88: 'running',     // On bicycle (other)
        89: 'running',     // Still (other)
        90: 'running',     // Unknown (other)
        91: 'running',     // Running (other)
        92: 'walking',     // Walking (other)
        93: 'cycling',     // Biking (other)
        94: 'swimming',    // Swimming (other)
        95: 'running',     // Still (other)
        96: 'running',     // Unknown (other)
        97: 'running',     // In vehicle (other)
        98: 'running',     // On bicycle (other)
        99: 'running',     // Still (other)
        100: 'running'      // Unknown (other)
    };
    
    return typeMap[googleFitType] || 'running';
}

// Helper function to estimate calories based on activity type and duration
function estimateCalories(activityType, durationMinutes) {
    const caloriesPerMinute = {
        'running': 12,
        'walking': 4,
        'cycling': 8,
        'swimming': 10,
        'default': 6
    };
    
    const rate = caloriesPerMinute[activityType] || caloriesPerMinute.default;
    return Math.round(rate * durationMinutes);
}

module.exports = {
    initiateGoogleFitAuth,
    handleGoogleFitCallback,
    syncGoogleFitData,
    disconnectGoogleFit,
    getSyncStatus
};
