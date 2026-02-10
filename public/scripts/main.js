// Sample data storage
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let meals = JSON.parse(localStorage.getItem('meals')) || [];
let weights = JSON.parse(localStorage.getItem('weights')) || [];
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        updateThemeIcon();
    }
    
    // Set today's date as default for activity tracker, meal log, and weight tracking
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('activityDate')) {
        document.getElementById('activityDate').value = today;
    }
    if (document.getElementById('mealDate')) {
        document.getElementById('mealDate').value = today;
    }
    if (document.getElementById('weightDate')) {
        document.getElementById('weightDate').value = today;
    }
    
    // Check for saved user session and restore
    const currentUserId = localStorage.getItem('currentUserId');
    userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    
    if (currentUserId && userProfile && userProfile.isSetupComplete) {
        // User is already logged in, show app screen
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
        
        // Load their data from the API
        loadUserData().then(() => {
            // Now that data is loaded, display it and show the page
            loadProfileData();
            displayActivities();
            displayMeals();
            updateOverview();
            updateSubscriptionBadge(); // Update subscription badge display
            
            const lastPage = localStorage.getItem('lastPage') || 'home';
            showPage(lastPage);
        }).catch(err => {
            console.error("Failed to load user data on refresh", err);
            // If API fails, show login
            document.getElementById('loginScreen').style.display = 'block';
            document.getElementById('appScreen').style.display = 'none';
        });
        
        // Update subscription badge on initial load
        updateSubscriptionBadge();
    } else if (userProfile && !userProfile.isSetupComplete) {
        // User signed up but didn't finish profile
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
        showPage('profile');
    }
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Navigation Dropdown Toggle for Meals
    const mealsDropdownToggle = document.getElementById('mealsDropdownToggle');
    const mealsDropdown = document.getElementById('mealsDropdown');
    // Navigation Dropdown Toggle for Activity
    const activityDropdownToggle = document.getElementById('activityDropdownToggle');
    const activityDropdown = document.getElementById('activityDropdown');
    
    if (mealsDropdownToggle && mealsDropdown) {
        mealsDropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(dd => {
                if (dd !== mealsDropdown) {
                    dd.classList.remove('active');
                    const menu = dd.querySelector('.nav-dropdown-menu');
                    if (menu) {
                        menu.style.opacity = '';
                        menu.style.visibility = '';
                        menu.style.transform = '';
                        menu.style.pointerEvents = '';
                    }
                }
            });
            
            // Toggle current dropdown
            mealsDropdown.classList.toggle('active');
            const menu = mealsDropdown.querySelector('.nav-dropdown-menu');
            if (menu) {
                if (mealsDropdown.classList.contains('active')) {
                    menu.style.opacity = '1';
                    menu.style.visibility = 'visible';
                    menu.style.transform = 'translateY(0)';
                    menu.style.pointerEvents = 'auto';
                    menu.style.display = 'block';
                    menu.style.zIndex = '99999';
                    menu.style.position = 'absolute';
                    menu.style.backgroundColor = document.body.classList.contains('light-mode') 
                        ? 'rgba(255, 255, 255, 0.98)' 
                        : 'rgba(26, 26, 46, 0.98)';
                    menu.style.backdropFilter = 'blur(10px)';
                    menu.style.webkitBackdropFilter = 'blur(10px)';
                } else {
                    menu.style.opacity = '';
                    menu.style.visibility = '';
                    menu.style.transform = '';
                    menu.style.pointerEvents = '';
                    menu.style.display = '';
                    menu.style.zIndex = '';
                    menu.style.position = '';
                    menu.style.backgroundColor = '';
                    menu.style.backdropFilter = '';
                    menu.style.webkitBackdropFilter = '';
                }
            }
        });
        
        // Handle dropdown item clicks
        mealsDropdown.querySelectorAll('.nav-dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                showPage(page);
                // Close dropdown
                mealsDropdown.classList.remove('active');
                const menu = mealsDropdown.querySelector('.nav-dropdown-menu');
                if (menu) {
                    menu.style.opacity = '';
                    menu.style.visibility = '';
                    menu.style.transform = '';
                    menu.style.pointerEvents = '';
                    menu.style.display = '';
                    menu.style.zIndex = '';
                    menu.style.position = '';
                    menu.style.backgroundColor = '';
                    menu.style.backdropFilter = '';
                    menu.style.webkitBackdropFilter = '';
                }
            });
        });
    }
    // Navigation Dropdown Toggle for Activity
    if (activityDropdownToggle && activityDropdown) {
        activityDropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(dd => {
                if (dd !== activityDropdown) {
                    dd.classList.remove('active');
                    const menu = dd.querySelector('.nav-dropdown-menu');
                    if (menu) {
                        menu.style.opacity = '';
                        menu.style.visibility = '';
                        menu.style.transform = '';
                        menu.style.pointerEvents = '';
                        menu.style.display = '';
                        menu.style.zIndex = '';
                        menu.style.position = '';
                        menu.style.backgroundColor = '';
                        menu.style.backdropFilter = '';
                        menu.style.webkitBackdropFilter = '';
                    }
                }
            });
            
            // Toggle current dropdown
            activityDropdown.classList.toggle('active');
            const menu = activityDropdown.querySelector('.nav-dropdown-menu');
            if (menu) {
                if (activityDropdown.classList.contains('active')) {
                    menu.style.opacity = '1';
                    menu.style.visibility = 'visible';
                    menu.style.transform = 'translateY(0)';
                    menu.style.pointerEvents = 'auto';
                    menu.style.display = 'block';
                    menu.style.zIndex = '99999';
                    menu.style.position = 'absolute';
                    menu.style.backgroundColor = document.body.classList.contains('light-mode') 
                        ? 'rgba(255, 255, 255, 0.98)' 
                        : 'rgba(26, 26, 46, 0.98)';
                    menu.style.backdropFilter = 'blur(10px)';
                    menu.style.webkitBackdropFilter = 'blur(10px)';
                } else {
                    menu.style.opacity = '';
                    menu.style.visibility = '';
                    menu.style.transform = '';
                    menu.style.pointerEvents = '';
                    menu.style.display = '';
                    menu.style.zIndex = '';
                    menu.style.position = '';
                    menu.style.backgroundColor = '';
                    menu.style.backdropFilter = '';
                    menu.style.webkitBackdropFilter = '';
                }
            }
        });
        
        // Handle dropdown item clicks
        activityDropdown.querySelectorAll('.nav-dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                showPage(page);
                // Close dropdown
                activityDropdown.classList.remove('active');
                const menu = activityDropdown.querySelector('.nav-dropdown-menu');
                if (menu) {
                    menu.style.opacity = '';
                    menu.style.visibility = '';
                    menu.style.transform = '';
                    menu.style.pointerEvents = '';
                    menu.style.display = '';
                    menu.style.zIndex = '';
                    menu.style.position = '';
                    menu.style.backgroundColor = '';
                    menu.style.backdropFilter = '';
                    menu.style.webkitBackdropFilter = '';
                }
            });
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (mealsDropdown && !mealsDropdown.contains(e.target)) {
            mealsDropdown.classList.remove('active');
            const menu = mealsDropdown.querySelector('.nav-dropdown-menu');
            if (menu) {
                menu.style.opacity = '';
                menu.style.visibility = '';
                menu.style.transform = '';
                menu.style.pointerEvents = '';
                menu.style.display = '';
                menu.style.zIndex = '';
                menu.style.position = '';
                menu.style.backgroundColor = '';
                menu.style.backdropFilter = '';
                menu.style.webkitBackdropFilter = '';
            }
        }
        if (activityDropdown && !activityDropdown.contains(e.target)) {
            activityDropdown.classList.remove('active');
            const menu = activityDropdown.querySelector('.nav-dropdown-menu');
            if (menu) {
                menu.style.opacity = '';
                menu.style.visibility = '';
                menu.style.transform = '';
                menu.style.pointerEvents = '';
                menu.style.display = '';
                menu.style.zIndex = '';
                menu.style.position = '';
                menu.style.backgroundColor = '';
                menu.style.backdropFilter = '';
                menu.style.webkitBackdropFilter = '';
            }
        }
    });
    
    // Initialize support chatbot (always visible)
    initializeSupportChatbot();
    
    // Validation Functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 8;
    }

    function checkPasswordStrength(password) {
        if (password.length === 0) return { strength: 'none', text: '' };
        if (password.length < 8) return { strength: 'weak', text: 'Password must be at least 8 characters' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        
        if (strength <= 2) return { strength: 'weak', text: 'Weak password' };
        if (strength <= 3) return { strength: 'medium', text: 'Medium strength' };
        return { strength: 'strong', text: 'Strong password' };
    }

    function showFieldError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + 'Error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    function hideFieldError(fieldId) {
        const errorEl = document.getElementById(fieldId + 'Error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }
    }

    function updatePasswordStrength(password, strengthId) {
        const strengthEl = document.getElementById(strengthId);
        if (!strengthEl) return;
        
        if (password.length === 0) {
            strengthEl.classList.remove('show', 'weak', 'medium', 'strong');
            return;
        }
        
        const { strength, text } = checkPasswordStrength(password);
        strengthEl.classList.add('show', strength);
        strengthEl.classList.remove('weak', 'medium', 'strong');
        strengthEl.classList.add(strength);
        
        const barEl = strengthEl.querySelector('.password-strength-bar') || document.createElement('div');
        barEl.className = 'password-strength-bar';
        if (!strengthEl.querySelector('.password-strength-bar')) {
            strengthEl.innerHTML = `<div class="password-strength-bar"></div><div class="password-strength-text">${text}</div>`;
        } else {
            strengthEl.querySelector('.password-strength-text').textContent = text;
        }
    }

    // Username availability check (debounced)
    let usernameCheckTimeout;
    async function checkUsernameAvailability(username) {
        if (username.length < 3) {
            document.getElementById('usernameAvailability').innerHTML = '';
            return;
        }
        
        clearTimeout(usernameCheckTimeout);
        usernameCheckTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
                const data = await response.json();
                const hintEl = document.getElementById('usernameAvailability');
                if (hintEl) {
                    if (data.available) {
                        hintEl.innerHTML = '<i class="fas fa-check-circle"></i> Username available';
                        hintEl.classList.add('success');
                        hintEl.classList.remove('error');
                    } else {
                        hintEl.innerHTML = '<i class="fas fa-times-circle"></i> Username already taken';
                        hintEl.classList.add('error');
                        hintEl.classList.remove('success');
                    }
                }
            } catch (error) {
                console.error('Error checking username:', error);
            }
        }, 500);
    }

    // Real-time validation for signup form
    document.getElementById('signupUsername')?.addEventListener('input', function(e) {
        const username = e.target.value.trim();
        hideFieldError('signupUsername');
        
        if (username.length > 0 && username.length < 3) {
            showFieldError('signupUsername', 'Username must be at least 3 characters');
        } else if (username.length > 30) {
            showFieldError('signupUsername', 'Username must be less than 30 characters');
        } else if (username.length >= 3) {
            checkUsernameAvailability(username);
        }
    });

    document.getElementById('signupEmail')?.addEventListener('input', function(e) {
        const email = e.target.value.trim();
        hideFieldError('signupEmail');
        
        if (email.length > 0 && !validateEmail(email)) {
            showFieldError('signupEmail', 'Please enter a valid email address');
        }
    });

    document.getElementById('signupPassword')?.addEventListener('input', function(e) {
        const password = e.target.value;
        hideFieldError('signupPassword');
        updatePasswordStrength(password, 'passwordStrength');
        
        if (password.length > 0 && !validatePassword(password)) {
            showFieldError('signupPassword', 'Password must be at least 8 characters');
        }
    });

    document.getElementById('signupConfirmPassword')?.addEventListener('input', function(e) {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = e.target.value;
        hideFieldError('signupConfirmPassword');
        
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            showFieldError('signupConfirmPassword', 'Passwords do not match');
        }
    });

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found!');
    } else {
        loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        
        // Clear previous errors
        hideFieldError('username');
        hideFieldError('password');
        
        // Basic validation
        if (!username) {
            showFieldError('username', 'Username is required');
            return;
        }
        if (!password) {
            showFieldError('password', 'Password is required');
            return;
        }
        
        // Disable button and show loading
        loginBtn.disabled = true;
        loginBtnText.innerHTML = '<span class="spinner"></span> Logging in...';
        
        try {
            // Try API login first
            const userData = await loginUser(username, password);
            
            // Load user profile
            userProfile = await getUserProfile();
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            updateSubscriptionBadge();
            
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appScreen').style.display = 'block';
            
            // Load user data
            await loadUserData();
            
            // Show profile setup if not completed, otherwise show home
            if (!userProfile.isSetupComplete) {
                showPage('profile');
            } else {
                loadProfileData();
                showPage('home');
            }
            
            showNotification('Login successful!', 'success');
        } catch (error) {
            console.error('API login failed:', error);
            
            // Check if email verification is required
            if (error.response && error.response.requiresEmailVerification) {
                showNotification('Please verify your email before logging in. Check your inbox for the verification link.', 'warning', 5000);
                showEmailVerificationSent(error.response.email || username + '@email.com');
                loginBtn.disabled = false;
                loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                return;
            }
            
            const errorMessage = error.message || 'Login failed. Please check your credentials.';
            showFieldError('password', errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
        });
    }
    
    // Show email verification OTP form
    function showEmailVerificationSent(email) {
        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('signupFormContainer').style.display = 'none';
        document.getElementById('forgotPasswordContainer').style.display = 'none';
        document.getElementById('resetPasswordContainer').style.display = 'none';
        document.getElementById('resetPasswordOTPContainer').style.display = 'none';
        document.getElementById('emailVerificationContainer').style.display = 'block';
        document.getElementById('verificationEmailAddress').textContent = email;
        document.getElementById('verificationOTP').value = '';
        document.getElementById('verificationOTP').focus();
    }
    
    // Store email for verification
    let pendingVerificationEmail = null;

    // Show forgot password form
    document.getElementById('forgotPasswordLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('forgotPasswordContainer').style.display = 'block';
    });

    document.getElementById('backToLoginFromForgot')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('forgotPasswordContainer').style.display = 'none';
        document.getElementById('loginFormContainer').style.display = 'block';
    });

    document.getElementById('backToLoginFromVerification')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('emailVerificationContainer').style.display = 'none';
        document.getElementById('loginFormContainer').style.display = 'block';
        pendingVerificationEmail = null;
    });

    // Forgot password form submission
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('forgotPasswordEmail').value.trim();
        hideFieldError('forgotPasswordEmail');
        
        if (!email) {
            showFieldError('forgotPasswordEmail', 'Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            showFieldError('forgotPasswordEmail', 'Please enter a valid email address');
            return;
        }
        
        try {
            await requestPasswordReset(email);
            showNotification('Password reset OTP sent to your email!', 'success', 5000);
            document.getElementById('forgotPasswordContainer').style.display = 'none';
            document.getElementById('resetPasswordOTPContainer').style.display = 'block';
            document.getElementById('resetPasswordEmailAddress').textContent = email;
            window.pendingResetEmail = email; // Store email for reset
            document.getElementById('resetPasswordOTP').value = '';
            document.getElementById('resetPasswordOTP').focus();
        } catch (error) {
            showFieldError('forgotPasswordEmail', error.message || 'Failed to send reset OTP');
            showNotification(error.message || 'Failed to send password reset OTP', 'error');
        }
    });

    // Password reset OTP form submission
    document.getElementById('resetPasswordOTPForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = window.pendingResetEmail;
        const otp = document.getElementById('resetPasswordOTP').value.trim();
        hideFieldError('resetPasswordOTP');
        
        if (!otp || otp.length !== 6) {
            showFieldError('resetPasswordOTP', 'Please enter a valid 6-digit OTP');
            return;
        }
        
        if (!email) {
            showNotification('Email not found. Please request a new password reset.', 'error');
            return;
        }
        
        try {
            await verifyResetOTP(email, otp);
            // OTP verified, show password reset form
            document.getElementById('resetPasswordOTPContainer').style.display = 'none';
            document.getElementById('resetPasswordContainer').style.display = 'block';
            window.pendingResetOTP = otp; // Store OTP for password reset
        } catch (error) {
            showFieldError('resetPasswordOTP', error.message || 'Invalid or expired OTP');
            showNotification(error.message || 'Invalid or expired OTP', 'error');
        }
    });
    
    // Reset password form submission (after OTP verification)
    document.getElementById('resetPasswordForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = window.pendingResetEmail;
        const otp = window.pendingResetOTP;
        const password = document.getElementById('resetPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;
        
        hideFieldError('resetPassword');
        hideFieldError('resetConfirmPassword');
        
        if (!validatePassword(password)) {
            showFieldError('resetPassword', 'Password must be at least 8 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            showFieldError('resetConfirmPassword', 'Passwords do not match');
            return;
        }
        
        if (!email || !otp) {
            showNotification('Session expired. Please request a new password reset.', 'error');
            document.getElementById('resetPasswordContainer').style.display = 'none';
            document.getElementById('forgotPasswordContainer').style.display = 'block';
            return;
        }
        
        try {
            await resetPassword(email, otp, password);
            showNotification('Password reset successfully! You can now login.', 'success', 5000);
            document.getElementById('resetPasswordContainer').style.display = 'none';
            document.getElementById('loginFormContainer').style.display = 'block';
            window.pendingResetEmail = null;
            window.pendingResetOTP = null;
        } catch (error) {
            showNotification(error.message || 'Failed to reset password', 'error');
        }
    });
    
    document.getElementById('backToForgotPassword')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('resetPasswordOTPContainer').style.display = 'none';
        document.getElementById('forgotPasswordContainer').style.display = 'block';
        window.pendingResetEmail = null;
    });
    
    document.getElementById('resendResetOTPBtn')?.addEventListener('click', async function(e) {
        e.preventDefault();
        const email = window.pendingResetEmail;
        if (!email) {
            showNotification('Email not found. Please request a new password reset.', 'error');
            return;
        }
        try {
            await requestPasswordReset(email);
            showNotification('OTP resent successfully!', 'success');
        } catch (error) {
            showNotification(error.message || 'Failed to resend OTP', 'error');
        }
    });

    // Email verification OTP form submission
    document.getElementById('emailVerificationForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = pendingVerificationEmail || document.getElementById('verificationEmailAddress').textContent;
        const otp = document.getElementById('verificationOTP').value.trim();
        const verifyBtn = document.getElementById('verifyOTPBtn');
        const verifyBtnText = document.getElementById('verifyOTPBtnText');
        
        hideFieldError('verificationOTP');
        
        if (!otp || otp.length !== 6) {
            showFieldError('verificationOTP', 'Please enter a valid 6-digit OTP');
            return;
        }
        
        if (!email) {
            showNotification('Email not found. Please sign up again.', 'error');
            return;
        }
        
        verifyBtn.disabled = true;
        verifyBtnText.innerHTML = '<span class="spinner"></span> Verifying...';
        
        try {
            await verifyEmail(email, otp);
            showNotification('Email verified successfully! You can now login.', 'success', 5000);
            document.getElementById('emailVerificationContainer').style.display = 'none';
            document.getElementById('loginFormContainer').style.display = 'block';
            pendingVerificationEmail = null;
        } catch (error) {
            showFieldError('verificationOTP', error.message || 'Invalid or expired OTP');
            showNotification(error.message || 'Invalid or expired OTP', 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtnText.innerHTML = '<i class="fas fa-check"></i> Verify OTP';
        }
    });
    
    // Resend verification OTP
    document.getElementById('resendVerificationBtn')?.addEventListener('click', async function(e) {
        e.preventDefault();
        const email = pendingVerificationEmail || document.getElementById('verificationEmailAddress').textContent;
        if (!email) {
            showNotification('Email not found. Please sign up again.', 'error');
            return;
        }
        try {
            await resendVerificationEmail(email);
            showNotification('OTP resent successfully!', 'success');
            document.getElementById('verificationOTP').value = '';
            document.getElementById('verificationOTP').focus();
        } catch (error) {
            showNotification(error.message || 'Failed to resend OTP', 'error');
        }
    });
    
    // Sign up form submission
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) {
        console.error('Signup form not found!');
    } else {
        signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const terms = document.getElementById('signupTerms').checked;
        const signupBtn = document.getElementById('signupBtn');
        const signupBtnText = document.getElementById('signupBtnText');
        
        // Clear previous errors
        hideFieldError('signupUsername');
        hideFieldError('signupEmail');
        hideFieldError('signupPassword');
        hideFieldError('signupConfirmPassword');
        hideFieldError('signupTerms');
        
        // Validation
        let hasErrors = false;
        
        if (username.length < 3 || username.length > 30) {
            showFieldError('signupUsername', 'Username must be between 3 and 30 characters');
            hasErrors = true;
        }
        
        if (!validateEmail(email)) {
            showFieldError('signupEmail', 'Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!validatePassword(password)) {
            showFieldError('signupPassword', 'Password must be at least 8 characters');
            hasErrors = true;
        }
        
        if (password !== confirmPassword) {
            showFieldError('signupConfirmPassword', 'Passwords do not match');
            hasErrors = true;
        }
        
        if (!terms) {
            showFieldError('signupTerms', 'You must agree to the terms and conditions');
            hasErrors = true;
        }
        
        if (hasErrors) {
            return;
        }
        
        // Disable button and show loading
        signupBtn.disabled = true;
        signupBtnText.innerHTML = '<span class="spinner"></span> Creating Account...';
        
        try {
            const userData = await registerUser(username, email, password);
            
            // Store email for verification
            pendingVerificationEmail = email;
            
            // Show email verification OTP form
            showEmailVerificationSent(email);
            showNotification('Account created! Check your email for the OTP.', 'success', 5000);
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
            
            if (errorMessage.includes('username') || errorMessage.includes('Username')) {
                showFieldError('signupUsername', 'Username is already taken');
            } else if (errorMessage.includes('email') || errorMessage.includes('Email')) {
                showFieldError('signupEmail', 'Email is already registered');
            } else {
                showNotification(errorMessage, 'error');
            }
        } finally {
            signupBtn.disabled = false;
            signupBtnText.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
        });
    }
    
    // Toggle between login and signup forms
    const showSignupBtn = document.getElementById('showSignup');
    const showLoginBtn = document.getElementById('showLogin');
    
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('loginFormContainer').style.display = 'none';
            document.getElementById('signupFormContainer').style.display = 'block';
            document.getElementById('forgotPasswordContainer').style.display = 'none';
            document.getElementById('emailVerificationContainer').style.display = 'none';
            document.getElementById('resetPasswordContainer').style.display = 'none';
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
        document.getElementById('signupFormContainer').style.display = 'none';
        document.getElementById('loginFormContainer').style.display = 'block';
        document.getElementById('forgotPasswordContainer').style.display = 'none';
        document.getElementById('emailVerificationContainer').style.display = 'none';
        document.getElementById('resetPasswordOTPContainer').style.display = 'none';
        document.getElementById('resetPasswordContainer').style.display = 'none';
        });
    }

    // OTP input formatting (auto-format to numbers only)
    document.getElementById('verificationOTP')?.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
    
    document.getElementById('resetPasswordOTP')?.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });
    
    // Update recipe suggestions when ingredients change (with debounce)
    const ingredientsInput = document.getElementById('ingredients');
    if (ingredientsInput) {
        let suggestionsTimeout;
        ingredientsInput.addEventListener('input', function() {
            clearTimeout(suggestionsTimeout);
            suggestionsTimeout = setTimeout(() => {
                if (document.getElementById('recipe').classList.contains('active')) {
                    loadRecipeSuggestions();
                }
            }, 1000); // Wait 1 second after user stops typing
        });
    }
    
    // Auto-lookup nutrition when meal name is entered (with debounce)
    const mealNameInput = document.getElementById('mealName');
    if (mealNameInput) {
        let nutritionTimeout;
        mealNameInput.addEventListener('input', function() {
            clearTimeout(nutritionTimeout);
            nutritionTimeout = setTimeout(() => {
                if (document.getElementById('tracker').classList.contains('active')) {
                    lookupRecipeNutrition();
                }
            }, 800); // Wait 0.8 seconds after user stops typing
        });
    }
});

// Load AI activity recommendations (with caching)
async function loadActivityRecommendations(forceRegenerate = false) {
    const recommendationBox = document.getElementById('activityRecommendationContent');
    if (!recommendationBox || !currentUserId) return;
    
    // Check cache first (unless forcing regeneration)
    if (!forceRegenerate) {
        const today = new Date().toISOString().split('T')[0];
        const cachedRecs = localStorage.getItem(`activityRecs_${currentUserId}_${today}`);
        if (cachedRecs) {
            try {
                const recommendations = JSON.parse(cachedRecs);
                displayActivityRecommendations(recommendations);
                return;
            } catch (e) {
                console.error('Error parsing cached activity recommendations:', e);
            }
        }
    }
    
    // Show loading state
    recommendationBox.innerHTML = '<p style="margin: 0;"><i class="fas fa-spinner fa-spin"></i> 🤖 AI is analyzing your activity history and meal logs...</p>';
    
    try {
        // Get previous activities (last 14 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const [previousActivities, previousMeals] = await Promise.all([
            getActivitiesByRange(startDateStr, endDate).catch(() => []),
            getMealsByRange(startDateStr, endDate).catch(() => [])
        ]);
        
        // Get user profile
        const profile = userProfile || await getUserProfile().catch(() => null);
        
        // Get AI recommendations
        const recommendations = await getActivityRecommendations(
            currentUserId,
            previousActivities,
            previousMeals,
            profile
        );
        
        if (recommendations && recommendations.length > 0) {
            // Cache for today
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`activityRecs_${currentUserId}_${today}`, JSON.stringify(recommendations));
            
            displayActivityRecommendations(recommendations);
        } else {
            recommendationBox.innerHTML = '<p style="margin: 0; color: var(--text-secondary);">No specific recommendations at this time. Keep up your regular activity routine!</p>';
        }
    } catch (error) {
        console.error('Error loading activity recommendations:', error);
        recommendationBox.innerHTML = `<p style="margin: 0; color: var(--accent-color);"><i class="fas fa-exclamation-triangle"></i> Unable to load recommendations: ${error.message || 'Unknown error'}</p>`;
    }
}

// Display activity recommendations
function displayActivityRecommendations(recommendations) {
    const recommendationBox = document.getElementById('activityRecommendationContent');
    if (!recommendationBox) return;
    
    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    recommendations.forEach((rec, index) => {
        const activityIcons = {
            running: 'fa-running',
            cycling: 'fa-bicycle',
            swimming: 'fa-swimmer',
            walking: 'fa-walking',
            gym: 'fa-dumbbell',
            yoga: 'fa-spa'
        };
        const icon = activityIcons[rec.type] || 'fa-running';
        const intensityColors = {
            light: '#50c878',
            moderate: '#ffa500',
            vigorous: '#ff4444'
        };
        const intensityColor = intensityColors[rec.intensity] || '#50c878';
        
        html += `
            <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; border-left: 4px solid ${intensityColor};">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="fas ${icon}" style="font-size: 1.2em; color: var(--accent-color);"></i>
                    <strong style="color: var(--text-primary); text-transform: capitalize;">${rec.type}</strong>
                    <span style="margin-left: auto; font-size: 0.9em; color: ${intensityColor};">
                        ${rec.intensity.charAt(0).toUpperCase() + rec.intensity.slice(1)}
                    </span>
                </div>
                <div style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 8px;">
                    <i class="fas fa-clock"></i> ${rec.duration} minutes
                </div>
                <div style="font-size: 0.85em; color: var(--text-secondary); font-style: italic;">
                    ${rec.reason}
                </div>
                <button onclick="useActivityRecommendation('${rec.type}', ${rec.duration}, '${rec.intensity}')" 
                        style="margin-top: 10px; padding: 8px 15px; background: var(--accent-color); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em;">
                    <i class="fas fa-check"></i> Use This Recommendation
                </button>
            </div>
        `;
    });
    html += '</div>';
    recommendationBox.innerHTML = html;
}


// Load AI daily plan for overview dashboard
async function loadDailyPlan(forceRegenerate = false) {
    const dailyPlanDiv = document.getElementById('dailyPlanContent');
    if (!dailyPlanDiv || !currentUserId) return;
    
    // Check cache first (unless forcing regeneration)
    if (!forceRegenerate) {
        const today = new Date().toISOString().split('T')[0];
        const cachedPlan = localStorage.getItem(`dailyPlan_${currentUserId}_${today}`);
        if (cachedPlan) {
            try {
                const dailyPlan = JSON.parse(cachedPlan);
                displayDailyPlanHTML(dailyPlan);
                return;
            } catch (e) {
                console.error('Error parsing cached daily plan:', e);
            }
        }
    }
    
    // Show loading state
    dailyPlanDiv.innerHTML = '<p style="margin: 0;"><i class="fas fa-spinner fa-spin"></i> 🤖 AI is creating your personalized daily plan...</p>';
    
    try {
        // Get previous activities and meals (last 14 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const [previousActivities, previousMeals] = await Promise.all([
            getActivitiesByRange(startDateStr, endDate).catch(() => []),
            getMealsByRange(startDateStr, endDate).catch(() => [])
        ]);
        
        // Get user profile
        const profile = userProfile || await getUserProfile().catch(() => null);
        
        // Get AI daily plan
        const dailyPlan = await getDailyPlan(
            currentUserId,
            previousActivities,
            previousMeals,
            profile
        );
        
        if (dailyPlan) {
            // Cache the plan for today
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`dailyPlan_${currentUserId}_${today}`, JSON.stringify(dailyPlan));
            
            displayDailyPlanHTML(dailyPlan);
        } else {
            dailyPlanDiv.innerHTML = '<p style="margin: 0; color: var(--text-secondary);">Unable to generate daily plan at this time. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error loading daily plan:', error);
        dailyPlanDiv.innerHTML = `<p style="margin: 0; color: var(--accent-color);"><i class="fas fa-exclamation-triangle"></i> Unable to load daily plan: ${error.message || 'Unknown error'}</p>`;
    }
}

// Display daily plan HTML
function displayDailyPlanHTML(dailyPlan) {
    const dailyPlanDiv = document.getElementById('dailyPlanContent');
    if (!dailyPlanDiv) return;
    
            let html = '';
            
            // Summary
            if (dailyPlan.summary) {
                html += `<div style="background: rgba(74, 144, 226, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid var(--accent-color);">
                    <p style="margin: 0; font-weight: 500; color: var(--text-primary);">${dailyPlan.summary}</p>
                </div>`;
            }
            
            // Activities
            if (dailyPlan.activities && dailyPlan.activities.length > 0) {
                html += `<div style="margin-bottom: 20px;">
                    <h4 style="color: var(--accent-color); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-running"></i> Recommended Activities
                    </h4>`;
        dailyPlan.activities.forEach((act, index) => {
                    const activityIcons = {
                        running: 'fa-running',
                        cycling: 'fa-bicycle',
                        swimming: 'fa-swimmer',
                        walking: 'fa-walking',
                        gym: 'fa-dumbbell',
                        yoga: 'fa-spa'
                    };
                    const icon = activityIcons[act.type] || 'fa-running';
                    const intensityColors = {
                        light: '#50c878',
                        moderate: '#ffa500',
                        vigorous: '#ff4444'
                    };
                    const intensityColor = intensityColors[act.intensity] || '#50c878';
                    
            html += `<div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid ${intensityColor}; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <i class="fas ${icon}" style="color: var(--accent-color);"></i>
                            <strong style="color: var(--text-primary); text-transform: capitalize;">${act.type}</strong>
                        <span style="font-size: 0.85em; color: ${intensityColor};">
                                ${act.intensity.charAt(0).toUpperCase() + act.intensity.slice(1)}
                            </span>
                        </div>
                    <div style="font-size: 0.9em; color: var(--text-secondary);">
                        <i class="fas fa-clock"></i> ${act.duration} minutes | <i class="fas fa-calendar"></i> ${act.time || 'Anytime'}
                        </div>
                        </div>
                <button onclick="logActivityFromPlan('${act.type}', ${act.duration}, '${act.intensity}')" 
                        style="padding: 8px 12px; font-size: 0.85em; background: var(--accent-color); color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; transition: opacity 0.2s;"
                        onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                    <i class="fas fa-plus"></i> Log Activity
                </button>
                    </div>`;
                });
                html += `</div>`;
            }
            
            // Meals
            if (dailyPlan.meals) {
                html += `<div style="margin-bottom: 20px;">
                    <h4 style="color: var(--secondary-color); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-utensils"></i> Meal Suggestions
                    </h4>`;
                
                const mealTypes = ['breakfast', 'lunch', 'dinner'];
                mealTypes.forEach(mealType => {
                    if (dailyPlan.meals[mealType]) {
                        const meal = dailyPlan.meals[mealType];
                const mealName = meal.suggestion || meal;
                html += `<div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid var(--secondary-color); display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <strong style="color: var(--text-primary); text-transform: capitalize;">${mealType}</strong>
                            <span style="font-size: 0.85em; color: var(--text-secondary);">
                                ${meal.calories || ''} ${meal.calories ? 'cal' : ''} ${meal.protein ? '| P:' + meal.protein + 'g' : ''}
                                </span>
                            </div>
                        <div style="font-size: 0.95em; color: var(--text-primary); font-weight: 500;">
                            ${mealName}
                            </div>
                            </div>
                    <button onclick="viewRecipeFromPlan('${mealName.replace(/'/g, "\\'")}')" 
                            style="padding: 8px 12px; font-size: 0.85em; background: var(--secondary-color); color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; transition: opacity 0.2s;"
                            onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        <i class="fas fa-utensils"></i> View Recipe
                    </button>
                        </div>`;
                    }
                });
                
                if (dailyPlan.meals.snacks && dailyPlan.meals.snacks.length > 0) {
                    html += `<div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid var(--secondary-color);">
                        <strong style="color: var(--text-primary); margin-bottom: 5px; display: block;">Snacks:</strong>
                        <div style="font-size: 0.9em; color: var(--text-secondary);">
                            ${dailyPlan.meals.snacks.map(snack => `• ${snack}`).join('<br>')}
                        </div>
                    </div>`;
                }
                html += `</div>`;
            }
            
            // Water intake
            if (dailyPlan.waterIntake) {
                html += `<div style="background: rgba(74, 144, 226, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid var(--accent-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-tint" style="color: var(--accent-color);"></i>
                        <strong style="color: var(--text-primary);">Water Intake:</strong>
                        <span style="margin-left: auto; font-size: 1.1em; color: var(--accent-color); font-weight: bold;">
                            ${dailyPlan.waterIntake.liters}L
                        </span>
                    </div>
                </div>`;
            }
            
    dailyPlanDiv.innerHTML = html;
}

// Regenerate daily plan
async function regenerateDailyPlan() {
    // Clear cache for today
    const today = new Date().toISOString().split('T')[0];
    if (currentUserId) {
        localStorage.removeItem(`dailyPlan_${currentUserId}_${today}`);
    }
    // Reload with force regeneration
    await loadDailyPlan(true);
}

