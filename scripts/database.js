// IndexedDB Setup and Management for VitaTrackr

let db;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('VitaTrackrDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Recipes Store
            if (!database.objectStoreNames.contains('recipes')) {
                const recipesStore = database.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
                recipesStore.createIndex('cuisine', 'cuisine', { unique: false });
                recipesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                recipesStore.createIndex('healthCondition', 'healthCondition', { unique: false });
            }

            // User Profiles Store
            if (!database.objectStoreNames.contains('profiles')) {
                const profilesStore = database.createObjectStore('profiles', { keyPath: 'id', autoIncrement: true });
                profilesStore.createIndex('username', 'username', { unique: true });
            }

            // Activities Store
            if (!database.objectStoreNames.contains('activities')) {
                const activitiesStore = database.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
                activitiesStore.createIndex('date', 'date', { unique: false });
                activitiesStore.createIndex('userId', 'userId', { unique: false });
            }

            // User Preferences Store
            if (!database.objectStoreNames.contains('preferences')) {
                const preferencesStore = database.createObjectStore('preferences', { keyPath: 'userId' });
            }
        };
    });
}

// Initialize database on page load
if (typeof indexedDB !== 'undefined') {
    initDB().then(() => {
        console.log('Database initialized successfully');
        populateInitialRecipes();
    }).catch(err => {
        console.error('Database initialization failed:', err);
    });
}

