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
            
            const lastPage = localStorage.getItem('lastPage') || 'home';
            showPage(lastPage);
        }).catch(err => {
            console.error("Failed to load user data on refresh", err);
            // If API fails, show login
            document.getElementById('loginScreen').style.display = 'block';
            document.getElementById('appScreen').style.display = 'none';
        });
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
    
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            // Try API login first
            const userData = await loginUser(username, password);
            
            // Load user profile
            userProfile = await getUserProfile();
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
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
            
            alert('Login successful!');
        } catch (error) {
            console.error('API login failed:', error);
            // Fallback: Allow basic demo mode (for testing)
            if (username && password) {
                // Store basic demo user
                const demoUserId = 'demo-' + Date.now();
                const demoUser = {
                    userId: demoUserId,
                    username: username,
                    email: username + '@demo.com',
                    isSetupComplete: false
                };
                localStorage.setItem('currentUser', JSON.stringify(demoUser));
                localStorage.setItem('currentUserId', demoUserId);
                
                // Set userProfile for demo mode
                userProfile = {
                    ...demoUser,
                    subscriptionStatus: 'pro',
                    isActive: true
                };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('appScreen').style.display = 'block';
                showPage('profile');
                
                alert('Demo mode: Please create your profile');
            } else {
                alert('Login failed: ' + error.message);
            }
        }
    });
    
    // Sign up form submission
    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        try {
            const userData = await registerUser(username, email, password);
            
            // Load user profile
            userProfile = await getUserProfile();
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appScreen').style.display = 'block';
            showPage('profile');
            
            alert('Account created successfully! Please complete your profile.');
        } catch (error) {
            console.error('Registration failed:', error);
            // Fallback: Allow basic demo user for testing
            if (username && email && password) {
                const demoUserId = 'demo-' + Date.now();
                const demoUser = {
                    userId: demoUserId,
                    username: username,
                    email: email,
                    isSetupComplete: false
                };
                localStorage.setItem('currentUser', JSON.stringify(demoUser));
                localStorage.setItem('currentUserId', demoUserId);
                
                // Set userProfile for demo mode
                userProfile = {
                    ...demoUser,
                    subscriptionStatus: 'pro',
                    isActive: true
                };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('appScreen').style.display = 'block';
                showPage('profile');
                
                alert('Demo mode: Registration recorded locally. Please create your profile.');
            } else {
                alert('Registration failed: ' + error.message);
            }
        }
    });
    
    // Toggle between login and signup forms
    document.getElementById('showSignup').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginFormContainer').style.display = 'none';
        document.getElementById('signupFormContainer').style.display = 'block';
    });
    
    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('signupFormContainer').style.display = 'none';
        document.getElementById('loginFormContainer').style.display = 'block';
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