// View recipe from daily plan
function viewRecipeFromPlan(recipeName) {
    // Check cache first for instant display
    const cachedRecipe = getCachedRecipe(recipeName);
    if (cachedRecipe) {
        // Display cached recipe directly
        showPage('recipe');
        setTimeout(() => {
            const resultDiv = document.getElementById('recipeResult');
            if (resultDiv) {
                displayRecipes([cachedRecipe]);
                resultDiv.classList.add('show');
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        return;
    }
    
    // If not cached, proceed with normal flow
    showPage('recipe');
    // Set the recipe name in search and generate
    setTimeout(() => {
        const recipeSearchInput = document.getElementById('recipeSearch');
        if (recipeSearchInput) {
            recipeSearchInput.value = recipeName;
            // Trigger generate
            const generateBtn = document.querySelector('#recipeSection button[onclick="generateRecipe()"]');
            if (generateBtn) {
                generateBtn.click();
        } else {
                generateRecipe();
            }
        }
    }, 300);
}

// Log activity from daily plan
function logActivityFromPlan(type, duration, intensity) {
    // Navigate to tracker page
    showPage('tracker');
    // Fill the form
    setTimeout(() => {
        const activityTypeSelect = document.getElementById('activityType');
        const durationInput = document.getElementById('duration');
        const intensitySelect = document.getElementById('intensity');
        
        if (activityTypeSelect) activityTypeSelect.value = type;
        if (durationInput) durationInput.value = duration;
        if (intensitySelect) intensitySelect.value = intensity;
        
        // Scroll to form
        const form = document.querySelector('#tracker form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// Use activity recommendation (fill form with recommended values)
function useActivityRecommendation(type, duration, intensity) {
    const activityTypeSelect = document.getElementById('activityType');
    const durationInput = document.getElementById('duration');
    
    if (activityTypeSelect) activityTypeSelect.value = type;
    if (durationInput) {
        durationInput.value = duration;
        calculateActivityCalories(); // Auto-calculate calories
    }
    
    // Show success message
    const recommendationBox = document.getElementById('activityRecommendationContent');
    if (recommendationBox) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'background: rgba(80, 200, 120, 0.2); padding: 10px; border-radius: 5px; margin-top: 10px; color: var(--secondary-color);';
        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> ${type.charAt(0).toUpperCase() + type.slice(1)} (${duration} min) has been filled in!`;
        recommendationBox.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    }
}

// Show page function
// Show custom styled notification
function showNotification(message, type = 'success', duration = 3000) {
    // Remove any existing notifications
    const existing = document.querySelectorAll('.custom-notification');
    existing.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.setAttribute('data-type', type);
    
    // Set icon based on type
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'info') icon = 'fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
}

// Navigate to home page and reset everything
function navigateToHome() {
    // Close all popovers and modals
    const actionBar = document.getElementById('weeklyPlanActionBar');
    if (actionBar) actionBar.style.display = 'none';
    
    const ingredientPopover = document.getElementById('weeklyPlanIngredientPopover');
    if (ingredientPopover) ingredientPopover.style.display = 'none';
    
    // Clear any selections
    window.currentWeeklyPlanSelection = null;
    
    // Close all navigation dropdowns
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        if (menu) {
            menu.style.opacity = '';
            menu.style.visibility = '';
            menu.style.transform = '';
            menu.style.pointerEvents = '';
            menu.style.display = '';
            menu.style.zIndex = '';
            menu.style.position = '';
            menu.style.backgroundColor = '';
            menu.style.backdropFilter = '';
            menu.style.webkitBackdropFilter = '';
        }
    });
    
    // Close any open modals (meal selection dialog, etc.)
    document.querySelectorAll('[style*="z-index: 10000"]').forEach(modal => {
        if (modal.style.position === 'fixed' && modal.style.background.includes('rgba')) {
            modal.remove();
        }
    });
    
    // Navigate to home page
    showPage('home');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    
    // Update active nav link and dropdown items
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // Update active dropdown item
    document.querySelectorAll('.nav-dropdown-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
            // Also highlight the dropdown toggle if one of its items is active
            const dropdown = item.closest('.nav-dropdown');
            if (dropdown) {
                const toggle = dropdown.querySelector('.nav-dropdown-toggle');
                if (toggle) {
                    toggle.classList.add('active');
                }
            }
        }
    });
    
    // Update main-content background based on page
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        if (pageName === 'home' || pageName === 'overview') {
            mainContent.classList.add('white-background');
        } else {
            mainContent.classList.remove('white-background');
        }
    }
    
    // Save last viewed page to localStorage
    localStorage.setItem('lastPage', pageName);
    
    // Update pages when navigating
    if (pageName === 'overview') {
        updateOverview();
    } else if (pageName === 'suggestions') {
        getSuggestions(); // Auto-load suggestions
    } else if (pageName === 'progress') {
        updateProgressPage(); // Load progress, achievements, and charts
    } else if (pageName === 'tracker') {
        loadActivityRecommendations(); // Load AI activity recommendations
    } else if (pageName === 'recipe') {
        loadRecipeSuggestions(); // Load AI recipe suggestions
    } else if (pageName === 'chatbot') {
        initializeChatbot(); // Initialize chatbot
    } else if (pageName === 'weeklyPlan') {
        loadWeeklyPlanPage();
    } else if (pageName === 'meals') {
        loadCommonPortions(); // Load common portions shortcuts
        loadRecentMealsChips(); // Load recent meals chips
        displayMeals(); // Display meals list
    } else if (pageName === 'connectedDevices') {
        loadDeviceStatus(); // Load device connection status
        loadSyncHistory(); // Load sync history
    }
}

// ==================== SAVED 7-DAY PLAN (TABULAR VIEW + POPOVER) ====================

// Cache to avoid recomputing ingredient lists and URLs repeatedly
let weeklyPlanIngredientCache = {};

function getSaved7DayPlanFromStorage() {
    try {
        const raw = localStorage.getItem('saved7DayPlan');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading saved 7-day plan:', e);
        return null;
    }
}

function save7DayPlanToStorage(plan) {
    try {
        // Store the start date (today's date) when saving the plan
        // This ensures dates remain constant regardless of when the plan is viewed
        const startDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const payload = {
            savedAt: new Date().toISOString(),
            startDate: startDate, // Store the start date for Day 1
            plan
        };
        localStorage.setItem('saved7DayPlan', JSON.stringify(payload));
    } catch (e) {
        console.error('Error saving 7-day plan:', e);
    }
}

function normalizeWeeklyPlanDayDate(plan, dayIndex) {
    // Use the saved start date instead of current date to keep dates constant
    const saved = getSaved7DayPlanFromStorage();
    let startDateStr = saved?.startDate;
    
    // If no start date is stored (for backward compatibility), use savedAt date
    if (!startDateStr && saved?.savedAt) {
        startDateStr = saved.savedAt.split('T')[0]; // Extract date from ISO string
    }
    
    // If still no date available, use today (shouldn't happen, but safety fallback)
    if (!startDateStr) {
        const today = new Date();
        startDateStr = today.toISOString().split('T')[0];
    }
    
    // Calculate date based on saved start date + dayIndex
    const startDate = new Date(startDateStr);
    startDate.setDate(startDate.getDate() + dayIndex);
    
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, '0');
    const dd = String(startDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatWeeklyPlanDisplayDate(isoDateStr) {
    if (!isoDateStr) return '';
    const parts = isoDateStr.split('-');
    if (parts.length !== 3) return isoDateStr;
    const [yyyy, mm, dd] = parts;
    const yy = yyyy.slice(-2);
    return `${dd}-${mm}-${yy}`;
}

function extractMealName(meal) {
    return typeof meal === 'string' ? meal : (meal?.name || meal?.suggestion || '');
}

// Helper function to get meal from day.meals, handling both 'snack' (singular) and 'snacks' (plural)
function getMealFromDay(day, mealType) {
    if (!day || !day.meals) return null;
    let meal = day.meals[mealType];
    // Handle both 'snack' (singular) and 'snacks' (plural) for backward compatibility
    if (mealType === 'snack' && !meal && day.meals.snacks) {
        meal = day.meals.snacks;
    }
    return meal;
}

function extractMealCalories(meal) {
    if (typeof meal !== 'object' || !meal) return null;
    const c = meal.calories;
    if (c === undefined || c === null) return null;
    const n = typeof c === 'number' ? c : parseFloat(String(c).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : null;
}

// Normalize any stored meal.date value to ISO (YYYY-MM-DD) for reliable comparisons
function getMealDateISO(meal) {
    if (!meal || !meal.date) return null;
    try {
        // If already in YYYY-MM-DD, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(meal.date)) return meal.date;
        const d = new Date(meal.date);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
}

function weeklyPlanOpenRecipe(dayIndex, mealType) {
    const saved = getSaved7DayPlanFromStorage();
    const plan = saved?.plan;
    const day = plan?.days?.[dayIndex];
    const meal = getMealFromDay(day, mealType);
    const name = extractMealName(meal);
    if (!name) {
        showNotification('Meal name not found for this slot.', 'error');
        return;
    }
    redirectToRecipeGenerator(name);
}

function weeklyPlanOpenZomato(dayIndex, mealType) {
    const saved = getSaved7DayPlanFromStorage();
    const plan = saved?.plan;
    const day = plan?.days?.[dayIndex];
    const meal = getMealFromDay(day, mealType);
    const name = extractMealName(meal);
    if (!name) {
        showNotification('Meal name not found for this slot.', 'error');
        return;
    }
    // Open Zomato search optimized for dish/menu item search
    // Zomato's search algorithm works better for dishes when the query is more specific
    // We'll use the dish name directly and let Zomato's search handle it
    // The search results page should show both restaurants and dishes, but dishes are usually shown
    // in a separate section or as menu items within restaurant listings
    
    // Clean the dish name - remove common meal type prefixes if present
    let dishName = name.trim();
    // Remove meal type prefixes that might interfere with search
    dishName = dishName.replace(/^(breakfast|lunch|dinner|snack):\s*/i, '');
    
    const searchQuery = encodeURIComponent(dishName);
    
    // Use Zomato's general search - it should show dish results in the search page
    // Zomato typically shows dishes in a "Dishes" tab or section on the search results page
    // Users can then click on the "Dishes" tab if available, or dishes appear in restaurant menus
    const zomatoUrl = `https://www.zomato.com/search?q=${searchQuery}`;
    
    window.open(zomatoUrl, '_blank', 'noopener,noreferrer');
}

function weeklyPlanPrefillMealLog(dayIndex, mealType) {
    const saved = getSaved7DayPlanFromStorage();
    const plan = saved?.plan;
    const day = plan?.days?.[dayIndex];
    const meal = getMealFromDay(day, mealType);
    const name = extractMealName(meal);
    if (!name) {
        showNotification('Meal name not found for this slot.', 'error');
        return;
    }

    const date = normalizeWeeklyPlanDayDate(plan, dayIndex);

    showPage('meals');
    setTimeout(() => {
        const mealTypeEl = document.getElementById('mealType');
        const mealDateEl = document.getElementById('mealDate');
        const mealNameEl = document.getElementById('mealName');

        if (mealTypeEl) mealTypeEl.value = String(mealType).toLowerCase();
        if (mealDateEl) mealDateEl.value = date;
        if (mealNameEl) {
            mealNameEl.value = name;
            mealNameEl.dispatchEvent(new Event('input', { bubbles: true }));
            mealNameEl.dispatchEvent(new Event('change', { bubbles: true }));
            mealNameEl.focus();
        }

        const form = document.querySelector('#meals .content-card');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
}

function weeklyPlanClearSelection() {
    window.currentWeeklyPlanSelection = null;
    const bar = document.getElementById('weeklyPlanActionBar');
    if (bar) bar.style.display = 'none';
    hideIngredientPopover();
}

function weeklyPlanSelectMeal(event, dayIndex, mealType) {
    // When selecting a new meal, always hide any open ingredient list popover
    hideIngredientPopover();

    const saved = getSaved7DayPlanFromStorage();
    const plan = saved?.plan;
    const day = plan?.days?.[dayIndex];
    const meal = getMealFromDay(day, mealType);
    const name = extractMealName(meal);
    if (!name) return;

    window.currentWeeklyPlanSelection = { dayIndex, mealType, name };

    const bar = document.getElementById('weeklyPlanActionBar');
    if (!bar) return;

    bar.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(74, 144, 226, 0.18) 0%, rgba(80, 200, 120, 0.14) 100%);
            border: 1px solid rgba(255,255,255,0.14);
            border-radius: 14px;
            padding: 12px 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        ">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
                <div>
                    <div style="color: var(--text-secondary); font-size: 0.9em;">Selected meal</div>
                    <div style="font-weight: 900; color: var(--text-primary); margin-top: 2px;">
                        <i class="fas fa-utensils"></i> ${name}
                    </div>
                </div>
                <button onclick="weeklyPlanClearSelection()"
                        style="background: transparent; border: none; color: var(--text-secondary); cursor:pointer; padding: 6px 8px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px;">
                <button class="btn-primary" style="padding: 10px 14px; min-width: unset; background: var(--secondary-color);"
                        onclick="weeklyPlanPrefillMealLog(${dayIndex}, '${mealType}')">
                    <i class="fas fa-plus"></i> Add to Meal Log
                </button>
                <button class="btn-primary" style="padding: 10px 14px; min-width: unset; background: var(--primary-color);"
                        onclick="weeklyPlanOpenRecipe(${dayIndex}, '${mealType}')">
                    <i class="fas fa-magic"></i> Recipe Generator
                </button>
                <button class="btn-primary" style="padding: 10px 14px; min-width: unset; background: var(--accent-color);"
                        onclick="weeklyPlanShowIngredients(event, ${dayIndex}, '${mealType}')">
                    <i class="fas fa-list"></i> Ingredients List
                </button>
                <button class="btn-primary" style="padding: 10px 14px; min-width: unset; background: linear-gradient(135deg, #E23744 0%, #CB202D 100%);"
                        onclick="weeklyPlanOpenZomato(${dayIndex}, '${mealType}')">
                    <i class="fas fa-utensils"></i> Find on Zomato
                </button>
            </div>
        </div>
    `;
    const rect = event?.currentTarget?.getBoundingClientRect();
    const estHeight = 180; // Increased height to accommodate 4 buttons
    if (rect) {
        const preferredLeft = rect.left + rect.width / 2;
        const preferredTopBelow = rect.top + rect.height + 10;
        let top = preferredTopBelow;
        if (preferredTopBelow + estHeight > window.innerHeight - 16) {
            top = Math.max(12, rect.top - estHeight - 10);
        }
        const clampedLeft = Math.max(16, Math.min(preferredLeft, window.innerWidth - 16));
        bar.style.left = `${clampedLeft}px`;
        bar.style.top = `${Math.max(12, top)}px`;
        bar.style.transform = 'translateX(-50%)';
    }
    bar.style.maxWidth = 'min(92vw, 520px)';
    bar.style.display = 'block';
}

// Helper function to split ingredients by multiple separators
function splitIngredients(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Normalize the text - replace common separators with a consistent delimiter
    let normalized = text
        .replace(/\s+and\s+/gi, '|')  // Replace " and " with |
        .replace(/\s+with\s+/gi, '|') // Replace " with " with |
        .replace(/\s+or\s+/gi, '|')  // Replace " or " with |
        .replace(/,/g, '|');           // Replace commas with |
    
    // Split by the delimiter and clean up
    const parts = normalized
        .split('|')
        .map(s => s.trim())
        .filter(s => s && s.length > 0);
    
    return parts;
}

function getMealIngredients(meal) {
    if (!meal) return [];
    const normalizeIng = (ing) => {
        if (typeof ing === 'string') return { name: ing, qty: null };
        if (typeof ing === 'object') {
            return {
                name: ing.name || ing.label || ing.ingredient || ing.item || '',
                qty: ing.quantity || ing.qty || ing.amount || ing.measure || ing.units || ing.quantityText || ing.portion || null
            };
        }
        return { name: String(ing), qty: null };
    };
    if (Array.isArray(meal.ingredients)) {
        return meal.ingredients.map(normalizeIng).filter(i => i.name);
    }
    // Check if meal is a string that might contain ingredients
    if (typeof meal === 'string') {
        // Check if it contains any of the separators
        if (/,|\s+(and|with|or)\s+/i.test(meal)) {
            const ingredients = splitIngredients(meal);
            return ingredients.map(n => ({ name: n, qty: null }));
        }
    }
    // If meal has ingredients as a string property
    if (meal.ingredients && typeof meal.ingredients === 'string') {
        const ingredients = splitIngredients(meal.ingredients);
        return ingredients.map(n => ({ name: n, qty: null }));
    }
    const name = extractMealName(meal);
    return name ? [{ name, qty: null }] : [];
}

function hideIngredientPopover() {
    const pop = document.getElementById('weeklyPlanIngredientPopover');
    if (pop) pop.style.display = 'none';
}

function weeklyPlanShowIngredients(event, dayIndex, mealType) {
    const pop = document.getElementById('weeklyPlanIngredientPopover');
    if (!pop) return;
    const saved = getSaved7DayPlanFromStorage();
    const day = saved?.plan?.days?.[dayIndex];
    const meal = getMealFromDay(day, mealType);
    const name = extractMealName(meal);
    const cacheKey = `${dayIndex}-${mealType}`;

    if (!weeklyPlanIngredientCache[cacheKey]) {
        weeklyPlanIngredientCache[cacheKey] = getMealIngredients(meal);
    }
    const ingredients = weeklyPlanIngredientCache[cacheKey];

    if (!ingredients.length) {
        pop.innerHTML = `
            <div style="
                background: #ffffff;
                color: var(--text-primary);
                border: 1px solid rgba(0,0,0,0.08);
                border-radius: 14px;
                padding: 14px;
                max-width: 360px;
                box-shadow: 0 14px 34px rgba(0,0,0,0.16);
            ">
                <div style="font-weight: 800; margin-bottom: 6px;">No ingredients found</div>
                <div style="color: var(--text-secondary);">This plan item has no ingredient list.</div>
            </div>
        `;
    } else {
        const listHtml = ingredients.map(ing => {
            const safeName = ing.name.replace(/"/g, '&quot;');
            const url = `https://blinkit.com/s/?q=${encodeURIComponent(ing.name)}`;
            const qty = ing.qty ? `<span style="color: var(--text-secondary); font-size: 0.9em;"> • ${ing.qty}</span>` : '';
            return `
                <li style="
                    padding: 10px 10px;
                    border-radius: 10px;
                    background: rgba(0,0,0,0.02);
                    border: 1px solid rgba(0,0,0,0.05);
                    color: var(--text-primary);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                    transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
                "
                onmouseenter="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 10px 24px rgba(0,0,0,0.16)'; this.style.background='rgba(0,0,0,0.04)';"
                onmouseleave="this.style.transform='none'; this.style.boxShadow='none'; this.style.background='rgba(0,0,0,0.02)';">
                    <div style="font-weight: 800; display: flex; flex-direction: column; gap: 2px;">
                        <span style="color: var(--text-primary);">${safeName}</span>
                        ${qty}
                    </div>
                    <a href="${url}" target="_blank" rel="noopener noreferrer"
                       style="
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            padding: 8px 10px;
                            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                            color: white;
                            border-radius: 10px;
                            font-weight: 800;
                            text-decoration: none;
                            font-size: 0.9em;
                            box-shadow: 0 8px 18px rgba(39, 174, 96, 0.28);
                       ">
                        <span style="background: rgba(0,0,0,0.15); padding: 4px 6px; border-radius: 8px; font-size: 0.8em;">Blinkit</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </li>
            `;
        }).join('');

        pop.innerHTML = `
            <div style="
                background: #ffffff;
                color: var(--text-primary);
                border: 1px solid rgba(0,0,0,0.08);
                border-radius: 14px;
                padding: 14px;
                max-width: 380px;
                box-shadow: 0 14px 34px rgba(0,0,0,0.18);
                pointer-events: auto;
            ">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom: 10px;">
                    <div style="font-weight: 900;">Ingredients${name ? ` • ${name}` : ''}</div>
                    <button onclick="hideIngredientPopover()" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${listHtml}
                </ul>
            </div>
        `;
    }

    const rect = event?.currentTarget?.getBoundingClientRect();
    const estHeight = 280;
    if (rect) {
        const preferredLeft = rect.left + rect.width / 2;
        const preferredTopBelow = rect.top + rect.height + 10;
        let top = preferredTopBelow;
        if (preferredTopBelow + estHeight > window.innerHeight - 12) {
            top = Math.max(8, rect.top - estHeight - 10);
        }
        const clampedLeft = Math.max(12, Math.min(preferredLeft, window.innerWidth - 12));
        pop.style.left = `${clampedLeft}px`;
        pop.style.top = `${Math.max(8, top)}px`;
        pop.style.transform = 'translateX(-50%)';
    }
    pop.style.display = 'block';
}

// Show meal selection dialog
function showMealSelectionDialog(mealsToLog) {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: var(--dark-bg);
            border-radius: 15px;
            padding: 25px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        const mealTypeLabels = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack'
        };
        
        const mealIcons = {
            breakfast: 'fa-coffee',
            lunch: 'fa-utensils',
            dinner: 'fa-drumstick-bite',
            snack: 'fa-cookie-bite'
        };
        
        // Create checkboxes for each meal
        let checkboxesHtml = '<div style="margin-bottom: 20px;"><h3 style="color: var(--text-primary); margin-bottom: 15px;"><i class="fas fa-calendar-day"></i> Select Meals to Log</h3></div>';
        
        // Add "Select All" option
        checkboxesHtml += `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(74, 144, 226, 0.1); border-radius: 8px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text-primary);">
                    <input type="checkbox" id="selectAllMeals" style="width: 18px; height: 18px; cursor: pointer;" checked>
                    <span style="font-weight: 600;"><i class="fas fa-check-square"></i> Select All (${mealsToLog.length} meals)</span>
                </label>
            </div>
        `;
        
        mealsToLog.forEach((meal, index) => {
            checkboxesHtml += `
                <div style="margin-bottom: 12px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: var(--text-primary);">
                        <input type="checkbox" class="meal-checkbox" data-index="${index}" style="width: 18px; height: 18px; cursor: pointer;" checked>
                        <i class="fas ${mealIcons[meal.type] || 'fa-utensils'}" style="color: var(--primary-color); width: 20px;"></i>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${mealTypeLabels[meal.type] || meal.type}</div>
                            <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 2px;">${meal.name}</div>
                        </div>
                    </label>
                </div>
            `;
        });
        
        modal.innerHTML = `
            ${checkboxesHtml}
            <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                <button id="cancelMealSelection" style="
                    padding: 10px 20px;
                    background: rgba(255, 107, 107, 0.2);
                    border: 1px solid rgba(255, 107, 107, 0.4);
                    border-radius: 8px;
                    color: var(--accent-color);
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                " onmouseenter="this.style.background='rgba(255, 107, 107, 0.3)'" onmouseleave="this.style.background='rgba(255, 107, 107, 0.2)'">
                    Cancel
                </button>
                <button id="confirmMealSelection" style="
                    padding: 10px 20px;
                    background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s ease;
                " onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform='none'">
                    <i class="fas fa-check"></i> Log Selected Meals
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle select all checkbox
        const selectAllCheckbox = modal.querySelector('#selectAllMeals');
        const mealCheckboxes = modal.querySelectorAll('.meal-checkbox');
        
        selectAllCheckbox.addEventListener('change', function() {
            mealCheckboxes.forEach(cb => {
                cb.checked = this.checked;
            });
        });
        
        // Handle individual checkbox changes
        mealCheckboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                const allChecked = Array.from(mealCheckboxes).every(c => c.checked);
                selectAllCheckbox.checked = allChecked;
            });
        });
        
        // Handle cancel
        modal.querySelector('#cancelMealSelection').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });
        
        // Handle confirm
        modal.querySelector('#confirmMealSelection').addEventListener('click', () => {
            const selectedIndices = Array.from(mealCheckboxes)
                .map((cb, idx) => cb.checked ? idx : null)
                .filter(idx => idx !== null);
            
            const selected = selectedIndices.map(idx => mealsToLog[idx]);
            document.body.removeChild(overlay);
            resolve(selected);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        });
    });
}

// Log all of today's meals from the 7-day plan
async function logTodaysMealsFromPlan() {
    const saved = getSaved7DayPlanFromStorage();
    if (!saved?.plan) {
        showNotification('No 7-day plan found. Please generate one first.', 'warning');
        return;
    }
    
    const plan = saved.plan;
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's day index in the plan
    let todayIndex = -1;
    for (let i = 0; i < plan.days.length; i++) {
        const dayDate = normalizeWeeklyPlanDayDate(plan, i);
        if (dayDate === today) {
            todayIndex = i;
            break;
        }
    }
    
    if (todayIndex === -1) {
        showNotification('Today is not in the current 7-day plan range. Please generate a new plan.', 'warning');
        return;
    }
    
    const todayDay = plan.days[todayIndex];
    const mealColumns = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealsToLog = [];
    
    mealColumns.forEach(mealType => {
        const meal = getMealFromDay(todayDay, mealType);
        const name = extractMealName(meal);
        if (name) {
            mealsToLog.push({
                type: mealType,
                name: name,
                quantity: 100, // Default 100g
                date: today
            });
        }
    });
    
    if (mealsToLog.length === 0) {
        showNotification('No meals planned for today in your 7-day plan.', 'info');
        return;
    }
    
    // Show selection dialog
    const selectedMeals = await showMealSelectionDialog(mealsToLog);
    if (!selectedMeals || selectedMeals.length === 0) {
        return; // User cancelled or selected nothing
    }
    
    // Navigate to meal log page
    showPage('meals');
    
    // Set today's date
    const mealDateEl = document.getElementById('mealDate');
    if (mealDateEl) mealDateEl.value = today;
    
    // Log each selected meal sequentially with a small delay
    let loggedCount = 0;
    let failedCount = 0;
    
    for (const mealData of selectedMeals) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between logs
            
            // Set meal type
            const mealTypeEl = document.getElementById('mealType');
            if (mealTypeEl) mealTypeEl.value = mealData.type;
            
            // Set meal name and trigger lookup
            const mealNameEl = document.getElementById('mealName');
            if (mealNameEl) {
                mealNameEl.value = mealData.name;
                mealNameEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Set quantity
            const mealQuantityEl = document.getElementById('mealQuantity');
            if (mealQuantityEl) mealQuantityEl.value = mealData.quantity;
            
            // Wait for nutrition lookup
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Log the meal (don't await alerts, but catch errors)
            try {
                await logMeal();
                loggedCount++;
            } catch (err) {
                console.error('Error logging meal:', err);
                failedCount++;
            }
        } catch (err) {
            console.error('Error processing meal:', err);
            failedCount++;
        }
    }
    
    const resultMsg = failedCount > 0 
        ? `Logged ${loggedCount} meal(s) successfully. ${failedCount} meal(s) failed - please log them manually.`
        : `Successfully logged ${loggedCount} meal(s) for today!`;
    showNotification(resultMsg, failedCount > 0 ? 'warning' : 'success');
    
    // Refresh plan view to show updated colors
    setTimeout(() => {
        loadWeeklyPlanPage(true);
    }, 500);
}

function loadWeeklyPlanPage(forceRefresh = false) {
    const metaEl = document.getElementById('weeklyPlanMeta');
    const wrapEl = document.getElementById('weeklyPlanTableWrap');
    const expectedEl = document.getElementById('weeklyPlanExpectedResults');
    const refreshBtn = document.getElementById('weeklyPlanRefreshBtn');
    const refreshIcon = document.getElementById('weeklyPlanRefreshIcon');

    // Start animation if refreshing
    if (forceRefresh && refreshBtn && refreshIcon) {
        refreshBtn.classList.add('refreshing');
        refreshIcon.classList.add('spinning');
    }

    if (!wrapEl || !expectedEl) {
        // Stop animation if early return
        if (refreshBtn && refreshIcon) {
            refreshBtn.classList.remove('refreshing');
            refreshIcon.classList.remove('spinning');
        }
        return;
    }

    // Ensure we use the latest logged meals (in case user logged after plan generation)
    try {
        const storedMeals = JSON.parse(localStorage.getItem('meals') || '[]');
        if (Array.isArray(storedMeals) && storedMeals.length >= meals.length) {
            meals = storedMeals;
        }
    } catch (e) {
        // Ignore parse errors and keep in-memory meals
    }

    const saved = getSaved7DayPlanFromStorage();
    if (!saved?.plan) {
        if (metaEl) metaEl.textContent = '';
        weeklyPlanClearSelection();
        weeklyPlanIngredientCache = {};
        wrapEl.innerHTML = `
            <div style="text-align:center; color: var(--text-secondary); padding: 18px;">
                No saved 7-day plan yet. Go to <strong>AI Chat</strong> → Generate 7-Day Plan → Save to Chat.
            </div>
        `;
        expectedEl.innerHTML = '';
        return;
    }

    if (metaEl) {
        const when = saved.savedAt ? new Date(saved.savedAt).toLocaleString() : '';
        metaEl.innerHTML = when ? `<i class="fas fa-save"></i> Last saved: <strong>${when}</strong>` : '';
    }

    const plan = saved.plan;
    // Reset ingredient cache when a new plan is loaded
    weeklyPlanIngredientCache = {};
    const days = Array.isArray(plan.days) ? plan.days : [];
    const mealColumns = ['breakfast', 'lunch', 'dinner', 'snack'];

    const headerHtml = `
        <tr>
            <th style="padding: 12px; text-align:left; position: sticky; left: 0; background: rgba(255,255,255,0.06); box-shadow: 4px 0 8px rgba(0,0,0,0.1); color: var(--text-primary);">Day</th>
            ${mealColumns.map(m => `<th style="padding: 12px; text-align:left; text-transform:capitalize; color: var(--text-primary);">${m}</th>`).join('')}
        </tr>
    `;

    const rowsHtml = days.map((day, dayIndex) => {
        const isoDate = normalizeWeeklyPlanDayDate(plan, dayIndex);
        const displayDate = formatWeeklyPlanDisplayDate(isoDate);
        const dayLabel = `${displayDate || ''} • Day ${dayIndex + 1}`;

        const cells = mealColumns.map(mealType => {
            const meal = getMealFromDay(day, mealType);
            const name = extractMealName(meal);
            const cals = extractMealCalories(meal);
            const calsHtml = cals !== null ? `<div style="margin-top:6px; color: var(--accent-color); font-size: 0.9em;"><i class="fas fa-fire"></i> ${Math.round(cals)} cal</div>` : '';

            // Determine background color based on whether user logged this slot in Meal Log
            let bgColor = 'rgba(255,255,255,0.04)';
            let borderColor = 'rgba(255,255,255,0.08)';
            if (isoDate) {
                const sameDateMeals = meals
                    .map(m => ({ meal: m, iso: getMealDateISO(m) }))
                    .filter(x => x.iso === isoDate)
                    .map(x => x.meal);
                if (sameDateMeals.length > 0) {
                    const sameTypeMeals = sameDateMeals.filter(m => m.type === mealType);
                    const sameName = sameTypeMeals.some(m => m.name && name && m.name.toLowerCase() === name.toLowerCase());
                    if (sameTypeMeals.length === 0) {
                        // Other meals logged this day, but this meal-type slot skipped
                        bgColor = 'rgba(255, 107, 107, 0.15)'; // dark theme red
                        borderColor = 'rgba(255, 107, 107, 0.3)';
                    } else if (sameName) {
                        // Logged exactly this meal for this slot
                        bgColor = 'rgba(80, 200, 120, 0.15)'; // dark theme green
                        borderColor = 'rgba(80, 200, 120, 0.3)';
                    } else {
                        // Logged a different meal for this slot
                        bgColor = 'rgba(255, 193, 7, 0.15)'; // dark theme yellow
                        borderColor = 'rgba(255, 193, 7, 0.3)';
                    }
                }
            }

            if (!name) {
                return `
                    <td style="padding: 12px; vertical-align: top; min-width: 220px; background: ${bgColor}; border: 1px solid ${borderColor}; color: var(--text-primary);">
                        <div style="color: var(--text-secondary);">—</div>
                    </td>
                `;
            }

            return `
                <td style="padding: 12px; vertical-align: top; min-width: 220px; background: ${bgColor}; border: 1px solid ${borderColor}; color: var(--text-primary);">
                    <div>
                        <span
                            onclick="weeklyPlanSelectMeal(event, ${dayIndex}, '${mealType}')"
                            title="Click for actions"
                            style="
                                display:inline-block;
                                font-weight: 900;
                                color: var(--text-primary);
                                cursor: pointer;
                                padding: 6px 10px;
                                border-radius: 12px;
                                position: relative;
                                transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease;
                                background: rgba(255,255,255,0.03);
                                border: 1px solid rgba(255,255,255,0.10);
                                box-shadow: 0 0 0 rgba(0,0,0,0);
                            "
                            onmouseenter="this.style.transform='translateY(-1px) scale(1.01)'; this.style.background='linear-gradient(135deg, rgba(74,144,226,0.20), rgba(80,200,120,0.16))'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.22)';"
                            onmouseleave="this.style.transform='none'; this.style.background='rgba(255,255,255,0.03)'; this.style.boxShadow='0 0 0 rgba(0,0,0,0)';"
                        >
                            ${name}
                        </span>
                    </div>
                    ${calsHtml}
                </td>
            `;
        }).join('');

        return `
            <tr>
                <td style="
                    padding: 12px;
                    text-align:left;
                    vertical-align: top;
                    position: sticky;
                    left: 0;
                    min-width: 180px;
                    background: rgba(255,255,255,0.06);
                    box-shadow: 4px 0 8px rgba(0,0,0,0.1);
                    color: var(--text-primary);
                ">
                    <div style="font-weight: 900; color: var(--text-primary);">${dayLabel}</div>
                    ${day?.notes ? `<div style="margin-top:8px; color: var(--text-secondary); font-style: italic; font-size: 0.9em;">${day.notes}</div>` : ''}
                </td>
                ${cells}
            </tr>
        `;
    }).join('');

    wrapEl.innerHTML = `
        <div style="margin-bottom: 12px; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px; flex-wrap: wrap;">
                <div>
                    <div style="font-weight: 800; color: var(--text-primary);"><i class="fas fa-calendar-week"></i> 7-Day Plan Table</div>
                    <div style="color: var(--text-secondary); margin-top: 6px;">${plan.summary || 'Your saved 7-day plan.'}</div>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.95em;">
                    Tip: “Add to Meal Log” pre-fills the meal form (you can edit quantity/nutrition before logging).
                </div>
            </div>
        </div>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; min-width: 900px; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.02);">
            <thead style="background: rgba(255,255,255,0.08);">
                ${headerHtml}
            </thead>
            <tbody style="background: rgba(255,255,255,0.02);">
                ${rowsHtml || `<tr><td style="padding: 14px; color: var(--text-secondary);">No days found in the saved plan.</td></tr>`}
            </tbody>
        </table>
    `;

    expectedEl.innerHTML = renderWeeklyPlanExpectedResults(plan);
    
    // Add streak-based nudges
    renderStreakBasedNudges(plan);
    
    // Stop animation after refresh completes
    if (forceRefresh) {
        setTimeout(() => {
            const refreshBtn = document.getElementById('weeklyPlanRefreshBtn');
            const refreshIcon = document.getElementById('weeklyPlanRefreshIcon');
            if (refreshBtn && refreshIcon) {
                refreshBtn.classList.remove('refreshing');
                refreshIcon.classList.remove('spinning');
            }
        }, 300); // Small delay to ensure smooth transition
    }
}

// Render streak-based nudges based on plan adherence
function renderStreakBasedNudges(plan) {
    const expectedEl = document.getElementById('weeklyPlanExpectedResults');
    if (!expectedEl) return;
    
    const days = Array.isArray(plan?.days) ? plan.days : [];
    const mealColumns = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Count red cells (skipped meal slots) in last 3 days
    let redCellCount = 0;
    const last3Days = days.slice(-3);
    
    last3Days.forEach((day, dayIndex) => {
        const actualDayIndex = days.length - 3 + dayIndex;
        const isoDate = normalizeWeeklyPlanDayDate(plan, actualDayIndex);
        
        mealColumns.forEach(mealType => {
            const meal = getMealFromDay(day, mealType);
            const name = extractMealName(meal);
            if (!name) return;
            
            if (isoDate) {
                const sameDateMeals = meals
                    .map(m => ({ meal: m, iso: getMealDateISO(m) }))
                    .filter(x => x.iso === isoDate)
                    .map(x => x.meal);
                
                if (sameDateMeals.length > 0) {
                    const sameTypeMeals = sameDateMeals.filter(m => m.type === mealType);
                    if (sameTypeMeals.length === 0) {
                        // This is a red cell (skipped slot)
                        redCellCount++;
                    }
                }
            }
        });
    });
    
    // Show nudge if 3+ red cells in last 3 days
    if (redCellCount >= 3) {
        const nudgeHtml = `
            <div style="margin-top: 16px; padding: 14px; border-radius: 12px; border: 2px solid rgba(255, 193, 7, 0.4); background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <i class="fas fa-lightbulb" style="color: #ffc107; font-size: 1.5em; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                            Plan Adherence Suggestion
                        </div>
                        <p style="color: var(--text-secondary); margin: 0; line-height: 1.6;">
                            You've skipped ${redCellCount} meal slots in the last 3 days. Your plan adherence is lower than ideal. 
                            Consider generating a <strong>gentler, more flexible plan</strong> that better fits your routine, or use the 
                            <strong>"Log Today's Meals"</strong> button to quickly catch up!
                        </p>
                        <button 
                            onclick="showPage('chatbot'); setTimeout(() => { const input = document.getElementById('chatInput'); if(input) input.value = 'Generate a more flexible 7-day plan that fits my routine better'; input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'})); }, 500);"
                            style="margin-top: 10px; padding: 8px 16px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: 600; transition: transform 0.2s ease;"
                            onmouseenter="this.style.transform='translateY(-1px)';"
                            onmouseleave="this.style.transform='none';"
                        >
                            <i class="fas fa-magic"></i> Generate Gentler Plan
                        </button>
                    </div>
                </div>
            </div>
        `;
        expectedEl.innerHTML += nudgeHtml;
    }
}

function renderWeeklyPlanExpectedResults(plan) {
    const profile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
    const days = Array.isArray(plan?.days) ? plan.days : [];
    const mealColumns = ['breakfast', 'lunch', 'dinner', 'snack'];

    let totalCals = 0;
    let countedMeals = 0;
    const dailyTotals = [];

    days.forEach((day, i) => {
        let dayCals = 0;
        mealColumns.forEach(mt => {
            const meal = getMealFromDay(day, mt);
            const c = extractMealCalories(meal);
            if (c !== null) {
                dayCals += c;
                totalCals += c;
                countedMeals += 1;
            }
        });
        dailyTotals.push({ index: i, calories: dayCals || null });
    });

    const avgDailyCals = days.length > 0 && countedMeals > 0 ? Math.round(totalCals / days.length) : null;
    const goal = profile?.caloricGoal ? Math.round(profile.caloricGoal) : null;
    const tdee = profile?.tdee ? Math.round(profile.tdee) : null;
    const goalType = profile?.goalType || null;

    let deltaVsGoal = null;
    if (avgDailyCals !== null && goal !== null) deltaVsGoal = avgDailyCals - goal;

    let weightTrend = null;
    if (avgDailyCals !== null && tdee !== null) {
        const dailyDelta = avgDailyCals - tdee;
        const weeklyKg = (dailyDelta * 7) / 7700;
        weightTrend = weeklyKg;
    }

    const goalLine = goal !== null
        ? `<div style="color: var(--text-secondary); margin-top: 6px;"><strong>Goal calories:</strong> ${goal} /day (${goalType || 'goal'})</div>`
        : `<div style="color: var(--text-secondary); margin-top: 6px;">Set your profile goals to get more accurate predictions.</div>`;

    const avgLine = avgDailyCals !== null
        ? `<div style="margin-top: 6px;"><strong>Planned avg calories:</strong> ${avgDailyCals} /day</div>`
        : `<div style="margin-top: 6px; color: var(--text-secondary);">Calories aren’t included in this plan’s meals, so results are estimated qualitatively.</div>`;

    const deltaLine = (deltaVsGoal !== null)
        ? `<div style="margin-top: 6px; color: ${deltaVsGoal <= 0 ? 'var(--secondary-color)' : 'var(--warning-color)'};">
              <strong>Delta vs goal:</strong> ${deltaVsGoal > 0 ? '+' : ''}${deltaVsGoal} cal/day
           </div>`
        : '';

    const trendLine = (weightTrend !== null)
        ? `<div style="margin-top: 6px; color: var(--text-secondary);">
              <strong>Expected weekly trend:</strong> ${weightTrend > 0 ? '+' : ''}${weightTrend.toFixed(2)} kg/week (based on your TDEE)
           </div>`
        : '';

    const qualitative = `
        <ul style="margin: 10px 0 0; padding-left: 20px; color: var(--text-secondary); line-height: 1.7;">
            <li>Better consistency → easier calorie control and fewer impulsive meals.</li>
            <li>More planned protein/fiber (if you follow the meals) → improved satiety and steadier energy.</li>
            <li>Fewer “decision points” during the week → higher adherence to your goal.</li>
        </ul>
    `;

    return `
        <div style="padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04);">
            <div style="font-weight: 900; color: var(--text-primary);"><i class="fas fa-chart-line"></i> Expected Results (if you implement this plan)</div>
            ${avgLine}
            ${goalLine}
            ${deltaLine}
            ${trendLine}
            ${qualitative}
            <div style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9em;">
                Note: This is an estimate. Actual results depend on portions, cooking oils, snacks, and activity.
            </div>
        </div>
    `;
}

// BMI Calculation
function calculateBMI() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    
    if (weight && height) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        // Determine BMI category
        let category = '';
        if (bmi < 18.5) category = ' (Underweight)';
        else if (bmi < 25) category = ' (Normal)';
        else if (bmi < 30) category = ' (Overweight)';
        else category = ' (Obese)';
        
        document.getElementById('bmi').value = bmi + category;
    }
}

// Caloric Goal Calculation
function updateCaloricGoals() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const goalType = document.getElementById('goalType').value;
    const occupation = document.getElementById('occupation').value;
    
    if (!weight || !height || !age || !gender || !goalType || !occupation) {
        return;
    }
    
    // Calculate BMR using Harris-Benedict equation
    let bmr;
    const heightInMeters = height / 100;
    
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
        // Average for other gender
        bmr = ((88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)) + 
               (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age))) / 2;
    }
    
    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        'lightly-active': 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
        'extremely-active': 1.9
    };
    
    const tdee = bmr * activityMultipliers[occupation];
    
    // Adjust based on goal
    let caloricGoal;
    let macroSplit;
    
    switch(goalType) {
        case 'weight-loss':
            caloricGoal = Math.round(tdee - 500); // 500 cal deficit
            macroSplit = { carbs: 45, protein: 30, fats: 25 };
            break;
        case 'weight-gain':
            caloricGoal = Math.round(tdee + 500); // 500 cal surplus
            macroSplit = { carbs: 50, protein: 25, fats: 25 };
            break;
        case 'muscle-gain':
            caloricGoal = Math.round(tdee + 300); // 300 cal surplus
            macroSplit = { carbs: 40, protein: 35, fats: 25 };
            break;
        case 'maintain':
            caloricGoal = Math.round(tdee);
            macroSplit = { carbs: 45, protein: 25, fats: 30 };
            break;
        default:
            return; // Invalid goal type
    }
    
    // Update UI only if macroSplit is defined
    if (macroSplit && document.getElementById('caloricGoal')) {
        document.getElementById('caloricGoal').value = caloricGoal + ' calories/day';
        document.getElementById('carbsValue').textContent = macroSplit.carbs + '%';
        document.getElementById('proteinValue').textContent = macroSplit.protein + '%';
        document.getElementById('fatsValue').textContent = macroSplit.fats + '%';
    }
}

// Profile Management
async function saveProfile() {
    // Required fields
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const dietaryPreference = document.getElementById('dietaryPreferenceProfile').value;
    const occupation = document.getElementById('occupation').value;
    const goalType = document.getElementById('goalType').value;
    
    // Check required fields
    if (!name || !age || !gender || !weight || !height || !dietaryPreference || !occupation || !goalType) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Optional fields
    const diseases = document.getElementById('diseases').value;
    const allergies = document.getElementById('allergies').value;
    const medications = document.getElementById('medications').value;
    const sleepHours = document.getElementById('sleepHours').value;
    const waterIntake = document.getElementById('waterIntake').value;
    const exerciseFrequency = document.getElementById('exerciseFrequency').value;
    const stepCount = document.getElementById('stepCount').value;
    const screenTime = document.getElementById('screenTime').value;
    const targetDuration = document.getElementById('targetDuration').value;
    const familyHistory = document.getElementById('familyHistory').value;
    const stressLevel = document.getElementById('stressLevel').value;
    const bloodReports = document.getElementById('bloodReports').value;
    const foodDislikes = document.getElementById('foodDislikes').value;
    const preferredCuisines = document.getElementById('preferredCuisines').value;
    
    // Process arrays
    const diseasesList = diseases ? diseases.split(',').map(d => d.trim()).filter(d => d) : [];
    const allergiesList = allergies ? allergies.split(',').map(a => a.trim()).filter(a => a) : [];
    
    // Calculate BMI
    const heightInMeters = parseFloat(height) / 100;
    const bmi = (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(1);
    
    // Calculate BMR
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
        bmr = ((88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)) + 
               (447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age))) / 2;
    }
    
    // Activity multipliers
    const activityMultipliers = {
        sedentary: 1.2,
        'lightly-active': 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
        'extremely-active': 1.9
    };
    
    const tdee = bmr * activityMultipliers[occupation];
    
    // Adjust based on goal
    let caloricGoal;
    let macroSplit;
    
    switch(goalType) {
        case 'weight-loss':
            caloricGoal = Math.round(tdee - 500);
            macroSplit = { carbs: 45, protein: 30, fats: 25 };
            break;
        case 'weight-gain':
            caloricGoal = Math.round(tdee + 500);
            macroSplit = { carbs: 50, protein: 25, fats: 25 };
            break;
        case 'muscle-gain':
            caloricGoal = Math.round(tdee + 300);
            macroSplit = { carbs: 40, protein: 35, fats: 25 };
            break;
        case 'maintain':
            caloricGoal = Math.round(tdee);
            macroSplit = { carbs: 45, protein: 25, fats: 30 };
            break;
        default:
            // Fallback for unknown goal type
            caloricGoal = Math.round(tdee);
            macroSplit = { carbs: 45, protein: 25, fats: 30 };
            break;
    }
    
    // Safety check
    if (!macroSplit || !caloricGoal) {
        alert('Please select a valid goal type');
        return;
    }
    
    // Create profile object
    const profileData = {
        // Basic Details
        name: name,
        age: parseInt(age),
        gender: gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        bmi: parseFloat(bmi),
        
        // Health Information
        diseases: diseasesList,
        allergies: allergiesList,
        dietaryPreference: dietaryPreference,
        medications: medications || null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        waterIntake: waterIntake ? parseFloat(waterIntake) : null,
        
        // Activity & Lifestyle
        occupation: occupation,
        exerciseFrequency: exerciseFrequency ? parseInt(exerciseFrequency) : null,
        stepCount: stepCount ? parseInt(stepCount) : null,
        screenTime: screenTime ? parseFloat(screenTime) : null,
        
        // Goal Tracking
        goalType: goalType,
        targetDuration: targetDuration ? parseInt(targetDuration) : null,
        caloricGoal: caloricGoal,
        macroSplit: macroSplit,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        
        // Optional Enhancements
        familyHistory: familyHistory || null,
        stressLevel: stressLevel ? parseInt(stressLevel) : null,
        bloodReports: bloodReports || null,
        foodDislikes: foodDislikes || null,
        preferredCuisines: preferredCuisines || null,
        
        // System fields
        isSetupComplete: true,
        setupDate: new Date().toISOString()
    };
    
    // Save to API and localStorage
    try {
        userProfile = await updateUserProfile(profileData);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        updateSubscriptionBadge(); // Update subscription badge after profile update
        alert('Profile saved successfully! Your personalized health plan is ready.');
        showPage('home');
    } catch (error) {
        alert('Error saving profile: ' + error.message);
        // Fallback to localStorage
        userProfile = profileData;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        updateSubscriptionBadge(); // Update subscription badge after profile update
        showPage('home');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Call API logout if available
        if (typeof logoutUser === 'function') {
            logoutUser();
        }
        
        // Clear all user data
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('activities');
        localStorage.removeItem('meals');
        localStorage.removeItem('weights');
        localStorage.removeItem('lastPage');
        
        // Reset global variables
        userProfile = null;
        activities = [];
        meals = [];
        weights = [];
        
        // Hide app and show login with proper reset
        const loginScreen = document.getElementById('loginScreen');
        const appScreen = document.getElementById('appScreen');
        
        appScreen.style.display = 'none';
        loginScreen.style.display = 'flex';  // Use flex to maintain centering
        
        // Reset any form display states
        document.getElementById('loginFormContainer').style.display = 'block';
        document.getElementById('signupFormContainer').style.display = 'none';
        
        alert('Logged out successfully!');
    }
}

// Load user data from API
async function loadUserData() {
    try {
        console.log('Loading user data from API...');
        // Load activities
        activities = await getActivities();
        console.log('Loaded activities:', activities.length);
        // Load meals
        meals = await getMeals();
        console.log('Loaded meals:', meals.length);
        // Load weights
        weights = await getWeights();
        console.log('Loaded weights:', weights.length);
        
        // Store in localStorage as backup
        localStorage.setItem('activities', JSON.stringify(activities));
        localStorage.setItem('meals', JSON.stringify(meals));
        localStorage.setItem('weights', JSON.stringify(weights));
    } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to localStorage if API fails
        activities = JSON.parse(localStorage.getItem('activities')) || [];
        meals = JSON.parse(localStorage.getItem('meals')) || [];
        weights = JSON.parse(localStorage.getItem('weights')) || [];
        console.log('Using fallback data:', { activities: activities.length, meals: meals.length, weights: weights.length });
    }
}

function loadProfileData() {
    if (!userProfile) return;
    
    // Only load if elements exist
    if (document.getElementById('name')) document.getElementById('name').value = userProfile.name || '';
    if (document.getElementById('age')) document.getElementById('age').value = userProfile.age || '';
    if (document.getElementById('gender')) document.getElementById('gender').value = userProfile.gender || '';
    if (document.getElementById('weight')) document.getElementById('weight').value = userProfile.weight || '';
    if (document.getElementById('height')) document.getElementById('height').value = userProfile.height || '';
    if (document.getElementById('diseases')) document.getElementById('diseases').value = userProfile.diseases ? userProfile.diseases.join(', ') : '';
    if (document.getElementById('allergies')) document.getElementById('allergies').value = userProfile.allergies ? userProfile.allergies.join(', ') : '';
    if (document.getElementById('dietaryPreferenceProfile')) document.getElementById('dietaryPreferenceProfile').value = userProfile.dietaryPreference || 'omnivore';
    if (document.getElementById('medications')) document.getElementById('medications').value = userProfile.medications || '';
    if (document.getElementById('sleepHours')) document.getElementById('sleepHours').value = userProfile.sleepHours || '';
    if (document.getElementById('waterIntake')) document.getElementById('waterIntake').value = userProfile.waterIntake || '';
    if (document.getElementById('occupation')) document.getElementById('occupation').value = userProfile.occupation || '';
    if (document.getElementById('exerciseFrequency')) document.getElementById('exerciseFrequency').value = userProfile.exerciseFrequency || '';
    if (document.getElementById('stepCount')) document.getElementById('stepCount').value = userProfile.stepCount || '';
    if (document.getElementById('screenTime')) document.getElementById('screenTime').value = userProfile.screenTime || '';
    if (document.getElementById('goalType')) document.getElementById('goalType').value = userProfile.goalType || '';
    if (document.getElementById('targetDuration')) document.getElementById('targetDuration').value = userProfile.targetDuration || '';
    if (document.getElementById('familyHistory')) document.getElementById('familyHistory').value = userProfile.familyHistory || '';
    if (document.getElementById('stressLevel')) document.getElementById('stressLevel').value = userProfile.stressLevel || '';
    if (document.getElementById('bloodReports')) document.getElementById('bloodReports').value = userProfile.bloodReports || '';
    if (document.getElementById('foodDislikes')) document.getElementById('foodDislikes').value = userProfile.foodDislikes || '';
    if (document.getElementById('preferredCuisines')) document.getElementById('preferredCuisines').value = userProfile.preferredCuisines || '';
    
    // Recalculate if possible
    if (document.getElementById('weight') && document.getElementById('height')) {
        calculateBMI();
    }
    if (document.getElementById('goalType') && document.getElementById('goalType').value) {
        updateCaloricGoals();
    }
}

// Find recipes from database that contain ALL listed ingredients
function findRecipesWithAllIngredients(userIngredients, allRecipes) {
    if (!userIngredients || userIngredients.length === 0) {
        return [];
    }
    
    // Normalize user ingredients (lowercase, trim)
    const normalizedUserIngredients = userIngredients.map(ing => ing.toLowerCase().trim());
    
    // Filter recipes that contain ALL user ingredients
    const matchingRecipes = allRecipes.filter(recipe => {
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
            return false;
        }
        
        // Normalize recipe ingredients
        const recipeIngredients = recipe.ingredients.map(ing => {
            // Handle both string and object formats
            const ingName = typeof ing === 'string' ? ing : (ing.name || ing);
            return ingName.toLowerCase().trim();
        });
        
        // Check if ALL user ingredients are present in recipe
        const allIngredientsFound = normalizedUserIngredients.every(userIng => {
            // Check for exact match or partial match (e.g., "chicken" matches "chicken breast")
            return recipeIngredients.some(recipeIng => 
                recipeIng === userIng || 
                recipeIng.includes(userIng) || 
                userIng.includes(recipeIng)
            );
        });
        
        return allIngredientsFound;
    });
    
    // Return only 2-3 recipes (limit to 3 as requested)
    return matchingRecipes.slice(0, 3);
}

// Load and display AI recipe suggestions (using ChatGPT AI)
async function loadRecipeSuggestions() {
    const suggestionsDiv = document.getElementById('recipeSuggestions');
    const ingredientsInput = document.getElementById('ingredients') ? document.getElementById('ingredients').value.trim() : '';
    
    if (!suggestionsDiv) return;
    
    try {
        // Get ingredients if available, otherwise get general suggestions
        const ingredients = ingredientsInput 
            ? ingredientsInput.split(',').map(i => i.trim()).filter(i => i)
            : [];
        
        suggestionsDiv.innerHTML = '<p class="suggestions-loading"><i class="fas fa-spinner fa-spin"></i> 🤖 AI is thinking...</p>';
        
        // Use AI to generate creative recipe name suggestions
        const suggestions = await suggestRecipeNames(ingredients);
        
        if (suggestions && suggestions.length > 0) {
            suggestionsDiv.innerHTML = suggestions.map((name, index) => {
                const escapedName = name.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                return `<div class="suggestion-item" data-recipe-name="${escapedName}">
                    <i class="fas fa-utensils"></i> ${name}
                </div>`;
            }).join('');
            
            // Add click event listeners
            suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    const recipeName = this.getAttribute('data-recipe-name');
                    selectSuggestedRecipe(recipeName);
                });
            });
        } else {
            suggestionsDiv.innerHTML = '<p class="suggestions-empty">No AI suggestions available</p>';
        }
    } catch (error) {
        console.error('Error loading AI recipe suggestions:', error);
        
        // Show helpful error message
        let errorMessage = 'Unable to load AI suggestions';
        if (error.message && error.message.includes('API key')) {
            errorMessage = '<i class="fas fa-exclamation-triangle"></i> Please configure OpenAI API key in .env file';
        } else if (error.message) {
            errorMessage = `Unable to load: ${error.message}`;
        }
        
        suggestionsDiv.innerHTML = `<p class="suggestions-error">${errorMessage}</p>`;
        
        // Fallback: Show database recipes if AI fails
        try {
            const ingredients = ingredientsInput 
                ? ingredientsInput.split(',').map(i => i.trim()).filter(i => i)
                : [];
            
            if (ingredients.length > 0) {
                setTimeout(async () => {
                    const allRecipes = await getRecipesFromDB();
                    const matchingRecipes = findRecipesWithAllIngredients(ingredients, allRecipes);
                    
                    if (matchingRecipes && matchingRecipes.length > 0) {
                        suggestionsDiv.innerHTML = `
                            <p style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px; font-style: italic;">
                                <i class="fas fa-info-circle"></i> Showing database recipes (AI unavailable)
                            </p>
                            ${matchingRecipes.map((recipe, index) => {
                                const escapedName = recipe.title.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                                return `<div class="suggestion-item" data-recipe-name="${escapedName}">
                                    <i class="fas fa-utensils"></i> ${recipe.title}
                                </div>`;
                            }).join('')}
                        `;
                        
                        // Add click event listeners
                        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                            item.addEventListener('click', function() {
                                const recipeName = this.getAttribute('data-recipe-name');
                                selectSuggestedRecipe(recipeName);
                            });
                        });
                    }
                }, 2000);
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
    }
}

// Select a suggested recipe name and generate full recipe using AI
async function selectSuggestedRecipe(recipeName) {
    const recipeSearchInput = document.getElementById('recipeSearch');
    const ingredientsInput = document.getElementById('ingredients');
    const resultDiv = document.getElementById('recipeResult');
    
    if (!recipeSearchInput || !resultDiv) return;
    
    // Decode HTML entities
    const decodedName = recipeName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    recipeSearchInput.value = decodedName;
    
    // Get ingredients from input if available (to give AI context)
    const ingredients = ingredientsInput && ingredientsInput.value.trim() 
        ? ingredientsInput.value.split(',').map(i => i.trim()).filter(i => i)
        : null;
    
    // Show loading state
    resultDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-color);"><i class="fas fa-spinner fa-spin"></i> 🤖 AI is generating the full recipe for "' + decodedName + '"...</p>';
    resultDiv.classList.add('show');
    
    try {
        // Generate full recipe using AI with the recipe name (and ingredients if available)
        const chatGPTRecipe = await generateRecipeWithGemini(ingredients, decodedName, userProfile);
        
        if (chatGPTRecipe) {
            // Display the generated recipe
            displayRecipes([chatGPTRecipe]);
        } else {
            resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">Failed to generate recipe. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error generating recipe from suggestion:', error);
        resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);"><i class="fas fa-exclamation-triangle"></i> Unable to generate recipe: ' + (error.message || 'Unknown error') + '</p>';
    }
}

// Recipe Generator with ChatGPT AI
async function generateRecipe() {
    const recipeSearchInput = document.getElementById('recipeSearch') ? document.getElementById('recipeSearch').value.trim() : '';
    const ingredientsInput = document.getElementById('ingredients').value.trim();
    const resultDiv = document.getElementById('recipeResult');
    
    if (!recipeSearchInput && !ingredientsInput) {
        alert('Please enter a recipe name or ingredients!');
        return;
    }
    
    // Show loading state
    if (recipeSearchInput) {
        resultDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-color);"><i class="fas fa-spinner fa-spin"></i> Searching for recipes...</p>';
    } else {
        resultDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-color);"><i class="fas fa-spinner fa-spin"></i> Searching database for recipes with your ingredients...</p>';
    }
    resultDiv.classList.add('show');
    
    try {
        let recipes = [];
        
        // If recipe name is provided, check cache first, then database, then ChatGPT
        if (recipeSearchInput) {
            // Check cached recipes first
            const cachedRecipe = getCachedRecipe(recipeSearchInput);
            if (cachedRecipe) {
                recipes = [cachedRecipe];
            } else {
                // Check database
            const dbRecipes = await searchRecipeByName(recipeSearchInput);
            if (dbRecipes.length > 0) {
                recipes = dbRecipes;
            } else {
                // Use ChatGPT to generate recipe by name
                const chatGPTRecipe = await generateRecipeWithGemini(null, recipeSearchInput, userProfile);
                    if (chatGPTRecipe) {
                        // Cache the generated recipe
                        setCachedRecipe(recipeSearchInput, chatGPTRecipe);
                recipes = [chatGPTRecipe];
                    }
                }
            }
        } else {
            // Search database for recipes that contain ALL listed ingredients
            const ingredients = ingredientsInput.split(',').map(i => i.trim()).filter(i => i);
            if (ingredients.length > 0) {
                // Get recipes from database that have ALL ingredients
                const allRecipes = await getRecipesFromDB();
                const matchingRecipes = findRecipesWithAllIngredients(ingredients, allRecipes);
                
                if (matchingRecipes.length > 0) {
                    recipes = matchingRecipes;
                } else {
                    // If no recipes found with all ingredients, show message
                    resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);"><i class="fas fa-info-circle"></i> No recipes found that contain all these ingredients: ' + ingredients.join(', ') + '. Try different ingredients or search by recipe name.</p>';
                    return;
                }
            } else {
                alert('Please enter ingredients!');
                return;
            }
        }
        
        displayRecipes(recipes);
    } catch (error) {
        console.error('Error generating recipes:', error);
        
        // Fallback to database search or basic generator
        if (recipeSearchInput) {
            try {
                const dbRecipes = await searchRecipeByName(recipeSearchInput);
                if (dbRecipes.length > 0) {
                    displayRecipes(dbRecipes);
                } else {
                    const ingredients = ingredientsInput ? ingredientsInput.split(',').map(i => i.trim()) : [];
                    const fallbackRecipes = generateMultipleRecipes(ingredients);
                    displayRecipes(fallbackRecipes);
                }
            } catch (fallbackError) {
                resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);"><i class="fas fa-exclamation-triangle"></i> Unable to generate recipes. Please check your connection or try again later.</p>';
            }
        } else {
            try {
                const ingredients = ingredientsInput.split(',').map(i => i.trim()).filter(i => i);
                if (ingredients.length > 0) {
                    // Search database for recipes with ALL ingredients
                    const allRecipes = await getRecipesFromDB();
                    const matchingRecipes = findRecipesWithAllIngredients(ingredients, allRecipes);
                    
                    if (matchingRecipes.length > 0) {
                        displayRecipes(matchingRecipes);
                    } else {
                        resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);"><i class="fas fa-info-circle"></i> No recipes found that contain all these ingredients: ' + ingredients.join(', ') + '. Try different ingredients.</p>';
                    }
                }
            } catch (fallbackError) {
                resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);"><i class="fas fa-exclamation-triangle"></i> Unable to search recipes. Please try again.</p>';
            }
        }
    }
}

// Search recipes by ingredients from database
async function searchRecipesByIngredients(ingredients) {
    try {
        const recipes = await getRecipesFromDB();
        
        // Score recipes based on ingredient matches
        const scoredRecipes = recipes.map(recipe => {
            let matches = 0;
            const ingredientsLower = ingredients.map(i => i.toLowerCase());
            
            // Check if recipe ingredients match user ingredients
            recipe.ingredients.forEach(recipeIngredient => {
                const recipeIngLower = recipeIngredient.toLowerCase();
                if (ingredientsLower.some(userIng => 
                    recipeIngLower.includes(userIng) || userIng.includes(recipeIngLower)
                )) {
                    matches++;
                }
            });
            
            return { recipe, matches, score: matches / recipe.ingredients.length };
        });
        
        // Filter and sort by relevance (at least 1 match)
        const relevantRecipes = scoredRecipes
            .filter(item => item.matches > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Top 5 matches
            .map(item => item.recipe);
        
        displayRecipes(relevantRecipes);
    } catch (error) {
        console.error('Error searching recipes:', error);
        // Fallback to basic generator
        const recipesDatabase = generateMultipleRecipes(ingredients);
        displayRecipes(recipesDatabase);
    }
}

// Search recipe by name
function searchRecipeByName(searchTerm) {
    return getRecipesFromDB().then(recipes => {
        const searchLower = searchTerm.toLowerCase();
        return recipes.filter(recipe => {
            const titleLower = recipe.title.toLowerCase();
            // Exact match or contains search term
            return titleLower === searchLower || titleLower.includes(searchLower);
        });
    });
}

// Display recipes in a consistent format
function displayRecipes(recipes) {
    const resultDiv = document.getElementById('recipeResult');
    
    if (recipes.length === 0) {
        resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">No recipes found. Try different ingredients or a recipe name.</p>';
        return;
    }
    
    // Store recipes for click handling
    window.currentGeneratorRecipes = recipes;
    
    resultDiv.innerHTML = recipes.map((recipe, index) => `
        <div class="recipe-card" onclick="showGeneratorRecipeDetails(${index})" style="cursor: pointer;">
            <div class="recipe-card-header">
                <h4><i class="fas fa-book-open"></i> ${recipe.title}</h4>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="recipe-preview">
                ${recipe.cuisine ? `<div style="margin-bottom: 10px;"><span class="cuisine-badge">${recipe.cuisine}</span></div>` : ''}
                ${recipe.prepTime ? `<div style="color: var(--text-secondary); font-size: 14px;"><i class="fas fa-clock"></i> Prep: ${recipe.prepTime} | Cook: ${recipe.cookTime}</div>` : ''}
                <div style="margin-top: 15px; text-align: center;">
                    <button style="background: var(--primary-color); border: none; color: white; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-eye"></i> View Full Recipe
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleRecipe(index) {
    const card = document.getElementById(`recipe-card-${index}`);
    card.classList.toggle('expanded');
}

function generateMultipleRecipes(ingredients) {
    const hasChicken = ingredients.some(i => ['chicken'].includes(i.toLowerCase()));
    const hasBeef = ingredients.some(i => ['beef'].includes(i.toLowerCase()));
    const hasFish = ingredients.some(i => ['fish', 'salmon', 'tuna'].includes(i.toLowerCase()));
    const hasRice = ingredients.some(i => ['rice'].includes(i.toLowerCase()));
    const hasPasta = ingredients.some(i => ['pasta', 'noodles'].includes(i.toLowerCase()));
    const hasVegetables = ingredients.some(i => ['tomato', 'tomatoes', 'vegetables', 'veggies', 'onion', 'garlic', 'bell pepper'].includes(i.toLowerCase()));
    
    let recipes = [];
    
    if (hasChicken && hasRice && hasVegetables) {
        recipes.push({
            title: 'Asian Chicken Rice Bowl',
            instructions: [
                'Cut chicken into bite-sized pieces and season with salt and pepper',
                'Heat oil in a pan and cook chicken until golden brown',
                'Add vegetables and stir-fry for 3-4 minutes',
                'Add soy sauce and cook for another minute',
                'Serve over cooked rice and garnish with sesame seeds'
            ],
            nutrition: {
                'Calories': '420',
                'Protein': '35g',
                'Carbs': '45g',
                'Fat': '12g',
                'Fiber': '4g'
            }
        });
    }
    
    if (hasFish && hasVegetables) {
        recipes.push({
            title: 'Mediterranean Fish with Vegetables',
            instructions: [
                'Season fish with herbs, salt, and pepper',
                'Sauté vegetables in olive oil until tender',
                'Place fish on top of vegetables in the pan',
                'Cover and cook for 8-10 minutes',
                'Serve with lemon wedges'
            ],
            nutrition: {
                'Calories': '285',
                'Protein': '32g',
                'Carbs': '18g',
                'Fat': '10g',
                'Omega-3': '2.5g'
            }
        });
    }
    
    if (hasRice && hasVegetables && !hasChicken && !hasBeef && !hasFish) {
        recipes.push({
            title: 'Vegetable Fried Rice',
            instructions: [
                'Cook rice and let cool completely',
                'Heat oil in a large pan or wok',
                'Add vegetables and stir-fry for 3-4 minutes',
                'Add rice and stir-fry for 5 minutes',
                'Season with soy sauce and serve hot'
            ],
            nutrition: {
                'Calories': '220',
                'Protein': '6g',
                'Carbs': '42g',
                'Fat': '5g',
                'Fiber': '6g'
            }
        });
    }
    
    if (hasPasta && hasVegetables) {
        recipes.push({
            title: 'Garden Fresh Pasta',
            instructions: [
                'Cook pasta according to package instructions',
                'Sauté vegetables in olive oil',
                'Add cooked pasta to the vegetables',
                'Toss together with herbs and seasoning',
                'Serve with grated cheese'
            ],
            nutrition: {
                'Calories': '380',
                'Protein': '14g',
                'Carbs': '68g',
                'Fat': '8g',
                'Fiber': '8g'
            }
        });
    }
    
    if (hasChicken && !hasRice && !hasPasta) {
        recipes.push({
            title: 'Grilled Chicken Salad',
            instructions: [
                'Season chicken and grill until cooked through',
                'Let rest and slice into strips',
                'Prepare fresh vegetables as salad base',
                'Top with grilled chicken',
                'Drizzle with dressing and serve'
            ],
            nutrition: {
                'Calories': '295',
                'Protein': '38g',
                'Carbs': '12g',
                'Fat': '11g',
                'Fiber': '5g'
            }
        });
    }
    
    // Fallback recipe if no specific match
    if (recipes.length === 0) {
        recipes.push({
            title: 'Quick Stir Fry',
            instructions: [
                'Heat oil in a large pan or wok',
                'Add all ingredients to the pan',
                'Stir-fry on high heat for 5-7 minutes',
                'Season to taste and serve hot'
            ],
            nutrition: {
                'Calories': '250',
                'Protein': '15g',
                'Carbs': '20g',
                'Fat': '12g',
                'Fiber': '4g'
            }
        });
    }
    
    // Return up to 3 recipes
    return recipes.slice(0, 3);
}

// Dish Suggestions with AI-powered recommendations (with caching)
async function getSuggestions(forceRegenerate = false) {
    const resultDiv = document.getElementById('suggestionsResult');
    
    if (!userProfile || !userProfile.isSetupComplete) {
        resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">Please complete your profile first to get personalized suggestions!</p>';
        return;
    }
    
    // Check cache first (unless forcing regeneration)
    if (!forceRegenerate) {
        const today = new Date().toISOString().split('T')[0];
        const cachedSuggestions = localStorage.getItem(`dishSuggestions_${today}`);
        if (cachedSuggestions) {
            try {
                const dishSuggestions = JSON.parse(cachedSuggestions);
                window.currentSuggestions = dishSuggestions;
                displayAIAutoRecommendation(dishSuggestions);
                displayDishSuggestions(dishSuggestions);
                return;
            } catch (e) {
                console.error('Error parsing cached suggestions:', e);
            }
        }
    }
    
    // Show loading state
    resultDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-color);"><i class="fas fa-spinner fa-spin"></i> 🤖 AI is analyzing your profile, goals, and activity patterns...</p>';
    
    try {
        // Get recent activities and meals for context
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const [recentActivities, recentMeals] = await Promise.all([
            getActivitiesByRange(startDateStr, endDate).catch(() => []),
            getMealsByRange(startDateStr, endDate).catch(() => [])
        ]);
        
        // Get AI-powered dish suggestions
        const dishSuggestions = await getDishSuggestions(userProfile, recentActivities, recentMeals);
        
        if (!dishSuggestions || dishSuggestions.length === 0) {
            resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">No recommendations found. Please try again or update your profile.</p>';
            return;
        }
        
        // Store suggestions in global scope for click handling
        window.currentSuggestions = dishSuggestions;
        
        // Cache suggestions for today
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`dishSuggestions_${today}`, JSON.stringify(dishSuggestions));
        
        // Display automatic recommendation summary based on AI suggestions
        displayAIAutoRecommendation(dishSuggestions);
        
        // Display AI suggestions
        displayDishSuggestions(dishSuggestions);
    } catch (error) {
        console.error('Error generating AI suggestions:', error);
        // Fallback to old system
        const autoRecommendation = determineAutoRecommendation();
        displayAutoRecommendation(autoRecommendation);
        const dishSuggestions = generateDishSuggestions(autoRecommendation);
        
        let recommendationsHTML = '';
        dishSuggestions.forEach((dish, index) => {
            recommendationsHTML += `
                <div class="suggestion-card">
                    <h4><i class="fas fa-heart" style="color: var(--secondary-color);"></i> ${dish.name}</h4>
                    <p>${dish.description}</p>
                    <div class="nutrition-info" style="margin-top: 15px;">
                        ${Object.entries(dish.nutrition).map(([key, value]) => `
                            <div class="nutrition-item">
                                <strong>${value}</strong>
                                <span>${key}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        resultDiv.innerHTML = recommendationsHTML || '<p style="text-align: center; color: var(--accent-color);">Error loading suggestions. Please try again.</p>';
    }
}

// Display dish suggestions HTML
function displayDishSuggestions(dishSuggestions) {
    const resultDiv = document.getElementById('suggestionsResult');
    if (!resultDiv) return;
    
    let recommendationsHTML = '';
    dishSuggestions.forEach((dish, index) => {
        const cuisineBadge = dish.cuisine ? `<span class="cuisine-badge">${dish.cuisine}</span>` : '';
        const tagsHTML = dish.tags ? dish.tags.slice(0, 3).map(tag => 
            `<span class="tag-badge">${tag}</span>`
        ).join('') : '';
        const escapedDishName = dish.name
            ? dish.name.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
            : '';
        
        recommendationsHTML += `
            <div class="suggestion-card" onclick="showRecipeDetails(${index})" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h4><i class="fas fa-heart" style="color: var(--secondary-color);"></i> ${dish.name}</h4>
                    ${cuisineBadge}
                </div>
                <p style="margin-bottom: 10px;">${dish.description || dish.reason || ''}</p>
                ${tagsHTML ? `<div style="margin-bottom: 10px;">${tagsHTML}</div>` : ''}
                ${dish.reason ? `<div style="margin-bottom: 10px; font-size: 0.9em; color: var(--accent-color); font-style: italic;">
                    <i class="fas fa-info-circle"></i> ${dish.reason}
                </div>` : ''}
                <div class="nutrition-info" style="margin-top: 15px;">
                    ${Object.entries(dish.nutrition || {}).map(([key, value]) => `
                        <div class="nutrition-item">
                            <strong>${value}</strong>
                            <span>${key}</span>
                        </div>
                    `).join('')}
                </div>
                ${dish.prepTime ? `<div style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
                    <i class="fas fa-clock"></i> ${dish.prepTime} prep | ${dish.cookTime || 'N/A'} cooking
                </div>` : ''}
                <div style="margin-top: 15px; text-align: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <button 
                        class="view-full-recipe-btn"
                        data-dish-name="${escapedDishName}"
                        style="background: var(--primary-color); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-book-open"></i> View Full Recipe
                    </button>
                </div>
            </div>
        `;
    });
    
    resultDiv.innerHTML = recommendationsHTML;
    
    // Wire "View Full Recipe" to recipe generator with auto-search and generation
    resultDiv.querySelectorAll('.view-full-recipe-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click handler
            const dishName = btn.getAttribute('data-dish-name');
            redirectToRecipeGenerator(dishName);
        });
    });
}

// Navigate to recipe generator, prefill the dish name, and auto-generate
function redirectToRecipeGenerator(recipeName) {
    const decodedName = recipeName
        ? recipeName.replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        : '';
    
    // Check cache first for instant display
    const cachedRecipe = getCachedRecipe(decodedName);
    if (cachedRecipe) {
        // Display cached recipe directly
        showPage('recipe');
        setTimeout(() => {
            const resultDiv = document.getElementById('recipeResult');
            if (resultDiv) {
                displayRecipes([cachedRecipe]);
                resultDiv.classList.add('show');
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        return;
    }
    
    // If not cached, proceed with normal flow
    showPage('recipe');
    
    // Wait briefly for page transition, then fill and trigger generation
    setTimeout(() => {
        const recipeSearchInput = document.getElementById('recipeSearch');
        const ingredientsInput = document.getElementById('ingredients');
        const generateButton = document.getElementById('generateRecipeBtn');
        
        if (recipeSearchInput) {
            recipeSearchInput.value = decodedName;
            // Fire input event so any suggestion listeners react
            recipeSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
            recipeSearchInput.focus();
        }
        if (ingredientsInput) {
            ingredientsInput.value = '';
        }
        
        const recipeSection = document.getElementById('recipe');
        if (recipeSection) {
            recipeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        if (generateButton) {
            generateButton.click(); // Triggers existing onclick handler
        } else {
        generateRecipe();
        }
    }, 350);
}

// Regenerate dish suggestions
async function regenerateDishSuggestions() {
    // Clear cache for today
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`dishSuggestions_${today}`);
    // Reload with force regeneration
    await getSuggestions(true);
}

function determineAutoRecommendation() {
    const { diseases, allergies, dietaryPreference } = userProfile;
    
    let recommendationType = 'balanced';
    let recommendationTags = [];
    let primaryCondition = null;
    let secondaryReasons = [];
    
    // Check for diseases and conditions
    if (diseases.some(d => ['diabetes', 'diabetic'].includes(d.toLowerCase()))) {
        recommendationType = 'lowSugar';
        recommendationTags.push('Low Sugar', 'High Fiber');
        primaryCondition = 'diabetes';
    } else if (diseases.some(d => ['hypertension', 'high blood pressure'].includes(d.toLowerCase()))) {
        recommendationType = 'lowSodium';
        recommendationTags.push('Low Sodium', 'Heart Healthy');
        primaryCondition = 'hypertension';
    } else if (diseases.some(d => ['obesity', 'overweight', 'weight loss'].includes(d.toLowerCase()))) {
        recommendationType = 'lowCarb';
        recommendationTags.push('Low Carb', 'Weight Management');
        primaryCondition = 'weight management';
    } else if (diseases.some(d => ['high cholesterol'].includes(d.toLowerCase()))) {
        recommendationType = 'lowFat';
        recommendationTags.push('Low Fat', 'High Fiber');
        primaryCondition = 'high cholesterol';
    }
    
    // Check for protein needs based on activities
    const recentCalories = activities.slice(-7).reduce((sum, act) => sum + (act.calories || 0), 0);
    if (recentCalories > 2000) {
        if (recommendationTags.length === 0) {
            recommendationType = 'protein';
        }
        recommendationTags.push('High Protein');
        secondaryReasons.push('your high activity levels');
    }
    
    // Check for fiber needs
    if (!recommendationTags.includes('High Fiber')) {
        recommendationTags.push('High Fiber');
    }
    
    return {
        type: recommendationType,
        tags: recommendationTags.slice(0, 3),
        primaryCondition: primaryCondition,
        secondaryReasons: secondaryReasons
    };
}

// Display AI-based automatic recommendation
function displayAIAutoRecommendation(dishSuggestions) {
    const infoDiv = document.getElementById('recommendationInfo');
    if (!infoDiv || !dishSuggestions || dishSuggestions.length === 0) {
        const autoRecommendation = determineAutoRecommendation();
        displayAutoRecommendation(autoRecommendation);
        return;
    }
    
    // Extract common tags and reasons from AI suggestions
    const allTags = [];
    const allReasons = [];
    dishSuggestions.forEach(dish => {
        if (dish.tags && Array.isArray(dish.tags)) {
            allTags.push(...dish.tags);
        }
        if (dish.reason) {
            allReasons.push(dish.reason);
        }
    });
    
    // Get unique tags
    const uniqueTags = [...new Set(allTags)].slice(0, 5);
    
    // Build recommendation text based on AI suggestions
    let recommendationText = `Based on your health profile, goals, and activity patterns, our AI recommends these personalized dishes. `;
    if (uniqueTags.length > 0) {
        recommendationText += `Focus areas: <strong>${uniqueTags.join(', ')}</strong>.`;
    }
    
    const tagsHTML = uniqueTags.map(tag => 
        `<span class="recommendation-tag">${tag}</span>`
    ).join('');
    
    infoDiv.innerHTML = `
        <p style="margin-bottom: 15px;">${recommendationText}</p>
        ${tagsHTML ? `<div>
            <strong>Diet Focus:</strong><br>
            ${tagsHTML}
        </div>` : ''}
    `;
}

// Fallback function for old recommendation system
function displayAutoRecommendation(recommendation) {
    const infoDiv = document.getElementById('recommendationInfo');
    if (!infoDiv) return;
    
    let recommendationText = '';
    
    // Build a personalized, complete sentence
    if (recommendation.primaryCondition) {
        const tagsList = recommendation.tags.join(', ');
        const conditionName = recommendation.primaryCondition.charAt(0).toUpperCase() + recommendation.primaryCondition.slice(1);
        
        if (recommendation.secondaryReasons.length > 0) {
            recommendationText = `Based on your profile, we recommend <strong>${tagsList}</strong> food because of your ${conditionName} condition, as well as ${recommendation.secondaryReasons.join(' and ')}.`;
        } else {
            recommendationText = `Based on your profile, we recommend <strong>${tagsList}</strong> food because of your ${conditionName} condition.`;
        }
    } else {
        switch(recommendation.type) {
            case 'protein':
                recommendationText = `Based on your high activity levels, we recommend a <strong>High Protein</strong> diet for better muscle recovery and energy.`;
                break;
            default:
                recommendationText = `We recommend a <strong>Balanced, High Fiber</strong> diet for optimal health and digestion.`;
        }
    }
    
    const tagsHTML = recommendation.tags.map(tag => 
        `<span class="recommendation-tag">${tag}</span>`
    ).join('');
    
    infoDiv.innerHTML = `
        <p style="margin-bottom: 15px;">${recommendationText}</p>
        <div>
            <strong>Diet Focus:</strong><br>
            ${tagsHTML}
        </div>
    `;
}

function generateDishSuggestions(recommendation) {
    const { dietaryPreference } = userProfile;
    const type = recommendation.type;
    
    const suggestionsDatabase = {
        'lowSugar': [
            { name: 'Grilled Vegetables with Hummus', description: 'Low sugar, high nutrient density with protein.', nutrition: { 'Calories': '180', 'Sugar': '2g', 'Protein': '8g', 'Fiber': '12g' } },
            { name: 'Avocado Toast on Whole Grain', description: 'Healthy fats and complex carbs without added sugar.', nutrition: { 'Calories': '250', 'Sugar': '3g', 'Protein': '10g', 'Fiber': '9g' } },
            { name: 'Zucchini Noodles with Pesto', description: 'Low-carb, low-sugar alternative to pasta.', nutrition: { 'Calories': '220', 'Sugar': '4g', 'Protein': '6g', 'Fiber': '5g' } },
            { name: 'Greek Salad with Feta', description: 'Fresh vegetables and protein without sugar spikes.', nutrition: { 'Calories': '200', 'Sugar': '6g', 'Protein': '12g', 'Fiber': '4g' } }
        ],
        'lowSodium': [
            { name: 'Fresh Salmon with Herbs', description: 'Heart-healthy fish rich in Omega-3 fatty acids.', nutrition: { 'Calories': '280', 'Sodium': '75mg', 'Protein': '34g', 'Omega-3': '2.8g' } },
            { name: 'Quinoa Buddha Bowl', description: 'Complete protein with fresh vegetables.', nutrition: { 'Calories': '320', 'Sodium': '45mg', 'Protein': '12g', 'Fiber': '8g' } },
            { name: 'Roasted Chicken with Vegetables', description: 'Lean protein with nutrient-rich sides.', nutrition: { 'Calories': '310', 'Sodium': '95mg', 'Protein': '32g', 'Fiber': '6g' } },
            { name: 'Mediterranean Lentil Salad', description: 'Plant-based protein with heart-healthy ingredients.', nutrition: { 'Calories': '240', 'Sodium': '35mg', 'Protein': '16g', 'Fiber': '15g' } }
        ],
        'lowCarb': [
            { name: 'Cauliflower Rice Stir Fry', description: 'All the flavor with minimal carbs.', nutrition: { 'Calories': '190', 'Carbs': '12g', 'Protein': '14g', 'Fiber': '5g' } },
            { name: 'Bunless Burger with Avocado', description: 'High protein, low carb meal.', nutrition: { 'Calories': '380', 'Carbs': '8g', 'Protein': '35g', 'Fiber': '7g' } },
            { name: 'Egg Muffins with Vegetables', description: 'Perfect for meal prep with low carbs.', nutrition: { 'Calories': '145', 'Carbs': '6g', 'Protein': '12g', 'Fiber': '2g' } },
            { name: 'Grilled Chicken Caesar Salad', description: 'Classic low-carb option with plenty of protein.', nutrition: { 'Calories': '285', 'Carbs': '10g', 'Protein': '36g', 'Fiber': '4g' } }
        ],
        'lowFat': [
            { name: 'Steamed Fish with Vegetables', description: 'Low fat, high protein meal.', nutrition: { 'Calories': '220', 'Fat': '4g', 'Protein': '32g', 'Fiber': '6g' } },
            { name: 'Lentil Soup with Whole Grain Bread', description: 'Excellent source of soluble fiber.', nutrition: { 'Calories': '260', 'Fat': '3g', 'Protein': '14g', 'Fiber': '16g' } },
            { name: 'Grilled Chicken Breast', description: 'Lean protein source.', nutrition: { 'Calories': '185', 'Fat': '4g', 'Protein': '35g', 'Fiber': '1g' } },
            { name: 'Fresh Fruit and Yogurt Bowl', description: 'Natural fiber from fresh fruits.', nutrition: { 'Calories': '180', 'Fat': '2g', 'Protein': '12g', 'Fiber': '8g' } }
        ],
        'protein': [
            { name: 'Grilled Chicken with Sweet Potato', description: 'High protein to repair and build muscles.', nutrition: { 'Calories': '420', 'Protein': '45g', 'Carbs': '35g', 'Fiber': '6g' } },
            { name: 'Greek Yogurt Parfait with Nuts', description: 'Quick protein boost with healthy fats.', nutrition: { 'Calories': '340', 'Protein': '24g', 'Carbs': '28g', 'Fiber': '5g' } },
            { name: 'Salmon Quinoa Bowl', description: 'Omega-3 fatty acids and complete protein.', nutrition: { 'Calories': '485', 'Protein': '38g', 'Carbs': '40g', 'Omega-3': '2.5g' } },
            { name: 'Protein Smoothie Bowl', description: 'Rapid absorption for post-workout recovery.', nutrition: { 'Calories': '380', 'Protein': '30g', 'Carbs': '45g', 'Fiber': '8g' } }
        ],
        'balanced': [
            { name: 'Colorful Buddha Bowl', description: 'Well-balanced macronutrients for optimal health.', nutrition: { 'Calories': '430', 'Protein': '18g', 'Carbs': '55g', 'Fiber': '12g' } },
            { name: 'Stuffed Bell Peppers', description: 'Complete meal with carbs, protein, and vegetables.', nutrition: { 'Calories': '365', 'Protein': '22g', 'Carbs': '42g', 'Fiber': '9g' } },
            { name: 'Whole Grain Pasta Primavera', description: 'Balanced meal with complex carbs.', nutrition: { 'Calories': '420', 'Protein': '16g', 'Carbs': '68g', 'Fiber': '8g' } },
            { name: 'Teriyaki Bowl with Mixed Vegetables', description: 'Asian-inspired balanced nutrition.', nutrition: { 'Calories': '395', 'Protein': '28g', 'Carbs': '52g', 'Fiber': '6g' } }
        ]
    };
    
    let suggestions = suggestionsDatabase[type] || suggestionsDatabase.balanced;
    
    // Filter based on dietary preference
    if (dietaryPreference === 'vegan') {
        suggestions = suggestions.filter(d => 
            !d.name.toLowerCase().includes('chicken') && 
            !d.name.toLowerCase().includes('salmon') && 
            !d.name.toLowerCase().includes('fish') &&
            !d.name.toLowerCase().includes('burger') &&
            !d.name.toLowerCase().includes('yogurt') &&
            !d.name.toLowerCase().includes('egg')
        );
    } else if (dietaryPreference === 'vegetarian') {
        suggestions = suggestions.filter(d => 
            !d.name.toLowerCase().includes('chicken') && 
            !d.name.toLowerCase().includes('salmon') &&
            !d.name.toLowerCase().includes('fish') &&
            !d.name.toLowerCase().includes('burger')
        );
    }
    
    return suggestions.slice(0, 5);
}

// Activity Calorie Calculator
function calculateActivityCalories() {
    const activityType = document.getElementById('activityType').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    if (!duration || duration <= 0) {
        document.getElementById('activityAutoFill').style.display = 'none';
        return;
    }
    
    // Get user's weight from profile for more accurate calculation
    const userWeight = userProfile && userProfile.weight ? userProfile.weight : 70; // Default 70kg
    const weightMultiplier = userWeight / 70; // Normalize to base weight
    
    // Calories burned per minute per kg (MET values approximated)
    const activityMETs = {
        running: 11.0,      // ~11 kcal per min for 70kg person
        cycling: 8.0,       // ~8 kcal per min
        swimming: 10.0,     // ~10 kcal per min
        walking: 4.5,       // ~4.5 kcal per min
        gym: 7.0,           // ~7 kcal per min (strength training)
        yoga: 3.5           // ~3.5 kcal per min
    };
    
    const baseCaloriesPerMin = activityMETs[activityType] || 5.0;
    const caloriesPerMin = baseCaloriesPerMin * weightMultiplier;
    const totalCalories = Math.round(caloriesPerMin * duration);
    
    // Update calories input
    document.getElementById('calories').value = totalCalories;
    
    // Show auto-fill notification
    if (totalCalories > 0) {
        document.getElementById('activityAutoFill').style.display = 'block';
    }
}

// Clear activity auto-fill
function clearActivityAutoFill() {
    document.getElementById('activityAutoFill').style.display = 'none';
    document.getElementById('calories').value = '';
}

// Activity Tracker
async function logActivity() {
    const activityType = document.getElementById('activityType').value;
    const duration = parseInt(document.getElementById('duration').value);
    const calories = parseInt(document.getElementById('calories').value);
    const date = document.getElementById('activityDate').value;
    
    if (!duration || !calories) {
        showNotification('Please fill in duration and calories!', 'error');
        return;
    }
    
    const activity = {
        type: activityType,
        duration: duration,
        calories: calories,
        date: date
    };
    
    try {
        // Check if user is in demo mode (demo userId)
        const currentUserId = localStorage.getItem('currentUserId');
        const isDemoUser = currentUserId && currentUserId.startsWith('demo-');
        
        if (isDemoUser) {
            // Save to localStorage for demo users
            const savedActivity = {
                ...activity,
                id: 'activity-' + Date.now(),
                _id: 'activity-' + Date.now()
            };
            activities.push(savedActivity);
            localStorage.setItem('activities', JSON.stringify(activities));
            
            displayActivities();
            updateOverview();
            updateProgressPage();
            
            // Reset form
            document.getElementById('duration').value = '';
            document.getElementById('calories').value = '';
            clearActivityAutoFill();
            
            showNotification('Activity logged successfully! (Demo mode)', 'success');
            // Navigate to progress page
            showPage('progress');
        } else {
            // Save to API for real users
            const savedActivity = await createActivity(activity);
            // Add id and timestamp for local use
            savedActivity.id = savedActivity._id;
            activities.push(savedActivity);
            localStorage.setItem('activities', JSON.stringify(activities));
            
            displayActivities();
            updateOverview();
            updateProgressPage();
            
            // Reset form
            document.getElementById('duration').value = '';
            document.getElementById('calories').value = '';
            clearActivityAutoFill();
            
            showNotification('Activity logged successfully!', 'success');
            // Navigate to progress page
            showPage('progress');
        }
    } catch (error) {
        // Fallback to localStorage if API fails
        console.error('API error, saving to localStorage:', error);
        const savedActivity = {
            ...activity,
            id: 'activity-' + Date.now(),
            _id: 'activity-' + Date.now()
        };
        activities.push(savedActivity);
        localStorage.setItem('activities', JSON.stringify(activities));
        
        displayActivities();
        updateOverview();
        updateProgressPage();
        
        // Reset form
        document.getElementById('duration').value = '';
        document.getElementById('calories').value = '';
        clearActivityAutoFill();
        
        showNotification('Activity logged successfully! (Saved locally)', 'success');
        // Navigate to progress page
        showPage('progress');
    }
}

function displayActivities() {
    const activitiesDiv = document.getElementById('activitiesList');
    
    if (activities.length === 0) {
        activitiesDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No activities logged yet. Start tracking your progress!</p>';
        return;
    }
    
    const sortedActivities = [...activities].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    activitiesDiv.innerHTML = sortedActivities.slice(0, 10).map(activity => {
        const activityIcons = {
            running: 'fa-running',
            cycling: 'fa-bicycle',
            swimming: 'fa-swimmer',
            walking: 'fa-walking',
            gym: 'fa-dumbbell',
            yoga: 'fa-spa'
        };
        
        const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="activity-item">
                <div class="activity-info">
                    <i class="fas ${activityIcons[activity.type] || 'fa-running'}"></i>
                    <div class="activity-details">
                        <h4>${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</h4>
                        <p><i class="fas fa-calendar"></i> ${formattedDate} | <i class="fas fa-stopwatch"></i> ${activity.duration} min | <i class="fas fa-fire"></i> ${activity.calories} cal</p>
                    </div>
                </div>
                <button onclick="deleteActivityById(${activity.id})" style="background: var(--accent-color); border: none; color: white; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

async function deleteActivityById(activityId) {
    try {
        // Find the MongoDB _id
        const activity = activities.find(a => a.id === activityId || a._id === activityId);
        if (activity && activity._id) {
            await deleteActivity(activity._id); // Call API
        }
        activities = activities.filter(activity => activity.id !== activityId && activity._id !== activityId);
        displayActivities();
        updateOverview();
    } catch (error) {
        showNotification('Error deleting activity: ' + error.message, 'error');
        // Still remove from local list if API fails
        activities = activities.filter(activity => activity.id !== activityId && activity._id !== activityId);
        displayActivities();
    }
}

// Global variable to store current recipe nutrition
let currentRecipeNutrition = null;

// Nutrition cache (localStorage-based, expires after 7 days)
function getNutritionCacheKey(foodName, quantity) {
    return `nutrition_cache_${foodName.toLowerCase().trim()}_${quantity}`;
}

function getCachedNutrition(foodName, quantity) {
    try {
        const key = getNutritionCacheKey(foodName, quantity);
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const expiry = new Date(data.expiry);
        if (new Date() > expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return data.nutrition;
    } catch (e) {
        return null;
    }
}

function setCachedNutrition(foodName, quantity, nutrition) {
    try {
        const key = getNutritionCacheKey(foodName, quantity);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7); // Cache for 7 days
        localStorage.setItem(key, JSON.stringify({
            nutrition,
            expiry: expiry.toISOString()
        }));
    } catch (e) {
        // Ignore cache errors
    }
}

// Lookup recipe nutrition from GPT-4o-mini (always uses AI, never database)
async function lookupRecipeNutrition() {
    const mealName = document.getElementById('mealName').value.trim();
    if (!mealName) {
        clearAutoFill();
        return;
    }
    
    try {
        // Always use GPT-4o-mini API for nutrition data (never check database)
        const quantity = parseFloat(document.getElementById('mealQuantity').value) || 100;
        const quantityType = 'grams'; // Always use grams
        
        // Check cache first
        const cached = getCachedNutrition(mealName, quantity);
        if (cached) {
            currentRecipeNutrition = {
                'Calories': cached.calories.toString(),
                'Protein': cached.protein + 'g',
                'Carbs': cached.carbs + 'g',
                'Fat': cached.fats + 'g',
                'Fiber': cached.fiber ? cached.fiber + 'g' : '0g',
                'Sugar': cached.sugar ? cached.sugar + 'g' : '0g'
            };
            updateNutritionFromQuantity();
            const autoFillDiv = document.getElementById('nutritionAutoFill');
            if (autoFillDiv) {
                autoFillDiv.style.display = 'block';
                const mainMsg = autoFillDiv.querySelector('span');
                if (mainMsg) {
                    mainMsg.innerHTML = '<i class="fas fa-robot"></i> Nutrition data from GPT-4o-mini AI! (Cached)';
                }
            }
            return;
        }
        
        try {
            const nutritionData = await getFoodNutrition(mealName, quantity, quantityType);
            
            if (nutritionData) {
                // Cache the nutrition data
                setCachedNutrition(mealName, quantity, nutritionData);
                
                // Convert API format to our format
                currentRecipeNutrition = {
                    'Calories': nutritionData.calories.toString(),
                    'Protein': nutritionData.protein + 'g',
                    'Carbs': nutritionData.carbs + 'g',
                    'Fat': nutritionData.fats + 'g',
                    'Fiber': nutritionData.fiber ? nutritionData.fiber + 'g' : '0g',
                    'Sugar': nutritionData.sugar ? nutritionData.sugar + 'g' : '0g'
                };
                
                updateNutritionFromQuantity();
                const autoFillDiv = document.getElementById('nutritionAutoFill');
                if (autoFillDiv) {
                    autoFillDiv.style.display = 'block';
                    
                    // Update the main message to indicate GPT AI source
                    const mainMsg = autoFillDiv.querySelector('span');
                    if (mainMsg) {
                        mainMsg.innerHTML = '<i class="fas fa-robot"></i> Nutrition data from GPT-4o-mini AI!';
                    }
                    
                    // Remove any existing API source info (if any)
                    const existingMsg = autoFillDiv.querySelector('.api-source-info');
                    if (existingMsg) existingMsg.remove();
                }
        } else {
            clearAutoFill();
        }
        } catch (apiError) {
            console.error('GPT Nutrition API error:', apiError);
            // Better error handling - show user-friendly message
            const autoFillDiv = document.getElementById('nutritionAutoFill');
            if (autoFillDiv) {
                autoFillDiv.style.display = 'block';
                autoFillDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: var(--accent-color);"><i class="fas fa-exclamation-triangle"></i> AI lookup failed</span>
                        <button onclick="clearAutoFill()" style="background: transparent; border: none; color: var(--accent-color); cursor: pointer;">
                            <i class="fas fa-times"></i> Clear
                        </button>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 14px;">Unable to get AI nutrition estimate. Please enter nutrition values manually below.</p>
                `;
            }
        }
    } catch (error) {
        console.error('Error looking up recipe:', error);
        clearAutoFill();
    }
}

// Handle quantity type change (no longer needed - always grams, but kept for compatibility)
function handleQuantityTypeChange() {
    // Always use grams - this function is kept for compatibility but does nothing
    if (currentRecipeNutrition) {
        updateNutritionFromQuantity();
    }
}

// Update nutrition based on quantity (always in grams)
// Multiply quantity by a factor (0.5 for half, 2 for double, 3 for triple, etc.)
function multiplyQuantity(factor) {
    const quantityInput = document.getElementById('mealQuantity');
    if (!quantityInput) return;
    
    const currentQuantity = parseFloat(quantityInput.value) || 100;
    const newQuantity = Math.round(currentQuantity * factor);
    
    // Ensure minimum value of 10g
    const finalQuantity = Math.max(10, newQuantity);
    
    quantityInput.value = finalQuantity;
    
    // Trigger nutrition update
    updateNutritionFromQuantity();
    
    // Add a brief visual feedback
    quantityInput.style.transform = 'scale(1.05)';
    quantityInput.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
        quantityInput.style.transform = 'scale(1)';
    }, 200);
}

function updateNutritionFromQuantity() {
    if (!currentRecipeNutrition) return;
    
    const quantity = parseFloat(document.getElementById('mealQuantity').value) || 100;
    
    // Base serving size is 100g, so nutrition data is per 100g
    const baseServingSizeGrams = 100;
    
    // Calculate nutrition values based on quantity (always in grams)
    Object.entries(currentRecipeNutrition).forEach(([key, value]) => {
        const numericValue = parseFloat(value.replace(/[^\d.]/g, '')); // Extract number
        
        // Calculate: (quantity / 100g) * base nutrition
        const calculatedValue = (numericValue / baseServingSizeGrams) * quantity;
        
        // Store for specific nutrients
        if (key === 'Calories') {
            document.getElementById('mealCalories').value = Math.round(calculatedValue);
        } else if (key === 'Protein') {
            document.getElementById('mealProtein').value = calculatedValue.toFixed(1);
        } else if (key === 'Carbs') {
            document.getElementById('mealCarbs').value = calculatedValue.toFixed(1);
        } else if (key === 'Fats' || key === 'Fat') {
            document.getElementById('mealFats').value = calculatedValue.toFixed(1);
        }
    });
}

// Clear auto-filled nutrition
function clearAutoFill() {
    currentRecipeNutrition = null;
    document.getElementById('nutritionAutoFill').style.display = 'none';
    document.getElementById('mealQuantity').value = 100; // Default to 100g
}

// Meal Logging
async function logMeal() {
    const mealType = document.getElementById('mealType').value;
    const mealDate = document.getElementById('mealDate').value;
    const mealName = document.getElementById('mealName').value;
    const quantity = parseFloat(document.getElementById('mealQuantity').value) || 1;
    const calories = parseInt(document.getElementById('mealCalories').value);
    const protein = parseFloat(document.getElementById('mealProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('mealCarbs').value) || 0;
    const fats = parseFloat(document.getElementById('mealFats').value) || 0;
    
    if (!mealName || !calories) {
        showNotification('Please fill in meal name and calories!', 'error');
        return;
    }
    
    const meal = {
        type: mealType,
        name: mealName,
        date: mealDate,
        quantity: quantity,
        quantityType: 'grams', // Always grams
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats
    };
    
    try {
        // Check if user is in demo mode (demo userId)
        const currentUserId = localStorage.getItem('currentUserId');
        const isDemoUser = currentUserId && currentUserId.startsWith('demo-');
        
        if (isDemoUser) {
            // Save to localStorage for demo users
            const savedMeal = {
                ...meal,
                id: 'meal-' + Date.now(),
                _id: 'meal-' + Date.now()
            };
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
            loadRecentMealsChips(); // Update recent meals chips
            updateOverview();
            updateProgressPage();
            
            // Reset form
            document.getElementById('mealName').value = '';
            document.getElementById('mealCalories').value = '';
            document.getElementById('mealProtein').value = '';
            document.getElementById('mealCarbs').value = '';
            document.getElementById('mealFats').value = '';
            document.getElementById('mealQuantity').value = 100;
            clearAutoFill();
            
            showNotification('Meal logged successfully! (Demo mode)', 'success');
            // Navigate to progress page
            showPage('progress');
        } else {
            // Save to API for real users
            const savedMeal = await createMeal(meal);
            savedMeal.id = savedMeal._id;
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
            loadRecentMealsChips(); // Update recent meals chips
            updateOverview();
            updateProgressPage();
            
            // Reset form
            document.getElementById('mealName').value = '';
            document.getElementById('mealCalories').value = '';
            document.getElementById('mealProtein').value = '';
            document.getElementById('mealCarbs').value = '';
            document.getElementById('mealFats').value = '';
            document.getElementById('mealQuantity').value = 100;
            clearAutoFill();
            
            showNotification('Meal logged successfully!', 'success');
            // Navigate to progress page
            showPage('progress');
        }
    } catch (error) {
        // Fallback to localStorage if API fails
        console.error('API error, saving to localStorage:', error);
        const savedMeal = {
            ...meal,
            id: 'meal-' + Date.now(),
            _id: 'meal-' + Date.now()
        };
        meals.push(savedMeal);
        localStorage.setItem('meals', JSON.stringify(meals));
        
        displayMeals();
        updateOverview();
        updateProgressPage();
        
        // Navigate to progress page
        showPage('progress');
        
        // Reset form
        document.getElementById('mealName').value = '';
        document.getElementById('mealCalories').value = '';
        document.getElementById('mealProtein').value = '';
        document.getElementById('mealCarbs').value = '';
        document.getElementById('mealFats').value = '';
            document.getElementById('mealQuantity').value = 100;
        clearAutoFill();
        
        showNotification('Meal logged successfully! (Saved locally)', 'success');
    }
}

// Common portions shortcuts (Indian food focused)
const COMMON_PORTIONS = [
    { label: '1 Roti', name: 'Roti', grams: 50 },
    { label: '1 Cup Rice', name: 'Cooked Rice', grams: 150 },
    { label: '1 Bowl Dal', name: 'Dal', grams: 200 },
    { label: '1 Cup Sabzi', name: 'Vegetable Curry', grams: 150 },
    { label: '1 Paratha', name: 'Paratha', grams: 80 },
    { label: '1 Cup Pulao', name: 'Pulao', grams: 180 },
    { label: '1 Bowl Sambar', name: 'Sambar', grams: 200 },
    { label: '1 Cup Rasam', name: 'Rasam', grams: 150 },
    { label: '1 Cup Curd', name: 'Curd/Yogurt', grams: 200 },
    { label: '1 Cup Salad', name: 'Salad', grams: 100 },
    { label: '1 Chapati', name: 'Chapati', grams: 40 },
    { label: '1 Cup Soup', name: 'Soup', grams: 200 }
];

// Load common portions buttons
function loadCommonPortions() {
    const container = document.getElementById('commonPortionsButtons');
    if (!container) return;
    
    container.innerHTML = COMMON_PORTIONS.map(portion => `
        <button 
            onclick="quickFillCommonPortion('${portion.name}', ${portion.grams})"
            style="
                padding: 8px 14px;
                background: rgba(80, 200, 120, 0.1);
                border: 1px solid rgba(80, 200, 120, 0.3);
                border-radius: 20px;
                color: var(--text-primary);
                font-size: 0.85em;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            "
            onmouseenter="this.style.background='rgba(80, 200, 120, 0.2)'; this.style.transform='translateY(-1px)';"
            onmouseleave="this.style.background='rgba(80, 200, 120, 0.1)'; this.style.transform='none';"
        >
            ${portion.label}
        </button>
    `).join('');
}

// Quick fill from common portion
function quickFillCommonPortion(foodName, grams) {
    document.getElementById('mealName').value = foodName;
    document.getElementById('mealQuantity').value = grams;
    document.getElementById('mealName').dispatchEvent(new Event('change', { bubbles: true }));
    document.getElementById('mealQuantity').dispatchEvent(new Event('change', { bubbles: true }));
}

// Load recent meals for quick-fill
function loadRecentMealsChips() {
    const container = document.getElementById('recentMealsChips');
    if (!container) return;
    
    if (!meals || meals.length === 0) {
        container.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.85em; font-style: italic;">No recent meals yet</span>';
        return;
    }
    
    // Get unique meal names from last 20 meals, limit to 8 most frequent
    const recentMeals = [...meals]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    
    const mealCounts = {};
    recentMeals.forEach(meal => {
        const key = meal.name.toLowerCase();
        if (!mealCounts[key]) {
            mealCounts[key] = { name: meal.name, quantity: meal.quantity || 100, count: 0 };
        }
        mealCounts[key].count++;
    });
    
    const uniqueMeals = Object.values(mealCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    
    if (uniqueMeals.length === 0) {
        container.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.85em; font-style: italic;">No recent meals yet</span>';
        return;
    }
    
    container.innerHTML = uniqueMeals.map(meal => `
        <button 
            onclick="quickFillRecentMeal('${meal.name.replace(/'/g, "\\'")}', ${meal.quantity})"
            style="
                padding: 6px 12px;
                background: rgba(74, 144, 226, 0.1);
                border: 1px solid rgba(74, 144, 226, 0.3);
                border-radius: 16px;
                color: var(--text-primary);
                font-size: 0.85em;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            "
            onmouseenter="this.style.background='rgba(74, 144, 226, 0.2)'; this.style.transform='translateY(-1px)';"
            onmouseleave="this.style.background='rgba(74, 144, 226, 0.1)'; this.style.transform='none';"
        >
            <i class="fas fa-utensils" style="font-size: 0.75em;"></i>
            ${meal.name} (${meal.quantity}g)
        </button>
    `).join('');
}

// Quick fill from recent meal
function quickFillRecentMeal(foodName, grams) {
    document.getElementById('mealName').value = foodName;
    document.getElementById('mealQuantity').value = grams;
    document.getElementById('mealName').dispatchEvent(new Event('change', { bubbles: true }));
    document.getElementById('mealQuantity').dispatchEvent(new Event('change', { bubbles: true }));
}

function displayMeals() {
    const mealsDiv = document.getElementById('mealsList');
    if (!mealsDiv) return;
    
    if (meals.length === 0) {
        mealsDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No meals logged yet. Start tracking your nutrition!</p>';
        loadRecentMealsChips(); // Update recent meals even if empty
        return;
    }
    
    const sortedMeals = [...meals].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    mealsDiv.innerHTML = sortedMeals.slice(0, 10).map(meal => {
        const mealIcons = {
            breakfast: 'fa-coffee',
            lunch: 'fa-utensils',
            dinner: 'fa-drumstick-bite',
            snack: 'fa-cookie-bite'
        };
        
        const formattedDate = new Date(meal.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const quantityDisplay = meal.quantity ? ` (${meal.quantity}g)` : '';
        return `
            <div class="meal-item">
                <div class="meal-info">
                    <i class="fas ${mealIcons[meal.type] || 'fa-utensils'}"></i>
                    <div class="meal-details">
                        <h4>${meal.name}${quantityDisplay} (${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)})</h4>
                        <p><i class="fas fa-calendar"></i> ${formattedDate} | <i class="fas fa-fire"></i> ${meal.calories} cal | P: ${meal.protein}g C: ${meal.carbs}g F: ${meal.fats}g</p>
                    </div>
                </div>
                <button onclick="deleteMeal('${meal.id || meal._id || ''}')" style="background: var(--accent-color); border: none; color: white; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

async function deleteMeal(id) {
    if (!id) {
        showNotification('Error: Meal ID is missing. Cannot delete meal.', 'error');
        return;
    }
    
    // Find the meal to delete - check both id and _id fields
    const mealToDelete = meals.find(meal => {
        const mealId = meal.id || meal._id;
        return mealId === id || mealId === String(id) || String(mealId) === String(id);
    });
    
    if (!mealToDelete) {
        showNotification('Meal not found. It may have already been deleted.', 'warning');
        return;
    }
    
    try {
        // Check if user is in demo mode
        const currentUserId = localStorage.getItem('currentUserId');
        const isDemoUser = currentUserId && currentUserId.startsWith('demo-');
        
        if (!isDemoUser) {
            // Delete from API for real users
            try {
                // Use the deleteMeal function from api.js (available globally)
                const response = await fetch(`/api/meals/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to delete from server');
                }
            } catch (error) {
                console.error('Error deleting meal from API:', error);
                showNotification('Failed to delete meal from server. Trying local delete...', 'warning');
            }
        }
        
        // Remove from local array - use proper comparison
        const initialLength = meals.length;
        meals = meals.filter(meal => {
            const mealId = meal.id || meal._id;
            // Use strict comparison with type conversion for safety
            return String(mealId) !== String(id);
        });
        
        if (meals.length === initialLength) {
            showNotification('Failed to delete meal. Meal ID mismatch.', 'error');
            console.error('Delete failed. Looking for ID:', id, 'Available IDs:', meals.map(m => m.id || m._id));
            return;
        }
        
        // Update localStorage
    localStorage.setItem('meals', JSON.stringify(meals));
        
        // Refresh display
    displayMeals();
    updateOverview();
        updateProgressPage();
        
        showNotification('Meal deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting meal:', error);
        showNotification('An error occurred while deleting the meal.', 'error');
    }
}

// Overview Dashboard
function updateOverview() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekActivities = activities.filter(act => new Date(act.date) >= weekAgo);
    const weekMeals = meals.filter(meal => new Date(meal.date) >= weekAgo);
    const totalCaloriesBurned = activities.reduce((sum, act) => sum + (act.calories || 0), 0);
    const totalMinutes = activities.reduce((sum, act) => sum + (act.duration || 0), 0);
    
    // Meal statistics
    const totalMealCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
    
    // Calculate average daily calories from meals
    const avgDailyCalories = weekMeals.length > 0 
        ? Math.round(weekMeals.reduce((sum, meal) => sum + meal.calories, 0) / 7)
        : 0;
    
    // Update UI
    document.getElementById('totalCalories').textContent = totalCaloriesBurned.toLocaleString();
    document.getElementById('totalMinutes').textContent = totalMinutes.toLocaleString();
    document.getElementById('totalMeals').textContent = meals.length;
    document.getElementById('weekActivities').textContent = weekActivities.length;
    document.getElementById('avgDailyCalories').textContent = avgDailyCalories;
    document.getElementById('totalProtein').textContent = Math.round(totalProtein);
    document.getElementById('totalCarbs').textContent = Math.round(totalCarbs);
    
    // Calculate health score based on activities and meals
    let healthScore = 50;
    if (activities.length > 0 || meals.length > 0) {
        const activityBonus = (weekActivities.length * 5) + (totalCaloriesBurned / 100);
        const mealBonus = Math.min(30, meals.length * 0.5); // Max 30 points for logging meals
        healthScore = Math.min(100, 50 + activityBonus + mealBonus);
    }
    document.getElementById('healthScore').textContent = Math.round(healthScore) + '%';
    
    // Display recent activities
    const overviewActivitiesDiv = document.getElementById('overviewActivities');
    const recentActivities = [...activities].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    ).slice(0, 10);
    
    if (recentActivities.length === 0) {
        overviewActivitiesDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary); width: 100%;">No recent activities</p>';
    } else {
        overviewActivitiesDiv.innerHTML = recentActivities.map(activity => {
            const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const icon = getActivityIcon(activity.type);
            return `
                <div style="padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid var(--primary-color); flex: 0 0 calc(33.333% - 6px); min-width: 200px; font-size: 0.9em;">
                    <strong>${icon} ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</strong>
                    <div style="margin-top: 4px; color: var(--text-secondary); font-size: 0.85em;">
                        ${activity.duration} min | ${activity.calories} cal
                    </div>
                    <div style="margin-top: 2px; color: var(--text-secondary); font-size: 0.8em; opacity: 0.7;">
                        ${formattedDate}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Display recent meals
    const overviewMealsDiv = document.getElementById('overviewMeals');
    const recentMeals = [...meals].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    ).slice(0, 10);
    
    if (recentMeals.length === 0) {
        overviewMealsDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary); width: 100%;">No recent meals logged</p>';
    } else {
        overviewMealsDiv.innerHTML = recentMeals.map(meal => {
            const formattedDate = new Date(meal.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const quantityDisplay = meal.quantity ? ` (${meal.quantity}g)` : '';
            return `
                <div style="padding: 8px 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid var(--secondary-color); flex: 0 0 calc(33.333% - 6px); min-width: 200px; font-size: 0.9em;">
                    <strong>🍽️ ${meal.name}${quantityDisplay}</strong>
                    <div style="margin-top: 4px; color: var(--text-secondary); font-size: 0.85em;">
                        ${meal.calories} cal | P:${meal.protein}g C:${meal.carbs}g F:${meal.fats}g
                    </div>
                    <div style="margin-top: 2px; color: var(--text-secondary); font-size: 0.8em; opacity: 0.7;">
                        ${formattedDate}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Load daily plan (async, won't block other updates)
    loadDailyPlan();
    
    // Display macro balance indicator
    const nutritionDiv = document.getElementById('nutritionInsights');
    let macroBalanceHtml = '';
    
    if (weekMeals.length > 0) {
        const totalWeekCalories = weekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        const totalWeekProtein = weekMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
        const totalWeekCarbs = weekMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
        const totalWeekFats = weekMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0);
        
        // Calculate percentages (1g protein/carbs = 4 cal, 1g fat = 9 cal)
        const proteinCals = totalWeekProtein * 4;
        const carbsCals = totalWeekCarbs * 4;
        const fatsCals = totalWeekFats * 9;
        const totalMacroCals = proteinCals + carbsCals + fatsCals;
        
        if (totalMacroCals > 0) {
            const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
            const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
            const fatsPct = Math.round((fatsCals / totalMacroCals) * 100);
            
            // Get user's target macros from profile (default: 45/25/30 carbs/protein/fats)
            const profile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
            const targetCarbs = profile?.macroSplit?.carbs || 45;
            const targetProtein = profile?.macroSplit?.protein || 25;
            const targetFats = profile?.macroSplit?.fats || 30;
            
            // Calculate progress bar widths relative to target
            const carbsBarWidth = carbsPct >= targetCarbs ? 100 : (carbsPct / targetCarbs) * 100;
            const proteinBarWidth = proteinPct >= targetProtein ? 100 : (proteinPct / targetProtein) * 100;
            const fatsBarWidth = fatsPct >= targetFats ? 100 : (fatsPct / targetFats) * 100;
            
            // Target marker is always at 100% (the target position in relative scale)
            // Since bars are relative to target, 100% = target reached
            const targetMarkerPosition = 100;
            
            macroBalanceHtml = `
                <div class="macro-balance-card" style="background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 200, 120, 0.1) 100%); border: 2px solid rgba(74, 144, 226, 0.2); border-radius: 12px; padding: 25px; margin-bottom: 25px; width: 100%; grid-column: 1 / -1;">
                    <h4 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: var(--text-primary);">
                        <i class="fas fa-chart-pie" style="color: var(--primary-color); font-size: 1.3em;"></i> 
                        <span>Macro Balance (This Week)</span>
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 15px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: 600; color: var(--text-primary); font-size: 1em;">Carbs:</span>
                                <span style="color: ${Math.abs(carbsPct - targetCarbs) <= 5 ? 'var(--secondary-color)' : 'var(--accent-color)'}; font-weight: 600;">
                                    ${carbsPct}% <small style="font-size: 0.85em; opacity: 0.8;">(target: ${targetCarbs}%)</small>
                                </span>
                            </div>
                            <div style="height: 10px; background: rgba(0,0,0,0.1); border-radius: 5px; overflow: visible; margin-bottom: 15px; position: relative;">
                                <div style="height: 100%; width: ${Math.min(carbsBarWidth, 100)}%; background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%); transition: width 0.5s ease; border-radius: 5px; ${carbsPct >= targetCarbs ? 'border: 2px solid rgba(255, 107, 107, 0.9); box-shadow: 0 0 4px rgba(255, 107, 107, 0.5);' : ''}"></div>
                                <div style="position: absolute; left: ${targetMarkerPosition}%; top: -2px; bottom: -2px; width: 2px; background: rgba(255, 255, 255, 0.8); box-shadow: 0 0 2px rgba(0, 0, 0, 0.3); pointer-events: none; z-index: 1;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: 600; color: var(--text-primary); font-size: 1em;">Protein:</span>
                                <span style="color: ${Math.abs(proteinPct - targetProtein) <= 5 ? 'var(--secondary-color)' : 'var(--accent-color)'}; font-weight: 600;">
                                    ${proteinPct}% <small style="font-size: 0.85em; opacity: 0.8;">(target: ${targetProtein}%)</small>
                                </span>
                            </div>
                            <div style="height: 10px; background: rgba(0,0,0,0.1); border-radius: 5px; overflow: visible; margin-bottom: 15px; position: relative;">
                                <div style="height: 100%; width: ${Math.min(proteinBarWidth, 100)}%; background: linear-gradient(90deg, #4a90e2 0%, #6ba3e8 100%); transition: width 0.5s ease; border-radius: 5px; ${proteinPct >= targetProtein ? 'border: 2px solid rgba(255, 107, 107, 0.9); box-shadow: 0 0 4px rgba(255, 107, 107, 0.5);' : ''}"></div>
                                <div style="position: absolute; left: ${targetMarkerPosition}%; top: -2px; bottom: -2px; width: 2px; background: rgba(255, 255, 255, 0.8); box-shadow: 0 0 2px rgba(0, 0, 0, 0.3); pointer-events: none; z-index: 1;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: 600; color: var(--text-primary); font-size: 1em;">Fats:</span>
                                <span style="color: ${Math.abs(fatsPct - targetFats) <= 5 ? 'var(--secondary-color)' : 'var(--accent-color)'}; font-weight: 600;">
                                    ${fatsPct}% <small style="font-size: 0.85em; opacity: 0.8;">(target: ${targetFats}%)</small>
                                </span>
                            </div>
                            <div style="height: 10px; background: rgba(0,0,0,0.1); border-radius: 5px; overflow: visible; margin-bottom: 15px; position: relative;">
                                <div style="height: 100%; width: ${Math.min(fatsBarWidth, 100)}%; background: linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%); transition: width 0.5s ease; border-radius: 5px; ${fatsPct >= targetFats ? 'border: 2px solid rgba(255, 107, 107, 0.9); box-shadow: 0 0 4px rgba(255, 107, 107, 0.5);' : ''}"></div>
                                <div style="position: absolute; left: ${targetMarkerPosition}%; top: -2px; bottom: -2px; width: 2px; background: rgba(255, 255, 255, 0.8); box-shadow: 0 0 2px rgba(0, 0, 0, 0.3); pointer-events: none; z-index: 1;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Display nutrition insights
    // Calculate insights based on recent activities and meals
    const avgDailyActivityCalories = weekActivities.length > 0 
        ? weekActivities.reduce((sum, act) => sum + act.calories, 0) / 7 
        : 0;
    
    const insights = [];
    
    if (weekActivities.length >= 5) {
        insights.push({
            title: 'Excellent Progress',
            description: 'You\'ve been very active this week! Keep up the great work.'
        });
    } else if (weekActivities.length >= 3) {
        insights.push({
            title: 'Good Progress',
            description: 'You\'re on the right track. Try to increase activity levels.'
        });
    } else {
        insights.push({
            title: 'Room for Improvement',
            description: 'Try to increase your weekly activities for better health.'
        });
    }
    
    if (avgDailyActivityCalories > 300) {
        insights.push({
            title: 'High Energy Burn',
            description: 'Your recent activities suggest you may need more protein for recovery.'
        });
    } else if (weekActivities.length > 0) {
        insights.push({
            title: 'Balanced Activity',
            description: 'Your activity levels are well-balanced with your diet.'
        });
    }
    
    // Add meal-related insights
    if (meals.length > 0) {
        insights.push({
            title: 'Great Nutrition Tracking',
            description: `You've logged ${meals.length} meals. Keep tracking for better health insights!`
        });
        
        if (totalProtein > 0 && totalProtein / meals.length < 20) {
            insights.push({
                title: 'Protein Boost Needed',
                description: 'Your average protein intake is low. Consider adding more protein-rich foods.'
            });
        }
    }
    
    insights.push({
        title: 'Hydration Tip',
        description: 'Remember to drink water throughout your activities for optimal performance.'
    });
    
    nutritionDiv.innerHTML = macroBalanceHtml + `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; width: 100%;">
            ${insights.map(insight => `
        <div class="insight-card">
            <h4><i class="fas fa-lightbulb" style="color: var(--secondary-color);"></i> ${insight.title}</h4>
            <p>${insight.description}</p>
        </div>
            `).join('')}
        </div>
    `;
    
    // Display daily plan (using cached version if available)
    loadDailyPlan();
}

// Modal Functions
function showRecipeDetails(index) {
    if (!window.currentSuggestions || !window.currentSuggestions[index]) {
        console.error('Recipe not found');
        return;
    }

    const dish = window.currentSuggestions[index];
    
    // Get full recipe details from database
    getRecipesFromDB().then(recipes => {
        const fullRecipe = recipes.find(r => r.title === dish.name);
        
        if (!fullRecipe) {
            showNotification('Recipe details not found', 'error');
            return;
        }

        displayRecipeModal(fullRecipe);
    }).catch(error => {
        console.error('Error fetching recipe details:', error);
        // Fallback: display with available data
        displayRecipeModalPartial(dish);
    });
}

function displayRecipeModal(recipe) {
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');

    const tagsHTML = recipe.tags ? recipe.tags.map(tag => 
        `<span class="tag-badge">${tag}</span>`
    ).join('') : '';

    modalContent.innerHTML = `
        <div class="recipe-detail-header">
            <h2><i class="fas fa-utensils"></i> ${recipe.title}</h2>
            <div class="recipe-meta">
                ${recipe.cuisine ? `<div class="meta-item"><i class="fas fa-globe"></i>${recipe.cuisine} Cuisine</div>` : ''}
                ${recipe.prepTime ? `<div class="meta-item"><i class="fas fa-clock"></i>Prep: ${recipe.prepTime}</div>` : ''}
                ${recipe.cookTime ? `<div class="meta-item"><i class="fas fa-fire"></i>Cook: ${recipe.cookTime}</div>` : ''}
            </div>
            ${tagsHTML ? `<div style="margin-top: 15px;">${tagsHTML}</div>` : ''}
        </div>

        <div class="recipe-detail-section">
            <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ingredient => `
                    <li><i class="fas fa-check-circle" style="color: var(--secondary-color); margin-right: 8px;"></i>${ingredient}</li>
                `).join('')}
            </ul>
        </div>

        <div class="recipe-detail-section">
            <h3><i class="fas fa-list-ol"></i> Instructions</h3>
            <ol class="instructions-list">
                ${recipe.instructions.map(instruction => `
                    <li>${instruction}</li>
                `).join('')}
            </ol>
        </div>

        <div class="recipe-detail-section">
            <h3><i class="fas fa-chart-pie"></i> Nutritional Information</h3>
            <div class="modal-nutrition-grid">
                ${Object.entries(recipe.nutrition).map(([key, value]) => `
                    <div class="modal-nutrition-item">
                        <strong>${value}</strong>
                        <span>${key}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="recipe-detail-section" style="border-top: 2px solid var(--secondary-color); padding-top: 20px; margin-top: 20px;">
            <button onclick="addRecipeToMealLog()" 
                    class="btn-add-to-meal-log" 
                    style="width: 100%; padding: 15px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); 
                           border: none; color: white; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; 
                           display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s;">
                <i class="fas fa-plus-circle"></i> Add to Meal Log
            </button>
        </div>
    `;

    // Store recipe in window for easy access
    window.currentModalRecipe = recipe;
    modal.classList.add('show');

    // Close modal function
    const closeModal = function() {
        modal.classList.remove('show');
        // Clean up event listeners
        if (modalClickHandler) modal.removeEventListener('click', modalClickHandler);
        if (escapeHandler) document.removeEventListener('keydown', escapeHandler);
    };

    // Close modal on X click - use specific selector for recipe modal
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
        // Remove any existing listeners by replacing the button
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        newCloseButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        };
    }

    // Close modal on outside click
    const modalClickHandler = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    modal.addEventListener('click', modalClickHandler);

    // Close modal on Escape key
    const escapeHandler = function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function displayRecipeModalPartial(dish) {
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');

    const tagsHTML = dish.tags ? dish.tags.map(tag => 
        `<span class="tag-badge">${tag}</span>`
    ).join('') : '';

    modalContent.innerHTML = `
        <div class="recipe-detail-header">
            <h2><i class="fas fa-utensils"></i> ${dish.name}</h2>
            ${dish.cuisine ? `<div style="margin-bottom: 15px;"><span class="cuisine-badge">${dish.cuisine}</span></div>` : ''}
            ${tagsHTML ? `<div>${tagsHTML}</div>` : ''}
        </div>

        <div class="recipe-detail-section">
            <h3><i class="fas fa-info-circle"></i> About This Recipe</h3>
            <p style="color: var(--text-secondary); line-height: 1.8;">${dish.description}</p>
        </div>

        <div class="recipe-detail-section">
            <h3><i class="fas fa-chart-pie"></i> Nutritional Information</h3>
            <div class="modal-nutrition-grid">
                ${Object.entries(dish.nutrition).map(([key, value]) => `
                    <div class="modal-nutrition-item">
                        <strong>${value}</strong>
                        <span>${key}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        ${dish.prepTime ? `
        <div class="recipe-detail-section">
            <h3><i class="fas fa-clock"></i> Time</h3>
            <p style="color: var(--text-secondary);"><i class="fas fa-hourglass-start"></i> Prep Time: ${dish.prepTime}</p>
            <p style="color: var(--text-secondary);"><i class="fas fa-fire"></i> Cook Time: ${dish.cookTime}</p>
        </div>
        ` : ''}

        <div class="recipe-detail-section" style="border-top: 2px solid var(--secondary-color); padding-top: 20px; margin-top: 20px;">
            <button onclick="addRecipeToMealLog()" 
                    class="btn-add-to-meal-log" 
                    style="width: 100%; padding: 15px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); 
                           border: none; color: white; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; 
                           display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s;">
                <i class="fas fa-plus-circle"></i> Add to Meal Log
            </button>
        </div>
    `;

    // Store dish in window for easy access
    window.currentModalRecipe = dish;
    modal.classList.add('show');

    // Close modal function
    const closeModal = function() {
        modal.classList.remove('show');
        // Clean up event listeners
        if (modalClickHandler) modal.removeEventListener('click', modalClickHandler);
        if (escapeHandler) document.removeEventListener('keydown', escapeHandler);
    };

    // Close modal on X click - use specific selector for recipe modal
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
        // Remove any existing listeners by replacing the button
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        newCloseButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        };
    }

    // Close modal on outside click
    const modalClickHandler = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
    modal.addEventListener('click', modalClickHandler);

    // Close modal on Escape key
    const escapeHandler = function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Handler for generator recipe details
function showGeneratorRecipeDetails(index) {
    if (!window.currentGeneratorRecipes || !window.currentGeneratorRecipes[index]) {
        console.error('Recipe not found');
        return;
    }

    const recipe = window.currentGeneratorRecipes[index];
    displayRecipeModal(recipe);
}

// Parse nutrition data from recipe (handles both string format like "420" or "35g" and number format)
function parseNutritionFromRecipe(recipe) {
    const nutrition = recipe.nutrition || {};
    const parsed = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0
    };

    // Helper function to extract number from string (handles "420", "35g", "10.5g", etc.)
    const extractNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Remove 'g', 'mg', etc. and extract number
            const match = value.match(/(\d+\.?\d*)/);
            return match ? parseFloat(match[1]) : 0;
        }
        return 0;
    };

    // Try different key formats (database format vs display format)
    // Database format: { calories: 420, protein: 35, ... }
    if (nutrition.calories !== undefined) {
        parsed.calories = extractNumber(nutrition.calories);
        parsed.protein = extractNumber(nutrition.protein || 0);
        parsed.carbs = extractNumber(nutrition.carbs || 0);
        parsed.fats = extractNumber(nutrition.fats || nutrition.fat || 0);
        parsed.fiber = extractNumber(nutrition.fiber || 0);
        parsed.sugar = extractNumber(nutrition.sugar || 0);
    }
    // Display format: { "Calories": "420", "Protein": "35g", ... }
    else if (nutrition.Calories !== undefined) {
        parsed.calories = extractNumber(nutrition.Calories);
        parsed.protein = extractNumber(nutrition.Protein || 0);
        parsed.carbs = extractNumber(nutrition.Carbs || 0);
        parsed.fats = extractNumber(nutrition.Fat || nutrition.Fats || 0);
        parsed.fiber = extractNumber(nutrition.Fiber || 0);
        parsed.sugar = extractNumber(nutrition.Sugar || 0);
    }
    // Try lowercase keys
    else {
        Object.keys(nutrition).forEach(key => {
            const lowerKey = key.toLowerCase();
            const value = nutrition[key];
            if (lowerKey.includes('calorie')) parsed.calories = extractNumber(value);
            else if (lowerKey.includes('protein')) parsed.protein = extractNumber(value);
            else if (lowerKey.includes('carb')) parsed.carbs = extractNumber(value);
            else if (lowerKey.includes('fat') && !lowerKey.includes('fiber')) parsed.fats = extractNumber(value);
            else if (lowerKey.includes('fiber')) parsed.fiber = extractNumber(value);
            else if (lowerKey.includes('sugar')) parsed.sugar = extractNumber(value);
        });
    }

    return parsed;
}

// Show custom modal for recipe meal logging
function showRecipeMealLogModal(recipe, callback) {
    // Remove any existing modal
    const existing = document.getElementById('recipeMealLogModal');
    if (existing) existing.remove();
    
    // Parse nutrition data
    const baseNutrition = parseNutritionFromRecipe(recipe);
    const recipeServings = recipe.servings || 1;
    const nutritionPerServing = baseNutrition;
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'recipeMealLogModal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--dark-bg);
        border-radius: 15px;
        padding: 25px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    modal.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-utensils"></i> Add Recipe to Meal Log
            </h3>
            <div style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 15px;">
                <strong>${recipe.title || recipe.name}</strong>
                ${recipeServings > 1 ? `<br>Recipe serves ${recipeServings}` : ''}
            </div>
            <div style="background: rgba(74, 144, 226, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 0.9em; color: var(--text-secondary);">
                <strong>Nutrition per 100g:</strong> ${Math.round(nutritionPerServing.calories)} cal, 
                ${Math.round(nutritionPerServing.protein)}g protein, 
                ${Math.round(nutritionPerServing.carbs)}g carbs, 
                ${Math.round(nutritionPerServing.fats)}g fats
            </div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">
                Weight (grams)
            </label>
            <input type="number" id="recipeMealWeight" placeholder="100" value="100" min="10" step="10" 
                   style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                          background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 1em;">
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">
                Meal Type
            </label>
            <select id="recipeMealType" 
                    style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                           background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 1em;">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner" selected>Dinner</option>
                <option value="snack">Snack</option>
            </select>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="recipeMealLogCancel" style="
                padding: 12px 24px;
                background: rgba(255, 107, 107, 0.2);
                border: 1px solid rgba(255, 107, 107, 0.4);
                border-radius: 8px;
                color: var(--accent-color);
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseenter="this.style.background='rgba(255, 107, 107, 0.3)'" onmouseleave="this.style.background='rgba(255, 107, 107, 0.2)'">
                Cancel
            </button>
            <button id="recipeMealLogSubmit" style="
                padding: 12px 24px;
                background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform='none'">
                <i class="fas fa-plus"></i> Add to Meal Log
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Handle cancel
    document.getElementById('recipeMealLogCancel').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Handle submit
    document.getElementById('recipeMealLogSubmit').addEventListener('click', () => {
        const weightGrams = parseFloat(document.getElementById('recipeMealWeight').value);
        const mealType = document.getElementById('recipeMealType').value;
        
        if (isNaN(weightGrams) || weightGrams <= 0) {
            showNotification('Please enter a valid weight in grams (greater than 0).', 'error');
            return;
        }
        
        overlay.remove();
        if (callback) callback(weightGrams, mealType);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Focus on weight input
    setTimeout(() => {
        document.getElementById('recipeMealWeight').focus();
        document.getElementById('recipeMealWeight').select();
    }, 100);
}

// Add recipe to meal log
async function addRecipeToMealLog() {
    const recipe = window.currentModalRecipe;
    
    if (!recipe) {
        showNotification('Recipe data not found. Please try viewing the recipe again.', 'error');
        return;
    }

    // Check if user is logged in
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        showNotification('Please log in to add meals to your log.', 'error');
        return;
    }

    // Parse nutrition data
    const baseNutrition = parseNutritionFromRecipe(recipe);
    
    if (baseNutrition.calories === 0) {
        showNotification('Nutritional information not available for this recipe.', 'error');
        return;
    }

    // Show custom modal for input
    showRecipeMealLogModal(recipe, async (weightGrams, mealType) => {
        const nutritionPerServing = baseNutrition;
        
        // Calculate nutrition for the specified weight (nutritionPerServing is per 100g)
        const multiplier = weightGrams / 100;
    const finalNutrition = {
            calories: Math.round(nutritionPerServing.calories * multiplier),
            protein: Math.round(nutritionPerServing.protein * multiplier * 10) / 10,
            carbs: Math.round(nutritionPerServing.carbs * multiplier * 10) / 10,
            fats: Math.round(nutritionPerServing.fats * multiplier * 10) / 10,
            fiber: Math.round(nutritionPerServing.fiber * multiplier * 10) / 10,
            sugar: Math.round(nutritionPerServing.sugar * multiplier * 10) / 10
    };

    // Get current date
    const today = new Date().toISOString().split('T')[0];

    // Create meal object
    const meal = {
        type: mealType,
        name: recipe.title || recipe.name,
        date: today,
            quantity: weightGrams,
            quantityType: 'grams',
        calories: finalNutrition.calories,
        protein: finalNutrition.protein,
        carbs: finalNutrition.carbs,
        fats: finalNutrition.fats,
        fiber: finalNutrition.fiber,
        sugar: finalNutrition.sugar
    };

    try {
        // Check if user is in demo mode
        const isDemoUser = currentUserId && currentUserId.startsWith('demo-');
        
        if (isDemoUser) {
            // Save to localStorage for demo users
            const savedMeal = {
                ...meal,
                id: 'meal-' + Date.now(),
                _id: 'meal-' + Date.now()
            };
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
                loadRecentMealsChips();
            updateOverview();
            updateProgressPage();
            
                showNotification(`Meal added successfully! ${meal.name} (${finalNutrition.calories} cal)`, 'success');
            // Navigate to progress page
            showPage('progress');
        } else {
            // Save to API for real users
            const savedMeal = await createMeal(meal);
            savedMeal.id = savedMeal._id;
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
                loadRecentMealsChips();
            updateOverview();
            updateProgressPage();
            
                showNotification(`Meal added successfully! ${meal.name} (${finalNutrition.calories} cal)`, 'success');
            // Navigate to progress page
            showPage('progress');
        }

            // Close the recipe modal
        const modal = document.getElementById('recipeModal');
        if (modal) {
            modal.classList.remove('show');
        }
    } catch (error) {
        console.error('Error adding meal to log:', error);
            showNotification('Failed to add meal to log. Please try again.', 'error');
    }
    });
}

// Theme Toggle Functions
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.className;
    
    if (currentTheme === 'light-mode') {
        body.className = '';
    } else {
        body.className = 'light-mode';
    }
    
    // Save preference
    localStorage.setItem('theme', body.className);
    
    // Update icon
    updateThemeIcon();
}

// Subscription Toggle Functions
function toggleSubscription() {
    if (!userProfile) {
        // Initialize userProfile if it doesn't exist
        userProfile = {
            subscriptionStatus: 'free'
        };
    }
    
    // Toggle between free and pro
    const currentStatus = userProfile.subscriptionStatus || 'free';
    const newStatus = currentStatus === 'free' ? 'pro' : 'free';
    
    // Update userProfile
    userProfile.subscriptionStatus = newStatus;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Update badge display
    updateSubscriptionBadge();
    
    // Try to update on backend if user is logged in
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId && !currentUserId.startsWith('demo-')) {
        // Update backend
        updateUserProfile({ subscriptionStatus: newStatus }).catch(err => {
            console.error('Failed to update subscription status on backend:', err);
            // Continue anyway, it's saved locally
        });
    }
    
    // Show confirmation
    const statusText = newStatus === 'pro' ? 'Pro' : 'Free';
    console.log(`Subscription switched to ${statusText}`);
}

// Update Subscription Badge Display
function updateSubscriptionBadge() {
    const badge = document.getElementById('subscriptionBadge');
    if (!badge) return;
    
    // Get current subscription status
    const status = (userProfile && userProfile.subscriptionStatus) || 'free';
    const isPro = status === 'pro';
    
    // Update text and styling
    badge.textContent = isPro ? 'Pro' : 'Free';
    badge.className = 'subscription-badge';
    badge.classList.add(isPro ? 'subscription-pro' : 'subscription-free');
    
    // Update tooltip
    badge.title = `Current: ${status.toUpperCase()} - Click to switch to ${isPro ? 'Free' : 'Pro'}`;
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (!themeIcon) return;
    
    if (document.body.className === 'light-mode') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// ==================== PROGRESS, ACHIEVEMENTS & CHARTS ====================

// Weight Logging
async function logWeight() {
    const weight = parseFloat(document.getElementById('newWeight').value);
    const date = document.getElementById('weightDate').value;
    
    if (!weight || weight <= 0) {
        alert('Please enter a valid weight!');
        return;
    }
    
    const weightEntry = {
        weight: weight,
        date: date
    };
    
    try {
        // Check if user is in demo mode (demo userId)
        const currentUserId = localStorage.getItem('currentUserId');
        const isDemoUser = currentUserId && currentUserId.startsWith('demo-');
        
        if (isDemoUser) {
            // Save to localStorage for demo users
            const savedWeight = {
                ...weightEntry,
                id: 'weight-' + Date.now(),
                _id: 'weight-' + Date.now()
            };
            weights.push(savedWeight);
            localStorage.setItem('weights', JSON.stringify(weights));
            
            // Reset form
            document.getElementById('newWeight').value = '';
            
            alert('Weight logged successfully! (Demo mode)');
            
            // Update progress page if visible
            if (document.getElementById('progress').classList.contains('active')) {
                updateProgressPage();
            }
        } else {
            // Save to API for real users
            const savedWeight = await createWeight(weightEntry);
            savedWeight.id = savedWeight._id;
            weights.push(savedWeight);
            localStorage.setItem('weights', JSON.stringify(weights));
            
            // Reset form
            document.getElementById('newWeight').value = '';
            
            alert('Weight logged successfully!');
            
            // Update progress page if visible
            if (document.getElementById('progress').classList.contains('active')) {
                updateProgressPage();
            }
        }
    } catch (error) {
        // Fallback to localStorage if API fails
        console.error('API error, saving to localStorage:', error);
        const savedWeight = {
            ...weightEntry,
            id: 'weight-' + Date.now(),
            _id: 'weight-' + Date.now()
        };
        weights.push(savedWeight);
        localStorage.setItem('weights', JSON.stringify(weights));
        
        // Reset form
        document.getElementById('newWeight').value = '';
        
        alert('Weight logged successfully! (Saved locally)');
        
        // Update progress page if visible
        if (document.getElementById('progress').classList.contains('active')) {
            updateProgressPage();
        }
    }
}

// Calculate Achievements
// Track newly unlocked achievements for animations
window.newlyUnlockedAchievements = new Set();

function calculateAchievements() {
    const achievements = [];
    
    // Activity-based achievements
    const totalActivities = activities.length;
    const totalCaloriesBurned = activities.reduce((sum, act) => sum + (act.calories || 0), 0);
    const totalMinutes = activities.reduce((sum, act) => sum + (act.duration || 0), 0);
    
    // Meal-based achievements
    const totalMeals = meals.length;
    const totalCaloriesConsumed = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    
    // Streak calculations
    const activityStreak = calculateStreak(activities, 'date');
    const mealStreak = calculateStreak(meals, 'date');
    
    // Calculate days since first use
    const firstActivityDate = activities.length > 0 ? new Date(Math.min(...activities.map(a => new Date(a.date).getTime()))) : null;
    const firstMealDate = meals.length > 0 ? new Date(Math.min(...meals.map(m => new Date(m.date).getTime()))) : null;
    const firstUseDate = firstActivityDate && firstMealDate 
        ? new Date(Math.min(firstActivityDate.getTime(), firstMealDate.getTime()))
        : (firstActivityDate || firstMealDate);
    const daysSinceFirstUse = firstUseDate ? Math.floor((new Date() - firstUseDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
    
    // Calculate nutrition goals met
    const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
    const calorieGoal = userProfile?.caloricGoal || 2000;
    const mealsWithGoal = meals.filter(meal => {
        const mealDate = typeof meal.date === 'string' ? meal.date.split('T')[0] : new Date(meal.date).toISOString().split('T')[0];
        const dayMeals = meals.filter(m => {
            const mDate = typeof m.date === 'string' ? m.date.split('T')[0] : new Date(m.date).toISOString().split('T')[0];
            return mDate === mealDate;
        });
        const dayCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        return Math.abs(dayCalories - calorieGoal) <= calorieGoal * 0.1; // Within 10% of goal
    });
    const daysMetGoal = new Set(mealsWithGoal.map(m => typeof m.date === 'string' ? m.date.split('T')[0] : new Date(m.date).toISOString().split('T')[0])).size;
    
    // Check if user has used chatbot
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const chatbotUses = chatHistory.filter(msg => msg.role === 'user').length;
    
    // Check if user has uploaded report
    const hasReport = localStorage.getItem('currentReportAnalysis') !== null;
    
    // Define all achievements by category
    const achievementDefinitions = [
        // 🔥 CONSISTENCY - Streak-Based Achievements
        {
            id: 'streak_3_meals',
            category: 'consistency',
            name: '3-Day Meal Streak',
            description: 'Logged meals 3 days in a row',
            icon: 'fa-fire',
            unlocked: mealStreak >= 3,
            progress: mealStreak,
            target: 3,
            badge: 'bronze',
            reason: mealStreak >= 3 ? `You logged meals for ${mealStreak} days in a row! 🎉` : `Keep going! ${mealStreak}/3 days`
        },
        {
            id: 'streak_7_meals',
            category: 'consistency',
            name: '7-Day Meal Streak',
            description: 'Logged meals 7 days in a row',
            icon: 'fa-fire',
            unlocked: mealStreak >= 7,
            progress: mealStreak,
            target: 7,
            badge: 'silver',
            reason: mealStreak >= 7 ? `Amazing! ${mealStreak} days of consistent meal logging! 🔥` : `You're at ${mealStreak}/7 days`
        },
        {
            id: 'streak_30_meals',
            category: 'consistency',
            name: '30-Day Meal Streak',
            description: 'Logged meals 30 days in a row',
            icon: 'fa-fire',
            unlocked: mealStreak >= 30,
            progress: mealStreak,
            target: 30,
            badge: 'gold',
            reason: mealStreak >= 30 ? `Incredible! ${mealStreak} days streak! 🏆` : `Keep the momentum! ${mealStreak}/30 days`
        },
        {
            id: 'streak_3_activity',
            category: 'consistency',
            name: '3-Day Activity Streak',
            description: 'Logged activity 3 days in a row',
            icon: 'fa-fire',
            unlocked: activityStreak >= 3,
            progress: activityStreak,
            target: 3,
            badge: 'bronze',
            reason: activityStreak >= 3 ? `You stayed active for ${activityStreak} days! 🎉` : `Keep moving! ${activityStreak}/3 days`
        },
        {
            id: 'streak_7_activity',
            category: 'consistency',
            name: '7-Day Activity Streak',
            description: 'Logged activity 7 days in a row',
            icon: 'fa-fire',
            unlocked: activityStreak >= 7,
            progress: activityStreak,
            target: 7,
            badge: 'silver',
            reason: activityStreak >= 7 ? `Outstanding! ${activityStreak} days of activity! 🔥` : `You're at ${activityStreak}/7 days`
        },
        {
            id: 'streak_30_activity',
            category: 'consistency',
            name: '30-Day Activity Streak',
            description: 'Logged activity 30 days in a row',
            icon: 'fa-fire',
            unlocked: activityStreak >= 30,
            progress: activityStreak,
            target: 30,
            badge: 'gold',
            reason: activityStreak >= 30 ? `Legendary! ${activityStreak} days streak! 🏆` : `Keep going! ${activityStreak}/30 days`
        },
        {
            id: 'streak_14_meals',
            category: 'consistency',
            name: '14-Day Meal Streak',
            description: 'Logged meals 14 days in a row',
            icon: 'fa-fire',
            unlocked: mealStreak >= 14,
            progress: mealStreak,
            target: 14,
            badge: 'silver',
            reason: mealStreak >= 14 ? `Excellent! ${mealStreak} days of meal tracking! 🔥` : `You're at ${mealStreak}/14 days`
        },
        {
            id: 'streak_60_meals',
            category: 'consistency',
            name: '60-Day Meal Streak',
            description: 'Logged meals 60 days in a row',
            icon: 'fa-fire',
            unlocked: mealStreak >= 60,
            progress: mealStreak,
            target: 60,
            badge: 'gold',
            reason: mealStreak >= 60 ? `Unstoppable! ${mealStreak} days streak! 🏆` : `Keep pushing! ${mealStreak}/60 days`
        },
        {
            id: 'streak_14_activity',
            category: 'consistency',
            name: '14-Day Activity Streak',
            description: 'Logged activity 14 days in a row',
            icon: 'fa-fire',
            unlocked: activityStreak >= 14,
            progress: activityStreak,
            target: 14,
            badge: 'silver',
            reason: activityStreak >= 14 ? `Fantastic! ${activityStreak} days of activity! 🔥` : `You're at ${activityStreak}/14 days`
        },
        {
            id: 'streak_60_activity',
            category: 'consistency',
            name: '60-Day Activity Streak',
            description: 'Logged activity 60 days in a row',
            icon: 'fa-fire',
            unlocked: activityStreak >= 60,
            progress: activityStreak,
            target: 60,
            badge: 'gold',
            reason: activityStreak >= 60 ? `Unstoppable! ${activityStreak} days streak! 🏆` : `Keep pushing! ${activityStreak}/60 days`
        },
        {
            id: 'streak_100_meals',
            category: 'consistency',
            name: '100-Day Meal Streak',
            description: 'Logged meals 100 days in a row',
            icon: 'fa-fire',
            unlocked: mealStreak >= 100,
            progress: mealStreak,
            target: 100,
            badge: 'gold',
            reason: mealStreak >= 100 ? `Legendary! ${mealStreak} days streak! 🏆` : `Incredible progress! ${mealStreak}/100 days`
        },
        {
            id: 'dual_streak_5',
            category: 'consistency',
            name: 'Dual Tracker',
            description: 'Log both meals and activities for 5 days in a row',
            icon: 'fa-balance-scale',
            unlocked: activityStreak >= 5 && mealStreak >= 5,
            progress: Math.min(activityStreak, mealStreak),
            target: 5,
            badge: 'silver',
            reason: (activityStreak >= 5 && mealStreak >= 5) ? `Amazing! You tracked both for ${Math.min(activityStreak, mealStreak)} days! 🎯` : `Track both meals and activities for 5 days`
        },
        
        // 🥗 NUTRITION - Nutrition-Based Achievements
        {
            id: 'healthy_eater_5',
            category: 'nutrition',
            name: 'Healthy Eater',
            description: 'Met calorie goal 5 days',
            icon: 'fa-apple-alt',
            unlocked: daysMetGoal >= 5,
            progress: daysMetGoal,
            target: 5,
            badge: 'bronze',
            reason: daysMetGoal >= 5 ? `You stayed within your calorie limit for ${daysMetGoal} days! 🎉` : `You've met your goal ${daysMetGoal}/5 days`
        },
        {
            id: 'healthy_eater_10',
            category: 'nutrition',
            name: 'Nutrition Master',
            description: 'Met calorie goal 10 days',
            icon: 'fa-apple-alt',
            unlocked: daysMetGoal >= 10,
            progress: daysMetGoal,
            target: 10,
            badge: 'silver',
            reason: daysMetGoal >= 10 ? `Excellent! ${daysMetGoal} days of balanced nutrition! 🥗` : `Keep it up! ${daysMetGoal}/10 days`
        },
        {
            id: 'first_meal',
            category: 'nutrition',
            name: 'First Meal Logged',
            description: 'Log your first meal',
            icon: 'fa-utensils',
            unlocked: totalMeals >= 1,
            progress: totalMeals,
            target: 1,
            badge: 'bronze',
            reason: totalMeals >= 1 ? `You've logged ${totalMeals} meal(s)! 🎉` : 'Log your first meal to unlock'
        },
        {
            id: 'meal_professional',
            category: 'nutrition',
            name: 'Meal Professional',
            description: 'Log 50 meals',
            icon: 'fa-utensils',
            unlocked: totalMeals >= 50,
            progress: totalMeals,
            target: 50,
            badge: 'silver',
            reason: totalMeals >= 50 ? `You've logged ${totalMeals} meals! Amazing tracking! 🏆` : `You've logged ${totalMeals}/50 meals`
        },
        {
            id: 'meal_master',
            category: 'nutrition',
            name: 'Meal Master',
            description: 'Log 100 meals',
            icon: 'fa-utensils',
            unlocked: totalMeals >= 100,
            progress: totalMeals,
            target: 100,
            badge: 'gold',
            reason: totalMeals >= 100 ? `Incredible! ${totalMeals} meals logged! 🎊` : `You've logged ${totalMeals}/100 meals`
        },
        {
            id: 'healthy_eater_20',
            category: 'nutrition',
            name: 'Nutrition Champion',
            description: 'Met calorie goal 20 days',
            icon: 'fa-apple-alt',
            unlocked: daysMetGoal >= 20,
            progress: daysMetGoal,
            target: 20,
            badge: 'gold',
            reason: daysMetGoal >= 20 ? `Outstanding! ${daysMetGoal} days of perfect nutrition! 🥗` : `You've met your goal ${daysMetGoal}/20 days`
        },
        {
            id: 'meal_enthusiast',
            category: 'nutrition',
            name: 'Meal Enthusiast',
            description: 'Log 25 meals',
            icon: 'fa-utensils',
            unlocked: totalMeals >= 25,
            progress: totalMeals,
            target: 25,
            badge: 'bronze',
            reason: totalMeals >= 25 ? `Great job! ${totalMeals} meals logged! 🎉` : `You've logged ${totalMeals}/25 meals`
        },
        {
            id: 'meal_legend',
            category: 'nutrition',
            name: 'Meal Legend',
            description: 'Log 200 meals',
            icon: 'fa-utensils',
            unlocked: totalMeals >= 200,
            progress: totalMeals,
            target: 200,
            badge: 'gold',
            reason: totalMeals >= 200 ? `Legendary! ${totalMeals} meals logged! 🎊` : `You've logged ${totalMeals}/200 meals`
        },
        {
            id: 'protein_tracker',
            category: 'nutrition',
            name: 'Protein Tracker',
            description: 'Log meals with protein data 20 times',
            icon: 'fa-drumstick-bite',
            unlocked: meals.filter(m => m.protein && m.protein > 0).length >= 20,
            progress: meals.filter(m => m.protein && m.protein > 0).length,
            target: 20,
            badge: 'silver',
            reason: meals.filter(m => m.protein && m.protein > 0).length >= 20 ? `You've tracked protein ${meals.filter(m => m.protein && m.protein > 0).length} times! 💪` : `Track protein ${meals.filter(m => m.protein && m.protein > 0).length}/20 times`
        },
        {
            id: 'balanced_macros',
            category: 'nutrition',
            name: 'Macro Master',
            description: 'Log meals with all macros (protein, carbs, fats) 15 times',
            icon: 'fa-chart-pie',
            unlocked: meals.filter(m => m.protein && m.carbs && m.fats && m.protein > 0 && m.carbs > 0 && m.fats > 0).length >= 15,
            progress: meals.filter(m => m.protein && m.carbs && m.fats && m.protein > 0 && m.carbs > 0 && m.fats > 0).length,
            target: 15,
            badge: 'silver',
            reason: meals.filter(m => m.protein && m.carbs && m.fats && m.protein > 0 && m.carbs > 0 && m.fats > 0).length >= 15 ? `Perfect! You've tracked complete macros ${meals.filter(m => m.protein && m.carbs && m.fats && m.protein > 0 && m.carbs > 0 && m.fats > 0).length} times! 🎯` : `Track all macros ${meals.filter(m => m.protein && m.carbs && m.fats && m.protein > 0 && m.carbs > 0 && m.fats > 0).length}/15 times`
        },
        {
            id: 'weekly_nutrition',
            category: 'nutrition',
            name: 'Weekly Nutritionist',
            description: 'Met calorie goal for 7 consecutive days',
            icon: 'fa-calendar-week',
            unlocked: daysMetGoal >= 7,
            progress: daysMetGoal,
            target: 7,
            badge: 'silver',
            reason: daysMetGoal >= 7 ? `Perfect week! ${daysMetGoal} days of balanced nutrition! 📅` : `Meet your goal for ${daysMetGoal}/7 days`
        },
        
        // 🏃 FITNESS - Fitness Achievements
        {
            id: 'first_activity',
            category: 'fitness',
            name: 'First Step',
            description: 'Log your first activity',
            icon: 'fa-running',
            unlocked: totalActivities >= 1,
            progress: totalActivities,
            target: 1,
            badge: 'bronze',
            reason: totalActivities >= 1 ? `You've logged ${totalActivities} activity! 🎉` : 'Log your first activity to unlock'
        },
        {
            id: 'activity_rookie',
            category: 'fitness',
            name: 'Activity Rookie',
            description: 'Log 5 activities',
            icon: 'fa-running',
            unlocked: totalActivities >= 5,
            progress: totalActivities,
            target: 5,
            badge: 'bronze',
            reason: totalActivities >= 5 ? `You've completed ${totalActivities} activities! 🎉` : `You've logged ${totalActivities}/5 activities`
        },
        {
            id: 'cardio_champ',
            category: 'fitness',
            name: 'Cardio Champ',
            description: 'Complete 10 workouts',
            icon: 'fa-dumbbell',
            unlocked: totalActivities >= 10,
            progress: totalActivities,
            target: 10,
            badge: 'silver',
            reason: totalActivities >= 10 ? `Amazing! ${totalActivities} workouts completed! 🏃` : `You've completed ${totalActivities}/10 workouts`
        },
        {
            id: 'calorie_burner',
            category: 'fitness',
            name: 'Calorie Burner',
            description: 'Burn 1000 calories',
            icon: 'fa-fire',
            unlocked: totalCaloriesBurned >= 1000,
            progress: totalCaloriesBurned,
            target: 1000,
            badge: 'bronze',
            reason: totalCaloriesBurned >= 1000 ? `You've burned ${Math.round(totalCaloriesBurned)} calories! 🔥` : `You've burned ${Math.round(totalCaloriesBurned)}/1000 calories`
        },
        {
            id: 'calorie_master',
            category: 'fitness',
            name: 'Calorie Master',
            description: 'Burn 10000 calories',
            icon: 'fa-fire-alt',
            unlocked: totalCaloriesBurned >= 10000,
            progress: totalCaloriesBurned,
            target: 10000,
            badge: 'gold',
            reason: totalCaloriesBurned >= 10000 ? `Incredible! ${Math.round(totalCaloriesBurned)} calories burned! 🏆` : `You've burned ${Math.round(totalCaloriesBurned)}/10000 calories`
        },
        {
            id: '30min_warrior',
            category: 'fitness',
            name: '30-Minute Warrior',
            description: 'Complete 30 minutes of activity in a day',
            icon: 'fa-clock',
            unlocked: activities.some(act => (act.duration || 0) >= 30),
            progress: activities.filter(act => (act.duration || 0) >= 30).length,
            target: 1,
            badge: 'bronze',
            reason: activities.some(act => (act.duration || 0) >= 30) ? 'You completed 30+ minutes in a day! 💪' : 'Complete 30 minutes of activity in one day'
        },
        {
            id: 'activity_veteran',
            category: 'fitness',
            name: 'Activity Veteran',
            description: 'Log 25 activities',
            icon: 'fa-running',
            unlocked: totalActivities >= 25,
            progress: totalActivities,
            target: 25,
            badge: 'silver',
            reason: totalActivities >= 25 ? `Impressive! ${totalActivities} activities logged! 🏃` : `You've logged ${totalActivities}/25 activities`
        },
        {
            id: 'activity_legend',
            category: 'fitness',
            name: 'Activity Legend',
            description: 'Log 50 activities',
            icon: 'fa-running',
            unlocked: totalActivities >= 50,
            progress: totalActivities,
            target: 50,
            badge: 'gold',
            reason: totalActivities >= 50 ? `Legendary! ${totalActivities} activities completed! 🏆` : `You've logged ${totalActivities}/50 activities`
        },
        {
            id: 'calorie_warrior',
            category: 'fitness',
            name: 'Calorie Warrior',
            description: 'Burn 5000 calories',
            icon: 'fa-fire',
            unlocked: totalCaloriesBurned >= 5000,
            progress: totalCaloriesBurned,
            target: 5000,
            badge: 'silver',
            reason: totalCaloriesBurned >= 5000 ? `Amazing! ${Math.round(totalCaloriesBurned)} calories burned! 🔥` : `You've burned ${Math.round(totalCaloriesBurned)}/5000 calories`
        },
        {
            id: 'hour_warrior',
            category: 'fitness',
            name: 'Hour Warrior',
            description: 'Complete 60 minutes of activity in a day',
            icon: 'fa-clock',
            unlocked: activities.some(act => (act.duration || 0) >= 60),
            progress: activities.filter(act => (act.duration || 0) >= 60).length,
            target: 1,
            badge: 'silver',
            reason: activities.some(act => (act.duration || 0) >= 60) ? 'You completed 60+ minutes in a day! 💪' : 'Complete 60 minutes of activity in one day'
        },
        {
            id: 'total_minutes_500',
            category: 'fitness',
            name: 'Fitness Enthusiast',
            description: 'Accumulate 500 total activity minutes',
            icon: 'fa-dumbbell',
            unlocked: totalMinutes >= 500,
            progress: totalMinutes,
            target: 500,
            badge: 'silver',
            reason: totalMinutes >= 500 ? `Excellent! ${totalMinutes} total minutes of activity! 🏋️` : `You've accumulated ${totalMinutes}/500 minutes`
        },
        {
            id: 'total_minutes_1000',
            category: 'fitness',
            name: 'Fitness Master',
            description: 'Accumulate 1000 total activity minutes',
            icon: 'fa-dumbbell',
            unlocked: totalMinutes >= 1000,
            progress: totalMinutes,
            target: 1000,
            badge: 'gold',
            reason: totalMinutes >= 1000 ? `Incredible! ${totalMinutes} total minutes of activity! 🏋️` : `You've accumulated ${totalMinutes}/1000 minutes`
        },
        {
            id: 'daily_activity_5',
            category: 'fitness',
            name: 'Active Week',
            description: 'Log activities on 5 different days',
            icon: 'fa-calendar-check',
            unlocked: new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])).size >= 5,
            progress: new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])).size,
            target: 5,
            badge: 'bronze',
            reason: new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])).size >= 5 ? `Great! You've been active on ${new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])).size} different days! 📅` : `Be active on ${new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])).size}/5 different days`
        },
        
        // 📊 TRACKING DISCIPLINE - Habit Achievements
        {
            id: 'data_logger',
            category: 'tracking',
            name: 'Data Logger',
            description: 'Log meals 10 times',
            icon: 'fa-clipboard-list',
            unlocked: totalMeals >= 10,
            progress: totalMeals,
            target: 10,
            badge: 'bronze',
            reason: totalMeals >= 10 ? `You've logged ${totalMeals} meals! Great tracking! 📊` : `You've logged ${totalMeals}/10 meals`
        },
        {
            id: 'health_aware',
            category: 'tracking',
            name: 'Health Aware',
            description: 'Upload your first health report',
            icon: 'fa-file-medical',
            unlocked: hasReport,
            progress: hasReport ? 1 : 0,
            target: 1,
            badge: 'silver',
            reason: hasReport ? 'You uploaded your health report! 📄' : 'Upload a health report to unlock'
        },
        {
            id: 'ai_explorer',
            category: 'tracking',
            name: 'AI Explorer',
            description: 'Use AI assistant 5 times',
            icon: 'fa-robot',
            unlocked: chatbotUses >= 5,
            progress: chatbotUses,
            target: 5,
            badge: 'silver',
            reason: chatbotUses >= 5 ? `You've used AI assistant ${chatbotUses} times! 🤖` : `You've used AI ${chatbotUses}/5 times`
        },
        {
            id: 'tracking_master',
            category: 'tracking',
            name: 'Tracking Master',
            description: 'Log 100 total entries (meals + activities)',
            icon: 'fa-chart-line',
            unlocked: (totalMeals + totalActivities) >= 100,
            progress: totalMeals + totalActivities,
            target: 100,
            badge: 'gold',
            reason: (totalMeals + totalActivities) >= 100 ? `Amazing! ${totalMeals + totalActivities} total entries! 📊` : `You've logged ${totalMeals + totalActivities}/100 entries`
        },
        {
            id: 'ai_master',
            category: 'tracking',
            name: 'AI Master',
            description: 'Use AI assistant 20 times',
            icon: 'fa-robot',
            unlocked: chatbotUses >= 20,
            progress: chatbotUses,
            target: 20,
            badge: 'gold',
            reason: chatbotUses >= 20 ? `Expert level! You've used AI ${chatbotUses} times! 🤖` : `You've used AI ${chatbotUses}/20 times`
        },
        {
            id: 'recipe_explorer',
            category: 'tracking',
            name: 'Recipe Explorer',
            description: 'Generate 5 recipes',
            icon: 'fa-utensils',
            unlocked: (() => {
                const cachedRecipes = JSON.parse(localStorage.getItem('cachedRecipes') || '{}');
                return Object.keys(cachedRecipes).length >= 5;
            })(),
            progress: (() => {
                const cachedRecipes = JSON.parse(localStorage.getItem('cachedRecipes') || '{}');
                return Object.keys(cachedRecipes).length;
            })(),
            target: 5,
            badge: 'silver',
            reason: (() => {
                const cachedRecipes = JSON.parse(localStorage.getItem('cachedRecipes') || '{}');
                const count = Object.keys(cachedRecipes).length;
                return count >= 5 ? `Great! You've generated ${count} recipes! 🍳` : `Generate ${count}/5 recipes`;
            })()
        },
        {
            id: 'plan_creator',
            category: 'tracking',
            name: 'Plan Creator',
            description: 'Create a 7-day plan',
            icon: 'fa-calendar-week',
            unlocked: (() => {
                const savedPlan = JSON.parse(localStorage.getItem('saved7DayPlan') || 'null');
                return savedPlan !== null;
            })(),
            progress: (() => {
                const savedPlan = JSON.parse(localStorage.getItem('saved7DayPlan') || 'null');
                return savedPlan !== null ? 1 : 0;
            })(),
            target: 1,
            badge: 'silver',
            reason: (() => {
                const savedPlan = JSON.parse(localStorage.getItem('saved7DayPlan') || 'null');
                return savedPlan !== null ? 'You created a 7-day plan! 📅' : 'Create a 7-day meal plan to unlock';
            })()
        },
        {
            id: 'data_enthusiast',
            category: 'tracking',
            name: 'Data Enthusiast',
            description: 'Log 50 total entries (meals + activities)',
            icon: 'fa-clipboard-list',
            unlocked: (totalMeals + totalActivities) >= 50,
            progress: totalMeals + totalActivities,
            target: 50,
            badge: 'silver',
            reason: (totalMeals + totalActivities) >= 50 ? `Excellent tracking! ${totalMeals + totalActivities} entries! 📊` : `You've logged ${totalMeals + totalActivities}/50 entries`
        },
        {
            id: 'complete_tracker',
            category: 'tracking',
            name: 'Complete Tracker',
            description: 'Log both meals and activities on the same day 10 times',
            icon: 'fa-check-double',
            unlocked: (() => {
                const mealDates = new Set(meals.map(m => typeof m.date === 'string' ? m.date.split('T')[0] : new Date(m.date).toISOString().split('T')[0]));
                const activityDates = new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0]));
                const commonDates = [...mealDates].filter(d => activityDates.has(d));
                return commonDates.length >= 10;
            })(),
            progress: (() => {
                const mealDates = new Set(meals.map(m => typeof m.date === 'string' ? m.date.split('T')[0] : new Date(m.date).toISOString().split('T')[0]));
                const activityDates = new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0]));
                const commonDates = [...mealDates].filter(d => activityDates.has(d));
                return commonDates.length;
            })(),
            target: 10,
            badge: 'gold',
            reason: (() => {
                const mealDates = new Set(meals.map(m => typeof m.date === 'string' ? m.date.split('T')[0] : new Date(m.date).toISOString().split('T')[0]));
                const activityDates = new Set(activities.map(a => typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0]));
                const commonDates = [...mealDates].filter(d => activityDates.has(d));
                return commonDates.length >= 10 ? `Perfect! You tracked both on ${commonDates.length} days! 🎯` : `Track both on ${commonDates.length}/10 days`;
            })()
        },
        
        // 🏅 MILESTONES - Milestone Achievements
        {
            id: 'day_1',
            category: 'milestone',
            name: 'Day 1 Complete',
            description: 'Complete your first day',
            icon: 'fa-calendar-check',
            unlocked: daysSinceFirstUse >= 1,
            progress: daysSinceFirstUse,
            target: 1,
            badge: 'bronze',
            reason: daysSinceFirstUse >= 1 ? `You've been using VitaTrackr for ${daysSinceFirstUse} day(s)! 🎉` : 'Complete your first day'
        },
        {
            id: 'week_1',
            category: 'milestone',
            name: 'Week 1 Complete',
            description: 'Use app for 7 days',
            icon: 'fa-calendar-week',
            unlocked: daysSinceFirstUse >= 7,
            progress: daysSinceFirstUse,
            target: 7,
            badge: 'silver',
            reason: daysSinceFirstUse >= 7 ? `You've been using VitaTrackr for ${daysSinceFirstUse} days! 🎊` : `You've used the app for ${daysSinceFirstUse}/7 days`
        },
        {
            id: 'month_1',
            category: 'milestone',
            name: '1 Month with VitaTrackr',
            description: 'Use app for 30 days',
            icon: 'fa-calendar-alt',
            unlocked: daysSinceFirstUse >= 30,
            progress: daysSinceFirstUse,
            target: 30,
            badge: 'gold',
            reason: daysSinceFirstUse >= 30 ? `Amazing! ${daysSinceFirstUse} days with VitaTrackr! 🏆` : `You've used the app for ${daysSinceFirstUse}/30 days`
        },
        {
            id: 'health_conscious',
            category: 'milestone',
            name: 'Health Conscious',
            description: 'Use app for 60 days',
            icon: 'fa-heart',
            unlocked: daysSinceFirstUse >= 60,
            progress: daysSinceFirstUse,
            target: 60,
            badge: 'gold',
            reason: daysSinceFirstUse >= 60 ? `Incredible! ${daysSinceFirstUse} days of health tracking! 🎊` : `You've used the app for ${daysSinceFirstUse}/60 days`
        },
        {
            id: 'hundred_meals',
            category: 'milestone',
            name: '100 Meals Logged',
            description: 'Log 100 meals',
            icon: 'fa-trophy',
            unlocked: totalMeals >= 100,
            progress: totalMeals,
            target: 100,
            badge: 'gold',
            reason: totalMeals >= 100 ? `Milestone reached! ${totalMeals} meals logged! 🎊` : `You've logged ${totalMeals}/100 meals`
        },
        {
            id: 'hundred_activities',
            category: 'milestone',
            name: '100 Activities Logged',
            description: 'Log 100 activities',
            icon: 'fa-trophy',
            unlocked: totalActivities >= 100,
            progress: totalActivities,
            target: 100,
            badge: 'gold',
            reason: totalActivities >= 100 ? `Milestone reached! ${totalActivities} activities logged! 🎊` : `You've logged ${totalActivities}/100 activities`
        },
        {
            id: 'week_2',
            category: 'milestone',
            name: '2 Weeks Complete',
            description: 'Use app for 14 days',
            icon: 'fa-calendar-week',
            unlocked: daysSinceFirstUse >= 14,
            progress: daysSinceFirstUse,
            target: 14,
            badge: 'silver',
            reason: daysSinceFirstUse >= 14 ? `Great commitment! ${daysSinceFirstUse} days with VitaTrackr! 🎊` : `You've used the app for ${daysSinceFirstUse}/14 days`
        },
        {
            id: 'month_2',
            category: 'milestone',
            name: '2 Months with VitaTrackr',
            description: 'Use app for 60 days',
            icon: 'fa-calendar-alt',
            unlocked: daysSinceFirstUse >= 60,
            progress: daysSinceFirstUse,
            target: 60,
            badge: 'gold',
            reason: daysSinceFirstUse >= 60 ? `Amazing dedication! ${daysSinceFirstUse} days! 🏆` : `You've used the app for ${daysSinceFirstUse}/60 days`
        },
        {
            id: 'month_3',
            category: 'milestone',
            name: '3 Months with VitaTrackr',
            description: 'Use app for 90 days',
            icon: 'fa-calendar-alt',
            unlocked: daysSinceFirstUse >= 90,
            progress: daysSinceFirstUse,
            target: 90,
            badge: 'gold',
            reason: daysSinceFirstUse >= 90 ? `Incredible! ${daysSinceFirstUse} days of health tracking! 🎊` : `You've used the app for ${daysSinceFirstUse}/90 days`
        },
        {
            id: 'year_1',
            category: 'milestone',
            name: '1 Year with VitaTrackr',
            description: 'Use app for 365 days',
            icon: 'fa-calendar-alt',
            unlocked: daysSinceFirstUse >= 365,
            progress: daysSinceFirstUse,
            target: 365,
            badge: 'gold',
            reason: daysSinceFirstUse >= 365 ? `Legendary! ${daysSinceFirstUse} days! You're a true health champion! 🏆` : `You've used the app for ${daysSinceFirstUse}/365 days`
        },
        {
            id: 'first_week_complete',
            category: 'milestone',
            name: 'First Week Complete',
            description: 'Complete your first week',
            icon: 'fa-calendar-check',
            unlocked: daysSinceFirstUse >= 7,
            progress: daysSinceFirstUse,
            target: 7,
            badge: 'bronze',
            reason: daysSinceFirstUse >= 7 ? `Congratulations! ${daysSinceFirstUse} days completed! 🎉` : `Complete ${daysSinceFirstUse}/7 days`
        },
        {
            id: 'fifty_meals',
            category: 'milestone',
            name: '50 Meals Logged',
            description: 'Log 50 meals',
            icon: 'fa-trophy',
            unlocked: totalMeals >= 50,
            progress: totalMeals,
            target: 50,
            badge: 'silver',
            reason: totalMeals >= 50 ? `Milestone reached! ${totalMeals} meals logged! 🎊` : `You've logged ${totalMeals}/50 meals`
        },
        {
            id: 'fifty_activities',
            category: 'milestone',
            name: '50 Activities Logged',
            description: 'Log 50 activities',
            icon: 'fa-trophy',
            unlocked: totalActivities >= 50,
            progress: totalActivities,
            target: 50,
            badge: 'silver',
            reason: totalActivities >= 50 ? `Milestone reached! ${totalActivities} activities logged! 🎊` : `You've logged ${totalActivities}/50 activities`
        }
    ];
    
    // Check for newly unlocked achievements
    const previouslyUnlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
    const nowUnlocked = achievementDefinitions.filter(a => a.unlocked).map(a => a.id);
    const newlyUnlocked = nowUnlocked.filter(id => !previouslyUnlocked.includes(id));
    
    if (newlyUnlocked.length > 0) {
        // Save newly unlocked
        localStorage.setItem('unlockedAchievements', JSON.stringify(nowUnlocked));
        window.newlyUnlockedAchievements = new Set(newlyUnlocked);
        
        // Show confetti and notification for each new achievement
        newlyUnlocked.forEach(achievementId => {
            const achievement = achievementDefinitions.find(a => a.id === achievementId);
            if (achievement) {
                setTimeout(() => {
                    triggerConfetti();
                    showNotification(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success', 4000);
                }, newlyUnlocked.indexOf(achievementId) * 500);
            }
        });
    }
    
    return achievementDefinitions;
}

// Calculate Streak
function calculateStreak(items, dateField) {
    if (items.length === 0) return 0;
    
    // Sort by date descending
    const sortedItems = [...items].sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedItems.length; i++) {
        const itemDate = new Date(sortedItems[i][dateField]);
        itemDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (itemDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Update Progress Page
function updateProgressPage() {
    updateAchievements();
    updateStreaks();
    
    // Initialize filter button states
    const activityPeriod = window.chartPeriods?.activity || '7d';
    const nutritionPeriod = window.chartPeriods?.nutrition || '7d';
    
    const activityFilters = document.getElementById('activityChartFilters');
    const nutritionFilters = document.getElementById('nutritionChartFilters');
    
    if (activityFilters) {
        activityFilters.querySelectorAll('.period-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === activityPeriod);
        });
        
        // Add tooltip for custom range if active
        if (activityPeriod === 'custom' && window.chartPeriods?.customRanges?.activity) {
            const range = window.chartPeriods.customRanges.activity;
            const customBtn = activityFilters.querySelector('[data-period="custom"]');
            if (customBtn) {
                const start = new Date(range.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const end = new Date(range.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                customBtn.title = `Custom: ${start} - ${end}`;
            }
        }
    }
    
    if (nutritionFilters) {
        nutritionFilters.querySelectorAll('.period-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === nutritionPeriod);
        });
        
        // Add tooltip for custom range if active
        if (nutritionPeriod === 'custom' && window.chartPeriods?.customRanges?.nutrition) {
            const range = window.chartPeriods.customRanges.nutrition;
            const customBtn = nutritionFilters.querySelector('[data-period="custom"]');
            if (customBtn) {
                const start = new Date(range.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const end = new Date(range.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                customBtn.title = `Custom: ${start} - ${end}`;
            }
        }
    }
    
    updateCharts();
}

// Confetti animation function
function triggerConfetti() {
    const confettiCount = 50;
    const confetti = [];
    const colors = ['#50c878', '#4a90e2', '#ff6b6b', '#ffd93d', '#ff6b9d', '#c44569'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 100001;
            pointer-events: none;
            border-radius: 50%;
            animation: confetti-fall ${1 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confettiPiece);
        confetti.push(confettiPiece);
        
        setTimeout(() => confettiPiece.remove(), 3000);
    }
}

// Current active achievement tab
window.activeAchievementTab = localStorage.getItem('activeAchievementTab') || 'consistency';

// Display Achievement Tabs
function renderAchievementTabs(achievements) {
    const tabsDiv = document.getElementById('achievementTabs');
    if (!tabsDiv) return;
    
    // Group achievements by category
    const categories = {
        consistency: { name: '🔥 Consistency', icon: 'fa-fire', key: 'consistency' },
        nutrition: { name: '🥗 Nutrition', icon: 'fa-apple-alt', key: 'nutrition' },
        fitness: { name: '🏃 Fitness', icon: 'fa-running', key: 'fitness' },
        tracking: { name: '📊 Tracking', icon: 'fa-clipboard-list', key: 'tracking' },
        milestone: { name: '🏅 Milestones', icon: 'fa-trophy', key: 'milestone' }
    };
    
    // Calculate progress for each category
    const categoryStats = {};
    Object.keys(categories).forEach(catKey => {
        const catAchievements = achievements.filter(a => a.category === catKey);
        const unlockedCount = catAchievements.filter(a => a.unlocked).length;
        const totalCount = catAchievements.length;
        categoryStats[catKey] = { unlocked: unlockedCount, total: totalCount };
    });
    
    // Render tabs
    tabsDiv.innerHTML = Object.values(categories).map(category => {
        const stats = categoryStats[category.key];
        const isActive = window.activeAchievementTab === category.key;
        
        return `
            <button class="achievement-tab ${isActive ? 'active' : ''}" 
                    onclick="switchAchievementTab('${category.key}')"
                    data-category="${category.key}">
                <span class="achievement-tab-icon"><i class="fas ${category.icon}"></i></span>
                <span class="achievement-tab-name">${category.name}</span>
                <span class="achievement-tab-progress">(${stats.unlocked}/${stats.total})</span>
            </button>
        `;
    }).join('');
}

// Switch Achievement Tab
function switchAchievementTab(category) {
    window.activeAchievementTab = category;
    localStorage.setItem('activeAchievementTab', category);
    
    // Update tab buttons
    document.querySelectorAll('.achievement-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // Re-render achievements for selected category
    updateAchievements();
}

// Display Achievements with Tab Filtering
function updateAchievements() {
    const achievements = calculateAchievements();
    const achievementsDiv = document.getElementById('achievementsDisplay');
    
    if (!achievementsDiv) return;
    
    // Render tabs first
    renderAchievementTabs(achievements);
    
    // Filter achievements by active tab
    const filteredAchievements = achievements.filter(a => a.category === window.activeAchievementTab);
    
    if (filteredAchievements.length === 0) {
        achievementsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No achievements in this category yet.</p>
            </div>
        `;
        return;
    }
    
    // Render filtered achievements
    achievementsDiv.innerHTML = filteredAchievements.map(achievement => {
        const isNewlyUnlocked = window.newlyUnlockedAchievements?.has(achievement.id);
        const progressPercent = achievement.progress !== undefined 
            ? Math.min((achievement.progress / achievement.target) * 100, 100) 
            : 100;
        const badgeClass = achievement.badge || 'bronze';
        
        return `
            <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'} ${badgeClass} ${isNewlyUnlocked ? 'newly-unlocked' : ''}" 
                 onclick="showAchievementDetails('${achievement.id}')"
                 data-achievement-id="${achievement.id}">
                ${achievement.unlocked ? '' : '<div class="achievement-lock"><i class="fas fa-lock"></i></div>'}
                <div class="achievement-icon ${achievement.unlocked ? '' : 'locked-icon'}">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.progress !== undefined ? `
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar">
                            <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="achievement-progress-text">${achievement.progress}/${achievement.target}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Clear newly unlocked after rendering
    if (window.newlyUnlockedAchievements) {
        window.newlyUnlockedAchievements.clear();
    }
}

// Display Streaks
function updateStreaks() {
    const streaksDiv = document.getElementById('streaksDisplay');
    if (!streaksDiv) return;
    
    const activityStreak = calculateStreak(activities, 'date');
    const mealStreak = calculateStreak(meals, 'date');
    
    streaksDiv.innerHTML = `
        <div class="streak-card">
            <div class="streak-number">${activityStreak}</div>
            <div class="streak-label">Activity Days</div>
        </div>
        <div class="streak-card">
            <div class="streak-number">${mealStreak}</div>
            <div class="streak-label">Meal Logging Days</div>
        </div>
    `;
}

// Show Achievement Details
function showAchievementDetails(achievementId) {
    const achievements = calculateAchievements();
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (!achievement) return;
    
    const progressPercent = achievement.progress !== undefined 
        ? Math.min((achievement.progress / achievement.target) * 100, 100) 
        : 100;
    
    // Remove existing modal
    const existing = document.getElementById('achievementDetailModal');
    if (existing) existing.remove();
    
    // Create modal
    const overlay = document.createElement('div');
    overlay.id = 'achievementDetailModal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--dark-bg);
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        border: 2px solid ${achievement.unlocked ? 'rgba(80, 200, 120, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
    `;
    
    modal.innerHTML = `
        <div style="text-align: center;">
            <div class="achievement-icon-large ${achievement.unlocked ? '' : 'locked-icon'}" style="
                font-size: 4em;
                margin-bottom: 15px;
                color: ${achievement.unlocked ? 'var(--secondary-color)' : 'rgba(255,255,255,0.3)'};
            ">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <h3 style="color: var(--text-primary); margin-bottom: 10px; font-size: 1.5em;">
                ${achievement.name}
            </h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 1em;">
                ${achievement.description}
            </p>
            ${achievement.reason ? `
                <div style="background: rgba(80, 200, 120, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px; border-left: 3px solid var(--secondary-color);">
                    <p style="color: var(--text-primary); margin: 0; font-size: 0.95em; text-align: left;">
                        ${achievement.reason}
                    </p>
                </div>
            ` : ''}
            ${achievement.progress !== undefined ? `
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: var(--text-secondary); font-size: 0.9em;">Progress</span>
                        <span style="color: var(--text-primary); font-weight: 600;">${achievement.progress}/${achievement.target}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, var(--secondary-color), var(--primary-color)); height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            ` : ''}
            <div style="margin-top: 20px;">
                <span style="
                    display: inline-block;
                    padding: 8px 16px;
                    background: ${achievement.unlocked ? 'rgba(80, 200, 120, 0.2)' : 'rgba(255,255,255,0.1)'};
                    color: ${achievement.unlocked ? 'var(--secondary-color)' : 'var(--text-secondary)'};
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.9em;
                ">
                    ${achievement.unlocked ? '✅ UNLOCKED' : '🔒 LOCKED'}
                </span>
            </div>
            <button onclick="document.getElementById('achievementDetailModal').remove()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-weight: 600;
                font-size: 1em;
            ">
                Close
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Chart period state - load from localStorage or default to 7d
window.chartPeriods = (() => {
    try {
        const saved = localStorage.getItem('chartPeriods');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                activity: parsed.activity || '7d',
                nutrition: parsed.nutrition || '7d',
                customRanges: parsed.customRanges || {}
            };
        }
    } catch (e) {
        console.error('Error loading chart periods:', e);
    }
    return {
        activity: '7d',
        nutrition: '7d',
        customRanges: {}
    };
})();

// Get date range for a given period
function getDateRangeForPeriod(period) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    
    // Handle custom date range
    if (period === 'custom') {
        const customRange = window.chartPeriods?.customRanges?.[window.currentChartType] || window.chartPeriods?.customRanges?.activity;
        if (customRange && customRange.startDate && customRange.endDate) {
            return {
                startDate: new Date(customRange.startDate),
                endDate: new Date(customRange.endDate)
            };
        }
        // Fallback to 7 days if no custom range set
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        return { startDate, endDate: today };
    }
    
    // Get profile creation date for 'max' period
    const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
    const profileCreatedAt = userProfile?.createdAt ? new Date(userProfile.createdAt) : null;
    
    switch(period) {
        case '7d':
            startDate.setDate(today.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'currentMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            return { startDate, endDate: lastMonthEnd };
        case '30d':
            startDate.setDate(today.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            break;
        case '90d':
            startDate.setDate(today.getDate() - 89);
            startDate.setHours(0, 0, 0, 0);
            break;
        case '1y':
            startDate.setFullYear(today.getFullYear() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'max':
            if (profileCreatedAt) {
                startDate = new Date(profileCreatedAt);
                startDate.setHours(0, 0, 0, 0);
            } else {
                // Fallback to 1 year if no profile date
                startDate.setFullYear(today.getFullYear() - 1);
                startDate.setHours(0, 0, 0, 0);
            }
            break;
        default:
            startDate.setDate(today.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
    }
    
    return { startDate, endDate: today };
}

// Generate date labels and data points based on period
function generateChartDataPoints(startDate, endDate, period) {
    const points = [];
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Determine aggregation level based on period length
    let aggregation = 'daily'; // daily, weekly, monthly
    let labelFormat = { month: 'short', day: 'numeric' };
    
    if (daysDiff > 365) {
        aggregation = 'monthly';
        labelFormat = { month: 'short', year: '2-digit' };
    } else if (daysDiff > 30) {
        // Use weekly aggregation for periods > 30 days (including 90 days)
        aggregation = 'weekly';
        labelFormat = { month: 'short', day: 'numeric' };
    }
    
    if (aggregation === 'daily') {
        // Daily data points
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            points.push({
                date: new Date(d).toISOString().split('T')[0],
                label: new Date(d).toLocaleDateString('en-US', labelFormat)
            });
        }
    } else if (aggregation === 'weekly') {
        // Weekly data points (start of each week)
        const current = new Date(startDate);
        let weekNum = 1;
        while (current <= endDate) {
            const weekEnd = new Date(current);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const weekLabel = current.getMonth() === weekEnd.getMonth() 
                ? `${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}`
                : `${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            
            points.push({
                date: new Date(current).toISOString().split('T')[0],
                label: weekLabel,
                isWeek: true,
                weekStart: new Date(current)
            });
            current.setDate(current.getDate() + 7);
            weekNum++;
        }
    } else {
        // Monthly data points
        const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (current <= endDate) {
            points.push({
                date: new Date(current).toISOString().split('T')[0],
                label: new Date(current).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                isMonth: true,
                monthStart: new Date(current)
            });
            current.setMonth(current.getMonth() + 1);
        }
    }
    
    return { points, aggregation };
}

// Show custom date range picker
function showCustomDateRangePicker(chartType) {
    window.currentChartType = chartType;
    
    // Remove any existing modal
    const existing = document.getElementById('customDateRangeModal');
    if (existing) existing.remove();
    
    // Get existing custom range if any
    const existingRange = window.chartPeriods?.customRanges?.[chartType];
    const defaultStart = existingRange?.startDate || new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEnd = existingRange?.endDate || new Date().toISOString().split('T')[0];
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'customDateRangeModal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--dark-bg);
        border-radius: 15px;
        padding: 25px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    modal.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-calendar-alt"></i> Custom Date Range
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.9em;">Select a custom date range for ${chartType === 'activity' ? 'Activity' : 'Nutrition'} Trends</p>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">
                Start Date
            </label>
            <input type="date" id="customStartDate" value="${defaultStart}" 
                   style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                          background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 1em;">
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; color: var(--text-primary); margin-bottom: 8px; font-weight: 600;">
                End Date
            </label>
            <input type="date" id="customEndDate" value="${defaultEnd}" 
                   style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                          background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 1em;">
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="customDateCancel" style="
                padding: 12px 24px;
                background: rgba(255, 107, 107, 0.2);
                border: 1px solid rgba(255, 107, 107, 0.4);
                border-radius: 8px;
                color: var(--accent-color);
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseenter="this.style.background='rgba(255, 107, 107, 0.3)'" onmouseleave="this.style.background='rgba(255, 107, 107, 0.2)'">
                Cancel
            </button>
            <button id="customDateApply" style="
                padding: 12px 24px;
                background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform='none'">
                <i class="fas fa-check"></i> Apply
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Handle cancel
    document.getElementById('customDateCancel').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Handle apply
    document.getElementById('customDateApply').addEventListener('click', () => {
        const startDate = document.getElementById('customStartDate').value;
        const endDate = document.getElementById('customEndDate').value;
        
        if (!startDate || !endDate) {
            showNotification('Please select both start and end dates.', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            showNotification('Start date must be before end date.', 'error');
            return;
        }
        
        // Save custom range
        if (!window.chartPeriods.customRanges) {
            window.chartPeriods.customRanges = {};
        }
        window.chartPeriods.customRanges[chartType] = {
            startDate: startDate,
            endDate: endDate
        };
        
        // Set period to custom and update
        setChartPeriod(chartType, 'custom');
        
        // Show success notification
        const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        showNotification(`Custom range set: ${start} - ${end}`, 'success', 3000);
        
        overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Set chart period and update
function setChartPeriod(chartType, period) {
    window.chartPeriods[chartType] = period;
    
    // Save to localStorage
    try {
        localStorage.setItem('chartPeriods', JSON.stringify(window.chartPeriods));
    } catch (e) {
        console.error('Error saving chart periods:', e);
    }
    
    // Update active button
    const filterContainer = document.getElementById(`${chartType}ChartFilters`);
    if (filterContainer) {
        filterContainer.querySelectorAll('.period-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.period === period) {
                btn.classList.add('active');
            }
        });
        
        // If custom period, also highlight the custom button
        if (period === 'custom') {
            const customBtn = filterContainer.querySelector('[data-period="custom"]');
            if (customBtn) customBtn.classList.add('active');
        }
    }
    
    // Update the chart
    if (chartType === 'activity') {
        updateActivityChart(period);
    } else if (chartType === 'nutrition') {
        updateNutritionChart(period);
    }
}

// Update Charts
function updateCharts() {
    // Use setTimeout to ensure DOM is ready and Chart.js is loaded
    setTimeout(() => {
        updateActivityChart(window.chartPeriods.activity || '7d');
    }, 100);
    
    setTimeout(() => {
        updateNutritionChart(window.chartPeriods.nutrition || '7d');
    }, 150);
    
    setTimeout(() => {
        updateWeightChart();
    }, 200);
}

// Activity Chart
function updateActivityChart(period = '7d') {
    const canvas = document.getElementById('activityChart');
    if (!canvas) {
        console.log('Activity chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Could not get canvas context');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        // Show fallback message
        canvas.parentElement.innerHTML += '<p style="text-align: center; color: var(--text-secondary); padding-top: 20px;">Charts loading... Please refresh if this persists.</p>';
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.activityChartInstance) {
        window.activityChartInstance.destroy();
    }
    
    // Get date range for the selected period
    const { startDate, endDate } = getDateRangeForPeriod(period);
    const { points, aggregation } = generateChartDataPoints(startDate, endDate, period);
    
    // Ensure activities array exists
    const activitiesArray = window.activities || activities || [];
    
    // Aggregate activity data based on period
    const activityCaloriesByPeriod = points.map(point => {
        let periodActivities = [];
        
        try {
            if (aggregation === 'daily') {
                // Daily aggregation
                periodActivities = activitiesArray.filter(act => {
                    if (!act || !act.date) return false;
            const actDate = typeof act.date === 'string' ? act.date.split('T')[0] : new Date(act.date).toISOString().split('T')[0];
                    return actDate === point.date;
                });
            } else if (aggregation === 'weekly' && point.weekStart) {
                // Weekly aggregation
                const weekStart = new Date(point.weekStart);
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                
                periodActivities = activitiesArray.filter(act => {
                    if (!act || !act.date) return false;
                    let actDate;
                    if (typeof act.date === 'string') {
                        actDate = new Date(act.date);
                    } else {
                        actDate = new Date(act.date);
                    }
                    // Normalize to start of day for comparison
                    actDate.setHours(0, 0, 0, 0);
                    return actDate >= weekStart && actDate <= weekEnd;
                });
            } else if (aggregation === 'monthly' && point.monthStart) {
                // Monthly aggregation
                const monthStart = new Date(point.monthStart);
                monthStart.setHours(0, 0, 0, 0);
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
                
                periodActivities = activitiesArray.filter(act => {
                    if (!act || !act.date) return false;
                    let actDate;
                    if (typeof act.date === 'string') {
                        actDate = new Date(act.date);
                    } else {
                        actDate = new Date(act.date);
                    }
                    // Normalize to start of day for comparison
                    actDate.setHours(0, 0, 0, 0);
                    return actDate >= monthStart && actDate <= monthEnd;
                });
            }
        } catch (err) {
            console.error('Error processing point:', point, err);
            return 0;
        }
        
        return periodActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    });
    
    console.log('Activity chart data:', {
        activities: activitiesArray.length,
        period: period,
        points: points.length,
        aggregation: aggregation,
        activityCaloriesByPeriod: activityCaloriesByPeriod,
        sampleDates: activitiesArray.slice(0, 3).map(a => a?.date)
    });
    
    // Show message if no activity data
    const totalCalories = activityCaloriesByPeriod.reduce((a, b) => a + b, 0);
    if (totalCalories === 0 && activitiesArray.length === 0) {
        // Keep canvas but show a message below
        const existingMsg = canvas.parentElement.querySelector('.no-data-message');
        if (!existingMsg) {
            const msg = document.createElement('p');
            msg.className = 'no-data-message';
            msg.style.cssText = 'text-align: center; color: var(--text-secondary); padding-top: 20px; font-style: italic;';
            msg.textContent = 'No activity data yet. Start logging activities to see your trends!';
            canvas.parentElement.appendChild(msg);
        }
    } else {
        // Remove no-data message if it exists
        const existingMsg = canvas.parentElement.querySelector('.no-data-message');
        if (existingMsg) existingMsg.remove();
    }
    
    // Average calories across the selected period (including zero days)
    const avgActivityCalories = activityCaloriesByPeriod.length
        ? totalCalories / activityCaloriesByPeriod.length
        : 0;
    
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#2c3e50' : '#ffffff';
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const tickColor = isLightMode ? '#5a6c7d' : '#b0b0b0';
    
    try {
        // Adjust point radius and font size based on data points
        const pointRadius = points.length > 30 ? 2 : (points.length > 14 ? 3 : 4);
        const fontSize = points.length > 30 ? 9 : (points.length > 14 ? 10 : 11);
        const maxTicks = points.length > 30 ? 10 : (points.length > 14 ? 14 : undefined);
        
        window.activityChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: points.map(p => p.label),
                datasets: [
                    {
                        label: 'Calories Burned',
                        data: activityCaloriesByPeriod,
                        borderColor: '#50c878',
                        backgroundColor: 'rgba(80, 200, 120, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: pointRadius,
                        pointBackgroundColor: '#50c878',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: points.length <= 30 ? 2 : 1
                    },
                    {
                        label: 'Average Calories Burned',
                        data: activityCaloriesByPeriod.map(() => avgActivityCalories),
                        borderColor: isLightMode ? 'rgba(40, 120, 60, 0.9)' : 'rgba(80, 200, 120, 0.9)',
                        borderDash: [6, 6],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#50c878',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: tickColor,
                            font: {
                                size: fontSize
                            }
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1
                        }
                    },
                    x: {
                        ticks: {
                            color: tickColor,
                            font: {
                                size: fontSize
                            },
                            maxTicksLimit: maxTicks
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1
                        }
                    }
                }
            }
        });
        
        console.log('✅ Activity chart rendered successfully with', activityCaloriesByPeriod.length, 'data points for period', period);
    } catch (error) {
        console.error('❌ Error rendering activity chart:', error);
        console.error('Error details:', error.stack);
        // Don't replace the entire parent, just show error message
        const errorMsg = canvas.parentElement.querySelector('.chart-error-message');
        if (!errorMsg) {
            const msg = document.createElement('p');
            msg.className = 'chart-error-message';
            msg.style.cssText = 'text-align: center; color: var(--accent-color); padding-top: 20px;';
            msg.textContent = 'Error loading chart. Please refresh the page.';
            canvas.parentElement.appendChild(msg);
        }
    }
}

// Nutrition Chart
function updateNutritionChart(period = '7d') {
    const canvas = document.getElementById('nutritionChart');
    if (!canvas) {
        console.log('Nutrition chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.log('Could not get canvas context');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        // Show fallback message
        canvas.parentElement.innerHTML += '<p style="text-align: center; color: var(--text-secondary); padding-top: 20px;">Charts loading... Please refresh if this persists.</p>';
        return;
    }
    
    if (window.nutritionChartInstance) {
        window.nutritionChartInstance.destroy();
    }
    
    // Get date range for the selected period
    const { startDate, endDate } = getDateRangeForPeriod(period);
    const { points, aggregation } = generateChartDataPoints(startDate, endDate, period);
    
    // Aggregate nutrition data based on period
    const nutritionByPeriod = points.map(point => {
        let periodMeals = [];
        
        if (aggregation === 'daily') {
            // Daily aggregation
            periodMeals = meals.filter(meal => {
            const mealDate = typeof meal.date === 'string' ? meal.date.split('T')[0] : new Date(meal.date).toISOString().split('T')[0];
                return mealDate === point.date;
            });
        } else if (aggregation === 'weekly') {
            // Weekly aggregation
            const weekEnd = new Date(point.weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            periodMeals = meals.filter(meal => {
                const mealDate = typeof meal.date === 'string' ? new Date(meal.date) : new Date(meal.date);
                return mealDate >= point.weekStart && mealDate <= weekEnd;
            });
        } else {
            // Monthly aggregation
            const monthEnd = new Date(point.monthStart.getFullYear(), point.monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
            
            periodMeals = meals.filter(meal => {
                const mealDate = typeof meal.date === 'string' ? new Date(meal.date) : new Date(meal.date);
                return mealDate >= point.monthStart && mealDate <= monthEnd;
            });
        }
        
        return {
            calories: periodMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
            protein: periodMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
            carbs: periodMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
        };
    });
    
    console.log('Nutrition chart data:', {
        meals: meals.length,
        period: period,
        points: points.length,
        nutritionByPeriod: nutritionByPeriod,
        sampleDates: meals.slice(0, 3).map(m => m.date)
    });
    
    // Show message if no nutrition data
    const totalCalories = nutritionByPeriod.reduce((sum, n) => sum + n.calories, 0);
    if (totalCalories === 0 && meals.length === 0) {
        // Keep canvas but show a message below
        const existingMsg = canvas.parentElement.querySelector('.no-data-message');
        if (!existingMsg) {
            const msg = document.createElement('p');
            msg.className = 'no-data-message';
            msg.style.cssText = 'text-align: center; color: var(--text-secondary); padding-top: 20px; font-style: italic;';
            msg.textContent = 'No meal data yet. Start logging meals to see your nutrition trends!';
            canvas.parentElement.appendChild(msg);
        }
    } else {
        // Remove no-data message if it exists
        const existingMsg = canvas.parentElement.querySelector('.no-data-message');
        if (existingMsg) existingMsg.remove();
    }
    
    // Average calories across the selected period (for calories line)
    const avgCalories = nutritionByPeriod.length
        ? totalCalories / nutritionByPeriod.length
        : 0;
    const avgCaloriesScaled = avgCalories / 10; // match Calories (×0.1) scaling
    const caloriesSeries = nutritionByPeriod.map(n => n.calories / 10);
    
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#2c3e50' : '#ffffff';
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const tickColor = isLightMode ? '#5a6c7d' : '#b0b0b0';
    
    try {
        // Adjust font size based on data points
        const fontSize = points.length > 30 ? 9 : (points.length > 14 ? 10 : 11);
        const maxTicks = points.length > 30 ? 10 : (points.length > 14 ? 14 : undefined);
        
        window.nutritionChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: points.map(p => p.label),
                datasets: [
                    {
                        label: 'Calories (×0.1)',
                        data: caloriesSeries,
                        backgroundColor: 'rgba(255, 107, 107, 0.6)',
                        borderColor: '#ff6b6b',
                        borderWidth: 2
                    },
                    {
                        label: 'Protein (g)',
                        data: nutritionByPeriod.map(n => n.protein),
                        backgroundColor: 'rgba(74, 144, 226, 0.6)',
                        borderColor: '#4a90e2',
                        borderWidth: 2
                    },
                    {
                        label: 'Carbs (g)',
                        data: nutritionByPeriod.map(n => n.carbs),
                        backgroundColor: 'rgba(255, 215, 0, 0.6)',
                        borderColor: '#ffd700',
                        borderWidth: 2
                    },
                    {
                        type: 'line',
                        label: 'Avg Calories (×0.1)',
                        data: nutritionByPeriod.map(() => avgCaloriesScaled),
                        borderColor: isLightMode ? 'rgba(200, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        borderDash: [6, 6],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4a90e2',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: tickColor,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1
                        }
                    },
                    x: {
                        ticks: {
                            color: tickColor,
                            font: {
                                size: fontSize
                            },
                            maxTicksLimit: maxTicks
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1
                        }
                    }
                }
            }
        });
        
        console.log('✅ Nutrition chart rendered successfully with', nutritionByPeriod.length, 'data points for period', period);
    } catch (error) {
        console.error('❌ Error rendering nutrition chart:', error);
        canvas.parentElement.innerHTML += '<p style="text-align: center; color: var(--accent-color); padding-top: 20px;">Error loading chart. Please refresh the page.</p>';
    }
}

// Weight Chart
function updateWeightChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (window.weightChartInstance) {
        window.weightChartInstance.destroy();
    }
    
    if (weights.length === 0) {
        // Show message if no weight data
        canvas.parentElement.innerHTML += '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No weight data logged yet. Start tracking to see your progress!</p>';
        return;
    }
    
    const sortedWeights = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));
    const weightData = sortedWeights.slice(-14); // Last 14 entries
    
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#2c3e50' : '#ffffff';
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const tickColor = isLightMode ? '#5a6c7d' : '#b0b0b0';
    
    window.weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weightData.map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Weight (kg)',
                data: weightData.map(w => w.weight),
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: '#4a90e2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: tickColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: tickColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

