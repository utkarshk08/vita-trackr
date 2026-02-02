// User Controller
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Meal = require('../models/mealModel');
const Weight = require('../models/weightModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helper function to send email using nodemailer
async function sendEmail(to, subject, html) {
    try {
        const nodemailer = require('nodemailer');
        
        // Check if email configuration exists
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️  Email credentials not configured. Emails will be logged to console only.');
            console.log('📧 Email would be sent:', { to, subject });
            console.log('Email content:', html);
            return true; // Return true to not block user registration
        }
        
        // Create transporter based on email service
        let transporterConfig;
        
        if (process.env.EMAIL_SERVICE === 'gmail') {
            // Gmail configuration
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
                }
            };
        } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
            // SendGrid configuration
            transporterConfig = {
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false,
                auth: {
                    user: 'apikey',
                    pass: process.env.EMAIL_PASSWORD // SendGrid API Key
                }
            };
        } else if (process.env.EMAIL_SERVICE === 'custom') {
            // Custom SMTP configuration
            transporterConfig = {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        } else {
            // Default: Try Gmail
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            };
        }
        
        const transporter = nodemailer.createTransport(transporterConfig);
        
        // Verify transporter configuration
        await transporter.verify();
        
        // Send email
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@vitatrackr.com',
            to: to,
            subject: subject,
            html: html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return true;
        
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        // Log email details for debugging
        console.log('📧 Failed email details:', { to, subject });
        console.log('Email content:', html);
        
        // Don't throw error - allow user registration to continue
        // In production, you might want to log this to an error tracking service
        return false;
    }
}

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                error: 'Username must be between 3 and 30 characters'
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address'
            });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
        if (existingUser) {
            if (existingUser.username.toLowerCase() === username.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            }
            if (existingUser.email.toLowerCase() === email.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already registered'
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP for email verification
        const emailVerificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const emailVerificationOTPExpiry = new Date();
        emailVerificationOTPExpiry.setMinutes(emailVerificationOTPExpiry.getMinutes() + 10); // 10 minutes expiry

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            emailVerificationOTP,
            emailVerificationOTPExpiry
        });

        // Send verification email with OTP
        const emailHtml = `
            <h2>Welcome to VitaTrackr!</h2>
            <p>Please verify your email address using the OTP below:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="font-size: 36px; letter-spacing: 8px; color: #4a90e2; margin: 0;">${emailVerificationOTP}</h1>
            </div>
            <p>Enter this OTP in the verification form to complete your registration.</p>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
        `;
        
        await sendEmail(email, 'Verify Your VitaTrackr Account - OTP', emailHtml);

        res.status(201).json({
            success: true,
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                requiresEmailVerification: true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                error: 'Please verify your email before logging in',
                requiresEmailVerification: true,
                email: user.email
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            data: {
                userId: user._id,
                username: user.username,
                email: user.email,
                isSetupComplete: user.isSetupComplete,
                subscriptionStatus: user.subscriptionStatus,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/:userId/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.params.userId;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Last 7 days

        const [user, activities, meals, weight] = await Promise.all([
            User.findById(userId).select('-password'),
            Activity.find({ userId, date: { $gte: startDate } }),
            Meal.find({ userId, date: { $gte: startDate } }),
            Weight.findOne({ userId }).sort({ date: -1 })
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Calculate stats
        const totalCaloriesBurned = activities.reduce((sum, a) => sum + a.calories, 0);
        const totalCaloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
        const avgProtein = meals.length > 0 
            ? meals.reduce((sum, m) => sum + m.protein, 0) / meals.length 
            : 0;

        res.json({
            success: true,
            data: {
                user,
                stats: {
                    totalActivities: activities.length,
                    totalMeals: meals.length,
                    totalCaloriesBurned,
                    totalCaloriesConsumed,
                    calorieBalance: totalCaloriesConsumed - totalCaloriesBurned,
                    avgProteinPerMeal: avgProtein,
                    currentWeight: weight ? weight.weight : user.weight
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Check username availability
// @route   GET /api/users/check-username
// @access  Public
const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.query;
        
        if (!username || username.length < 3) {
            return res.json({
                success: true,
                data: { available: false, message: 'Username must be at least 3 characters' }
            });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        
        res.json({
            success: true,
            data: {
                available: !existingUser,
                username: username
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            emailVerificationOTP: otp,
            emailVerificationOTPExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP'
            });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationOTP = null;
        user.emailVerificationOTPExpiry = null;
        await user.save();

        res.json({
            success: true,
            data: {
                message: 'Email verified successfully',
                userId: user._id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }

        // Generate new 6-digit OTP
        const emailVerificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const emailVerificationOTPExpiry = new Date();
        emailVerificationOTPExpiry.setMinutes(emailVerificationOTPExpiry.getMinutes() + 10);

        user.emailVerificationOTP = emailVerificationOTP;
        user.emailVerificationOTPExpiry = emailVerificationOTPExpiry;
        await user.save();

        // Send verification email with OTP
        const emailHtml = `
            <h2>Verify Your VitaTrackr Account</h2>
            <p>Please verify your email address using the OTP below:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="font-size: 36px; letter-spacing: 8px; color: #4a90e2; margin: 0;">${emailVerificationOTP}</h1>
            </div>
            <p>Enter this OTP in the verification form to complete your registration.</p>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
        `;
        
        await sendEmail(email, 'Verify Your VitaTrackr Account - OTP', emailHtml);

        res.json({
            success: true,
            data: {
                message: 'Verification email sent successfully'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Don't reveal if user exists (security best practice)
        if (!user) {
            return res.json({
                success: true,
                data: {
                    message: 'If an account exists with this email, a password reset OTP has been sent'
                }
            });
        }

        // Generate 6-digit OTP for password reset
        const passwordResetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const passwordResetOTPExpiry = new Date();
        passwordResetOTPExpiry.setMinutes(passwordResetOTPExpiry.getMinutes() + 10); // 10 minutes expiry

        user.passwordResetOTP = passwordResetOTP;
        user.passwordResetOTPExpiry = passwordResetOTPExpiry;
        await user.save();

        // Send reset email with OTP
        const emailHtml = `
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="font-size: 36px; letter-spacing: 8px; color: #4a90e2; margin: 0;">${passwordResetOTP}</h1>
            </div>
            <p>Enter this OTP in the password reset form to set a new password.</p>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you didn't request a password reset, please ignore this email.</p>
        `;
        
        await sendEmail(email, 'Reset Your VitaTrackr Password - OTP', emailHtml);

        res.json({
            success: true,
            data: {
                message: 'If an account exists with this email, a password reset OTP has been sent'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Verify password reset OTP
// @route   POST /api/users/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            passwordResetOTP: otp,
            passwordResetOTPExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP'
            });
        }

        res.json({
            success: true,
            data: {
                message: 'OTP verified successfully',
                verified: true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Email, OTP, and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            passwordResetOTP: otp,
            passwordResetOTPExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset OTP
        user.password = hashedPassword;
        user.passwordResetOTP = null;
        user.passwordResetOTPExpiry = null;
        await user.save();

        res.json({
            success: true,
            data: {
                message: 'Password reset successfully'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
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
};