// Show page function
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
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
        displayActivityRecommendation(); // Load activity recommendation
    } else if (pageName === 'recipe') {
        loadRecipeSuggestions(); // Load AI recipe suggestions
    }
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
    const bodyFat = document.getElementById('bodyFat').value;
    const waistHipRatio = document.getElementById('waistHipRatio').value;
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
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        waistHipRatio: waistHipRatio ? parseFloat(waistHipRatio) : null,
        
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
        alert('Profile saved successfully! Your personalized health plan is ready.');
        showPage('home');
    } catch (error) {
        alert('Error saving profile: ' + error.message);
        // Fallback to localStorage
        userProfile = profileData;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
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
    if (document.getElementById('bodyFat')) document.getElementById('bodyFat').value = userProfile.bodyFat || '';
    if (document.getElementById('waistHipRatio')) document.getElementById('waistHipRatio').value = userProfile.waistHipRatio || '';
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

// Load and display AI recipe suggestions
async function loadRecipeSuggestions() {
    const suggestionsDiv = document.getElementById('recipeSuggestions');
    const ingredientsInput = document.getElementById('ingredients') ? document.getElementById('ingredients').value.trim() : '';
    
    if (!suggestionsDiv) return;
    
    try {
        // Get ingredients if available, otherwise get general suggestions
        const ingredients = ingredientsInput 
            ? ingredientsInput.split(',').map(i => i.trim()).filter(i => i)
            : [];
        
        suggestionsDiv.innerHTML = '<p class="suggestions-loading"><i class="fas fa-spinner fa-spin"></i> Loading suggestions...</p>';
        
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
            suggestionsDiv.innerHTML = '<p class="suggestions-empty">No suggestions available</p>';
        }
    } catch (error) {
        console.error('Error loading recipe suggestions:', error);
        
        // Show more helpful error message
        let errorMessage = 'Unable to load suggestions';
        if (error.message && error.message.includes('API key')) {
            errorMessage = '<i class="fas fa-exclamation-triangle"></i> Please configure Gemini API key in .env file';
        } else if (error.message) {
            errorMessage = `Unable to load: ${error.message}`;
        }
        
        suggestionsDiv.innerHTML = `<p class="suggestions-error">${errorMessage}</p>`;
        
        // Show fallback suggestions if API fails
        setTimeout(() => {
            const fallbackSuggestions = ingredients.length > 0 
                ? ['Quick ' + ingredients[0] + ' Recipe', 'Simple ' + ingredients[0] + ' Dish', 'Easy ' + ingredients[0] + ' Meal']
                : ['Chicken Curry', 'Vegetable Stir Fry', 'Pasta Primavera'];
            
            suggestionsDiv.innerHTML = `
                <p style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px; font-style: italic;">
                    <i class="fas fa-info-circle"></i> Showing sample suggestions (API unavailable)
                </p>
                ${fallbackSuggestions.map((name, index) => {
                    const escapedName = name.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
                    return `<div class="suggestion-item" data-recipe-name="${escapedName}">
                        <i class="fas fa-utensils"></i> ${name}
                    </div>`;
                }).join('')}
            `;
            
            // Add click event listeners to fallback suggestions
            suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    const recipeName = this.getAttribute('data-recipe-name');
                    selectSuggestedRecipe(recipeName);
                });
            });
        }, 2000);
    }
}

// Select a suggested recipe name
function selectSuggestedRecipe(recipeName) {
    const recipeSearchInput = document.getElementById('recipeSearch');
    if (recipeSearchInput) {
        // Decode HTML entities
        const decodedName = recipeName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        recipeSearchInput.value = decodedName;
        // Optionally auto-generate the recipe
        // generateRecipe();
    }
}