// ==================== ENHANCED RECOMMENDATION SYSTEM ====================

// Display Activity Recommendation for Activity Tracker page
function displayActivityRecommendation() {
    if (!userProfile || !userProfile.isSetupComplete) {
        const contentDiv = document.getElementById('activityRecommendationContent');
        if (contentDiv) {
            contentDiv.innerHTML = '<p style="margin: 0; color: var(--text-secondary);">Complete your profile setup to get personalized activity recommendations!</p>';
        }
        return;
    }
    
    // Check if goal is completed
    const completionCheck = checkActivityGoalCompletion();
    if (completionCheck.completed) {
        const contentDiv = document.getElementById('activityRecommendationContent');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4em; margin-bottom: 15px;">🎉</div>
                    <p style="margin: 0 0 10px 0; font-size: 1.3em; font-weight: 700; color: var(--accent-color);">
                        Hooray! You've completed today's goal!
                    </p>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 1em; line-height: 1.6;">
                        ${completionCheck.message}
                    </p>
                </div>
            `;
        }
        return;
    }
    
    const recommendation = generateActivityRecommendation();
    const contentDiv = document.getElementById('activityRecommendationContent');
    
    if (contentDiv) {
        const icon = getActivityIcon(recommendation.activity);
        contentDiv.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px;">
                <div style="font-size: 2em; color: var(--accent-color);">${icon}</div>
                <div style="flex: 1;">
                    <p style="margin: 0 0 10px 0; font-size: 1.1em; font-weight: 600;">
                        Do <span style="color: var(--accent-color);">${recommendation.duration} minutes of ${recommendation.activity}</span> today
                    </p>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.95em;">
                        <i class="fas fa-info-circle"></i> ${recommendation.reason}
                    </p>
                </div>
            </div>
        `;
    }
}

