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
    },
    // More Diverse Dishes
    {
        title: 'Aloo Bhindi (Potato Okra)',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'gluten-free', 'budget-friendly'],
        healthCondition: ['low-fat', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['potatoes', 'okra', 'onions', 'tomatoes', 'ginger', 'garlic', 'turmeric', 'spices'],
        instructions: [
            'Cut okra and potatoes into pieces',
            'Heat oil and fry okra until crispy',
            'Remove and set aside',
            'Sauté onions until golden',
            'Add ginger-garlic paste',
            'Add tomatoes and spices',
            'Add potatoes and cook until tender',
            'Add fried okra and mix gently',
            'Garnish with coriander leaves'
        ],
        nutrition: {
            'Calories': '135',
            'Protein': '4g',
            'Carbs': '24g',
            'Fiber': '8g',
            'Fat': '4g'
        },
        prepTime: '20 min',
        cookTime: '30 min'
    },
    {
        title: 'Gobi Manchurian (Cauliflower Manchurian)',
        cuisine: 'Indo-Chinese',
        tags: ['vegetarian', 'vegan', 'spicy', 'crispy', 'appetizer'],
        healthCondition: ['moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['cauliflower', 'flour', 'cornstarch', 'onions', 'bell peppers', 'garlic', 'ginger', 'soy sauce', 'vinegar'],
        instructions: [
            'Cut cauliflower into florets',
            'Make batter with flour and cornstarch',
            'Dip florets and deep fry until golden',
            'Heat oil and sauté garlic and ginger',
            'Add onions and bell peppers',
            'Add sauces and spices',
            'Toss fried cauliflower in sauce',
            'Garnish with green onions'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '6g',
            'Carbs': '38g',
            'Fat': '12g',
            'Fiber': '4g'
        },
        prepTime: '25 min',
        cookTime: '20 min'
    },
    {
        title: 'Vegetable Fried Rice',
        cuisine: 'Chinese',
        tags: ['vegetarian', 'vegan', 'high-carb', 'quick', 'balanced'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['cooked rice', 'vegetables', 'soy sauce', 'sesame oil', 'garlic', 'ginger', 'eggs (optional)'],
        instructions: [
            'Use day-old cooked rice',
            'Heat oil in wok',
            'Sauté garlic and ginger',
            'Add vegetables and stir-fry',
            'Add rice and break up clumps',
            'Add soy sauce and sesame oil',
            'Add eggs if using and scramble',
            'Toss well and serve hot'
        ],
        nutrition: {
            'Calories': '240',
            'Protein': '6g',
            'Carbs': '45g',
            'Fat': '5g',
            'Fiber': '3g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Chicken Fried Rice',
        cuisine: 'Chinese',
        tags: ['high-protein', 'balanced', 'quick'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['cooked rice', 'chicken', 'vegetables', 'soy sauce', 'eggs', 'garlic', 'ginger', 'sesame oil'],
        instructions: [
            'Use day-old cooked rice',
            'Cook chicken and set aside',
            'Heat oil and scramble eggs',
            'Add garlic and ginger',
            'Add vegetables and stir-fry',
            'Add rice and chicken',
            'Add soy sauce and toss',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '310',
            'Protein': '22g',
            'Carbs': '42g',
            'Fat': '7g',
            'Fiber': '2g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    {
        title: 'Hakka Noodles',
        cuisine: 'Chinese',
        tags: ['vegetarian', 'high-carb', 'quick', 'balanced'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['hakka noodles', 'vegetables', 'soy sauce', 'vinegar', 'chili sauce', 'garlic', 'ginger'],
        instructions: [
            'Boil noodles until al dente',
            'Drain and rinse with cold water',
            'Heat oil in wok',
            'Sauté garlic and ginger',
            'Add vegetables and stir-fry',
            'Add noodles and toss',
            'Add sauces and mix well',
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
        title: 'Chicken Tikka',
        cuisine: 'Indian',
        tags: ['high-protein', 'low-carb', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken breast', 'yogurt', 'ginger', 'garlic', 'lemon', 'garam masala', 'cumin', 'paprika'],
        instructions: [
            'Cut chicken into cubes',
            'Mix yogurt with ginger-garlic paste',
            'Add spices and lemon juice',
            'Marinate for 4-6 hours',
            'Skewer chicken pieces',
            'Grill or bake until cooked',
            'Baste with butter',
            'Serve with mint chutney'
        ],
        nutrition: {
            'Calories': '245',
            'Protein': '28g',
            'Carbs': '6g',
            'Fat': '10g',
            'Fiber': '1g'
        },
        prepTime: '20 min',
        cookTime: '20 min'
    },
    {
        title: 'Chinese Bhel',
        cuisine: 'Indo-Chinese',
        tags: ['vegetarian', 'vegan', 'crispy', 'appetizer', 'quick'],
        healthCondition: ['moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['noodles', 'cabbage', 'onions', 'bell peppers', 'carrots', 'chili sauce', 'vinegar', 'sesame seeds'],
        instructions: [
            'Deep fry noodles until crispy',
            'Shred vegetables finely',
            'Mix vegetables with sauces',
            'Add chili sauce and vinegar',
            'Toss with crispy noodles',
            'Garnish with green onions',
            'Add sesame seeds',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '220',
            'Protein': '5g',
            'Carbs': '35g',
            'Fat': '8g',
            'Fiber': '4g'
        },
        prepTime: '15 min',
        cookTime: '10 min'
    },
    {
        title: 'Sushi Rolls',
        cuisine: 'Japanese',
        tags: ['pescatarian', 'low-fat', 'gluten-free', 'fresh'],
        healthCondition: ['low-fat', 'omega-3'],
        dietaryPreference: ['pescatarian'],
        ingredients: ['sushi rice', 'nori seaweed', 'fresh fish', 'vegetables', 'wasabi', 'pickled ginger', 'soy sauce'],
        instructions: [
            'Cook sushi rice with vinegar',
            'Lay nori sheet on bamboo mat',
            'Spread rice evenly',
            'Add fish and vegetables',
            'Roll tightly using mat',
            'Slice into pieces',
            'Serve with wasabi and ginger',
            'Dip in soy sauce'
        ],
        nutrition: {
            'Calories': '200',
            'Protein': '8g',
            'Carbs': '35g',
            'Fat': '3g',
            'Omega-3': '0.8g'
        },
        prepTime: '40 min',
        cookTime: '10 min'
    },
    {
        title: 'Caesar Salad',
        cuisine: 'Western',
        tags: ['vegetarian', 'high-protein', 'low-carb', 'fresh'],
        healthCondition: ['low-carb', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing', 'lemon', 'anchovies (optional)'],
        instructions: [
            'Chop romaine lettuce',
            'Make caesar dressing',
            'Grate parmesan cheese',
            'Prepare croutons',
            'Toss lettuce with dressing',
            'Add croutons and cheese',
            'Squeeze lemon juice',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '220',
            'Protein': '10g',
            'Carbs': '12g',
            'Fat': '16g',
            'Fiber': '3g'
        },
        prepTime: '15 min',
        cookTime: '0 min'
    },
    {
        title: 'Mediterranean Quinoa Salad',
        cuisine: 'Mediterranean',
        tags: ['vegetarian', 'vegan', 'high-protein', 'high-fiber', 'gluten-free'],
        healthCondition: ['high-protein', 'high-fiber', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['quinoa', 'cucumber', 'cherry tomatoes', 'olives', 'feta cheese', 'olive oil', 'lemon', 'herbs'],
        instructions: [
            'Cook quinoa and cool',
            'Dice cucumber and tomatoes',
            'Mix with olives',
            'Add crumbled feta',
            'Drizzle olive oil and lemon',
            'Add fresh herbs',
            'Toss gently',
            'Serve chilled'
        ],
        nutrition: {
            'Calories': '290',
            'Protein': '12g',
            'Carbs': '38g',
            'Fat': '12g',
            'Fiber': '6g'
        },
        prepTime: '20 min',
        cookTime: '15 min'
    },
    {
        title: 'Green Salad with Vinaigrette',
        cuisine: 'Western',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'quick'],
        healthCondition: ['low-calorie', 'low-fat', 'fresh'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['mixed greens', 'cherry tomatoes', 'cucumber', 'carrots', 'olive oil', 'vinegar', 'mustard', 'honey'],
        instructions: [
            'Wash and chop greens',
            'Slice tomatoes and cucumber',
            'Shred carrots',
            'Make vinaigrette dressing',
            'Toss vegetables in dressing',
            'Serve fresh'
        ],
        nutrition: {
            'Calories': '85',
            'Protein': '3g',
            'Carbs': '10g',
            'Fat': '4g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    {
        title: 'Chilli Paneer',
        cuisine: 'Indo-Chinese',
        tags: ['vegetarian', 'high-protein', 'spicy', 'crispy'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['paneer', 'bell peppers', 'onions', 'ginger', 'garlic', 'soy sauce', 'chili sauce', 'cornstarch'],
        instructions: [
            'Cube paneer and coat with cornstarch',
            'Deep fry until golden',
            'Heat oil and sauté garlic and ginger',
            'Add onions and bell peppers',
            'Add sauces and spices',
            'Toss fried paneer in sauce',
            'Garnish with green onions'
        ],
        nutrition: {
            'Calories': '310',
            'Protein': '18g',
            'Carbs': '22g',
            'Fat': '16g',
            'Fiber': '3g'
        },
        prepTime: '20 min',
        cookTime: '20 min'
    },
    {
        title: 'Paneer 65',
        cuisine: 'Indian',
        tags: ['vegetarian', 'high-protein', 'spicy', 'crispy', 'appetizer'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['paneer', 'yogurt', 'red chili powder', 'garam masala', 'ginger-garlic paste', 'cornstarch', 'curry leaves'],
        instructions: [
            'Cut paneer into cubes',
            'Marinate in yogurt and spices',
            'Covern paneer with cornstarch',
            'Deep fry until golden and crispy',
            'Heat oil and temper curry leaves',
            'Add fried paneer and toss',
            'Garnish with fresh coriander'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '16g',
            'Carbs': '18g',
            'Fat': '16g',
            'Fiber': '1g'
        },
        prepTime: '25 min',
        cookTime: '15 min'
    },
    {
        title: 'Tandoori Chicken',
        cuisine: 'Indian',
        tags: ['high-protein', 'low-carb', 'spicy', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken', 'yogurt', 'lemon', 'ginger-garlic paste', 'tandoori masala', 'turmeric', 'red chili', 'butter'],
        instructions: [
            'Cut chicken into pieces',
            'Make cuts on chicken',
            'Mix yogurt with spices and lemon',
            'Marinate chicken overnight',
            'Skewer chicken pieces',
            'Grill or bake until cooked',
            'Baste with butter',
            'Serve with onion rings and lemon'
        ],
        nutrition: {
            'Calories': '265',
            'Protein': '32g',
            'Carbs': '4g',
            'Fat': '12g',
            'Fiber': '0g'
        },
        prepTime: '30 min',
        cookTime: '25 min'
    },
    {
        title: 'Chicken Spring Rolls',
        cuisine: 'Chinese',
        tags: ['high-protein', 'crispy', 'appetizer'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['omnivore'],
        ingredients: ['spring roll wrappers', 'chicken', 'cabbage', 'carrots', 'bean sprouts', 'soy sauce', 'garlic'],
        instructions: [
            'Cook chicken and shred',
            'Shred vegetables',
            'Heat oil and sauté vegetables',
            'Add chicken and season',
            'Cool filling',
            'Wrap in spring roll wrappers',
            'Deep fry until golden',
            'Serve with sweet chili sauce'
        ],
        nutrition: {
            'Calories': '195',
            'Protein': '10g',
            'Carbs': '22g',
            'Fat': '7g',
            'Fiber': '2g'
        },
        prepTime: '30 min',
        cookTime: '15 min'
    },
    {
        title: 'Vegetable Spring Rolls',
        cuisine: 'Chinese',
        tags: ['vegetarian', 'vegan', 'crispy', 'appetizer'],
        healthCondition: ['low-calorie', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['spring roll wrappers', 'cabbage', 'carrots', 'bean sprouts', 'mushrooms', 'ginger', 'soy sauce'],
        instructions: [
            'Shred all vegetables',
            'Heat oil and sauté vegetables',
            'Add seasonings',
            'Cool filling completely',
            'Wrap in spring roll wrappers',
            'Deep fry until golden and crispy',
            'Serve with dipping sauce'
        ],
        nutrition: {
            'Calories': '145',
            'Protein': '4g',
            'Carbs': '20g',
            'Fat': '6g',
            'Fiber': '3g'
        },
        prepTime: '25 min',
        cookTime: '12 min'
    },
    {
        title: 'Chicken Momos',
        cuisine: 'Chinese/Himalayan',
        tags: ['high-protein', 'balanced', 'steamed'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['omnivore'],
        ingredients: ['all-purpose flour', 'chicken', 'cabbage', 'ginger', 'garlic', 'soy sauce', 'pepper'],
        instructions: [
            'Make dough and rest',
            'Mince chicken with vegetables',
            'Season with spices',
            'Roll small circles of dough',
            'Fill with chicken mixture',
            'Pleat and seal momos',
            'Steam for 10-12 minutes',
            'Serve with spicy chutney'
        ],
        nutrition: {
            'Calories': '240',
            'Protein': '16g',
            'Carbs': '32g',
            'Fat': '6g',
            'Fiber': '2g'
        },
        prepTime: '40 min',
        cookTime: '15 min'
    },
    {
        title: 'Veg Momos',
        cuisine: 'Chinese/Himalayan',
        tags: ['vegetarian', 'vegan', 'balanced', 'steamed'],
        healthCondition: ['balanced', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['all-purpose flour', 'cabbage', 'carrots', 'ginger', 'garlic', 'soy sauce', 'pepper'],
        instructions: [
            'Make dough and rest',
            'Shred vegetables',
            'Season with spices',
            'Roll dough into circles',
            'Fill with vegetable mixture',
            'Pleat and seal',
            'Steam until cooked',
            'Serve with red chutney'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '5g',
            'Carbs': '34g',
            'Fat': '3g',
            'Fiber': '3g'
        },
        prepTime: '35 min',
        cookTime: '12 min'
    },
    {
        title: 'Classic Burger',
        cuisine: 'Western',
        tags: ['high-protein', 'balanced', 'comfort-food'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['omnivore'],
        ingredients: ['burger buns', 'beef/chicken patty', 'lettuce', 'tomato', 'onion', 'cheese', 'pickles', 'special sauce'],
        instructions: [
            'Season and grill patty',
            'Toast burger buns',
            'Spread sauce on bottom bun',
            'Add patty and cheese',
            'Add fresh vegetables',
            'Top with other half',
            'Secure with toothpick',
            'Serve with fries'
        ],
        nutrition: {
            'Calories': '420',
            'Protein': '28g',
            'Carbs': '35g',
            'Fat': '18g',
            'Fiber': '3g'
        },
        prepTime: '20 min',
        cookTime: '15 min'
    },
    {
        title: 'Veggie Burger',
        cuisine: 'Western',
        tags: ['vegetarian', 'high-protein', 'balanced'],
        healthCondition: ['balanced', 'high-protein'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['burger bun', 'veggie patty', 'lettuce', 'tomato', 'onion', 'cheese', 'mayo', 'pickles'],
        instructions: [
            'Grill or pan-fry veggie patty',
            'Toast burger buns',
            'Spread mayo on bottom bun',
            'Add patty and cheese',
            'Layer fresh vegetables',
            'Add top bun',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '315',
            'Protein': '16g',
            'Carbs': '42g',
            'Fat': '10g',
            'Fiber': '8g'
        },
        prepTime: '15 min',
        cookTime: '12 min'
    },
    {
        title: 'Vada Pav',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'comfort-food', 'street-food'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['pav buns', 'potatoes', 'curry leaves', 'mustard seeds', 'turmeric', 'green chilies', 'ginger', 'garlic', 'chickpea flour'],
        instructions: [
            'Boil and mash potatoes',
            'Temper mustard seeds and curry leaves',
            'Add chilies, ginger, garlic',
            'Mix with potatoes and spices',
            'Shape into balls',
            'Coat with chickpea flour batter',
            'Deep fry until golden',
            'Serve in pav with chutneys'
        ],
        nutrition: {
            'Calories': '280',
            'Protein': '8g',
            'Carbs': '42g',
            'Fat': '10g',
            'Fiber': '5g'
        },
        prepTime: '30 min',
        cookTime: '20 min'
    },
    {
        title: 'Mint Chutney',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'condiment'],
        healthCondition: ['low-calorie', 'digestive'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['mint leaves', 'coriander leaves', 'green chilies', 'ginger', 'lemon', 'cumin powder', 'salt'],
        instructions: [
            'Wash mint and coriander leaves',
            'Chop green chilies',
            'Add all ingredients to blender',
            'Blend to smooth paste',
            'Add water if needed',
            'Adjust seasoning',
            'Serve chilled'
        ],
        nutrition: {
            'Calories': '15',
            'Protein': '1g',
            'Carbs': '3g',
            'Fat': '0g',
            'Fiber': '1g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    {
        title: 'Dal Baati',
        cuisine: 'Indian',
        tags: ['vegetarian', 'high-carb', 'comfort-food', 'rich'],
        healthCondition: ['high-carb', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['wheat flour', 'dal (pigeon pea)', 'onions', 'tomatoes', 'ginger', 'garlic', 'spices', 'ghee'],
        instructions: [
            'Make dough with wheat flour and ghee',
            'Shape into balls (baati)',
            'Bake or deep fry baatis',
            'Cook dal with spices',
            'Temper with garlic',
            'Smash hot baatis',
            'Pour dal over baatis',
            'Drizzle ghee and serve'
        ],
        nutrition: {
            'Calories': '485',
            'Protein': '14g',
            'Carbs': '68g',
            'Fat': '18g',
            'Fiber': '8g'
        },
        prepTime: '40 min',
        cookTime: '60 min'
    },
    // Quick Fridge-Friendly Recipes
    {
        title: 'Egg Fried Rice',
        cuisine: 'Quick & Easy',
        tags: ['high-protein', 'quick', 'balanced', 'budget-friendly'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['omnivore'],
        ingredients: ['cooked rice', 'eggs', 'onions', 'garlic', 'soy sauce', 'green onions', 'oil'],
        instructions: [
            'Use leftover cooked rice',
            'Scramble eggs in pan and set aside',
            'Sauté garlic and onions',
            'Add rice and break clumps',
            'Add soy sauce',
            'Mix in scrambled eggs',
            'Garnish with green onions',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '275',
            'Protein': '12g',
            'Carbs': '42g',
            'Fat': '7g',
            'Fiber': '2g'
        },
        prepTime: '5 min',
        cookTime: '10 min'
    },
    {
        title: 'Cheese Sandwich',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'quick', 'budget-friendly', 'comfort-food'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['bread slices', 'cheese slices', 'butter', 'black pepper', 'mustard (optional)'],
        instructions: [
            'Butter bread slices',
            'Place cheese slices on bread',
            'Add pepper and mustard',
            'Cover with other bread slice',
            'Toast on pan or grill',
            'Cut in half',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '320',
            'Protein': '16g',
            'Carbs': '30g',
            'Fat': '16g',
            'Fiber': '2g'
        },
        prepTime: '3 min',
        cookTime: '5 min'
    },
    {
        title: 'Chicken Soup',
        cuisine: 'Quick & Easy',
        tags: ['high-protein', 'comfort-food', 'gluten-free', 'healing'],
        healthCondition: ['high-protein', 'low-calorie', 'easy-digest'],
        dietaryPreference: ['omnivore'],
        ingredients: ['chicken pieces', 'onions', 'carrots', 'celery', 'garlic', 'salt', 'pepper', 'herbs'],
        instructions: [
            'Boil chicken in water',
            'Add chopped vegetables',
            'Simmer for 45 minutes',
            'Add garlic and herbs',
            'Season with salt and pepper',
            'Remove chicken and shred',
            'Add back to soup',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '140',
            'Protein': '16g',
            'Carbs': '8g',
            'Fat': '5g',
            'Fiber': '2g'
        },
        prepTime: '15 min',
        cookTime: '50 min'
    },
    {
        title: 'Vegetable Stir Fry',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'quick', 'gluten-free'],
        healthCondition: ['low-calorie', 'low-fat', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['mixed vegetables', 'garlic', 'ginger', 'soy sauce', 'sesame oil', 'salt', 'pepper'],
        instructions: [
            'Cut vegetables into bite sizes',
            'Heat oil in pan',
            'Sauté garlic and ginger',
            'Add vegetables and stir-fry',
            'Add soy sauce',
            'Cook until crisp-tender',
            'Season and serve',
            'Optional: sprinkle sesame seeds'
        ],
        nutrition: {
            'Calories': '95',
            'Protein': '4g',
            'Carbs': '14g',
            'Fat': '3g',
            'Fiber': '5g'
        },
        prepTime: '10 min',
        cookTime: '10 min'
    },
    {
        title: 'Scrambled Eggs',
        cuisine: 'Quick & Easy',
        tags: ['high-protein', 'quick', 'breakfast', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['omnivore'],
        ingredients: ['eggs', 'butter', 'milk', 'salt', 'pepper', 'chives (optional)'],
        instructions: [
            'Beat eggs with milk',
            'Heat butter in pan',
            'Pour eggs in pan',
            'Scramble gently',
            'Cook until creamy',
            'Season with salt and pepper',
            'Garnish with chives',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '200',
            'Protein': '14g',
            'Carbs': '2g',
            'Fat': '15g',
            'Fiber': '0g'
        },
        prepTime: '3 min',
        cookTime: '5 min'
    },
    {
        title: 'Omelette',
        cuisine: 'Quick & Easy',
        tags: ['high-protein', 'quick', 'breakfast', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['omnivore'],
        ingredients: ['eggs', 'onions', 'tomatoes', 'green chilies', 'salt', 'butter', 'pepper'],
        instructions: [
            'Beat eggs well',
            'Add chopped vegetables',
            'Season with salt and pepper',
            'Heat butter in pan',
            'Pour egg mixture',
            'Cook on low heat',
            'Fold in half when set',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '220',
            'Protein': '14g',
            'Carbs': '4g',
            'Fat': '16g',
            'Fiber': '1g'
        },
        prepTime: '5 min',
        cookTime: '7 min'
    },
    {
        title: 'Maggi Noodles',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'quick', 'comfort-food', 'budget-friendly'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['maggi noodles', 'water', 'noodles masala', 'oil', 'vegetables (optional)'],
        instructions: [
            'Boil water in pan',
            'Add maggi noodles',
            'Add masala from packet',
            'Cook for 2 minutes',
            'Stir occasionally',
            'Add vegetables if using',
            'Cook until noodles tender',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '250',
            'Protein': '6g',
            'Carbs': '40g',
            'Fat': '8g',
            'Fiber': '2g'
        },
        prepTime: '2 min',
        cookTime: '5 min'
    },
    {
        title: 'Tomato Rice',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'gluten-free', 'quick', 'balanced'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['cooked rice', 'tomatoes', 'onions', 'garlic', 'curry leaves', 'mustard seeds', 'turmeric', 'spices'],
        instructions: [
            'Use leftover cooked rice',
            'Heat oil and temper mustard',
            'Add curry leaves',
            'Sauté onions until golden',
            'Add chopped tomatoes',
            'Cook until soft',
            'Add spices and turmeric',
            'Mix with rice and serve'
        ],
        nutrition: {
            'Calories': '215',
            'Protein': '5g',
            'Carbs': '42g',
            'Fat': '4g',
            'Fiber': '2g'
        },
        prepTime: '8 min',
        cookTime: '12 min'
    },
    {
        title: 'French Toast',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'breakfast', 'comfort-food', 'quick'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['bread slices', 'eggs', 'milk', 'vanilla', 'cinnamon', 'butter', 'maple syrup'],
        instructions: [
            'Beat eggs with milk',
            'Add vanilla and cinnamon',
            'Dip bread slices',
            'Heat butter in pan',
            'Cook until golden brown',
            'Flip and cook other side',
            'Serve with maple syrup'
        ],
        nutrition: {
            'Calories': '280',
            'Protein': '12g',
            'Carbs': '32g',
            'Fat': '12g',
            'Fiber': '1g'
        },
        prepTime: '5 min',
        cookTime: '10 min'
    },
    {
        title: 'Boiled Eggs with Bread',
        cuisine: 'Quick & Easy',
        tags: ['high-protein', 'quick', 'breakfast', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['omnivore'],
        ingredients: ['eggs', 'bread', 'butter', 'salt', 'pepper'],
        instructions: [
            'Boil eggs in water',
            'Cook for 7-8 minutes',
            'Cool and peel',
            'Toast bread slices',
            'Butter the toast',
            'Cut eggs in half',
            'Season with salt and pepper',
            'Serve together'
        ],
        nutrition: {
            'Calories': '260',
            'Protein': '15g',
            'Carbs': '22g',
            'Fat': '11g',
            'Fiber': '1g'
        },
        prepTime: '5 min',
        cookTime: '8 min'
    },
    {
        title: 'Grilled Cheese Sandwich',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'quick', 'comfort-food'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['bread', 'cheese slices', 'butter', 'garlic powder (optional)'],
        instructions: [
            'Butter both bread slices',
            'Place cheese between slices',
            'Add garlic powder if desired',
            'Heat pan on medium',
            'Grill sandwich until golden',
            'Flip and grill other side',
            'Cheese should be melted',
            'Cut and serve hot'
        ],
        nutrition: {
            'Calories': '335',
            'Protein': '16g',
            'Carbs': '30g',
            'Fat': '17g',
            'Fiber': '2g'
        },
        prepTime: '3 min',
        cookTime: '6 min'
    },
    {
        title: 'Potato Fry',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'gluten-free', 'quick'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['potatoes', 'onions', 'turmeric', 'red chili powder', 'salt', 'oil', 'mustard seeds'],
        instructions: [
            'Cut potatoes into cubes',
            'Boil until half cooked',
            'Heat oil in pan',
            'Temper mustard seeds',
            'Add onions and sauté',
            'Add potatoes',
            'Add spices',
            'Fry until golden and crispy'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '3g',
            'Carbs': '32g',
            'Fat': '5g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Cucumber Raita',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'low-calorie', 'cooling', 'gluten-free', 'quick'],
        healthCondition: ['low-calorie', 'probiotic'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['cucumber', 'yogurt', 'cumin powder', 'salt', 'fresh coriander', 'mint (optional)'],
        instructions: [
            'Peel and grate cucumber',
            'Beat yogurt until smooth',
            'Mix in grated cucumber',
            'Add cumin powder and salt',
            'Garnish with coriander',
            'Chill for 30 minutes',
            'Serve as side dish'
        ],
        nutrition: {
            'Calories': '45',
            'Protein': '3g',
            'Carbs': '5g',
            'Fat': '1g',
            'Fiber': '1g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    {
        title: 'Onion Rings',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'crispy', 'appetizer'],
        healthCondition: ['moderate-calorie', 'crispy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['onions', 'flour', 'cornstarch', 'baking powder', 'salt', 'oil'],
        instructions: [
            'Slice onions into rings',
            'Separate rings',
            'Make batter with flour and water',
            'Add cornstarch and spices',
            'Dip rings in batter',
            'Deep fry until golden',
            'Drain on paper towel',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '185',
            'Protein': '3g',
            'Carbs': '28g',
            'Fat': '8g',
            'Fiber': '2g'
        },
        prepTime: '15 min',
        cookTime: '10 min'
    },
    {
        title: 'Garlic Bread',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'quick', 'appetizer', 'comfort-food'],
        healthCondition: ['high-carb', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['bread', 'butter', 'garlic', 'parsley', 'cheese (optional)'],
        instructions: [
            'Mix butter with minced garlic',
            'Add chopped parsley',
            'Add grated cheese if using',
            'Spread on bread slices',
            'Bake at 200°C for 8 minutes',
            'Or grill on pan',
            'Serve hot and crispy'
        ],
        nutrition: {
            'Calories': '210',
            'Protein': '5g',
            'Carbs': '24g',
            'Fat': '11g',
            'Fiber': '1g'
        },
        prepTime: '5 min',
        cookTime: '8 min'
    },
    {
        title: 'Crispy Fried Egg',
        cuisine: 'Quick & Easy',
        tags: ['high-protein', 'quick', 'breakfast', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['omnivore'],
        ingredients: ['eggs', 'oil', 'salt', 'pepper'],
        instructions: [
            'Heat oil in pan',
            'Crack egg into hot oil',
            'Fry until edges crispy',
            'Flip if desired',
            'Cook to preference',
            'Season with salt and pepper',
            'Serve on bread or rice'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '12g',
            'Carbs': '1g',
            'Fat': '14g',
            'Fiber': '0g'
        },
        prepTime: '2 min',
        cookTime: '3 min'
    },
    {
        title: 'Corn Sandwich',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'quick', 'balanced', 'budget-friendly'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['corn kernels', 'bread', 'onions', 'bell peppers', 'mayonnaise', 'black pepper', 'butter'],
        instructions: [
            'Boil corn kernels',
            'Mix with mayonnaise',
            'Add chopped vegetables',
            'Season with pepper',
            'Butter bread slices',
            'Spread corn mixture',
            'Grill sandwich',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '9g',
            'Carbs': '42g',
            'Fat': '11g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '8 min'
    },
    {
        title: 'Banana Toast',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'quick', 'breakfast', 'sweet'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['bread slices', 'bananas', 'honey', 'cinnamon (optional)'],
        instructions: [
            'Toast bread slices',
            'Slice bananas thinly',
            'Arrange on toast',
            'Drizzle with honey',
            'Sprinkle cinnamon',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '195',
            'Protein': '4g',
            'Carbs': '42g',
            'Fat': '3g',
            'Fiber': '4g'
        },
        prepTime: '3 min',
        cookTime: '3 min'
    },
    {
        title: 'Quick Poha',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'gluten-free', 'quick', 'breakfast'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['flattened rice (poha)', 'onions', 'peanuts', 'mustard seeds', 'turmeric', 'green chilies', 'lemon'],
        instructions: [
            'Wash and drain poha',
            'Heat oil and temper mustard',
            'Add peanuts and roast',
            'Add onions and chilies',
            'Add turmeric',
            'Add poha and mix gently',
            'Cook for 2 minutes',
            'Squeeze lemon and serve'
        ],
        nutrition: {
            'Calories': '225',
            'Protein': '5g',
            'Carbs': '42g',
            'Fat': '5g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '8 min'
    },
    {
        title: 'Beans Toast',
        cuisine: 'Quick & Easy',
        tags: ['vegetarian', 'vegan', 'high-protein', 'quick', 'breakfast'],
        healthCondition: ['high-protein', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['bread', 'baked beans', 'onions', 'bell peppers', 'black pepper'],
        instructions: [
            'Toast bread slices',
            'Heat baked beans',
            'Add chopped vegetables',
            'Add pepper',
            'Spread on toast',
            'Serve hot',
            'Optional: add cheese'
        ],
        nutrition: {
            'Calories': '245',
            'Protein': '12g',
            'Carbs': '38g',
            'Fat': '5g',
            'Fiber': '10g'
        },
        prepTime: '5 min',
        cookTime: '5 min'
    },
    // Additional Breakfast & Light Meals
    {
        title: 'Vegetable Upma',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'gluten-free'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['semolina (rava)', 'vegetables', 'onions', 'green chilies', 'mustard seeds', 'curry leaves', 'turmeric'],
        instructions: [
            'Heat oil in a pan',
            'Add mustard seeds and curry leaves',
            'Add chopped onions and green chilies',
            'Sauté until golden',
            'Add vegetables and cook slightly',
            'Add semolina and roast until aromatic',
            'Add hot water gradually, stirring continuously',
            'Cook until semolina is soft and fluffy',
            'Season with salt and garnish with coriander'
        ],
        nutrition: {
            'Calories': '195',
            'Protein': '5g',
            'Carbs': '38g',
            'Fat': '4g',
            'Fiber': '3g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Poha with Peanuts',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'gluten-free', 'quick'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['flattened rice (poha)', 'peanuts', 'onions', 'potatoes', 'mustard seeds', 'turmeric', 'green chilies', 'lemon'],
        instructions: [
            'Rinse poha and drain well',
            'Heat oil and roast peanuts until golden',
            'Temper mustard seeds',
            'Add chopped potatoes and cook until tender',
            'Add onions and green chilies',
            'Add turmeric and salt',
            'Add poha and mix gently',
            'Cook for 2-3 minutes',
            'Squeeze lemon juice and serve'
        ],
        nutrition: {
            'Calories': '240',
            'Protein': '6g',
            'Carbs': '45g',
            'Fat': '6g',
            'Fiber': '3g'
        },
        prepTime: '10 min',
        cookTime: '12 min'
    },
    {
        title: 'Masala Oats',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'high-fiber', 'quick'],
        healthCondition: ['high-fiber', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['oats', 'onions', 'tomatoes', 'green chilies', 'mustard seeds', 'turmeric', 'curry leaves'],
        instructions: [
            'Heat oil and temper mustard seeds',
            'Add curry leaves and green chilies',
            'Sauté onions until translucent',
            'Add chopped tomatoes and cook until soft',
            'Add turmeric and spices',
            'Add oats and roast for a minute',
            'Add water and cook until creamy',
            'Season with salt and serve hot'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '7g',
            'Carbs': '30g',
            'Fat': '4g',
            'Fiber': '6g'
        },
        prepTime: '5 min',
        cookTime: '10 min'
    },
    {
        title: 'Idli with Sambar',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'high-protein', 'gluten-free'],
        healthCondition: ['high-protein', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['idli', 'lentils (toor dal)', 'vegetables', 'tamarind', 'sambar powder', 'mustard seeds', 'curry leaves'],
        instructions: [
            'Prepare idli batter and steam in idli moulds',
            'Cook toor dal until soft',
            'Heat oil and temper mustard seeds and curry leaves',
            'Add vegetables and cook',
            'Add tamarind water and sambar powder',
            'Add cooked dal and simmer',
            'Season with salt',
            'Serve hot idli with sambar and coconut chutney'
        ],
        nutrition: {
            'Calories': '265',
            'Protein': '12g',
            'Carbs': '45g',
            'Fat': '5g',
            'Fiber': '8g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    {
        title: 'Besan Chilla',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'high-protein', 'gluten-free'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['gram flour (besan)', 'onions', 'tomatoes', 'green chilies', 'cumin seeds', 'turmeric', 'coriander leaves'],
        instructions: [
            'Mix besan with water to make thin batter',
            'Add chopped vegetables',
            'Add spices and salt',
            'Heat oil in a pan',
            'Pour ladleful of batter',
            'Spread evenly to make thin chilla',
            'Cook until golden on both sides',
            'Serve hot with chutney or pickle'
        ],
        nutrition: {
            'Calories': '165',
            'Protein': '8g',
            'Carbs': '22g',
            'Fat': '5g',
            'Fiber': '5g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Rava Dosa',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'crispy', 'quick'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['semolina (rava)', 'rice flour', 'onions', 'green chilies', 'cumin seeds', 'curry leaves', 'pepper'],
        instructions: [
            'Mix rava, rice flour, and salt',
            'Add water to make thin batter',
            'Add chopped onions, chilies, and spices',
            'Let batter rest for 10 minutes',
            'Heat oil in a non-stick pan',
            'Pour batter in circular motion',
            'Drizzle oil and cook until crispy',
            'Flip and cook until golden brown'
        ],
        nutrition: {
            'Calories': '245',
            'Protein': '5g',
            'Carbs': '48g',
            'Fat': '5g',
            'Fiber': '2g'
        },
        prepTime: '15 min',
        cookTime: '8 min'
    },
    {
        title: 'Vegetable Sandwich',
        cuisine: 'Continental',
        tags: ['vegetarian', 'quick', 'breakfast', 'balanced'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['bread slices', 'cucumber', 'tomato', 'onions', 'bell peppers', 'mayonnaise', 'butter', 'salt', 'pepper'],
        instructions: [
            'Butter bread slices',
            'Slice vegetables thinly',
            'Spread mayonnaise on bread',
            'Layer vegetables evenly',
            'Season with salt and pepper',
            'Cover with second bread slice',
            'Toast sandwich maker or pan grill',
            'Cut diagonally and serve'
        ],
        nutrition: {
            'Calories': '235',
            'Protein': '8g',
            'Carbs': '35g',
            'Fat': '8g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '5 min'
    },
    {
        title: 'Sprouts Salad',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-protein', 'high-fiber', 'gluten-free'],
        healthCondition: ['high-protein', 'high-fiber', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['sprouted moong beans', 'onions', 'tomatoes', 'cucumber', 'lemon juice', 'black pepper', 'salt', 'coriander'],
        instructions: [
            'Wash and drain sprouted beans',
            'Chop all vegetables',
            'Mix sprouts with vegetables',
            'Add lemon juice and spices',
            'Season with salt and pepper',
            'Toss well to combine',
            'Garnish with fresh coriander',
            'Serve fresh and chilled'
        ],
        nutrition: {
            'Calories': '125',
            'Protein': '10g',
            'Carbs': '20g',
            'Fat': '2g',
            'Fiber': '8g'
        },
        prepTime: '15 min',
        cookTime: '0 min'
    },
    {
        title: 'Paneer Bhurji',
        cuisine: 'Indian',
        tags: ['vegetarian', 'high-protein', 'breakfast', 'quick'],
        healthCondition: ['high-protein', 'low-carb'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['crumbled paneer', 'onions', 'tomatoes', 'ginger-garlic paste', 'turmeric', 'garam masala', 'green chilies'],
        instructions: [
            'Heat oil in a pan',
            'Add cumin seeds until they crackle',
            'Add chopped onions and sauté',
            'Add ginger-garlic paste',
            'Add tomatoes and cook until soft',
            'Add spices and turmeric',
            'Add crumbled paneer',
            'Cook for 3-4 minutes',
            'Garnish with coriander and serve'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '18g',
            'Carbs': '12g',
            'Fat': '18g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '12 min'
    },
    {
        title: 'Egg White Omelette',
        cuisine: 'Healthy',
        tags: ['high-protein', 'low-fat', 'breakfast', 'gluten-free'],
        healthCondition: ['high-protein', 'low-fat', 'low-calorie'],
        dietaryPreference: ['omnivore'],
        ingredients: ['egg whites', 'mushrooms', 'spinach', 'onions', 'bell peppers', 'salt', 'pepper'],
        instructions: [
            'Separate egg whites from yolks',
            'Whisk egg whites until frothy',
            'Sauté vegetables until tender',
            'Add vegetables to egg whites',
            'Season with salt and pepper',
            'Heat oil in pan',
            'Pour mixture and cook until set',
            'Fold in half and serve'
        ],
        nutrition: {
            'Calories': '120',
            'Protein': '16g',
            'Carbs': '4g',
            'Fat': '3g',
            'Fiber': '2g'
        },
        prepTime: '8 min',
        cookTime: '6 min'
    },
    {
        title: 'Peanut Butter Toast',
        cuisine: 'Continental',
        tags: ['vegetarian', 'vegan', 'breakfast', 'high-protein', 'quick'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['whole grain bread', 'peanut butter', 'banana (optional)', 'honey (optional)'],
        instructions: [
            'Toast bread slices until golden',
            'Spread generous amount of peanut butter',
            'Slice banana if using',
            'Layer banana slices on top',
            'Drizzle honey if desired',
            'Serve immediately',
            'Optional: add chia seeds or flax seeds'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '12g',
            'Carbs': '32g',
            'Fat': '14g',
            'Fiber': '6g'
        },
        prepTime: '3 min',
        cookTime: '2 min'
    },
    {
        title: 'Banana Pancakes',
        cuisine: 'Continental',
        tags: ['vegetarian', 'breakfast', 'balanced', 'quick'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['banana', 'eggs', 'baking powder', 'cinnamon', 'vanilla', 'butter', 'maple syrup'],
        instructions: [
            'Mash ripe banana',
            'Mix with eggs and baking powder',
            'Add cinnamon and vanilla',
            'Heat butter in pan',
            'Pour small amount of batter',
            'Cook until bubbles form',
            'Flip and cook until golden',
            'Serve with maple syrup'
        ],
        nutrition: {
            'Calories': '210',
            'Protein': '8g',
            'Carbs': '28g',
            'Fat': '7g',
            'Fiber': '3g'
        },
        prepTime: '5 min',
        cookTime: '10 min'
    },
    // Continental & Western
    {
        title: 'Veg Burger',
        cuisine: 'Continental',
        tags: ['vegetarian', 'comfort-food', 'balanced'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['burger bun', 'vegetable patty', 'lettuce', 'tomato', 'onion', 'cheese', 'mayonnaise'],
        instructions: [
            'Toast burger buns',
            'Grill or pan-fry vegetable patty',
            'Wash and dry lettuce leaves',
            'Slice vegetables thinly',
            'Assemble: bottom bun, patty, cheese',
            'Add vegetables and sauce',
            'Cover with top bun',
            'Serve with fries'
        ],
        nutrition: {
            'Calories': '380',
            'Protein': '14g',
            'Carbs': '48g',
            'Fat': '14g',
            'Fiber': '5g'
        },
        prepTime: '10 min',
        cookTime: '8 min'
    },
    {
        title: 'Spaghetti Aglio e Olio',
        cuisine: 'Italian',
        tags: ['vegetarian', 'vegan', 'quick', 'pasta'],
        healthCondition: ['high-carb', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['spaghetti', 'garlic', 'olive oil', 'red chili flakes', 'parsley', 'salt', 'pepper'],
        instructions: [
            'Cook spaghetti until al dente',
            'Heat olive oil in pan',
            'Add sliced garlic and cook until golden',
            'Add red chili flakes',
            'Add cooked pasta',
            'Toss well with oil',
            'Season with salt and pepper',
            'Garnish with fresh parsley'
        ],
        nutrition: {
            'Calories': '365',
            'Protein': '12g',
            'Carbs': '58g',
            'Fat': '10g',
            'Fiber': '3g'
        },
        prepTime: '5 min',
        cookTime: '12 min'
    },
    {
        title: 'Mac and Cheese',
        cuisine: 'Continental',
        tags: ['vegetarian', 'comfort-food', 'creamy'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['macaroni', 'cheddar cheese', 'butter', 'flour', 'milk', 'mustard powder', 'salt', 'pepper'],
        instructions: [
            'Cook macaroni until al dente',
            'Melt butter in pan',
            'Add flour to make roux',
            'Gradually add milk, whisking constantly',
            'Add shredded cheese',
            'Season with mustard, salt, pepper',
            'Add cooked pasta',
            'Mix well and serve hot'
        ],
        nutrition: {
            'Calories': '425',
            'Protein': '18g',
            'Carbs': '52g',
            'Fat': '16g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '20 min'
    },
    {
        title: 'Veg Lasagna',
        cuisine: 'Italian',
        tags: ['vegetarian', 'comfort-food', 'balanced', 'hearty'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['lasagna sheets', 'mozzarella cheese', 'ricotta cheese', 'spinach', 'mushrooms', 'marinara sauce', 'herbs'],
        instructions: [
            'Cook lasagna sheets until al dente',
            'Sauté vegetables',
            'Layer: sauce, pasta, vegetables, cheese',
            'Repeat layers',
            'Top with mozzarella',
            'Bake until golden and bubbly',
            'Let rest before cutting',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '385',
            'Protein': '22g',
            'Carbs': '45g',
            'Fat': '14g',
            'Fiber': '5g'
        },
        prepTime: '20 min',
        cookTime: '45 min'
    },
    {
        title: 'Garlic Bread',
        cuisine: 'Italian',
        tags: ['vegetarian', 'appetizer', 'quick'],
        healthCondition: ['moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['bread', 'butter', 'garlic', 'parsley', 'parmesan cheese', 'salt'],
        instructions: [
            'Preheat oven to 375°F',
            'Mix butter with minced garlic',
            'Add chopped parsley and salt',
            'Slice bread diagonally',
            'Spread garlic butter generously',
            'Sprinkle parmesan cheese',
            'Bake until golden and crispy',
            'Serve hot'
        ],
        nutrition: {
            'Calories': '185',
            'Protein': '5g',
            'Carbs': '22g',
            'Fat': '9g',
            'Fiber': '1g'
        },
        prepTime: '5 min',
        cookTime: '10 min'
    },
    {
        title: 'Veg Quesadilla',
        cuisine: 'Mexican',
        tags: ['vegetarian', 'quick', 'comfort-food'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['tortilla', 'cheese', 'bell peppers', 'onions', 'black beans', 'jalapeños', 'sour cream'],
        instructions: [
            'Heat tortilla in pan',
            'Add grated cheese on one half',
            'Top with vegetables and beans',
            'Add jalapeños if desired',
            'Fold tortilla in half',
            'Cook until cheese melts',
            'Flip and cook until golden',
            'Cut and serve with sour cream'
        ],
        nutrition: {
            'Calories': '315',
            'Protein': '14g',
            'Carbs': '35g',
            'Fat': '12g',
            'Fiber': '5g'
        },
        prepTime: '10 min',
        cookTime: '8 min'
    },
    // Healthy & Diet Meals
    {
        title: 'Quinoa Salad',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-protein', 'gluten-free', 'low-fat'],
        healthCondition: ['high-protein', 'low-fat', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['quinoa', 'cucumber', 'tomatoes', 'bell peppers', 'black beans', 'lemon juice', 'olive oil', 'herbs'],
        instructions: [
            'Cook quinoa until fluffy',
            'Let quinoa cool completely',
            'Chop all vegetables',
            'Mix quinoa with vegetables',
            'Add beans and herbs',
            'Dress with lemon and olive oil',
            'Season with salt and pepper',
            'Chill and serve'
        ],
        nutrition: {
            'Calories': '235',
            'Protein': '10g',
            'Carbs': '38g',
            'Fat': '6g',
            'Fiber': '5g'
        },
        prepTime: '15 min',
        cookTime: '15 min'
    },
    {
        title: 'Chickpea Salad',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-protein', 'high-fiber', 'gluten-free'],
        healthCondition: ['high-protein', 'high-fiber', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['chickpeas', 'red onions', 'cucumber', 'tomatoes', 'feta cheese', 'olive oil', 'lemon juice', 'herbs'],
        instructions: [
            'Drain and rinse chickpeas',
            'Chop vegetables finely',
            'Mix chickpeas with vegetables',
            'Add crumbled feta',
            'Dress with olive oil and lemon',
            'Add fresh herbs',
            'Season and toss',
            'Serve chilled'
        ],
        nutrition: {
            'Calories': '265',
            'Protein': '14g',
            'Carbs': '32g',
            'Fat': '9g',
            'Fiber': '12g'
        },
        prepTime: '15 min',
        cookTime: '0 min'
    },
    {
        title: 'Grilled Tofu Bowl',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-protein', 'low-fat'],
        healthCondition: ['high-protein', 'low-fat', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['firm tofu', 'brown rice', 'broccoli', 'carrots', 'bell peppers', 'soy sauce', 'sesame oil'],
        instructions: [
            'Press tofu to remove water',
            'Cut tofu into cubes',
            'Marinate in soy sauce',
            'Grill tofu until golden',
            'Cook brown rice',
            'Steam vegetables',
            'Assemble bowl with rice and vegetables',
            'Top with grilled tofu'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '18g',
            'Carbs': '38g',
            'Fat': '7g',
            'Fiber': '8g'
        },
        prepTime: '20 min',
        cookTime: '25 min'
    },
    {
        title: 'Brown Rice with Veggies',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'gluten-free', 'balanced'],
        healthCondition: ['high-fiber', 'low-fat', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['brown rice', 'vegetables', 'garlic', 'ginger', 'soy sauce', 'sesame oil', 'herbs'],
        instructions: [
            'Cook brown rice until tender',
            'Heat oil in wok',
            'Add minced garlic and ginger',
            'Stir-fry vegetables until crisp-tender',
            'Add cooked rice',
            'Season with soy sauce',
            'Toss everything together',
            'Garnish with herbs and serve'
        ],
        nutrition: {
            'Calories': '225',
            'Protein': '6g',
            'Carbs': '42g',
            'Fat': '4g',
            'Fiber': '4g'
        },
        prepTime: '15 min',
        cookTime: '30 min'
    },
    {
        title: 'Oats Smoothie Bowl',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'breakfast', 'quick'],
        healthCondition: ['high-fiber', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['oats', 'banana', 'berries', 'almond milk', 'nuts', 'seeds', 'honey'],
        instructions: [
            'Blend oats, banana, and milk',
            'Make smooth, thick consistency',
            'Pour into bowl',
            'Top with fresh berries',
            'Add nuts and seeds',
            'Drizzle honey',
            'Add granola if desired',
            'Serve immediately'
        ],
        nutrition: {
            'Calories': '320',
            'Protein': '10g',
            'Carbs': '55g',
            'Fat': '8g',
            'Fiber': '8g'
        },
        prepTime: '5 min',
        cookTime: '2 min'
    },
    {
        title: 'Cucumber Detox Salad',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'detox'],
        healthCondition: ['low-calorie', 'low-fat'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['cucumber', 'tomatoes', 'onions', 'lemon juice', 'mint leaves', 'salt', 'pepper', 'cumin'],
        instructions: [
            'Chop cucumber into bite-sized pieces',
            'Dice tomatoes and onions',
            'Mix all vegetables',
            'Add freshly squeezed lemon juice',
            'Add chopped mint leaves',
            'Season with salt and pepper',
            'Add a pinch of roasted cumin',
            'Toss and serve chilled'
        ],
        nutrition: {
            'Calories': '45',
            'Protein': '2g',
            'Carbs': '10g',
            'Fat': '0g',
            'Fiber': '3g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    {
        title: 'Stir-Fried Vegetables',
        cuisine: 'Asian',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'quick'],
        healthCondition: ['low-calorie', 'low-fat', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['mixed vegetables', 'garlic', 'ginger', 'soy sauce', 'sesame oil', 'cornstarch', 'salt'],
        instructions: [
            'Cut vegetables into uniform pieces',
            'Heat oil in wok',
            'Add minced garlic and ginger',
            'Add hard vegetables first',
            'Stir-fry on high heat',
            'Add leafy vegetables last',
            'Season with soy sauce',
            'Serve hot over rice'
        ],
        nutrition: {
            'Calories': '95',
            'Protein': '4g',
            'Carbs': '14g',
            'Fat': '3g',
            'Fiber': '5g'
        },
        prepTime: '10 min',
        cookTime: '10 min'
    },
    {
        title: 'Steamed Broccoli Bowl',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'low-calorie', 'gluten-free', 'detox'],
        healthCondition: ['low-calorie', 'low-fat', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['broccoli', 'carrots', 'cauliflower', 'olive oil', 'lemon juice', 'salt', 'pepper', 'herbs'],
        instructions: [
            'Cut vegetables into florets',
            'Steam for 5-7 minutes',
            'Keep crisp-tender texture',
            'Drain well',
            'Dress with olive oil',
            'Add lemon juice',
            'Season with salt and pepper',
            'Garnish with fresh herbs'
        ],
        nutrition: {
            'Calories': '85',
            'Protein': '5g',
            'Carbs': '12g',
            'Fat': '3g',
            'Fiber': '6g'
        },
        prepTime: '10 min',
        cookTime: '8 min'
    },
    {
        title: 'Protein-Packed Wrap',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'high-protein', 'quick', 'balanced'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['whole wheat tortilla', 'hummus', 'grilled chicken/tofu', 'vegetables', 'avocado', 'cheese'],
        instructions: [
            'Heat tortilla slightly',
            'Spread hummus evenly',
            'Add protein source',
            'Layer fresh vegetables',
            'Add avocado slices',
            'Sprinkle cheese',
            'Roll tightly',
            'Cut in half and serve'
        ],
        nutrition: {
            'Calories': '345',
            'Protein': '22g',
            'Carbs': '35g',
            'Fat': '12g',
            'Fiber': '8g'
        },
        prepTime: '10 min',
        cookTime: '5 min'
    },
    // South Indian Specials
    {
        title: 'Pongal',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'breakfast', 'gluten-free', 'comfort-food'],
        healthCondition: ['high-carb', 'balanced'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['rice', 'moong dal', 'ginger', 'pepper', 'cumin', 'ghee', 'cashews', 'curry leaves'],
        instructions: [
            'Cook rice and dal together',
            'Heat ghee and temper spices',
            'Add curry leaves and ginger',
            'Add cashews and roast',
            'Add cooked rice-dal mixture',
            'Mash slightly',
            'Season with salt and pepper',
            'Serve hot with chutney'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '8g',
            'Carbs': '48g',
            'Fat': '7g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '25 min'
    },
    {
        title: 'Lemon Rice',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'quick', 'gluten-free'],
        healthCondition: ['high-carb', 'quick-energy'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['cooked rice', 'lemon juice', 'mustard seeds', 'chana dal', 'urad dal', 'peanuts', 'turmeric', 'curry leaves'],
        instructions: [
            'Use cooked and cooled rice',
            'Heat oil and temper mustard seeds',
            'Add dals and peanuts',
            'Roast until golden',
            'Add curry leaves and turmeric',
            'Mix with rice',
            'Add lemon juice',
            'Season and serve'
        ],
        nutrition: {
            'Calories': '245',
            'Protein': '6g',
            'Carbs': '45g',
            'Fat': '5g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '5 min'
    },
    {
        title: 'Curd Rice',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'breakfast', 'gluten-free', 'probiotic'],
        healthCondition: ['balanced', 'easy-digest'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['cooked rice', 'yogurt', 'tempering spices', 'grapes', 'pomegranate', 'grated carrot', 'salt'],
        instructions: [
            'Cool cooked rice completely',
            'Mix with fresh yogurt',
            'Add salt to taste',
            'Add chopped fruits',
            'Prepare tempering with spices',
            'Mix everything gently',
            'Let stand for 10 minutes',
            'Serve chilled or at room temperature'
        ],
        nutrition: {
            'Calories': '195',
            'Protein': '6g',
            'Carbs': '36g',
            'Fat': '3g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '5 min'
    },
    {
        title: 'Tomato Rasam',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'soup', 'gluten-free', 'healing'],
        healthCondition: ['low-calorie', 'anti-inflammatory'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['tomatoes', 'tamarind', 'rasam powder', 'garlic', 'curry leaves', 'mustard seeds', 'coriander leaves'],
        instructions: [
            'Boil tomatoes until soft',
            'Mash tomatoes well',
            'Extract tamarind juice',
            'Mix tomato and tamarind',
            'Add rasam powder and salt',
            'Boil until frothy',
            'Temper with mustard and curry leaves',
            'Garnish with coriander'
        ],
        nutrition: {
            'Calories': '45',
            'Protein': '2g',
            'Carbs': '10g',
            'Fat': '1g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Vegetable Kurma',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'creamy', 'gluten-free', 'balanced'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['mixed vegetables', 'onions', 'tomatoes', 'cashews', 'coconut', 'yogurt', 'spices', 'curry leaves'],
        instructions: [
            'Cook vegetables until tender',
            'Sauté onions and tomatoes',
            'Grind cashews and coconut',
            'Add to vegetables',
            'Simmer until creamy',
            'Add yogurt gradually',
            'Season with spices',
            'Garnish and serve with rice or dosa'
        ],
        nutrition: {
            'Calories': '185',
            'Protein': '5g',
            'Carbs': '22g',
            'Fat': '8g',
            'Fiber': '4g'
        },
        prepTime: '15 min',
        cookTime: '20 min'
    },
    {
        title: 'Appam with Stew',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'breakfast', 'gluten-free'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['rice', 'fermented batter', 'coconut milk', 'vegetables', 'onions', 'coconut', 'spices', 'curry leaves'],
        instructions: [
            'Prepare appam batter',
            'Ferment overnight',
            'Cook appam in appam pan',
            'Sauté onions and spices for stew',
            'Add vegetables and cook',
            'Add coconut milk',
            'Simmer until creamy',
            'Serve hot appam with stew'
        ],
        nutrition: {
            'Calories': '245',
            'Protein': '6g',
            'Carbs': '42g',
            'Fat': '8g',
            'Fiber': '3g'
        },
        prepTime: '20 min',
        cookTime: '25 min'
    },
    {
        title: 'Vegetable Uttapam',
        cuisine: 'South Indian',
        tags: ['vegetarian', 'vegan', 'breakfast', 'gluten-free'],
        healthCondition: ['balanced', 'moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['dosa batter', 'onions', 'tomatoes', 'green chilies', 'carrots', 'bell peppers', 'carom seeds'],
        instructions: [
            'Use fermented dosa batter',
            'Chop vegetables finely',
            'Heat tawa or pan',
            'Pour ladleful of batter',
            'Top with vegetables',
            'Drizzle oil around edges',
            'Cook until base is crispy',
            'Flip and cook other side'
        ],
        nutrition: {
            'Calories': '185',
            'Protein': '5g',
            'Carbs': '32g',
            'Fat': '5g',
            'Fiber': '3g'
        },
        prepTime: '10 min',
        cookTime: '8 min'
    },
    // Snacks & Sides
    {
        title: 'Bhel Puri',
        cuisine: 'Indian Street Food',
        tags: ['vegetarian', 'vegan', 'crispy', 'snack', 'quick'],
        healthCondition: ['moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['puffed rice', 'onions', 'tomatoes', 'green chilies', 'tamarind chutney', 'coriander chutney', 'sev', 'lemon'],
        instructions: [
            'Mix puffed rice in large bowl',
            'Add chopped vegetables',
            'Add both chutneys',
            'Add sev for crunch',
            'Squeeze fresh lemon juice',
            'Toss everything together',
            'Serve immediately',
            'Garnish with coriander'
        ],
        nutrition: {
            'Calories': '185',
            'Protein': '4g',
            'Carbs': '32g',
            'Fat': '5g',
            'Fiber': '3g'
        },
        prepTime: '10 min',
        cookTime: '0 min'
    },
    {
        title: 'Samosa',
        cuisine: 'Indian',
        tags: ['vegetarian', 'snack', 'fried', 'comfort-food'],
        healthCondition: ['high-carb', 'moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['all-purpose flour', 'potatoes', 'peas', 'spices', 'cumin seeds', 'green chilies', 'oil for frying'],
        instructions: [
            'Make dough with flour and oil',
            'Boil and mash potatoes',
            'Sauté spices and peas',
            'Mix with mashed potatoes',
            'Roll dough and fill',
            'Seal in triangular shape',
            'Deep fry until golden',
            'Serve hot with chutney'
        ],
        nutrition: {
            'Calories': '265',
            'Protein': '5g',
            'Carbs': '35g',
            'Fat': '12g',
            'Fiber': '4g'
        },
        prepTime: '20 min',
        cookTime: '15 min'
    },
    {
        title: 'Dhokla',
        cuisine: 'Gujarati',
        tags: ['vegetarian', 'vegan', 'steamed', 'snack', 'gluten-free'],
        healthCondition: ['low-fat', 'high-protein'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['gram flour', 'semolina', 'yogurt', 'salt', 'sugar', 'green chilies', 'ginger', 'mustard seeds'],
        instructions: [
            'Mix besan and semolina',
            'Add yogurt to make batter',
            'Add spices and sweetener',
            'Let batter ferment',
            'Steam in dhokla plates',
            'Temper with mustard seeds',
            'Garnish with coriander',
            'Cut and serve'
        ],
        nutrition: {
            'Calories': '125',
            'Protein': '6g',
            'Carbs': '22g',
            'Fat': '2g',
            'Fiber': '3g'
        },
        prepTime: '15 min',
        cookTime: '15 min'
    },
    {
        title: 'Aloo Tikki',
        cuisine: 'Indian Street Food',
        tags: ['vegetarian', 'vegan', 'snack', 'fried'],
        healthCondition: ['high-carb', 'moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['potatoes', 'bread crumbs', 'spices', 'green chilies', 'coriander leaves', 'oil for frying'],
        instructions: [
            'Boil and mash potatoes',
            'Add spices and chilies',
            'Mix bread crumbs',
            'Shape into round tikkis',
            'Heat oil in pan',
            'Shallow fry until golden',
            'Flip and cook other side',
            'Serve with chutney'
        ],
        nutrition: {
            'Calories': '195',
            'Protein': '4g',
            'Carbs': '28g',
            'Fat': '8g',
            'Fiber': '3g'
        },
        prepTime: '20 min',
        cookTime: '15 min'
    },
    {
        title: 'Hummus with Pita',
        cuisine: 'Mediterranean',
        tags: ['vegetarian', 'vegan', 'high-protein', 'gluten-free'],
        healthCondition: ['high-protein', 'high-fiber'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['chickpeas', 'tahini', 'lemon juice', 'garlic', 'olive oil', 'pita bread', 'paprika', 'cumin'],
        instructions: [
            'Soak and cook chickpeas',
            'Blend chickpeas until smooth',
            'Add tahini and lemon juice',
            'Add minced garlic',
            'Drizzle olive oil',
            'Season with cumin and salt',
            'Toast pita bread',
            'Serve with hummus and olive oil'
        ],
        nutrition: {
            'Calories': '225',
            'Protein': '8g',
            'Carbs': '28g',
            'Fat': '9g',
            'Fiber': '8g'
        },
        prepTime: '20 min',
        cookTime: '5 min'
    },
    {
        title: 'Corn Chaat',
        cuisine: 'Indian Street Food',
        tags: ['vegetarian', 'vegan', 'snack', 'quick', 'gluten-free'],
        healthCondition: ['moderate-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['corn kernels', 'onions', 'tomatoes', 'green chilies', 'chaat masala', 'lemon juice', 'herbs'],
        instructions: [
            'Boil corn until tender',
            'Drain and cool',
            'Mix with chopped vegetables',
            'Add chaat masala',
            'Squeeze fresh lemon',
            'Garnish with herbs',
            'Serve chilled',
            'Optional: add sev'
        ],
        nutrition: {
            'Calories': '145',
            'Protein': '4g',
            'Carbs': '32g',
            'Fat': '2g',
            'Fiber': '4g'
        },
        prepTime: '10 min',
        cookTime: '10 min'
    },
    {
        title: 'Masala Papad',
        cuisine: 'Indian',
        tags: ['vegetarian', 'vegan', 'snack', 'gluten-free', 'quick'],
        healthCondition: ['low-calorie'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['papad', 'onions', 'tomatoes', 'coriander', 'chaat masala', 'lemon juice', 'cumin powder'],
        instructions: [
            'Deep fry or roast papad',
            'Chop vegetables finely',
            'Mix with spices',
            'Add lemon juice',
            'Spread mixture on papad',
            'Garnish with coriander',
            'Serve immediately',
            'Cut into pieces if desired'
        ],
        nutrition: {
            'Calories': '65',
            'Protein': '3g',
            'Carbs': '10g',
            'Fat': '2g',
            'Fiber': '2g'
        },
        prepTime: '5 min',
        cookTime: '2 min'
    },
    // Desserts
    {
        title: 'Fruit Custard',
        cuisine: 'Dessert',
        tags: ['vegetarian', 'dessert', 'sweet'],
        healthCondition: ['moderate-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['custard powder', 'milk', 'sugar', 'assorted fruits', 'nuts', 'vanilla extract'],
        instructions: [
            'Dissolve custard powder in milk',
            'Boil remaining milk with sugar',
            'Add custard mixture gradually',
            'Stir continuously until thick',
            'Let cool completely',
            'Add chopped fruits',
            'Mix gently',
            'Chill and serve'
        ],
        nutrition: {
            'Calories': '220',
            'Protein': '6g',
            'Carbs': '38g',
            'Fat': '6g',
            'Fiber': '2g'
        },
        prepTime: '10 min',
        cookTime: '15 min'
    },
    {
        title: 'Gajar ka Halwa',
        cuisine: 'Indian Dessert',
        tags: ['vegetarian', 'dessert', 'sweet', 'comfort-food'],
        healthCondition: ['high-calorie', 'sweet'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['carrots', 'milk', 'ghee', 'sugar', 'cardamom', 'nuts', 'raisins'],
        instructions: [
            'Grate carrots finely',
            'Cook in ghee until soft',
            'Add milk and simmer',
            'Cook until milk reduces',
            'Add sugar and stir',
            'Add cardamom powder',
            'Garnish with nuts and raisins',
            'Serve warm'
        ],
        nutrition: {
            'Calories': '285',
            'Protein': '6g',
            'Carbs': '42g',
            'Fat': '12g',
            'Fiber': '3g'
        },
        prepTime: '15 min',
        cookTime: '45 min'
    },
    {
        title: 'Rice Kheer',
        cuisine: 'Indian Dessert',
        tags: ['vegetarian', 'dessert', 'comfort-food', 'sweet'],
        healthCondition: ['high-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['rice', 'milk', 'sugar', 'cardamom', 'nuts', 'saffron', 'ghee'],
        instructions: [
            'Soak rice for 30 minutes',
            'Boil milk in heavy bottom pan',
            'Add rice and cook until soft',
            'Keep stirring frequently',
            'Add sugar',
            'Add cardamom and saffron',
            'Garnish with nuts',
            'Serve warm or chilled'
        ],
        nutrition: {
            'Calories': '265',
            'Protein': '7g',
            'Carbs': '42g',
            'Fat': '8g',
            'Fiber': '1g'
        },
        prepTime: '10 min',
        cookTime: '40 min'
    },
    {
        title: 'Rasmalai',
        cuisine: 'Indian Dessert',
        tags: ['vegetarian', 'dessert', 'sweet', 'rich'],
        healthCondition: ['high-calorie'],
        dietaryPreference: ['vegetarian'],
        ingredients: ['chenna', 'milk', 'sugar', 'cardamom', 'pistachios', 'saffron'],
        instructions: [
            'Knead chenna until smooth',
            'Make small flat discs',
            'Cook in sugar syrup',
            'Heat milk and reduce slightly',
            'Add cardamom and saffron',
            'Cool milk completely',
            'Dunk chenna discs in milk',
            'Garnish with nuts and serve chilled'
        ],
        nutrition: {
            'Calories': '225',
            'Protein': '8g',
            'Carbs': '32g',
            'Fat': '7g',
            'Fiber': '0g'
        },
        prepTime: '30 min',
        cookTime: '25 min'
    },
    {
        title: 'Mango Smoothie',
        cuisine: 'Drinks',
        tags: ['vegetarian', 'vegan', 'healthy', 'smoothie', 'quick'],
        healthCondition: ['balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['mango', 'yogurt/milk', 'honey', 'ice', 'cardamom'],
        instructions: [
            'Peel and chop ripe mango',
            'Blend mango until smooth',
            'Add yogurt or milk',
            'Add honey for sweetness',
            'Add ice cubes',
            'Blend until frothy',
            'Add pinch of cardamom',
            'Serve chilled'
        ],
        nutrition: {
            'Calories': '180',
            'Protein': '5g',
            'Carbs': '38g',
            'Fat': '3g',
            'Fiber': '3g'
        },
        prepTime: '5 min',
        cookTime: '2 min'
    },
    {
        title: 'Chia Pudding',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-fiber', 'gluten-free', 'breakfast'],
        healthCondition: ['high-fiber', 'high-protein'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['chia seeds', 'almond milk', 'honey/maple syrup', 'vanilla', 'fruits', 'nuts'],
        instructions: [
            'Mix chia seeds with milk',
            'Add sweetener and vanilla',
            'Stir well and let sit',
            'Refrigerate overnight',
            'Top with fresh fruits',
            'Add nuts and seeds',
            'Drizzle with honey',
            'Serve chilled'
        ],
        nutrition: {
            'Calories': '185',
            'Protein': '6g',
            'Carbs': '22g',
            'Fat': '8g',
            'Fiber': '10g'
        },
        prepTime: '5 min',
        cookTime: '0 min (overnight)'
    },
    {
        title: 'Oats Energy Bar',
        cuisine: 'Healthy',
        tags: ['vegetarian', 'vegan', 'high-protein', 'snack', 'meal-prep'],
        healthCondition: ['high-protein', 'balanced'],
        dietaryPreference: ['vegetarian', 'vegan'],
        ingredients: ['oats', 'nuts', 'dates', 'honey', 'peanut butter', 'chia seeds', 'cocoa powder'],
        instructions: [
            'Mix oats and chopped nuts',
            'Blend dates to make paste',
            'Warm honey and peanut butter',
            'Mix everything together',
            'Add chia seeds and cocoa',
            'Press into baking dish',
            'Refrigerate until firm',
            'Cut into bars'
        ],
        nutrition: {
            'Calories': '245',
            'Protein': '8g',
            'Carbs': '32g',
            'Fat': '10g',
            'Fiber': '6g'
        },
        prepTime: '15 min',
        cookTime: '0 min (chill)'
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