// Comprehensive Recipe Database
const recipeDatabase = [
    // Indian Cuisine
    {
        title: 'Masala Dal (Spiced Lentils)',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'high-protein', 'gluten-free', 'budget-friendly'],
        healthCondition: ['low-fat', 'high-protein', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['red lentils', 'onion', 'garlic', 'ginger', 'tomatoes', 'turmeric', 'cumin', 'coriander'],
        instructions: [
            'Wash and soak red lentils for 30 minutes',
            'Heat oil in a pan, add cumin seeds until they crackle',
            'Add chopped onions and sauté until golden',
            'Add ginger-garlic paste and cook for 1 minute',
            'Add chopped tomatoes and cook until soft',
            'Add turmeric, red chili, and other spices',
            'Add lentils with 3 cups water and cook until soft (20-25 min)',
            'Garnish with fresh coriander leaves and serve hot'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '12g',
            'Carbs': '28g',
            'Fiber': '15g',
            'Fat': '3g'
        },
        prepTime: '15 min',
        cookTime: '25 min'
    },
    {
        title: 'Paneer Tikka (Grilled Cottage Cheese)',
        cuisine: 'Indian',
        tags: ['vegetarian', 'high-protein', 'gluten-free', 'low-carb'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['paneer', 'bell peppers', 'yogurt', 'garlic', 'ginger', 'garam masala', 'turmeric'],
        instructions: [
            'Cut paneer and bell peppers into cubes',
            'Mix yogurt with ginger-garlic paste and spices',
            'Marinate paneer and peppers for 2 hours',
            'Skewer the marinated pieces',
            'Grill or bake for 15-20 minutes until charred',
            'Serve with mint chutney'
        ],
        nutrition: {
            'Calories': '220',
            'Protein': '18g',
            'Carbs': '8g',
            'Fiber': '2g',
            'Fat': '12g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    {
        title: 'Chicken Curry',
        cuisine: 'Indian',
        tags: ['non-vegetarian', 'high-protein', 'gluten-free'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken', 'onion', 'tomatoes', 'ginger', 'garlic', 'yogurt', 'garam masala', 'turmeric'],
        instructions: [
            'Marinate chicken with yogurt and spices for 1 hour',
            'Heat oil and sauté onions until golden',
            'Add ginger-garlic paste and cook',
            'Add tomatoes and cook until oil separates',
            'Add marinated chicken and cook on high heat',
            'Add water and simmer for 20-25 minutes',
            'Garnish with fresh coriander and serve'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '35g',
            'Carbs': '12g',
            'Fiber': '2g',
            'Fat': '10g'
        },
        prepTime: '15 min',
        cookTime: '35 min'
    },
    {
        title: 'Vegetable Biryani',
        cuisine: 'Indian',
        tags: ['vegetarian', 'high-fiber', 'gluten-free', 'balanced'],
        healthCondition: ['balanced', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['basmati rice', 'mixed vegetables', 'onion', 'yogurt', 'saffron', 'spices', 'mint', 'coriander'],
        instructions: [
            'Soak basmati rice for 30 minutes',
            'Cook rice 70% done, strain',
            'Heat ghee/oil and fry onions until golden',
            'Add spices and mixed vegetables',
            'Layer rice and vegetables in a pot',
            'Add saffron water and cover tightly',
            'Cook on low heat for 25 minutes (dum cooking)',
            'Serve hot with raita'
        ],
        nutrition: {
            'Calories': '320',
            'Protein': '10g',
            'Carbs': '60g',
            'Fiber': '8g',
            'Fat': '8g'
        },
        prepTime: '20 min',
        cookTime: '45 min'
    },
    // Mediterranean Cuisine
    {
        title: 'Greek Salad with Feta',
        cuisine: 'Mediterranean',
        tags: ['vegetarian', 'low-carb', 'gluten-free', 'fresh', 'quick'],
        healthCondition: ['low-carb', 'low-sugar', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['cucumbers', 'tomatoes', 'red onion', 'olives', 'feta cheese', 'olive oil', 'oregano'],
        instructions: [
            'Chop cucumbers, tomatoes, and red onion',
            'Mix in a large bowl with olives',
            'Crumble feta cheese on top',
            'Drizzle with olive oil',
            'Sprinkle oregano and serve fresh'
        ],
        nutrition: {
            'Calories': '200',
            'Protein': '8g',
            'Carbs': '10g',
            'Fiber': '3g',
            'Fat': '15g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    {
        title: 'Grilled Salmon with Vegetables',
        cuisine: 'Mediterranean',
        tags: ['pescatarian', 'high-protein', 'low-carb', 'omega-3'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['pescatarian'],
        ingredients: ['salmon fillet', 'zucchini', 'bell peppers', 'olive oil', 'lemon', 'herbs'],
        instructions: [
            'Season salmon with herbs and lemon',
            'Preheat grill to medium-high',
            'Grill salmon for 6-7 minutes per side',
            'Grill vegetables until tender',
            'Serve with lemon wedges'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '28g',
            'Carbs': '8g',
            'Omega-3': '2.2g',
            'Fat': '16g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Mediterranean Quinoa Bowl',
        cuisine: 'Mediterranean',
        tags: ['vegetarian', 'vegan', 'high-protein', 'high-fiber', 'balanced'],
        healthCondition: ['balanced', 'high-protein', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['quinoa', 'chickpeas', 'cucumber', 'tomatoes', 'olives', 'hummus', 'olive oil'],
        instructions: [
            'Cook quinoa according to package instructions',
            'Mix with chickpeas and vegetables',
            'Add olives and drizzle olive oil',
            'Top with hummus and fresh herbs',
            'Serve at room temperature'
        ],
        nutrition: {
            'Calories': '380',
            'Protein': '16g',
            'Carbs': '55g',
            'Fiber': '12g',
            'Fat': '14g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    // Italian Cuisine
    {
        title: 'Whole Wheat Pasta Primavera',
        cuisine: 'Italian',
        tags: ['vegetarian', 'high-fiber', 'balanced'],
        healthCondition: ['balanced', 'high-fiber'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['whole wheat pasta', 'mixed vegetables', 'garlic', 'olive oil', 'parmesan'],
        instructions: [
            'Cook whole wheat pasta al dente',
            'Sauté garlic in olive oil',
            'Add mixed vegetables and cook until tender',
            'Toss with pasta and parmesan',
            'Season and serve hot'
        ],
        nutrition: {
            'Calories': '340',
            'Protein': '14g',
            'Carbs': '58g',
            'Fiber': '8g',
            'Fat': '8g'
        },
        prepTime: '10 min',
        cookTime: '20 min'
    },
    {
        title: 'Caprese Salad',
        cuisine: 'Italian',
        tags: ['vegetarian', 'low-carb', 'fresh', 'quick'],
        healthCondition: ['low-carb', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['fresh mozzarella', 'tomatoes', 'basil', 'olive oil', 'balsamic'],
        instructions: [
            'Slice mozzarella and tomatoes',
            'Arrange alternating slices',
            'Add fresh basil leaves',
            'Drizzle olive oil and balsamic',
            'Season with salt and pepper'
        ],
        nutrition: {
            'Calories': '240',
            'Protein': '15g',
            'Carbs': '8g',
            'Fiber': '2g',
            'Fat': '18g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    // Asian Cuisine
    {
        title: 'Stir-Fried Vegetables with Tofu',
        cuisine: 'Asian',
        tags: ['vegetarian', 'vegan', 'high-protein', 'quick'],
        healthCondition: ['high-protein', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['tofu', 'mixed vegetables', 'soy sauce', 'ginger', 'garlic', 'sesame oil'],
        instructions: [
            'Press and cube tofu',
            'Stir-fry tofu until golden',
            'Add vegetables and cook until crisp',
            'Add soy sauce and spices',
            'Serve with brown rice'
        ],
        nutrition: {
            'Calories': '220',
            'Protein': '18g',
            'Carbs': '15g',
            'Fiber': '5g',
            'Fat': '10g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Chicken Teriyaki Bowl',
        cuisine: 'Asian',
        tags: ['high-protein', 'balanced'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken breast', 'brown rice', 'broccoli', 'carrots', 'teriyaki sauce'],
        instructions: [
            'Marinate chicken in teriyaki sauce',
            'Grill or pan-fry chicken until done',
            'Steam broccoli and carrots',
            'Cook brown rice',
            'Assemble bowl with rice, chicken, and vegetables'
        ],
        nutrition: {
            'Calories': '450',
            'Protein': '40g',
            'Carbs': '48g',
            'Fiber': '6g',
            'Fat': '12g'
        },
        prepTime: '15 min',
        cookTime: '25 min'
    },
    // Healthy Quick Options
    {
        title: 'Avocado Toast with Eggs',
        cuisine: 'Western',
        tags: ['vegetarian', 'high-protein', 'breakfast', 'quick'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['whole grain bread', 'avocado', 'eggs', 'seasoning'],
        instructions: [
            'Toast whole grain bread',
            'Mash avocado and spread on toast',
            'Fry or poach eggs',
            'Top toast with eggs',
            'Season and serve'
        ],
        nutrition: {
            'Calories': '320',
            'Protein': '18g',
            'Carbs': '28g',
            'Fiber': '10g',
            'Fat': '18g'
        },
        prepTime: '5 min',
        cookTime: '10 min'
    },
    {
        title: 'Green Smoothie Bowl',
        cuisine: 'Western',
        tags: ['vegan', 'vegetarian', 'low-fat', 'breakfast', 'quick'],
        healthCondition: ['low-fat', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['spinach', 'banana', 'mango', 'coconut milk', 'toppings'],
        instructions: [
            'Blend spinach, fruits, and coconut milk',
            'Pour into bowl',
            'Add favorite toppings',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '280',
            'Protein': '8g',
            'Carbs': '58g',
            'Fiber': '12g',
            'Fat': '6g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    }
];

// Populate initial recipes into IndexedDB
function populateInitialRecipes() {
    if (!db) return;

    const transaction = db.transaction(['recipes'], 'readwrite');
    const store = transaction.objectStore('recipes');

    // Clear existing recipes
    store.clear().onsuccess = () => {
        // Add new recipes
        recipeDatabase.forEach((recipe, index) => {
            const recipeData = {
                ...recipe,
                id: index + 1,
                createdAt: new Date().toISOString()
            };
            store.add(recipeData);
        });

        transaction.oncomplete = () => {
            console.log('Recipes populated successfully');
        };
    };
}

// Get recipes from database
function getRecipesFromDB() {
    if (!db) return Promise.resolve(recipeDatabase);

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['recipes'], 'readonly');
        const store = transaction.objectStore('recipes');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || recipeDatabase);
        request.onerror = () => {
            console.error('Error fetching recipes:', request.error);
            resolve(recipeDatabase); // Fallback to in-memory database
        };
    });
}

// Save user profile to database
function saveProfileToDB(profile) {
    if (!db) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['profiles'], 'readwrite');
        const store = transaction.objectStore('profiles');

        const profileData = {
            ...profile,
            updatedAt: new Date().toISOString()
        };

        const request = store.put(profileData);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving profile:', request.error);
            resolve(); // Don't fail if database save fails
        };
    });
}

// Save activity to database
function saveActivityToDB(activity) {
    if (!db) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['activities'], 'readwrite');
        const store = transaction.objectStore('activities');

        const request = store.add({
            ...activity,
            createdAt: new Date().toISOString()
        });

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving activity:', request.error);
            resolve();
        };
    });
}

// Get activities from database
function getActivitiesFromDB() {
    if (!db) {
        // Fallback to localStorage
        return Promise.resolve(JSON.parse(localStorage.getItem('activities')) || []);
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['activities'], 'readonly');
        const store = transaction.objectStore('activities');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
            console.error('Error fetching activities:', request.error);
            resolve(JSON.parse(localStorage.getItem('activities')) || []);
        };
    });
}