// Generate Activity Recommendation
function generateActivityRecommendation() {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(act => act.date === today);
    const todayCalories = todayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    
    // Get yesterday's activity
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayActivities = activities.filter(act => act.date === yesterdayStr);
    const yesterdayCalories = yesterdayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    
    // Get last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    });
    
    const weekActivities = activities.filter(act => last7Days.includes(act.date));
    const avgDailyCalories = weekActivities.reduce((sum, act) => sum + (act.calories || 0), 0) / 7;
    
    // Check for excessive activity
    const age = userProfile.age || 30;
    const isExcessive = checkExcessiveActivity(age, todayCalories, userProfile);
    
    let recommendation;
    
    if (isExcessive.excessive) {
        // User over-exercised - recommend rest or light activity
        recommendation = {
            activity: 'yoga',
            duration: 15,
            reason: isExcessive.reason
        };
    } else if (todayCalories === 0) {
        // No activity today - recommend based on weekly average
        if (avgDailyCalories > 500) {
            recommendation = {
                activity: getRecommendedActivity(avgDailyCalories),
                duration: calculateRecommendedDuration(userProfile.goalType, age),
                reason: `Your weekly average is ${Math.round(avgDailyCalories)} calories/day. Keep the momentum going!`
            };
        } else if (avgDailyCalories > 200) {
            recommendation = {
                activity: 'walking',
                duration: 30,
                reason: `You've been active this week (${Math.round(avgDailyCalories)} cal/day avg). A brisk walk will help maintain your progress.`
            };
        } else {
            recommendation = {
                activity: 'walking',
                duration: 20,
                reason: 'Start with a gentle walk to begin your fitness journey!'
            };
        }
    } else if (todayCalories < 100) {
        // Light activity today
        recommendation = {
            activity: 'walking',
            duration: 20,
            reason: `You've burned ${todayCalories} calories today. A short walk would help you reach your daily goal.`
        };
    } else if (todayCalories >= 100 && todayCalories < 300) {
        // Moderate activity - encourage to continue
        recommendation = {
            activity: getRecommendedActivity(avgDailyCalories),
            duration: 15,
            reason: `Great start! You've burned ${todayCalories} calories. Add 15 more minutes to maximize your results.`
        };
    } else {
        // Good activity - light activity or rest
        recommendation = {
            activity: 'yoga',
            duration: 15,
            reason: `Excellent work! You've burned ${todayCalories} calories today. A light yoga session will help with recovery.`
        };
    }
    
    return recommendation;
}