// Recipe Generator with Gemini AI
async function generateRecipe() {
    const recipeSearchInput = document.getElementById('recipeSearch') ? document.getElementById('recipeSearch').value.trim() : '';
    const ingredientsInput = document.getElementById('ingredients').value.trim();
    const resultDiv = document.getElementById('recipeResult');
    
    if (!recipeSearchInput && !ingredientsInput) {
        alert('Please enter a recipe name or ingredients!');
        return;
    }
    
    // Show loading state
    resultDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-color);"><i class="fas fa-spinner fa-spin"></i> 🤖 AI is crafting the perfect recipe for you...</p>';
    resultDiv.classList.add('show');
    
    try {
        let recipes = [];
        
        // If recipe name is provided, search database first, then use Gemini if not found
        if (recipeSearchInput) {
            const dbRecipes = await searchRecipeByName(recipeSearchInput);
            if (dbRecipes.length > 0) {
                recipes = dbRecipes;
            } else {
                // Use Gemini to generate recipe by name
                const geminiRecipe = await generateRecipeWithGemini(null, recipeSearchInput, userProfile);
                recipes = [geminiRecipe];
            }
        } else {
            // Generate recipe(s) from ingredients using Gemini AI
            const ingredients = ingredientsInput.split(',').map(i => i.trim()).filter(i => i);
            const geminiRecipes = await generateMultipleRecipesWithGemini(ingredients, 3);
            recipes = geminiRecipes;
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
                const ingredients = ingredientsInput.split(',').map(i => i.trim());
                await searchRecipesByIngredients(ingredients);
            } catch (fallbackError) {
                const fallbackRecipes = generateMultipleRecipes(ingredientsInput.split(',').map(i => i.trim()));
                displayRecipes(fallbackRecipes);
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

// Dish Suggestions with automatic recommendations
function getSuggestions() {
    const resultDiv = document.getElementById('suggestionsResult');
    
    if (!userProfile || !userProfile.isSetupComplete) {
        resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">Please complete your profile first to get personalized suggestions!</p>';
        return;
    }
    
    // Show loading state
    resultDiv.innerHTML = '<p style="text-align: center; color: var(--secondary-color);"><i class="fas fa-spinner fa-spin"></i> Finding the perfect recipes for you...</p>';
    
    // Determine automatic recommendation based on profile
    const autoRecommendation = determineAutoRecommendation();
    
    // Display automatic recommendation
    displayAutoRecommendation(autoRecommendation);
    
    // Use smart recommendation system
    if (typeof generateSmartDishSuggestions === 'function') {
        generateSmartDishSuggestions(userProfile).then(dishSuggestions => {
            if (dishSuggestions.length === 0) {
                resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">No recommendations found. Please update your profile preferences.</p>';
                return;
            }
            
            // Store suggestions in global scope for click handling
            window.currentSuggestions = dishSuggestions;
            
            let recommendationsHTML = '';
            dishSuggestions.forEach((dish, index) => {
                const cuisineBadge = dish.cuisine ? `<span class="cuisine-badge">${dish.cuisine}</span>` : '';
                const tagsHTML = dish.tags ? dish.tags.slice(0, 3).map(tag => 
                    `<span class="tag-badge">${tag}</span>`
                ).join('') : '';
                
                recommendationsHTML += `
                    <div class="suggestion-card" onclick="showRecipeDetails(${index})" style="cursor: pointer;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <h4><i class="fas fa-heart" style="color: var(--secondary-color);"></i> ${dish.name}</h4>
                            ${cuisineBadge}
                        </div>
                        <p style="margin-bottom: 10px;">${dish.description}</p>
                        ${tagsHTML ? `<div style="margin-bottom: 10px;">${tagsHTML}</div>` : ''}
                        <div class="nutrition-info" style="margin-top: 15px;">
                            ${Object.entries(dish.nutrition).map(([key, value]) => `
                                <div class="nutrition-item">
                                    <strong>${value}</strong>
                                    <span>${key}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${dish.prepTime ? `<div style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
                            <i class="fas fa-clock"></i> ${dish.prepTime} prep | ${dish.cookTime} cooking
                        </div>` : ''}
                        <div style="margin-top: 15px; text-align: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <button style="background: var(--primary-color); border: none; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                                <i class="fas fa-book-open"></i> View Full Recipe
                            </button>
                        </div>
                    </div>
                `;
            });
            
            resultDiv.innerHTML = recommendationsHTML;
        }).catch(error => {
            console.error('Error generating suggestions:', error);
            resultDiv.innerHTML = '<p style="text-align: center; color: var(--accent-color);">Error loading suggestions. Please try again.</p>';
        });
    } else {
        // Fallback to old system
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
        
        resultDiv.innerHTML = recommendationsHTML;
    }
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

function displayAutoRecommendation(recommendation) {
    const infoDiv = document.getElementById('recommendationInfo');
    
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
        alert('Please fill in duration and calories!');
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
            
            alert('Activity logged successfully! (Demo mode)');
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
            
            alert('Activity logged successfully!');
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
        
        alert('Activity logged successfully! (Saved locally)');
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
        alert('Error deleting activity: ' + error.message);
        // Still remove from local list if API fails
        activities = activities.filter(activity => activity.id !== activityId && activity._id !== activityId);
        displayActivities();
    }
}

// Global variable to store current recipe nutrition
let currentRecipeNutrition = null;

// Lookup recipe nutrition from database or nutrition API
async function lookupRecipeNutrition() {
    const mealName = document.getElementById('mealName').value.trim();
    if (!mealName) {
        clearAutoFill();
        return;
    }
    
    try {
        // First, try to find in local database
        const recipes = await getRecipesFromDB();
        const searchLower = mealName.toLowerCase();
        const matchedRecipe = recipes.find(recipe => {
            const titleLower = recipe.title.toLowerCase();
            return titleLower === searchLower || 
                   titleLower.includes(searchLower) || 
                   searchLower.includes(titleLower);
        });
        
        if (matchedRecipe && matchedRecipe.nutrition) {
            // Found in database
            currentRecipeNutrition = matchedRecipe.nutrition;
            updateNutritionFromQuantity();
            document.getElementById('nutritionAutoFill').style.display = 'block';
            return;
        }
        
        // Not found in database, try nutrition API
        const quantity = parseFloat(document.getElementById('mealQuantity').value) || 100;
        const quantityType = document.getElementById('quantityType').value;
        
        try {
            const nutritionData = await getFoodNutrition(mealName, quantity, quantityType);
            
            if (nutritionData) {
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
                document.getElementById('nutritionAutoFill').style.display = 'block';
                
                // Show a message that data came from API
                const autoFillDiv = document.getElementById('nutritionAutoFill');
                if (autoFillDiv) {
                    const infoMsg = autoFillDiv.querySelector('.api-source-info');
                    if (!infoMsg) {
                        const msg = document.createElement('p');
                        msg.className = 'api-source-info';
                        msg.style.cssText = 'font-size: 0.85em; color: var(--secondary-color); margin-top: 5px; font-style: italic;';
                        msg.innerHTML = '<i class="fas fa-cloud"></i> Nutrition data from API';
                        autoFillDiv.appendChild(msg);
                    }
                }
            } else {
                clearAutoFill();
            }
        } catch (apiError) {
            console.error('Nutrition API error:', apiError);
            // If API fails, just clear (database lookup already failed)
            clearAutoFill();
        }
    } catch (error) {
        console.error('Error looking up recipe:', error);
        clearAutoFill();
    }
}

// Handle quantity type change
function handleQuantityTypeChange() {
    const quantityType = document.getElementById('quantityType').value;
    const quantityLabel = document.getElementById('quantityLabel');
    const mealQuantity = document.getElementById('mealQuantity');
    const servingWeightInfo = document.getElementById('servingWeightInfo');
    
    if (quantityType === 'grams') {
        quantityLabel.textContent = 'Weight (grams)';
        mealQuantity.placeholder = '100';
        mealQuantity.step = '10';
        mealQuantity.min = '10';
        mealQuantity.value = 100;
        servingWeightInfo.style.display = 'block';
    } else {
        quantityLabel.textContent = 'Quantity (servings)';
        mealQuantity.placeholder = '1';
        mealQuantity.step = '0.5';
        mealQuantity.min = '0.25';
        mealQuantity.value = 1;
        servingWeightInfo.style.display = 'none';
    }
    
    // Recalculate if we have nutrition data
    if (currentRecipeNutrition) {
        updateNutritionFromQuantity();
    }
}

// Update nutrition based on quantity
function updateNutritionFromQuantity() {
    if (!currentRecipeNutrition) return;
    
    const quantity = parseFloat(document.getElementById('mealQuantity').value) || 1;
    const quantityType = document.getElementById('quantityType').value;
    
    // Base serving size is 100g, so recipes in database are per 100g
    const baseServingSizeGrams = 100;
    
    // Calculate nutrition values based on quantity
    Object.entries(currentRecipeNutrition).forEach(([key, value]) => {
        const numericValue = parseFloat(value.replace(/[^\d.]/g, '')); // Extract number
        
        let calculatedValue;
        if (quantityType === 'grams') {
            // If quantity in grams, calculate: (quantity / 100g) * base nutrition
            calculatedValue = (numericValue / baseServingSizeGrams) * quantity;
        } else {
            // If quantity in servings, multiply directly
            calculatedValue = numericValue * quantity;
        }
        
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
    document.getElementById('mealQuantity').value = 1;
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
        alert('Please fill in meal name and calories!');
        return;
    }
    
    const quantityType = document.getElementById('quantityType').value;
    
    const meal = {
        type: mealType,
        name: mealName,
        date: mealDate,
        quantity: quantity,
        quantityType: quantityType,
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
            updateOverview();
            updateProgressPage();
            
            // Reset form
            document.getElementById('mealName').value = '';
            document.getElementById('mealCalories').value = '';
            document.getElementById('mealProtein').value = '';
            document.getElementById('mealCarbs').value = '';
            document.getElementById('mealFats').value = '';
            document.getElementById('mealQuantity').value = 1;
            clearAutoFill();
            
            alert('Meal logged successfully! (Demo mode)');
        } else {
            // Save to API for real users
            const savedMeal = await createMeal(meal);
            savedMeal.id = savedMeal._id;
            meals.push(savedMeal);
            localStorage.setItem('meals', JSON.stringify(meals));
            
            displayMeals();
            updateOverview();
            updateProgressPage();
            
            // Reset form
            document.getElementById('mealName').value = '';
            document.getElementById('mealCalories').value = '';
            document.getElementById('mealProtein').value = '';
            document.getElementById('mealCarbs').value = '';
            document.getElementById('mealFats').value = '';
            document.getElementById('mealQuantity').value = 1;
            clearAutoFill();
            
            alert('Meal logged successfully!');
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
        
        // Reset form
        document.getElementById('mealName').value = '';
        document.getElementById('mealCalories').value = '';
        document.getElementById('mealProtein').value = '';
        document.getElementById('mealCarbs').value = '';
        document.getElementById('mealFats').value = '';
        document.getElementById('mealQuantity').value = 1;
        clearAutoFill();
        
        alert('Meal logged successfully! (Saved locally)');
    }
}

function displayMeals() {
    const mealsDiv = document.getElementById('mealsList');
    if (!mealsDiv) return;
    
    if (meals.length === 0) {
        mealsDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No meals logged yet. Start tracking your nutrition!</p>';
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
        
        const quantityDisplay = meal.quantity ? 
        (meal.quantityType === 'grams' ? ` (${meal.quantity}g)` : ` x${meal.quantity}`) : '';
        return `
            <div class="meal-item">
                <div class="meal-info">
                    <i class="fas ${mealIcons[meal.type] || 'fa-utensils'}"></i>
                    <div class="meal-details">
                        <h4>${meal.name}${quantityDisplay} (${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)})</h4>
                        <p><i class="fas fa-calendar"></i> ${formattedDate} | <i class="fas fa-fire"></i> ${meal.calories} cal | P: ${meal.protein}g C: ${meal.carbs}g F: ${meal.fats}g</p>
                    </div>
                </div>
                <button onclick="deleteMeal(${meal.id})" style="background: var(--accent-color); border: none; color: white; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function deleteMeal(id) {
    meals = meals.filter(meal => meal.id !== id);
    localStorage.setItem('meals', JSON.stringify(meals));
    displayMeals();
    updateOverview();
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
            const quantityDisplay = meal.quantity ? 
                (meal.quantityType === 'grams' ? ` (${meal.quantity}g)` : ` x${meal.quantity}`) : '';
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
    
    // Display nutrition insights
    const nutritionDiv = document.getElementById('nutritionInsights');
    
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
    
    nutritionDiv.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <h4><i class="fas fa-lightbulb" style="color: var(--secondary-color);"></i> ${insight.title}</h4>
            <p>${insight.description}</p>
        </div>
    `).join('');
    
    // Display daily plan
    displayDailyPlan();
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
            alert('Recipe details not found');
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
    `;

    modal.classList.add('show');

    // Close modal on X click
    document.querySelector('.modal-close').onclick = function() {
        modal.classList.remove('show');
    };

    // Close modal on outside click
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
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
    `;

    modal.classList.add('show');

    document.querySelector('.modal-close').onclick = function() {
        modal.classList.remove('show');
    };

    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };
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
    
    // Define all achievements
    const achievementDefinitions = [
        {
            id: 'first_activity',
            name: 'First Steps',
            description: 'Log your first activity',
            icon: 'fa-running',
            unlocked: totalActivities >= 1
        },
        {
            id: 'activity_rookie',
            name: 'Activity Rookie',
            description: 'Log 5 activities',
            icon: 'fa-star',
            unlocked: totalActivities >= 5
        },
        {
            id: 'activity_veteran',
            name: 'Activity Veteran',
            description: 'Log 25 activities',
            icon: 'fa-medal',
            unlocked: totalActivities >= 25
        },
        {
            id: 'calorie_burner',
            name: 'Calorie Burner',
            description: 'Burn 1000 calories',
            icon: 'fa-fire',
            unlocked: totalCaloriesBurned >= 1000
        },
        {
            id: 'calorie_master',
            name: 'Calorie Master',
            description: 'Burn 10000 calories',
            icon: 'fa-fire-alt',
            unlocked: totalCaloriesBurned >= 10000
        },
        {
            id: 'meal_tracker',
            name: 'Meal Tracker',
            description: 'Log your first meal',
            icon: 'fa-apple-alt',
            unlocked: totalMeals >= 1
        },
        {
            id: 'meal_professional',
            name: 'Meal Professional',
            description: 'Log 50 meals',
            icon: 'fa-utensils',
            unlocked: totalMeals >= 50
        },
        {
            id: 'streak_starter',
            name: 'Streak Starter',
            description: '3 day activity streak',
            icon: 'fa-fire',
            unlocked: activityStreak >= 3
        },
        {
            id: 'streak_champion',
            name: 'Streak Champion',
            description: '7 day activity streak',
            icon: 'fa-fire-alt',
            unlocked: activityStreak >= 7
        },
        {
            id: 'wellness_warrior',
            name: 'Wellness Warrior',
            description: '500 total activity minutes',
            icon: 'fa-dumbbell',
            unlocked: totalMinutes >= 500
        },
        {
            id: 'nutrition_expert',
            name: 'Nutrition Expert',
            description: 'Log meals for 7 days',
            icon: 'fa-chart-pie',
            unlocked: mealStreak >= 7
        },
        {
            id: 'balanced_life',
            name: 'Balanced Life',
            description: 'Log both meals and activities for 5 days',
            icon: 'fa-balance-scale',
            unlocked: activityStreak >= 5 && mealStreak >= 5
        }
    ];
    
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
    updateCharts();
}

// Display Achievements
function updateAchievements() {
    const achievements = calculateAchievements();
    const achievementsDiv = document.getElementById('achievementsDisplay');
    
    if (!achievementsDiv) return;
    
    achievementsDiv.innerHTML = achievements.map(achievement => {
        const statusClass = achievement.unlocked ? 'unlocked' : 'locked';
        return `
            <div class="achievement-badge ${statusClass}" onclick="showAchievementDetails('${achievement.id}')">
                <div class="achievement-icon"><i class="fas ${achievement.icon}"></i></div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
    }).join('');
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
    
    if (achievement) {
        const status = achievement.unlocked ? '✅ UNLOCKED' : '🔒 LOCKED';
        alert(`${achievement.name}\n${achievement.description}\n\nStatus: ${status}`);
    }
}

// Update Charts
function updateCharts() {
    // Use setTimeout to ensure DOM is ready and Chart.js is loaded
    setTimeout(() => {
        updateActivityChart();
    }, 100);
    
    setTimeout(() => {
        updateNutritionChart();
    }, 150);
    
    setTimeout(() => {
        updateWeightChart();
    }, 200);
}

// Activity Chart
function updateActivityChart() {
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
    
    // Get last 7 days of activities
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    const activityCaloriesByDay = last7Days.map(date => {
        const dayActivities = activities.filter(act => {
            // Handle both date string and Date object formats
            const actDate = typeof act.date === 'string' ? act.date.split('T')[0] : new Date(act.date).toISOString().split('T')[0];
            return actDate === date;
        });
        return dayActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
    });
    
    console.log('Activity chart data:', {
        activities: activities.length,
        last7Days: last7Days,
        activityCaloriesByDay: activityCaloriesByDay,
        sampleDates: activities.slice(0, 3).map(a => a.date)
    });
    
    // Show message if no activity data
    const totalCalories = activityCaloriesByDay.reduce((a, b) => a + b, 0);
    if (totalCalories === 0 && activities.length === 0) {
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
    
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#2c3e50' : '#ffffff';
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const tickColor = isLightMode ? '#5a6c7d' : '#b0b0b0';
    
    try {
        window.activityChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Calories Burned',
                    data: activityCaloriesByDay,
                    borderColor: '#50c878',
                    backgroundColor: 'rgba(80, 200, 120, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#50c878',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
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
                                size: 11
                            }
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1
                        }
                    }
                }
            }
        });
        
        console.log('✅ Activity chart rendered successfully with', activityCaloriesByDay.length, 'data points');
    } catch (error) {
        console.error('❌ Error rendering activity chart:', error);
        canvas.parentElement.innerHTML += '<p style="text-align: center; color: var(--accent-color); padding-top: 20px;">Error loading chart. Please refresh the page.</p>';
    }
}

