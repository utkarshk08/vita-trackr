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
    },
    // More Indian Cuisine
    {
        title: 'Butter Chicken',
        cuisine: 'Indian',
        tags: ['non-vegetarian', 'high-protein', 'gluten-free', 'rich'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken', 'butter', 'tomatoes', 'cream', 'ginger', 'garlic', 'spices', 'yogurt'],
        instructions: [
            'Marinate chicken in yogurt and spices for 2 hours',
            'Grill chicken until cooked',
            'Make tomato-based gravy with butter and spices',
            'Add cream and simmer',
            'Add grilled chicken and cook 10 minutes',
            'Garnish with fresh cream and coriander'
        ],
        nutrition: {
            'Calories': '320',
            'Protein': '32g',
            'Carbs': '8g',
            'Fat': '18g',
            'Fiber': '2g'
        },
        prepTime: '20 min',
        cookTime: '40 min'
    },
    {
        title: 'Chole Bhature (Chickpeas with Fried Bread)',
        cuisine: 'Indian',
        tags: ['vegetarian', 'high-protein', 'high-fiber', 'comfort-food'],
        healthCondition: ['high-protein', 'high-fiber', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['chickpeas', 'onion', 'tomatoes', 'ginger', 'garlic', 'spices', 'flour', 'yogurt'],
        instructions: [
            'Soak chickpeas overnight and pressure cook',
            'Heat oil and add spices until fragrant',
            'Add onions and sauté until golden',
            'Add tomatoes and cook until soft',
            'Add chickpeas and cook 15 minutes',
            'Make dough for bhature with flour and yogurt',
            'Roll and deep fry until golden',
            'Serve hot with pickled onions'
        ],
        nutrition: {
            'Calories': '450',
            'Protein': '18g',
            'Carbs': '65g',
            'Fiber': '15g',
            'Fat': '14g'
        },
        prepTime: '30 min',
        cookTime: '50 min'
    },
    {
        title: 'Rajma (Kidney Bean Curry)',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'high-protein', 'high-fiber', 'gluten-free'],
        healthCondition: ['high-protein', 'high-fiber', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['kidney beans', 'onion', 'tomatoes', 'ginger', 'garlic', 'spices', 'garam masala'],
        instructions: [
            'Soak kidney beans overnight',
            'Pressure cook until soft',
            'Heat oil and add cumin seeds',
            'Add onions and sauté until golden',
            'Add tomatoes and cook until soft',
            'Add spices and kidney beans',
            'Simmer 20 minutes until thick',
            'Garnish with coriander leaves'
        ],
        nutrition: {
            'Calories': '195',
            'Protein': '10g',
            'Carbs': '32g',
            'Fiber': '13g',
            'Fat': '4g'
        },
        prepTime: '20 min',
        cookTime: '40 min'
    },
    {
        title: 'Aloo Gobi (Potato Cauliflower)',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'gluten-free', 'budget-friendly'],
        healthCondition: ['low-fat', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['potatoes', 'cauliflower', 'onion', 'tomatoes', 'ginger', 'garlic', 'turmeric', 'spices'],
        instructions: [
            'Cut potatoes and cauliflower into florets',
            'Heat oil and add cumin seeds',
            'Add onions and sauté until golden',
            'Add ginger-garlic paste',
            'Add turmeric and other spices',
            'Add cauliflower and potatoes',
            'Cover and cook until tender (15-20 min)',
            'Garnish with fresh coriander'
        ],
        nutrition: {
            'Calories': '150',
            'Protein': '5g',
            'Carbs': '28g',
            'Fiber': '6g',
            'Fat': '3g'
        },
        prepTime: '15 min',
        cookTime: '25 min'
    },
    // South Indian Cuisine
    {
        title: 'Dosa (Fermented Rice Pancake)',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'gluten-free', 'fermented', 'breakfast'],
        healthCondition: ['low-fat', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['rice', 'urad dal', 'fenugreek seeds', 'salt', 'oil'],
        instructions: [
            'Soak rice and urad dal separately overnight',
            'Grind with fenugreek seeds to smooth batter',
            'Ferment overnight in warm place',
            'Heat tawa and pour batter',
            'Spread thin and drizzle oil',
            'Cook until golden and crispy',
            'Serve with sambar and chutney'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '4g',
            'Carbs': '35g',
            'Fiber': '3g',
            'Fat': '4g'
        },
        prepTime: '30 min',
        cookTime: '10 min'
    },
    {
        title: 'Idli (Steamed Rice Cakes)',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'gluten-free', 'low-fat', 'breakfast'],
        healthCondition: ['low-fat', 'balanced', 'easy-digest'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['rice', 'urad dal', 'fenugreek seeds', 'salt'],
        instructions: [
            'Soak rice and urad dal overnight',
            'Grind to smooth batter separately',
            'Mix and ferment overnight',
            'Pour into idli molds',
            'Steam for 10-12 minutes',
            'Serve hot with sambar and chutney'
        ],
        nutrition: {
            'Calories': '85',
            'Protein': '2g',
            'Carbs': '18g',
            'Fiber': '1g',
            'Fat': '0.5g'
        },
        prepTime: '30 min',
        cookTime: '15 min'
    },
    {
        title: 'Sambar (Lentil Vegetable Stew)',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'high-protein', 'high-fiber', 'gluten-free'],
        healthCondition: ['high-protein', 'high-fiber', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['toor dal', 'vegetables', 'tamarind', 'sambar powder', 'turmeric', 'tempering spices'],
        instructions: [
            'Cook toor dal until soft',
            'Add vegetables and cook',
            'Add tamarind extract',
            'Add sambar powder and turmeric',
            'Prepare tempering with mustard seeds',
            'Add to sambar and bring to boil',
            'Serve hot with idli or dosa'
        ],
        nutrition: {
            'Calories': '95',
            'Protein': '5g',
            'Carbs': '15g',
            'Fiber': '5g',
            'Fat': '1g'
        },
        prepTime: '15 min',
        cookTime: '30 min'
    },
    {
        title: 'Upma (Savory Semolina)',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'high-fiber', 'quick', 'breakfast'],
        healthCondition: ['balanced', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['semolina', 'onions', 'vegetables', 'green chilies', 'ginger', 'mustard seeds', 'urad dal'],
        instructions: [
            'Dry roast semolina until golden',
            'Heat oil and add mustard seeds',
            'Add urad dal and sauté until golden',
            'Add onions and green chilies',
            'Add vegetables and cook',
            'Add water and bring to boil',
            'Stir in semolina continuously',
            'Cook until water absorbed'
        ],
        nutrition: {
            'Calories': '240',
            'Protein': '6g',
            'Carbs': '45g',
            'Fiber': '4g',
            'Fat': '5g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Rasam (Spiced Tamarind Soup)',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'digestive'],
        healthCondition: ['low-calorie', 'easy-digest'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['tamarind', 'tomatoes', 'rasam powder', 'turmeric', 'peppercorns', 'cumin', 'garlic'],
        instructions: [
            'Extract tamarind juice',
            'Heat with water and turmeric',
            'Add chopped tomatoes',
            'Add rasam powder and boil',
            'Prepare tempering with cumin and garlic',
            'Add to rasam and bring to boil',
            'Serve hot as soup or with rice'
        ],
        nutrition: {
            'Calories': '40',
            'Protein': '2g',
            'Carbs': '8g',
            'Fiber': '2g',
            'Fat': '0.5g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Pesarattu (Green Gram Dosa)',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'high-protein', 'gluten-free', 'breakfast'],
        healthCondition: ['high-protein', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['green gram', 'rice', 'ginger', 'green chilies', 'cumin seeds'],
        instructions: [
            'Soak green gram overnight',
            'Grind with ginger and chilies',
            'Add cumin seeds to batter',
            'Heat tawa and pour batter',
            'Spread thick and drizzle oil',
            'Cook both sides until golden',
            'Serve with ginger chutney'
        ],
        nutrition: {
            'Calories': '155',
            'Protein': '8g',
            'Carbs': '24g',
            'Fiber': '8g',
            'Fat': '3g'
        },
        prepTime: '20 min',
        cookTime: '12 min'
    },
    // French Cuisine
    {
        title: 'Coq au Vin',
        cuisine: 'French',
        tags: ['non-vegetarian', 'high-protein', 'rich', 'comfort-food'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken', 'red wine', 'mushrooms', 'onions', 'bacon', 'herbs', 'stock'],
        instructions: [
            'Brown chicken pieces in butter',
            'Cook bacon and set aside',
            'Sauté mushrooms and onions',
            'Deglaze pan with wine',
            'Add chicken, stock, and herbs',
            'Simmer for 1 hour until tender',
            'Serve with crusty bread'
        ],
        nutrition: {
            'Calories': '420',
            'Protein': '38g',
            'Carbs': '12g',
            'Fat': '18g',
            'Fiber': '2g'
        },
        prepTime: '20 min',
        cookTime: '90 min'
    },
    {
        title: 'Ratatouille',
        cuisine: 'French',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'gluten-free', 'low-calorie'],
        healthCondition: ['low-calorie', 'high-fiber', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['eggplant', 'zucchini', 'bell peppers', 'tomatoes', 'onion', 'garlic', 'herbs', 'olive oil'],
        instructions: [
            'Slice vegetables evenly',
            'Sauté onions and garlic',
            'Layer vegetables in baking dish',
            'Drizzle olive oil and herbs',
            'Bake at 180°C for 45 minutes',
            'Serve with fresh basil'
        ],
        nutrition: {
            'Calories': '120',
            'Protein': '4g',
            'Carbs': '18g',
            'Fiber': '8g',
            'Fat': '5g'
        },
        prepTime: '25 min',
        cookTime: '45 min'
    },
    {
        title: 'Salmon en Papillote',
        cuisine: 'French',
        tags: ['pescatarian', 'high-protein', 'low-carb', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb', 'omega-3'],
        dietaryPreference: ['pescatarian'],
        ingredients: ['salmon', 'lemon', 'herbs', 'vegetables', 'white wine', 'butter'],
        instructions: [
            'Preheat oven to 200°C',
            'Cut parchment paper into hearts',
            'Place salmon on parchment',
            'Add vegetables and herbs',
            'Drizzle wine and butter',
            'Fold and seal tightly',
            'Bake for 12-15 minutes',
            'Serve in paper packet'
        ],
        nutrition: {
            'Calories': '280',
            'Protein': '32g',
            'Carbs': '6g',
            'Fat': '14g',
            'Omega-3': '2.5g'
        },
        prepTime: '15 min',
        cookTime: '15 min'
    },
    {
        title: 'French Onion Soup',
        cuisine: 'French',
        tags: ['vegetarian', 'low-calorie', 'comfort-food', 'gluten-free'],
        healthCondition: ['low-calorie', 'low-fat'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['onions', 'butter', 'stock', 'white wine', 'gruyere cheese', 'bread'],
        instructions: [
            'Slice onions thinly',
            'Caramelize in butter for 30 minutes',
            'Add wine and cook down',
            'Add stock and simmer 20 minutes',
            'Ladle into bowls',
            'Top with bread and cheese',
            'Broil until bubbly'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '8g',
            'Carbs': '20g',
            'Fat': '7g',
            'Fiber': '3g'
        },
        prepTime: '15 min',
        cookTime: '60 min'
    },
    {
        title: 'Bouillabaisse',
        cuisine: 'French',
        tags: ['pescatarian', 'high-protein', 'low-carb', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb', 'omega-3'],
        dietaryPreference: ['pescatarian'],
        ingredients: ['fish', 'shellfish', 'fennel', 'onions', 'tomatoes', 'saffron', 'herbs', 'wine'],
        instructions: [
            'Make fish stock with bones',
            'Sauté fennel and onions',
            'Add tomatoes and wine',
            'Add stock and saffron',
            'Add fish and shellfish',
            'Simmer 15 minutes',
            'Serve with rouille and bread'
        ],
        nutrition: {
            'Calories': '240',
            'Protein': '30g',
            'Carbs': '8g',
            'Fat': '10g',
            'Omega-3': '1.8g'
        },
        prepTime: '30 min',
        cookTime: '45 min'
    },
    // More Italian Cuisine
    {
        title: 'Risotto ai Funghi (Mushroom Risotto)',
        cuisine: 'Italian',
        tags: ['vegetarian', 'gluten-free', 'creamy', 'comfort-food'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['arborio rice', 'mushrooms', 'onion', 'white wine', 'parmesan', 'stock', 'butter'],
        instructions: [
            'Sauté mushrooms until golden',
            'Cook onions until translucent',
            'Toast rice in pan',
            'Add wine and cook until absorbed',
            'Add hot stock ladle by ladle',
            'Stir continuously 18-20 minutes',
            'Stir in butter and parmesan',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '340',
            'Protein': '12g',
            'Carbs': '52g',
            'Fat': '11g',
            'Fiber': '2g'
        },
        prepTime: '15 min',
        cookTime: '30 min'
    },
    {
        title: 'Osso Buco',
        cuisine: 'Italian',
        tags: ['non-vegetarian', 'high-protein', 'gluten-free', 'rich'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['veal shanks', 'vegetables', 'white wine', 'stock', 'herbs', 'gremolata'],
        instructions: [
            'Brown veal shanks in butter',
            'Sauté vegetables until soft',
            'Add wine and reduce',
            'Add stock and herbs',
            'Braise covered for 2 hours',
            'Make gremolata with lemon zest',
            'Serve with risotto milanese'
        ],
        nutrition: {
            'Calories': '380',
            'Protein': '42g',
            'Carbs': '6g',
            'Fat': '18g',
            'Fiber': '1g'
        },
        prepTime: '25 min',
        cookTime: '120 min'
    },
    {
        title: 'Bruschetta al Pomodoro',
        cuisine: 'Italian',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'quick', 'appetizer'],
        healthCondition: ['low-calorie', 'low-fat', 'fresh'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['bread', 'tomatoes', 'garlic', 'basil', 'olive oil', 'balsamic'],
        instructions: [
            'Toast bread slices until golden',
            'Rub with garlic clove',
            'Dice tomatoes and mix with basil',
            'Add olive oil and salt',
            'Top bread with tomato mixture',
            'Drizzle balsamic and serve'
        ],
        nutrition: {
            'Calories': '140',
            'Protein': '4g',
            'Carbs': '18g',
            'Fat': '6g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '5 min'
    },
    {
        title: 'Margherita Pizza',
        cuisine: 'Italian',
        tags: ['vegetarian', 'balanced', 'comfort-food'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil', 'olive oil'],
        instructions: [
            'Preheat oven to 250°C',
            'Roll out pizza dough',
            'Spread tomato sauce',
            'Add mozzarella slices',
            'Bake 10-12 minutes',
            'Top with fresh basil',
            'Drizzle olive oil and serve'
        ],
        nutrition: {
            'Calories': '280',
            'Protein': '14g',
            'Carbs': '38g',
            'Fat': '9g',
            'Fiber': '2g'
        },
        prepTime: '20 min',
        cookTime: '15 min'
    },
    {
        title: 'Tiramisu',
        cuisine: 'Italian',
        tags: ['vegetarian', 'dessert', 'indulgent'],
        healthCondition: ['high-calorie', 'sweet'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['ladyfingers', 'mascarpone', 'espresso', 'cocoa powder', 'eggs', 'sugar'],
        instructions: [
            'Brew strong espresso and cool',
            'Beat egg yolks with sugar',
            'Fold in mascarpone',
            'Dip ladyfingers in coffee',
            'Layer in dish',
            'Spread mascarpone mixture',
            'Repeat layers',
            'Dust with cocoa and chill'
        ],
        nutrition: {
            'Calories': '320',
            'Protein': '6g',
            'Carbs': '32g',
            'Fat': '18g',
            'Fiber': '1g'
        },
        prepTime: '30 min',
        cookTime: '0 min'
    },
    // Chinese Cuisine
    {
        title: 'Mapo Tofu',
        cuisine: 'Chinese',
        tags: ['vegetarian', 'vegan', 'high-protein', 'spicy', 'gluten-free'],
        healthCondition: ['high-protein', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['tofu', 'ground meat/beans', 'sichuan peppers', 'doubanjiang', 'soy sauce', 'ginger', 'garlic'],
        instructions: [
            'Cube tofu and blanch',
            'Heat oil and fry ground meat',
            'Add doubanjiang and spices',
            'Add ginger and garlic',
            'Add stock and simmer',
            'Add tofu carefully',
            'Thicken with cornstarch',
            'Garnish with green onions'
        ],
        nutrition: {
            'Calories': '215',
            'Protein': '16g',
            'Carbs': '8g',
            'Fat': '12g',
            'Fiber': '2g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    {
        title: 'Kung Pao Chicken',
        cuisine: 'Chinese',
        tags: ['high-protein', 'balanced', 'spicy'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken', 'peanuts', 'bell peppers', 'dried chilies', 'soy sauce', 'vinegar', 'cornstarch'],
        instructions: [
            'Marinate chicken in soy sauce and cornstarch',
            'Deep fry chicken until crispy',
            'Sauté dried chilies and peanuts',
            'Add bell peppers',
            'Add sauce mixture',
            'Add chicken and toss',
            'Garnish with green onions'
        ],
        nutrition: {
            'Calories': '290',
            'Protein': '28g',
            'Carbs': '12g',
            'Fat': '14g',
            'Fiber': '2g'
        },
        prepTime: '20 min',
        cookTime: '15 min'
    },
    {
        title: 'Hot and Sour Soup',
        cuisine: 'Chinese',
        tags: ['low-calorie', 'gluten-free', 'comfort-food'],
        healthCondition: ['low-calorie', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['tofu', 'mushrooms', 'bamboo shoots', 'vinegar', 'soy sauce', 'pepper', 'cornstarch', 'egg'],
        instructions: [
            'Heat stock and bring to boil',
            'Add mushrooms and bamboo shoots',
            'Add tofu and spices',
            'Add vinegar and soy sauce',
            'Thicken with cornstarch',
            'Drizzle beaten egg',
            'Garnish with green onions'
        ],
        nutrition: {
            'Calories': '85',
            'Protein': '5g',
            'Carbs': '8g',
            'Fat': '3g',
            'Fiber': '1g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    {
        title: 'Sweet and Sour Pork',
        cuisine: 'Chinese',
        tags: ['high-protein', 'balanced', 'sweet'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['omnivore'],
        ingredients: ['pork', 'bell peppers', 'pineapple', 'vinegar', 'sugar', 'ketchup', 'cornstarch'],
        instructions: [
            'Marinate pork in soy sauce',
            'Coat with cornstarch and fry',
            'Make sweet and sour sauce',
            'Sauté vegetables',
            'Add sauce and simmer',
            'Add pineapple',
            'Toss with fried pork',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '310',
            'Protein': '24g',
            'Carbs': '28g',
            'Fat': '12g',
            'Fiber': '2g'
        },
        prepTime: '20 min',
        cookTime: '20 min'
    },
    {
        title: 'Vegetable Lo Mein',
        cuisine: 'Chinese',
        tags: ['vegetarian', 'vegan', 'high-carb', 'balanced'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['lo mein noodles', 'vegetables', 'soy sauce', 'sesame oil', 'ginger', 'garlic'],
        instructions: [
            'Cook noodles until al dente',
            'Sauté ginger and garlic',
            'Add vegetables and stir-fry',
            'Add soy sauce and sesame oil',
            'Toss with noodles',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '265',
            'Protein': '8g',
            'Carbs': '48g',
            'Fat': '6g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Peking Duck',
        cuisine: 'Chinese',
        tags: ['high-protein', 'indulgent', 'special-occasion'],
        healthCondition: ['high-protein', 'higher-fat'],
        dietaryPreference: ['omnivore'],
        ingredients: ['duck', 'hoisin sauce', 'pancakes', 'cucumber', 'green onions', 'sugar'],
        instructions: [
            'Roast duck until crispy',
            'Make pancakes',
            'Prepare hoisin sauce',
            'Shred duck meat',
            'Slice skin thinly',
            'Serve with pancakes and vegetables',
            'Wrap and enjoy'
        ],
        nutrition: {
            'Calories': '395',
            'Protein': '35g',
            'Carbs': '18g',
            'Fat': '20g',
            'Fiber': '1g'
        },
        prepTime: '30 min',
        cookTime: '120 min'
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