// Check if user is over-exercising
function checkExcessiveActivity(age, todayCalories, userProfile) {
    const healthConditions = userProfile.diseases || [];
    const hasHeartCondition = healthConditions.some(d => 
        d.toLowerCase().includes('heart') || 
        d.toLowerCase().includes('hypertension') || 
        d.toLowerCase().includes('pressure')
    );
    
    // Age-based thresholds
    let maxCaloriesThreshold = 1000;
    if (age > 60) maxCaloriesThreshold = 500;
    else if (age > 50) maxCaloriesThreshold = 700;
    else if (age > 40) maxCaloriesThreshold = 900;
    
    // Health condition adjustments
    if (hasHeartCondition) maxCaloriesThreshold *= 0.7;
    
    if (todayCalories > maxCaloriesThreshold) {
        const overBy = todayCalories - maxCaloriesThreshold;
        return {
            excessive: true,
            reason: `Warning: You've over-exercised by ~${Math.round(overBy)} calories today. Rest is crucial for recovery and preventing injuries.${age > 50 ? ' Take it easier at your age.' : ''}${hasHeartCondition ? ' Given your heart condition, reduce intensity.' : ''}`
        };
    }
    
    return { excessive: false };
}

// Check if activity goal is completed for the day
function checkActivityGoalCompletion() {
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(act => act.date === today);
    const todayCalories = todayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    const todayDuration = todayActivities.reduce((sum, act) => sum + (act.duration || 0), 0);
    
    // Define completion thresholds based on goal type
    const goalType = userProfile.goalType || 'maintain';
    let targetCalories = 300; // Default moderate activity goal
    let targetDuration = 30;  // Default 30 minutes
    
    if (goalType === 'weight-loss') {
        targetCalories = 400;
        targetDuration = 45;
    } else if (goalType === 'muscle-gain') {
        targetCalories = 500;
        targetDuration = 60;
    } else if (goalType === 'weight-gain') {
        targetCalories = 250;
        targetDuration = 30;
    }
    
    // Adjust for age
    const age = userProfile.age || 30;
    if (age > 60) {
        targetCalories *= 0.6;
        targetDuration *= 0.6;
    } else if (age > 50) {
        targetCalories *= 0.75;
        targetDuration *= 0.75;
    }
    
    // Check if goal met
    if (todayCalories >= targetCalories || todayDuration >= targetDuration) {
        const messages = [
            `You've burned ${Math.round(todayCalories)} calories and exercised for ${todayDuration} minutes today! Your body is thanking you for this amazing effort. Rest well and stay hydrated! 🏆`,
            `Incredible! ${Math.round(todayCalories)} calories burned today! You're crushing your fitness goals. Keep this momentum going tomorrow! 💪`,
            `Outstanding achievement! ${todayDuration} minutes of activity completed. Your dedication is inspiring! Remember to fuel your body with nutritious meals. 🌟`,
            `You did it! You've exceeded today's activity goal with ${Math.round(todayCalories)} calories burned. This is the dedication that leads to real results! 🎯`,
            `Fantastic work! ${todayDuration} minutes of exercise today shows serious commitment to your health. You deserve this celebration! ✨`
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        return {
            completed: true,
            message: randomMessage
        };
    }
    
    return { completed: false };
}

// Get recommended activity type based on weekly average
function getRecommendedActivity(avgCalories) {
    const activities = ['running', 'cycling', 'swimming', 'walking', 'gym', 'yoga'];
    // Add some randomness to avoid repetition
    const recentActivities = getRecentActivityTypes(7);
    const availableActivities = activities.filter(a => !recentActivities.includes(a));
    const pool = availableActivities.length > 0 ? availableActivities : activities;
    
    // Recommend based on calories burned
    if (avgCalories > 500) return pool.includes('running') ? 'running' : pool[0];
    if (avgCalories > 300) return pool.includes('cycling') ? 'cycling' : pool[0];
    if (avgCalories > 200) return pool.includes('walking') ? 'walking' : pool[0];
    return 'walking';
}

// Get recent activity types for variety
function getRecentActivityTypes(days) {
    const last7Days = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    });
    
    const recentActs = activities.filter(act => last7Days.includes(act.date));
    return [...new Set(recentActs.map(act => act.type))];
}