// Nutrition Chart
function updateNutritionChart() {
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
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    const nutritionByDay = last7Days.map(date => {
        const dayMeals = meals.filter(meal => {
            // Handle both date string and Date object formats
            const mealDate = typeof meal.date === 'string' ? meal.date.split('T')[0] : new Date(meal.date).toISOString().split('T')[0];
            return mealDate === date;
        });
        return {
            calories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
            protein: dayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
            carbs: dayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
        };
    });
    
    console.log('Nutrition chart data:', {
        meals: meals.length,
        last7Days: last7Days,
        nutritionByDay: nutritionByDay,
        sampleDates: meals.slice(0, 3).map(m => m.date)
    });
    
    // Show message if no nutrition data
    const totalCalories = nutritionByDay.reduce((sum, n) => sum + n.calories, 0);
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
    
    const isLightMode = document.body.classList.contains('light-mode');
    const textColor = isLightMode ? '#2c3e50' : '#ffffff';
    const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const tickColor = isLightMode ? '#5a6c7d' : '#b0b0b0';
    
    try {
        window.nutritionChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [
                    {
                        label: 'Calories',
                        data: nutritionByDay.map(n => n.calories),
                        backgroundColor: 'rgba(255, 107, 107, 0.6)',
                        borderColor: '#ff6b6b',
                        borderWidth: 2
                    },
                    {
                        label: 'Protein (g)',
                        data: nutritionByDay.map(n => n.protein),
                        backgroundColor: 'rgba(74, 144, 226, 0.6)',
                        borderColor: '#4a90e2',
                        borderWidth: 2
                    },
                    {
                        label: 'Carbs (g)',
                        data: nutritionByDay.map(n => n.carbs),
                        backgroundColor: 'rgba(255, 215, 0, 0.6)',
                        borderColor: '#ffd700',
                        borderWidth: 2
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
                                size: 11
                            }
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1
                        }
                    }
                }
            }
        });
        
        console.log('✅ Nutrition chart rendered successfully with', nutritionByDay.length, 'data points');
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