// Calculate recommended duration
function calculateRecommendedDuration(goalType, age) {
    let baseDuration = 30;
    
    // Adjust based on goal
    if (goalType === 'weight-loss') baseDuration = 45;
    else if (goalType === 'muscle-gain') baseDuration = 60;
    else if (goalType === 'weight-gain') baseDuration = 30;
    else baseDuration = 30;
    
    // Adjust for age
    if (age > 60) baseDuration = Math.min(20, baseDuration);
    else if (age > 50) baseDuration = Math.min(30, baseDuration);
    else if (age > 40) baseDuration = Math.min(40, baseDuration);
    
    // Add some randomness (10-20% variation) to avoid repetition
    const variation = 0.1 + Math.random() * 0.1;
    return Math.round(baseDuration * (1 + (Math.random() > 0.5 ? variation : -variation)));
}

// Get activity icon
function getActivityIcon(activity) {
    const icons = {
        running: '🏃',
        cycling: '🚴',
        swimming: '🏊',
        walking: '🚶',
        gym: '💪',
        yoga: '🧘'
    };
    return icons[activity] || '🏃';
}

// Display Daily Plan for Overview page
function displayDailyPlan() {
    if (!userProfile || !userProfile.isSetupComplete) {
        const contentDiv = document.getElementById('dailyPlanContent');
        if (contentDiv) {
            contentDiv.innerHTML = '<p style="margin: 0;">Complete your profile setup to get your personalized daily plan!</p>';
        }
        return;
    }
    
    const dailyPlan = generateDailyPlan();
    const contentDiv = document.getElementById('dailyPlanContent');
    
    if (contentDiv) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        contentDiv.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0; font-size: 1.05em; font-weight: 600; color: var(--text-primary);">
                    <i class="fas fa-calendar-day"></i> Your plan for ${today}
                </p>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--accent-color);">
                        <i class="fas fa-running"></i> Activity Recommendation
                    </h4>
                    <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">
                        ${dailyPlan.activityRecommendation}
                    </p>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--secondary-color);">
                        <i class="fas fa-utensils"></i> Nutrition Focus
                    </h4>
                    <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">
                        ${dailyPlan.nutritionRecommendation}
                    </p>
                </div>
            </div>
        `;
    }
}

// Generate Complete Daily Plan
function generateDailyPlan() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Get yesterday's data
    const yesterdayActivities = activities.filter(act => act.date === yesterdayStr);
    const yesterdayMeals = meals.filter(meal => meal.date === yesterdayStr);
    const yesterdayCaloriesBurned = yesterdayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    const yesterdayCaloriesEaten = yesterdayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const yesterdayProtein = yesterdayMeals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0);
    const yesterdayCarbs = yesterdayMeals.reduce((sum, meal) => sum + (parseFloat(meal.carbs) || 0), 0);
    
    // Get last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    });
    
    const weekActivities = activities.filter(act => last7Days.includes(act.date));
    const weekMeals = meals.filter(meal => last7Days.includes(meal.date));
    const avgDailyCaloriesBurned = weekActivities.reduce((sum, act) => sum + (act.calories || 0), 0) / 7;
    const avgDailyCaloriesEaten = weekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / 7;
    const avgDailyProtein = weekMeals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0) / 7;
    
    const activityRec = generateActivityRecommendation();
    const age = userProfile.age || 30;
    
    // Build activity recommendation with context
    let activityContext = '';
    if (yesterdayCaloriesBurned > 500) {
        activityContext = `Yesterday you had an intense workout (${Math.round(yesterdayCaloriesBurned)} cal), so today focus on recovery and lighter movement.`;
    } else if (yesterdayCaloriesBurned > 200) {
        activityContext = `You were moderately active yesterday (${Math.round(yesterdayCaloriesBurned)} cal). Today you can push a bit more!`;
    } else if (avgDailyCaloriesBurned > 400) {
        activityContext = `Your weekly average is ${Math.round(avgDailyCaloriesBurned)} calories/day. Maintain this excellent momentum!`;
    } else {
        activityContext = 'Based on your weekly activity patterns, let\'s boost your fitness journey!';
    }
    
    const activityRecommendation = `${activityContext} ${activityRec.reason} Recommended: ${activityRec.duration} minutes of ${activityRec.activity}.`;
    
    // Build nutrition recommendation with context
    let nutritionContext = '';
    let nutritionFocus = '';
    
    if (yesterdayProtein < 50) {
        nutritionContext = `Your protein intake was low yesterday (${Math.round(yesterdayProtein)}g).`;
        nutritionFocus = 'Focus on high-protein foods today like chicken, fish, eggs, legumes, or Greek yogurt to support muscle recovery and growth.';
    } else if (avgDailyProtein < 60) {
        nutritionContext = `Your weekly protein average (${Math.round(avgDailyProtein)}g/day) could be improved.`;
        nutritionFocus = 'Incorporate protein-rich snacks between meals to boost your intake throughout the day.';
    } else {
        nutritionContext = `Your nutrition has been balanced recently.`;
        nutritionFocus = 'Maintain variety in your meals. Include colorful vegetables, whole grains, and healthy fats for optimal nutrition.';
    }
    
    if (yesterdayCaloriesEaten > 2500 && avgDailyCaloriesBurned < 300) {
        nutritionContext += ' You consumed more calories yesterday than you burned through activities.';
        nutritionFocus = 'Today, focus on nutrient-dense foods that provide satiety without excess calories. Choose lean proteins, vegetables, and whole grains.';
    }
    
    // Add goal-specific recommendations
    if (userProfile.goalType) {
        switch(userProfile.goalType) {
            case 'weight-loss':
                if (nutritionFocus.includes('Focus on')) {
                    nutritionFocus += ' For weight loss, prioritize portion control and high-fiber foods.';
                } else {
                    nutritionFocus = 'Focus on portion control, high-fiber foods, and lean proteins. Stay hydrated and avoid sugary drinks.';
                }
                break;
            case 'muscle-gain':
                nutritionFocus += ' For muscle gain, ensure you\'re eating enough calories and protein. Consider protein-rich snacks post-workout.';
                break;
            case 'weight-gain':
                nutritionFocus += ' For healthy weight gain, focus on calorie-dense but nutritious foods like nuts, avocados, and whole grains.';
                break;
        }
    }
    
    // Add condition-specific recommendations
    if (userProfile.diseases && userProfile.diseases.length > 0) {
        const diseases = userProfile.diseases.map(d => d.toLowerCase());
        if (diseases.some(d => d.includes('diabetes'))) {
            nutritionFocus += ' With diabetes, maintain consistent meal timing and choose low-glycemic foods. Monitor your carb intake.';
        }
        if (diseases.some(d => d.includes('hypertension'))) {
            nutritionFocus += ' For hypertension, limit sodium intake and increase potassium-rich foods like bananas and leafy greens.';
        }
    }
    
    const nutritionRecommendation = `${nutritionContext} ${nutritionFocus}`;
    
    return {
        activityRecommendation,
        nutritionRecommendation
    };
}

// ==================== CHATBOT FUNCTIONS ====================

// Report Analysis Chatbot state
let conversationHistory = [];
let currentReportAnalysis = null;

// Customer Support Chatbot state
let supportConversationHistory = [];
let supportChatOpen = false;

// Get storage key for current user's chat
function getChatStorageKey() {
    const currentUserId = localStorage.getItem('currentUserId');
    return currentUserId ? `reportChat_${currentUserId}` : null;
}

// Save chat to localStorage
function saveChatToStorage() {
    const storageKey = getChatStorageKey();
    if (!storageKey) return;
    
    const chatData = {
        conversationHistory: conversationHistory,
        currentReportAnalysis: currentReportAnalysis,
        chatMessagesHTML: document.getElementById('chatMessages')?.innerHTML || ''
    };
    
    try {
        localStorage.setItem(storageKey, JSON.stringify(chatData));
    } catch (e) {
        console.error('Error saving chat to storage:', e);
    }
}

// Load chat from localStorage
function loadChatFromStorage() {
    const storageKey = getChatStorageKey();
    if (!storageKey) return false;
    
    try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            const chatData = JSON.parse(savedData);
            conversationHistory = chatData.conversationHistory || [];
            currentReportAnalysis = chatData.currentReportAnalysis || null;
            
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages && chatData.chatMessagesHTML) {
                chatMessages.innerHTML = chatData.chatMessagesHTML;
                scrollChatToBottom();
                return true;
            }
        }
    } catch (e) {
        console.error('Error loading chat from storage:', e);
    }
    
    return false;
}

// Initialize chatbot when page loads
function initializeChatbot() {
    // Try to load saved chat first
    const chatLoaded = loadChatFromStorage();
    
    // If no saved chat, initialize empty
    if (!chatLoaded) {
        conversationHistory = [];
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.children.length === 0) {
            chatMessages.innerHTML = `
                <div class="chat-message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-microscope"></i>
                    </div>
                    <div class="message-content">
                        <p>Hello! Upload your report to get started, or ask me anything about your health and nutrition.</p>
                    </div>
                </div>
            `;
        }
    }
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    scrollChatToBottom();
}

// Send message to report analysis chatbot
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Disable input while processing
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Add user message to chat
    addMessageToChat('user', message);
    chatInput.value = '';
    
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: message });
    
    // Save chat after user message
    saveChatToStorage();
    
    try {
        // Get user data for context
        const currentUserId = localStorage.getItem('currentUserId');
        const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
        const activities = window.activities || [];
        const meals = window.meals || [];
        
        // Show typing indicator
        const typingId = addTypingIndicator();
        
        // Call chatbot API
        const response = await chatWithBot(message, conversationHistory, userProfile, activities, meals);
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add bot response to chat
        addMessageToChat('bot', response.response);
        
        // Add to conversation history
        conversationHistory.push({ role: 'assistant', content: response.response });
        
        // Save chat after bot response
        saveChatToStorage();
        
    } catch (error) {
        console.error('Chatbot error:', error);
        addMessageToChat('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
        // Save chat even on error
        saveChatToStorage();
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        chatInput.focus();
    }
}

// Send message to customer support chatbot
async function sendSupportMessage() {
    const chatInput = document.getElementById('supportChatInput');
    const sendBtn = document.getElementById('supportSendBtn');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Disable input while processing
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Add user message to chat
    addSupportMessageToChat('user', message);
    chatInput.value = '';
    
    // Add to conversation history
    supportConversationHistory.push({ role: 'user', content: message });
    
    try {
        // Show typing indicator
        const typingId = addSupportTypingIndicator();
        
        // Call support chat API
        const response = await supportChat(message, supportConversationHistory);
        
        // Remove typing indicator
        removeSupportTypingIndicator(typingId);
        
        // Add bot response to chat
        addSupportMessageToChat('bot', response.response);
        
        // Add to conversation history
        supportConversationHistory.push({ role: 'assistant', content: response.response });
        
        // Hide badge if visible
        const badge = document.getElementById('supportBadge');
        if (badge) badge.style.display = 'none';
        
    } catch (error) {
        console.error('Support chat error:', error);
        addSupportMessageToChat('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        chatInput.focus();
    }
}

// Add message to chat UI
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    
    const avatar = role === 'user' 
        ? '<i class="fas fa-user"></i>' 
        : '<i class="fas fa-robot"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>
        <div class="message-content">
            ${formatMessageContent(content)}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollChatToBottom();
}

// Format message content (handle markdown, links, etc.)
function formatMessageContent(content) {
    // Convert newlines to <br>
    content = content.replace(/\n/g, '<br>');
    
    // Convert URLs to links
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert **bold** to <strong>
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return content;
}

// Add typing indicator
function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;
    
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'chat-message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <span class="typing-dots">
                <span>.</span><span>.</span><span>.</span>
            </span>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollChatToBottom();
    return typingId;
}

// Remove typing indicator
function removeTypingIndicator(typingId) {
    if (typingId) {
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();
    }
}

// Scroll chat to bottom
function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Show FAQ modal
async function showFAQ() {
    const modal = document.getElementById('faqModal');
    const faqContent = document.getElementById('faqContent');
    
    if (!modal || !faqContent) return;
    
    try {
        faqContent.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading FAQs...</p>';
        modal.classList.add('show');
        
        const faqs = await getFAQ();
        
        faqContent.innerHTML = faqs.map((faq, index) => `
            <div class="faq-item" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <h4 style="color: var(--primary-color); margin-bottom: 10px;">
                    <i class="fas fa-question-circle"></i> ${faq.question}
                </h4>
                <p style="color: var(--text-secondary); line-height: 1.6;">${faq.answer}</p>
            </div>
        `).join('');
    } catch (error) {
        faqContent.innerHTML = `<p style="color: var(--accent-color);">Error loading FAQs: ${error.message}</p>`;
    }
}

// Close FAQ modal
function closeFAQ() {
    const modal = document.getElementById('faqModal');
    if (modal) modal.classList.remove('show');
}

// Show report upload modal
function showReportUpload() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.classList.add('show');
        document.getElementById('reportText').value = '';
        document.getElementById('reportFile').value = '';
        document.getElementById('reportAnalysisResult').innerHTML = '';
    }
}

// Close report upload modal
function closeReportUpload() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.classList.remove('show');
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('reportText').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

// Analyze report
async function analyzeReport() {
    const reportText = document.getElementById('reportText').value.trim();
    const reportFile = document.getElementById('reportFile').files[0];
    const resultDiv = document.getElementById('reportAnalysisResult');
    
    if (!reportText && !reportFile) {
        alert('Please provide report text or upload a file');
        return;
    }
    
    resultDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analyzing report...</p>';
    
    try {
        let analysis;
        
        if (reportFile) {
            // Upload file
            const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
            const activities = window.activities || [];
            const meals = window.meals || [];
            
            analysis = await uploadReportFile(reportFile, userProfile, activities, meals);
        } else {
            // Use text input
            const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
            const activities = window.activities || [];
            const meals = window.meals || [];
            
            // Call analyzeReport API directly
            const response = await fetch('/api/chatbot/analyze-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportText, userProfile, activities, meals })
            });
            const apiData = await response.json();
            if (!apiData.success) throw new Error(apiData.error);
            analysis = apiData.data;
        }
        
        // Store analysis for diet plan generation
        currentReportAnalysis = analysis;
        
        // Display results
        displayReportAnalysis(analysis);
        
        // Add message to chat
        addMessageToChat('bot', `I've analyzed your report. Here's a summary:\n\n${analysis.summary}\n\nWould you like me to generate a detailed diet plan based on this analysis?`);
        conversationHistory.push({ 
            role: 'assistant', 
            content: `Report analyzed. Summary: ${analysis.summary}` 
        });
        
        // Save chat after report analysis
        saveChatToStorage();
        
    } catch (error) {
        console.error('Report analysis error:', error);
        resultDiv.innerHTML = `<p style="color: var(--accent-color);">Error analyzing report: ${error.message}</p>`;
    }
}

// This function is no longer needed - using direct API calls

// Display report analysis
function displayReportAnalysis(analysis) {
    const resultDiv = document.getElementById('reportAnalysisResult');
    
    resultDiv.innerHTML = `
        <div style="background: rgba(80, 200, 120, 0.1); padding: 20px; border-radius: 10px; border: 2px solid var(--secondary-color);">
            <h3 style="color: var(--secondary-color); margin-top: 0;">
                <i class="fas fa-check-circle"></i> Analysis Complete
            </h3>
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--primary-color);">Summary:</h4>
                <p style="color: var(--text-secondary); line-height: 1.8;">${analysis.summary}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--primary-color);">Beneficial Foods:</h4>
                <ul style="color: var(--text-secondary);">
                    ${analysis.dietPlan.beneficialFoods.map(f => `<li><strong>${f.food}</strong>: ${f.reason}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--primary-color);">Foods to Avoid/Limit:</h4>
                <ul style="color: var(--text-secondary);">
                    ${analysis.dietPlan.foodsToAvoid.map(f => `<li><strong>${f.food}</strong>: ${f.reason}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--primary-color);">Recommended Supplements:</h4>
                <ul style="color: var(--text-secondary);">
                    ${analysis.dietPlan.supplements.map(s => `<li><strong>${s.supplement}</strong> (${s.dosage}): ${s.reason}</li>`).join('')}
                </ul>
            </div>
            
            <div>
                <h4 style="color: var(--primary-color);">Further Tests Recommended:</h4>
                <ul style="color: var(--text-secondary);">
                    ${analysis.dietPlan.furtherTests.map(t => `<li><strong>${t.test}</strong>: ${t.reason}</li>`).join('')}
                </ul>
            </div>
            
            <button onclick="generateDietPlanFromAnalysis()" class="btn-primary" style="width: 100%; margin-top: 20px;">
                <i class="fas fa-utensils"></i> Generate Detailed Diet Plan
            </button>
        </div>
    `;
}

// Generate diet plan
async function generateDietPlan() {
    const modal = document.getElementById('dietPlanModal');
    const contentDiv = document.getElementById('dietPlanContent');
    
    if (!modal || !contentDiv) return;
    
    modal.classList.add('show');
    contentDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating personalized diet plan...</p>';
    
    try {
        const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
        const activities = window.activities || [];
        const meals = window.meals || [];
        
        // Call diet plan API directly
        const response = await fetch('/api/chatbot/diet-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reportAnalysis: currentReportAnalysis, 
                userProfile, 
                activities, 
                meals 
            })
        });
        const apiData = await response.json();
        if (!apiData.success) throw new Error(apiData.error);
        const dietPlan = apiData.data;
        
        displayDietPlan(dietPlan);
        
    } catch (error) {
        console.error('Diet plan error:', error);
        contentDiv.innerHTML = `<p style="color: var(--accent-color);">Error generating diet plan: ${error.message}</p>`;
    }
}

// Generate diet plan from analysis (called from report analysis)
async function generateDietPlanFromAnalysis() {
    closeReportUpload();
    await generateDietPlan();
}

// Generate diet plan API wrapper (calls API function from api.js)
async function generateDietPlanAPI(reportAnalysis, userProfile, activities, meals) {
    // Use the API function - it's available globally from api.js
    if (typeof window.generateDietPlanAPI !== 'undefined') {
        return await window.generateDietPlanAPI(reportAnalysis, userProfile, activities, meals);
    }
    // Fallback: direct API call
    const response = await fetch('/api/chatbot/diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportAnalysis, userProfile, activities, meals })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

// Display diet plan
function displayDietPlan(plan) {
    const contentDiv = document.getElementById('dietPlanContent');
    
    contentDiv.innerHTML = `
        <div style="background: rgba(74, 144, 226, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-top: 0;">
                <i class="fas fa-info-circle"></i> ${plan.summary}
            </h3>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: rgba(80, 200, 120, 0.1); padding: 15px; border-radius: 10px; border: 2px solid var(--secondary-color);">
                <h4 style="color: var(--secondary-color); margin-top: 0;">
                    <i class="fas fa-check-circle"></i> Beneficial Foods
                </h4>
                ${Array.isArray(plan.beneficialFoods) ? plan.beneficialFoods.map(categoryGroup => `
                    <div style="margin-bottom: 15px;">
                        <strong style="color: var(--text-primary);">${categoryGroup.category || 'General'}:</strong>
                        <ul style="margin: 5px 0; padding-left: 20px; color: var(--text-secondary);">
                            ${(categoryGroup.items || []).map(item => `
                                <li>
                                    <strong>${item.name || item.food || item}</strong>${item.serving ? ` (${item.serving})` : ''}${item.benefits ? `<br><small>${item.benefits}</small>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('') : Object.entries(plan.beneficialFoods || {}).map(([category, items]) => `
                    <div style="margin-bottom: 15px;">
                        <strong style="color: var(--text-primary);">${category}:</strong>
                        <ul style="margin: 5px 0; padding-left: 20px; color: var(--text-secondary);">
                            ${(Array.isArray(items) ? items : []).map(item => `
                                <li>
                                    <strong>${item.name || item.food || item}</strong>${item.serving ? ` (${item.serving})` : ''}${item.benefits ? `<br><small>${item.benefits}</small>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 10px; border: 2px solid var(--accent-color);">
                <h4 style="color: var(--accent-color); margin-top: 0;">
                    <i class="fas fa-times-circle"></i> Foods to Avoid/Limit
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    ${plan.foodsToAvoid.map(f => `
                        <li style="margin-bottom: 10px;">
                            <strong>${f.food}</strong><br>
                            <small>Reason: ${f.reason}</small><br>
                            ${f.alternative ? `<small style="color: var(--secondary-color);">Alternative: ${f.alternative}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; border: 2px solid var(--warning-color);">
                <h4 style="color: var(--warning-color); margin-top: 0;">
                    <i class="fas fa-pills"></i> Supplements
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    ${plan.supplements.map(s => `
                        <li style="margin-bottom: 10px;">
                            <strong>${s.name}</strong> - ${s.dosage}<br>
                            <small>Timing: ${s.timing}</small><br>
                            <small>Reason: ${s.reason}</small>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="background: rgba(74, 144, 226, 0.1); padding: 15px; border-radius: 10px; border: 2px solid var(--primary-color);">
                <h4 style="color: var(--primary-color); margin-top: 0;">
                    <i class="fas fa-flask"></i> Further Tests
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    ${plan.furtherTests.map(t => `
                        <li style="margin-bottom: 10px;">
                            <strong>${t.test}</strong><br>
                            <small>Frequency: ${t.frequency}</small><br>
                            <small>Reason: ${t.reason}</small>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
        
        <div style="background: rgba(80, 200, 120, 0.1); padding: 15px; border-radius: 10px; border: 2px solid var(--secondary-color); margin-bottom: 20px;">
            <h4 style="color: var(--secondary-color); margin-top: 0;">
                <i class="fas fa-calendar-alt"></i> Meal Suggestions
            </h4>
            ${Object.entries(plan.mealSuggestions).map(([mealType, suggestions]) => `
                <div style="margin-bottom: 15px;">
                    <strong style="color: var(--text-primary); text-transform: capitalize;">${mealType}:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px; color: var(--text-secondary);">
                        ${suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.04); padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); margin-bottom: 22px;">
            <h4 style="color: var(--text-primary); margin-top: 0; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-pen-to-square" style="color: var(--primary-color);"></i>
                Special Request
            </h4>
            <div id="dietSpecialRequestDisplay" style="color: var(--text-secondary); line-height: 1.6;">
                ${
                    plan.specialRequest && plan.specialRequest.trim()
                        ? `<p style="margin: 0; white-space: pre-line;">${plan.specialRequest.replace(/\\n/g, '<br>')}</p>`
                        : `<p style="margin: 0; font-style: italic; opacity: 0.8;">No special request added yet. Click <strong>Edit Plan</strong> to add one.</p>`
                }
            </div>
            <div id="dietSpecialRequestEditor" style="display: none; margin-top: 10px;">
                <label for="dietSpecialRequestTextarea" style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 0.9em;">
                    Describe any special requests (allergies, cultural preferences, timing, etc.)
                </label>
                <textarea
                    id="dietSpecialRequestTextarea"
                    rows="4"
                    style="
                        width: 100%;
                        padding: 12px 14px;
                        border-radius: 10px;
                        border: 2px solid rgba(255, 255, 255, 0.18);
                        background: rgba(255, 255, 255, 0.06);
                        color: var(--text-primary);
                        font-size: 0.95em;
                        resize: vertical;
                        font-family: inherit;
                        outline: none;
                    "
                ></textarea>
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                    <button type="button" onclick="saveDietPlanSpecialRequest()" class="btn-primary" style="width: auto; padding: 10px 18px; min-width: 120px;">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <button type="button" onclick="cancelDietPlanSpecialRequest()" class="btn-secondary" style="width: auto; padding: 10px 18px; min-width: 120px;">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
            <button onclick="saveDietPlanToChat()" class="btn-primary" style="flex: 1; min-width: 150px;">
                <i class="fas fa-save"></i> Save to Chat
            </button>
            <button onclick="editDietPlan()" class="btn-primary" style="flex: 1; min-width: 150px; background: var(--secondary-color);">
                <i class="fas fa-edit"></i> Edit Plan
            </button>
            <button onclick="generate7DayPlan()" class="btn-primary" style="flex: 1; min-width: 150px; background: var(--accent-color);">
                <i class="fas fa-calendar-week"></i> Generate 7-Day Plan
            </button>
        </div>
    `;
    
    // Store current diet plan globally for editing
    window.currentDietPlan = plan;
}

// Close diet plan modal
function closeDietPlan() {
    const modal = document.getElementById('dietPlanModal');
    if (modal) modal.classList.remove('show');
}

// Save diet plan to chat
function saveDietPlanToChat() {
    if (!window.currentDietPlan) {
        alert('No diet plan to save. Please generate a diet plan first.');
        return;
    }
    
    const plan = window.currentDietPlan;
    
    // Format the diet plan as a message
    let planText = `📋 **Diet Plan Generated**\n\n`;
    planText += `**Summary:** ${plan.summary}\n\n`;
    
    planText += `**Beneficial Foods:**\n`;
    if (Array.isArray(plan.beneficialFoods)) {
        plan.beneficialFoods.forEach(categoryGroup => {
            planText += `\n*${categoryGroup.category || 'General'}:*\n`;
            (categoryGroup.items || []).forEach(item => {
                planText += `- ${item.name || item.food || item}${item.serving ? ` (${item.serving})` : ''}${item.benefits ? ` - ${item.benefits}` : ''}\n`;
            });
        });
    } else {
        Object.entries(plan.beneficialFoods || {}).forEach(([category, items]) => {
            planText += `\n*${category}:*\n`;
            (Array.isArray(items) ? items : []).forEach(item => {
                planText += `- ${item.name || item.food || item}${item.serving ? ` (${item.serving})` : ''}${item.benefits ? ` - ${item.benefits}` : ''}\n`;
            });
        });
    }
    
    planText += `\n**Foods to Avoid/Limit:**\n`;
    plan.foodsToAvoid.forEach(f => {
        planText += `- ${f.food} - ${f.reason}${f.alternative ? ` (Alternative: ${f.alternative})` : ''}\n`;
    });
    
    planText += `\n**Supplements:**\n`;
    plan.supplements.forEach(s => {
        planText += `- ${s.name} (${s.dosage}) - ${s.reason}${s.timing ? ` - Take: ${s.timing}` : ''}\n`;
    });
    
    planText += `\n**Further Tests:**\n`;
    plan.furtherTests.forEach(t => {
        planText += `- ${t.test} (${t.frequency}) - ${t.reason}\n`;
    });
    
    if (plan.specialRequest && plan.specialRequest.trim()) {
        planText += `\n**Special Request:**\n${plan.specialRequest.trim()}\n`;
    }
    
    planText += `\n**Meal Suggestions:**\n`;
    Object.entries(plan.mealSuggestions).forEach(([mealType, suggestions]) => {
        planText += `\n*${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:*\n`;
        suggestions.forEach(s => planText += `- ${s}\n`);
    });
    
    // Add to chat
    addMessageToChat('bot', planText);
    conversationHistory.push({ role: 'assistant', content: planText });
    
    // Save chat after diet plan is added
    saveChatToStorage();
    
    // Close modal and show success
    closeDietPlan();
    alert('Diet plan saved to chat!');
}

// Edit diet plan - only Special Request section (inline editor)
function editDietPlan() {
    if (!window.currentDietPlan) {
        alert('No diet plan to edit. Please generate a diet plan first.');
        return;
    }
    
    const displayEl = document.getElementById('dietSpecialRequestDisplay');
    const editorEl = document.getElementById('dietSpecialRequestEditor');
    const textarea = document.getElementById('dietSpecialRequestTextarea');
    
    if (!displayEl || !editorEl || !textarea) {
        console.warn('Special Request editor elements not found in diet plan modal.');
        return;
    }
    
    // Populate textarea with current special request (if any)
    textarea.value = window.currentDietPlan.specialRequest || '';
    
    // Toggle to edit mode
    displayEl.style.display = 'none';
    editorEl.style.display = 'block';
    
    textarea.focus();
}

// Save Special Request edits
function saveDietPlanSpecialRequest() {
    if (!window.currentDietPlan) return;
    
    const textarea = document.getElementById('dietSpecialRequestTextarea');
    if (!textarea) return;
    
    const value = textarea.value.trim();
    window.currentDietPlan.specialRequest = value;
    
    // Re-render plan so display section updates and editor hides
    displayDietPlan(window.currentDietPlan);
    
    alert('Special request updated! Click "Save to Chat" to save the edited version.');
}

// Cancel Special Request edit (revert UI without changing stored plan)
function cancelDietPlanSpecialRequest() {
    const displayEl = document.getElementById('dietSpecialRequestDisplay');
    const editorEl = document.getElementById('dietSpecialRequestEditor');
    const textarea = document.getElementById('dietSpecialRequestTextarea');
    
    if (!displayEl || !editorEl || !textarea) return;
    
    // Reset textarea to current plan value
    if (window.currentDietPlan) {
        textarea.value = window.currentDietPlan.specialRequest || '';
    }
    
    editorEl.style.display = 'none';
    displayEl.style.display = 'block';
}

// Generate 7-day diet plan
async function generate7DayPlan() {
    // Check if we have diet plan or user profile (required for 7-day plan)
    const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
    
    if (!window.currentDietPlan && (!userProfile || !userProfile.isSetupComplete)) {
        alert('Please generate a diet plan first or complete your profile setup to generate a 7-day plan. The 7-day plan is based on your diet plan and profile overview.');
        return;
    }
    
    // If no current diet plan, try to get it from report analysis if available
    if (!window.currentDietPlan && currentReportAnalysis && currentReportAnalysis.dietPlan) {
        window.currentDietPlan = currentReportAnalysis.dietPlan;
    }
    
    const modal = document.getElementById('dietPlanModal');
    const contentDiv = document.getElementById('dietPlanContent');
    
    if (!modal || !contentDiv) return;
    
    contentDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating your 7-day personalized diet plan...</p>';
    
    try {
        const activities = window.activities || [];
        const meals = window.meals || [];
        
        // Call API to generate 7-day plan
        // Prioritize diet plan and overview (user profile/context) over report
        const response = await fetch('/api/chatbot/7day-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                reportAnalysis: currentReportAnalysis, // Optional - only if available
                baseDietPlan: window.currentDietPlan, // Primary source
                userProfile, // Overview/context - primary source
                activities, 
                meals 
            })
        });
        
        const apiData = await response.json();
        if (!apiData.success) throw new Error(apiData.error);
        const sevenDayPlan = apiData.data;
        
        // Display 7-day plan
        display7DayPlan(sevenDayPlan);
        
    } catch (error) {
        console.error('7-day plan error:', error);
        contentDiv.innerHTML = `<p style="color: var(--accent-color);">Error generating 7-day plan: ${error.message}</p>`;
    }
}

// Display 7-day diet plan
function display7DayPlan(plan) {
    const contentDiv = document.getElementById('dietPlanContent');
    
    let html = `
        <div style="background: rgba(74, 144, 226, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: var(--primary-color); margin-top: 0;">
                <i class="fas fa-calendar-week"></i> 7-Day Personalized Diet Plan
            </h3>
            <p style="color: var(--text-secondary);">${plan.summary || 'Your comprehensive 7-day diet plan based on your health profile and report analysis.'}</p>
        </div>
    `;
    
    // Display each day
    if (plan.days && Array.isArray(plan.days)) {
        plan.days.forEach((day, index) => {
            html += `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 4px solid var(--accent-color);">
                    <h4 style="color: var(--accent-color); margin-top: 0;">
                        <i class="fas fa-calendar-day"></i> Day ${index + 1}${day.date ? ` - ${day.date}` : ''}
                    </h4>
                    ${day.meals ? `
                        <div style="margin-top: 10px;">
                            ${Object.entries(day.meals).map(([mealType, meal]) => `
                                <div style="margin-bottom: 8px;">
                                    <strong style="color: var(--text-primary); text-transform: capitalize;">${mealType}:</strong>
                                    <span style="color: var(--text-secondary);"> ${typeof meal === 'string' ? meal : meal.name || meal.suggestion || ''}</span>
                                    ${typeof meal === 'object' && meal.calories ? ` <span style="font-size: 0.9em; color: var(--accent-color);">(${meal.calories} cal)</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${day.notes ? `<p style="margin-top: 10px; font-size: 0.9em; color: var(--text-secondary); font-style: italic;">${day.notes}</p>` : ''}
                </div>
            `;
        });
    }
    
    html += `
        <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
            <button onclick="save7DayPlanToChat()" class="btn-primary" style="flex: 1; min-width: 150px;">
                <i class="fas fa-save"></i> Save to Chat
            </button>
        </div>
    `;
    
    contentDiv.innerHTML = html;
    
    // Store 7-day plan globally
    window.current7DayPlan = plan;
}

// Get or set cached recipe
function getCachedRecipe(mealName) {
    try {
        const cached = localStorage.getItem('cachedRecipes');
        if (!cached) return null;
        const recipes = JSON.parse(cached);
        // Normalize meal name for lookup (lowercase, trim)
        const normalizedName = mealName.toLowerCase().trim();
        return recipes[normalizedName] || null;
    } catch (e) {
        console.error('Error reading cached recipes:', e);
        return null;
    }
}

function setCachedRecipe(mealName, recipe) {
    try {
        const cached = localStorage.getItem('cachedRecipes');
        const recipes = cached ? JSON.parse(cached) : {};
        // Normalize meal name for storage (lowercase, trim)
        const normalizedName = mealName.toLowerCase().trim();
        recipes[normalizedName] = recipe;
        localStorage.setItem('cachedRecipes', JSON.stringify(recipes));
    } catch (e) {
        console.error('Error saving cached recipe:', e);
    }
}

// Generate recipes for all meals in the 7-day plan
async function generateRecipesForPlan(plan) {
    if (!plan || !plan.days) return;
    
    const userProfile = window.userProfile || JSON.parse(localStorage.getItem('userProfile') || 'null');
    const mealNames = new Set();
    
    // Collect all unique meal names from the plan
    plan.days.forEach(day => {
        if (day.meals) {
            Object.values(day.meals).forEach(meal => {
                const mealName = typeof meal === 'string' ? meal : (meal.name || meal.suggestion || '');
                if (mealName && mealName.trim()) {
                    mealNames.add(mealName.trim());
                }
            });
        }
    });
    
    if (mealNames.size === 0) return;
    
    // Show notification
    showNotification(`Generating recipes for ${mealNames.size} meals... This may take a moment.`, 'info', 5000);
    
    let generatedCount = 0;
    let cachedCount = 0;
    
    // Generate recipes for each meal (check cache first)
    for (const mealName of mealNames) {
        // Check if recipe already cached
        const cached = getCachedRecipe(mealName);
        if (cached) {
            cachedCount++;
            continue;
        }
        
        try {
            // Generate recipe using AI
            const recipe = await generateRecipeWithGemini(null, mealName, userProfile);
            if (recipe && recipe.title) {
                setCachedRecipe(mealName, recipe);
                generatedCount++;
            }
            
            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error generating recipe for ${mealName}:`, error);
            // Continue with other meals even if one fails
        }
    }
    
    // Show completion notification
    if (generatedCount > 0 || cachedCount > 0) {
        const message = cachedCount > 0 
            ? `Recipes ready! ${cachedCount} from cache, ${generatedCount} newly generated.`
            : `${generatedCount} recipes generated and cached!`;
        showNotification(message, 'success', 4000);
    }
}

// Save 7-day plan to chat
async function save7DayPlanToChat() {
    if (!window.current7DayPlan) {
        showNotification('No 7-day plan to save.', 'error');
        return;
    }
    
    const plan = window.current7DayPlan;
    
    let planText = `📅 **7-Day Diet Plan Generated**\n\n`;
    planText += `${plan.summary || 'Your comprehensive 7-day personalized diet plan.'}\n\n`;
    
    if (plan.days && Array.isArray(plan.days)) {
        plan.days.forEach((day, index) => {
            planText += `**Day ${index + 1}${day.date ? ` - ${day.date}` : ''}**\n`;
            if (day.meals) {
                Object.entries(day.meals).forEach(([mealType, meal]) => {
                    planText += `- *${mealType}:* ${typeof meal === 'string' ? meal : meal.name || meal.suggestion || ''}${typeof meal === 'object' && meal.calories ? ` (${meal.calories} cal)` : ''}\n`;
                });
            }
            if (day.notes) {
                planText += `  _${day.notes}_\n`;
            }
            planText += `\n`;
        });
    }
    
    // Add to chat
    addMessageToChat('bot', planText);
    conversationHistory.push({ role: 'assistant', content: planText });

    // Also save a structured copy for the "7-Day Plan" tab
    save7DayPlanToStorage(plan);
    
    // Save chat after 7-day plan is added
    saveChatToStorage();
    
    // Generate and cache recipes for all meals in the plan (async, don't wait)
    generateRecipesForPlan(plan).catch(err => {
        console.error('Error generating recipes for plan:', err);
    });
    
    // Close modal and show success
    closeDietPlan();
    showNotification('7-day plan saved! Generating recipes in the background...', 'success');

    // Navigate user to the tab view for easier actioning
    showPage('weeklyPlan');
}

// Clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        conversationHistory = [];
        currentReportAnalysis = null;
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="chat-message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-microscope"></i>
                    </div>
                    <div class="message-content">
                        <p>Chat cleared. Upload your report to get started!</p>
                    </div>
                </div>
            `;
        }
        
        // Clear from localStorage
        const storageKey = getChatStorageKey();
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
    }
}

// ==================== CUSTOMER SUPPORT CHATBOT FUNCTIONS ====================

// Toggle support chat window
function toggleSupportChat() {
    const widget = document.getElementById('supportChatbotWidget');
    const window = document.getElementById('supportChatWindow');
    
    if (!widget || !window) return;
    
    supportChatOpen = !supportChatOpen;
    
    if (supportChatOpen) {
        window.classList.add('open');
        const input = document.getElementById('supportChatInput');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
        // Hide badge
        const badge = document.getElementById('supportBadge');
        if (badge) badge.style.display = 'none';
    } else {
        window.classList.remove('open');
    }
}

// Add message to support chat
function addSupportMessageToChat(role, content) {
    const chatMessages = document.getElementById('supportChatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `support-chat-message ${role}-message`;
    
    const avatar = role === 'user' 
        ? '<i class="fas fa-user"></i>' 
        : '<i class="fas fa-headset"></i>';
    
    messageDiv.innerHTML = `
        <div class="support-message-avatar">
            ${avatar}
        </div>
        <div class="support-message-content">
            ${formatMessageContent(content)}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollSupportChatToBottom();
}

// Add typing indicator to support chat
function addSupportTypingIndicator() {
    const chatMessages = document.getElementById('supportChatMessages');
    if (!chatMessages) return null;
    
    const typingId = 'support-typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'support-chat-message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="support-message-avatar">
            <i class="fas fa-headset"></i>
        </div>
        <div class="support-message-content">
            <span class="typing-dots">
                <span>.</span><span>.</span><span>.</span>
            </span>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollSupportChatToBottom();
    return typingId;
}

// Remove typing indicator from support chat
function removeSupportTypingIndicator(typingId) {
    if (typingId) {
        const indicator = document.getElementById(typingId);
        if (indicator) indicator.remove();
    }
}

// Scroll support chat to bottom
function scrollSupportChatToBottom() {
    const chatMessages = document.getElementById('supportChatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Show support FAQ
async function showSupportFAQ() {
    const modal = document.getElementById('supportFAQModal');
    const faqContent = document.getElementById('supportFAQContent');
    
    if (!modal || !faqContent) return;
    
    try {
        faqContent.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading FAQs...</p>';
        modal.classList.add('show');
        
        const faqs = await getFAQ();
        
        faqContent.innerHTML = faqs.map((faq, index) => `
            <div class="faq-item" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <h4 style="color: var(--primary-color); margin-bottom: 10px;">
                    <i class="fas fa-question-circle"></i> ${faq.question}
                </h4>
                <p style="color: var(--text-secondary); line-height: 1.6;">${faq.answer}</p>
            </div>
        `).join('');
    } catch (error) {
        faqContent.innerHTML = `<p style="color: var(--accent-color);">Error loading FAQs: ${error.message}</p>`;
    }
}

// Close support FAQ
function closeSupportFAQ() {
    const modal = document.getElementById('supportFAQModal');
    if (modal) modal.classList.remove('show');
}

// Initialize support chatbot
function initializeSupportChatbot() {
    const chatInput = document.getElementById('supportChatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendSupportMessage();
            }
        });
    }
    
    // Show badge on page load
    const badge = document.getElementById('supportBadge');
    if (badge) {
        badge.style.display = 'flex';
    }
    
    // Update nutrition when quantity changes in scan meal form
    const scanMealQuantity = document.getElementById('scanMealQuantity');
    if (scanMealQuantity) {
        scanMealQuantity.addEventListener('change', function() {
            if (window.scannedMealData && window.scannedMealData.nutritionPer100g) {
                const quantity = parseFloat(this.value) || 100;
                const nutrition = {
                    calories: Math.round((window.scannedMealData.nutritionPer100g.calories || 0) * (quantity / 100)),
                    protein: parseFloat(((window.scannedMealData.nutritionPer100g.protein || 0) * (quantity / 100)).toFixed(1)),
                    carbs: parseFloat(((window.scannedMealData.nutritionPer100g.carbs || 0) * (quantity / 100)).toFixed(1)),
                    fats: parseFloat(((window.scannedMealData.nutritionPer100g.fats || 0) * (quantity / 100)).toFixed(1))
                };
                
                document.getElementById('scanMealCalories').value = nutrition.calories;
                document.getElementById('scanMealProtein').value = nutrition.protein;
                document.getElementById('scanMealCarbs').value = nutrition.carbs;
                document.getElementById('scanMealFats').value = nutrition.fats;
            }
        });
    }
}

// ==================== SCAN MEAL FUNCTIONS ====================

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload a valid image file', 'error');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('Image size should be less than 10MB', 'error');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');
        preview.src = e.target.result;
        container.style.display = 'block';
        
        // Hide detected form if exists
        document.getElementById('detectedMealForm').style.display = 'none';
        window.scannedMealData = null;
    };
    reader.readAsDataURL(file);
}

// Clear image preview
function clearImagePreview() {
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('mealImageInput').value = '';
    document.getElementById('detectedMealForm').style.display = 'none';
    document.getElementById('analyzingContainer').style.display = 'none';
    window.scannedMealData = null;
}

// Compress and resize image before upload
function compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve({
                    base64: compressedBase64.split(',')[1],
                    mimeType: 'image/jpeg'
                });
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Analyze meal image (frontend handler)
async function analyzeMealImageFromUpload() {
    const imageInput = document.getElementById('mealImageInput');
    const file = imageInput.files[0];
    
    if (!file) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    
    // Show loading state
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('analyzingContainer').style.display = 'block';
    document.getElementById('detectedMealForm').style.display = 'none';
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeBtnText = document.getElementById('analyzeBtnText');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        if (analyzeBtnText) analyzeBtnText.innerHTML = '<span class="spinner"></span> Compressing & Analyzing...';
    }
    
    try {
        // Compress image first to reduce size
        const compressed = await compressImage(file, 1024, 1024, 0.8);
        const base64String = compressed.base64;
        const mimeType = compressed.mimeType;
        
        if (analyzeBtnText) analyzeBtnText.innerHTML = '<span class="spinner"></span> Analyzing...';
        
        // Call API directly using fetch
        const response = await fetch('/api/gemini/analyze-meal-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                imageBase64: base64String, 
                imageMimeType: mimeType 
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to analyze meal image');
        }
        
        const data = await response.json();
        const result = data.data;
        
        // Store scanned data
        window.scannedMealData = result;
        
        // Pre-fill form
        document.getElementById('scanMealName').value = result.mealName || '';
        document.getElementById('scanMealQuantity').value = result.estimatedQuantity || 100;
        document.getElementById('scanMealCalories').value = result.nutrition.calories || 0;
        document.getElementById('scanMealProtein').value = result.nutrition.protein || 0;
        document.getElementById('scanMealCarbs').value = result.nutrition.carbs || 0;
        document.getElementById('scanMealFats').value = result.nutrition.fats || 0;
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('scanMealDate').value = today;
        
        // Show form
        document.getElementById('analyzingContainer').style.display = 'none';
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('detectedMealForm').style.display = 'block';
        
        // Scroll to form
        document.getElementById('detectedMealForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showNotification(`Meal detected! ${result.confidence === 'high' ? 'High' : result.confidence === 'medium' ? 'Medium' : 'Low'} confidence.`, 'success');
    } catch (error) {
        console.error('Error analyzing meal:', error);
        document.getElementById('analyzingContainer').style.display = 'none';
        document.getElementById('imagePreviewContainer').style.display = 'block';
        showNotification(error.message || 'Failed to analyze meal image', 'error');
    } finally {
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            if (analyzeBtnText) analyzeBtnText.innerHTML = '<i class="fas fa-brain"></i> Analyze Meal';
        }
    }
}

// Log scanned meal
async function logScannedMeal() {
    const mealType = document.getElementById('scanMealType').value;
    const mealDate = document.getElementById('scanMealDate').value;
    const mealName = document.getElementById('scanMealName').value;
    const quantity = parseFloat(document.getElementById('scanMealQuantity').value) || 100;
    const calories = parseInt(document.getElementById('scanMealCalories').value) || 0;
    const protein = parseFloat(document.getElementById('scanMealProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('scanMealCarbs').value) || 0;
    const fats = parseFloat(document.getElementById('scanMealFats').value) || 0;
    
    // Validation
    if (!mealType) {
        showNotification('Please select a meal type', 'error');
        return;
    }
    
    if (!mealName) {
        showNotification('Meal name is required', 'error');
        return;
    }
    
    // Recalculate nutrition based on quantity if it changed
    let finalNutrition = {
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats
    };
    
    if (window.scannedMealData && window.scannedMealData.nutritionPer100g) {
        const originalQuantity = window.scannedMealData.estimatedQuantity || 100;
        if (quantity !== originalQuantity) {
            // Recalculate based on new quantity
            finalNutrition = {
                calories: Math.round((window.scannedMealData.nutritionPer100g.calories || 0) * (quantity / 100)),
                protein: parseFloat(((window.scannedMealData.nutritionPer100g.protein || 0) * (quantity / 100)).toFixed(1)),
                carbs: parseFloat(((window.scannedMealData.nutritionPer100g.carbs || 0) * (quantity / 100)).toFixed(1)),
                fats: parseFloat(((window.scannedMealData.nutritionPer100g.fats || 0) * (quantity / 100)).toFixed(1))
            };
            
            // Update form fields
            document.getElementById('scanMealCalories').value = finalNutrition.calories;
            document.getElementById('scanMealProtein').value = finalNutrition.protein;
            document.getElementById('scanMealCarbs').value = finalNutrition.carbs;
            document.getElementById('scanMealFats').value = finalNutrition.fats;
        }
    }
    
    const meal = {
        type: mealType,
        name: mealName,
        date: mealDate,
        quantity: quantity,
        quantityType: 'grams',
        calories: finalNutrition.calories,
        protein: finalNutrition.protein,
        carbs: finalNutrition.carbs,
        fats: finalNutrition.fats
    };
    
    const logBtn = document.getElementById('logScannedMealBtn');
    const logBtnText = document.getElementById('logScannedMealBtnText');
    
    if (logBtn) {
        logBtn.disabled = true;
        if (logBtnText) logBtnText.innerHTML = '<span class="spinner"></span> Logging...';
    }
    
    try {
        // Check if user is in demo mode
        const currentUserId = localStorage.getItem('currentUserId');
        const isDemoUser = currentUserId && currentUserId.startsWith('demo-');
        
        if (isDemoUser) {
            // Save to localStorage for demo users
            const savedMeal = {
                ...meal,
                id: 'meal-' + Date.now(),
                _id: 'meal-' + Date.now()
            };
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
            loadRecentMealsChips();
            updateOverview();
            updateProgressPage();
            
            showNotification('Meal logged successfully! (Demo mode)', 'success');
        } else {
            // Save to API for real users
            const savedMeal = await createMeal(meal);
            savedMeal.id = savedMeal._id;
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
            loadRecentMealsChips();
            updateOverview();
            updateProgressPage();
            
            showNotification('Meal logged successfully!', 'success');
        }
        
        // Clear scanned meal form
        clearScannedMeal();
        
        // Navigate to meal log page
        showPage('meals');
    } catch (error) {
        console.error('Error logging scanned meal:', error);
        showNotification(error.message || 'Failed to log meal', 'error');
    } finally {
        if (logBtn) {
            logBtn.disabled = false;
            if (logBtnText) logBtnText.innerHTML = '<i class="fas fa-check"></i> Log Meal';
        }
    }
}

// Clear scanned meal form
function clearScannedMeal() {
    document.getElementById('detectedMealForm').style.display = 'none';
    document.getElementById('scanMealType').value = '';
    document.getElementById('scanMealName').value = '';
    document.getElementById('scanMealQuantity').value = '100';
    document.getElementById('scanMealCalories').value = '';
    document.getElementById('scanMealProtein').value = '';
    document.getElementById('scanMealCarbs').value = '';
    document.getElementById('scanMealFats').value = '';
    clearImagePreview();
    window.scannedMealData = null;
}

// ==================== CONNECTED DEVICES FUNCTIONS ====================

// Load device connection status
async function loadDeviceStatus() {
    try {
        const status = await getDeviceStatus();
        
        // Update Google Fit status
        const googleFitStatusText = document.getElementById('googleFitStatusText');
        const googleFitConnectBtn = document.getElementById('googleFitConnectBtn');
        const googleFitInfo = document.getElementById('googleFitInfo');
        const googleFitLastSync = document.getElementById('googleFitLastSync');
        
        if (status && status.googleFit && status.googleFit.connected) {
            if (googleFitStatusText) {
                googleFitStatusText.textContent = 'Connected';
                googleFitStatusText.style.color = 'var(--secondary-color)';
            }
            if (googleFitConnectBtn) {
                googleFitConnectBtn.style.display = 'none';
            }
            if (googleFitInfo) {
                googleFitInfo.style.setProperty('display', 'block', 'important');
                googleFitInfo.style.setProperty('margin-top', '15px', 'important');
                googleFitInfo.style.setProperty('padding-top', '15px', 'important');
                googleFitInfo.style.setProperty('border-top', '1px solid rgba(255,255,255,0.1)', 'important');
                googleFitInfo.style.setProperty('height', 'auto', 'important');
                googleFitInfo.style.setProperty('overflow', 'visible', 'important');
            }
            if (googleFitLastSync) {
                if (status.googleFit.lastSync) {
                    try {
                        const lastSyncDate = new Date(status.googleFit.lastSync);
                        googleFitLastSync.textContent = lastSyncDate.toLocaleString();
                    } catch (e) {
                        googleFitLastSync.textContent = 'Never';
                    }
                } else {
                    googleFitLastSync.textContent = 'Never';
                }
            }
        } else {
            if (googleFitStatusText) {
                googleFitStatusText.textContent = 'Not Connected';
                googleFitStatusText.style.color = 'var(--text-secondary)';
            }
            if (googleFitConnectBtn) {
                googleFitConnectBtn.style.display = 'block';
            }
            if (googleFitInfo) {
                googleFitInfo.style.setProperty('display', 'none', 'important');
                googleFitInfo.style.setProperty('margin', '0', 'important');
                googleFitInfo.style.setProperty('padding', '0', 'important');
                googleFitInfo.style.setProperty('border', 'none', 'important');
                googleFitInfo.style.setProperty('height', '0', 'important');
                googleFitInfo.style.setProperty('overflow', 'hidden', 'important');
            }
        }
    } catch (error) {
        console.error('Error loading device status:', error);
        // On error, show "Not Connected" state instead of error message
        const googleFitStatusText = document.getElementById('googleFitStatusText');
        const googleFitConnectBtn = document.getElementById('googleFitConnectBtn');
        const googleFitInfo = document.getElementById('googleFitInfo');
        
        if (googleFitStatusText) {
            googleFitStatusText.textContent = 'Not Connected';
            googleFitStatusText.style.color = 'var(--text-secondary)';
        }
        if (googleFitConnectBtn) {
            googleFitConnectBtn.style.display = 'block';
        }
        if (googleFitInfo) {
            googleFitInfo.style.display = 'none';
        }
    }
}

// Connect Google Fit
async function connectGoogleFit() {
    try {
        const authUrl = await initiateGoogleFitAuth();
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const popup = window.open(
            authUrl,
            'Google Fit Authorization',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
        
        // Check if popup was blocked
        if (!popup) {
            showNotification('Please allow popups to connect Google Fit', 'error');
            return;
        }
        
        // Listen for message from popup
        const messageHandler = (event) => {
            if (event.data && event.data.type === 'google-fit-connected') {
                if (event.data.success) {
                    showNotification('Google Fit connected successfully!', 'success');
                    loadDeviceStatus();
                    loadSyncHistory();
                } else {
                    showNotification(event.data.error || 'Failed to connect Google Fit. Please try again.', 'error');
                }
                window.removeEventListener('message', messageHandler);
            }
        };
        window.addEventListener('message', messageHandler);
        
        // Fallback: Monitor popup for completion (if message doesn't work)
        const checkPopup = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkPopup);
                // Reload status after popup closes
                setTimeout(() => {
                    loadDeviceStatus();
                    loadSyncHistory();
                    // Check URL for connection status
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('connected') === 'google-fit') {
                        showNotification('Google Fit connected successfully!', 'success');
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else if (urlParams.get('error') === 'google-fit-auth-failed') {
                        showNotification('Failed to connect Google Fit. Please try again.', 'error');
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }, 1000);
            }
        }, 500);
    } catch (error) {
        console.error('Error connecting Google Fit:', error);
        showNotification(error.message || 'Failed to initiate Google Fit connection', 'error');
    }
}

// Sync Google Fit data (frontend handler)
async function syncGoogleFitData() {
    const syncBtn = event?.target || document.querySelector('button[onclick*="syncGoogleFit"]');
    if (syncBtn) {
        syncBtn.disabled = true;
        const originalText = syncBtn.innerHTML;
        syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
        
        try {
            // Call the API function (from api.js)
            const result = await syncGoogleFit();
            
            // Check if result exists and has the expected structure
            if (!result) {
                throw new Error('No response from server');
            }
            
            // Handle different response structures
            const message = result.message || (result.data && result.data.message);
            const count = result.count || (result.data && result.data.count) || 0;
            
            if (message) {
                showNotification(message, 'success');
            } else if (count > 0) {
                showNotification(`Synced ${count} activities from Google Fit`, 'success');
            } else {
                showNotification('Sync completed. No new activities found.', 'info');
            }
            
            // Reload activities and update overview
            await loadUserData();
            updateOverview();
            updateProgressPage();
            
            // Update last sync time
            loadDeviceStatus();
            loadSyncHistory();
        } catch (error) {
            console.error('Error syncing Google Fit:', error);
            const errorMsg = (error && error.message) || (error && error.error) || 'Failed to sync Google Fit data';
            showNotification(errorMsg, 'error');
        } finally {
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = originalText;
            }
        }
    }
}

// Disconnect Google Fit
async function disconnectGoogleFitDevice() {
    if (!confirm('Are you sure you want to disconnect Google Fit? This will stop automatic syncing.')) {
        return;
    }
    
    try {
        await disconnectGoogleFit();
        showNotification('Google Fit disconnected successfully', 'success');
        loadDeviceStatus();
        loadSyncHistory();
    } catch (error) {
        console.error('Error disconnecting Google Fit:', error);
        showNotification(error.message || 'Failed to disconnect Google Fit', 'error');
    }
}

// Connect Apple Health (placeholder for future implementation)
function connectAppleHealth() {
    showNotification('Apple Health integration coming soon!', 'info');
}

// Load sync history
async function loadSyncHistory() {
    const syncHistoryDiv = document.getElementById('syncHistory');
    if (!syncHistoryDiv) return;
    
    try {
        // Get recent synced activities
        const syncedActivities = activities.filter(a => a.source === 'google-fit' || a.source === 'apple-health');
        
        if (syncedActivities.length === 0) {
            syncHistoryDiv.innerHTML = `
                <p style="color: var(--text-secondary); text-align: center; margin: 20px 0;">
                    No sync history yet. Connect a device and sync to see your activity history here.
                </p>
            `;
            return;
        }
        
        // Group by date
        const groupedByDate = {};
        syncedActivities.forEach(activity => {
            const date = new Date(activity.date).toLocaleDateString();
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(activity);
        });
        
        let historyHTML = '';
        Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            const dayActivities = groupedByDate[date];
            historyHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 10px;">
                        <i class="fas fa-calendar-day"></i> ${date}
                    </div>
                    ${dayActivities.map(activity => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div>
                                <div style="color: var(--text-primary); font-weight: 500;">${activity.name || activity.type}</div>
                                <div style="color: var(--text-secondary); font-size: 0.85em;">
                                    ${activity.duration} min • ${activity.calories} cal
                                    ${activity.source === 'google-fit' ? '<i class="fab fa-google" style="margin-left: 8px;"></i>' : ''}
                                    ${activity.source === 'apple-health' ? '<i class="fab fa-apple" style="margin-left: 8px;"></i>' : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });
        
        syncHistoryDiv.innerHTML = historyHTML;
    } catch (error) {
        console.error('Error loading sync history:', error);
        syncHistoryDiv.innerHTML = `
            <p style="color: var(--text-secondary); text-align: center; margin: 20px 0;">
                Error loading sync history.
            </p>
        `;
    }
}
