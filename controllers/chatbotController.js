// ChatGPT Controller for AI Chatbot
// Ensure dotenv is loaded
if (!process.env.OPENAI_API_KEY) {
    try {
        require('dotenv').config();
    } catch (e) {
        // dotenv might already be loaded by server.js
    }
}

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Helper function to get environment-aware error message
const getApiKeyErrorMessage = () => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    if (isProduction) {
        return 'OpenAI API key not configured. Please add OPENAI_API_KEY as an environment variable in your Render dashboard (Settings > Environment Variables).';
    } else {
        return 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file and restart the server.';
    }
};

// Initialize OpenAI client
let cachedOpenAI = null;

const getOpenAI = () => {
    if (cachedOpenAI) {
        return cachedOpenAI;
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        console.error('[ChatGPT] API key not found in process.env.OPENAI_API_KEY');
        throw new Error(getApiKeyErrorMessage());
    }
    
    if (apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
        console.error('[ChatGPT] API key is placeholder or empty');
        throw new Error(getApiKeyErrorMessage());
    }
    
    console.log(`[ChatGPT] Initializing with API key: ${apiKey.substring(0, 10)}...`);
    
    try {
        cachedOpenAI = new OpenAI({ apiKey });
        console.log('[ChatGPT] OpenAI client created successfully');
        return cachedOpenAI;
    } catch (error) {
        console.error('[ChatGPT] Failed to create OpenAI client:', error.message);
        throw new Error(`Failed to initialize OpenAI: ${error.message}`);
    }
};

// Build user context from profile and data
const buildUserContext = (userProfile, activities = [], meals = []) => {
    let context = '';
    
    if (userProfile) {
        context += `User Profile:\n`;
        if (userProfile.name) context += `- Name: ${userProfile.name}\n`;
        if (userProfile.age) context += `- Age: ${userProfile.age}\n`;
        if (userProfile.gender) context += `- Gender: ${userProfile.gender}\n`;
        if (userProfile.weight) context += `- Weight: ${userProfile.weight} kg\n`;
        if (userProfile.height) context += `- Height: ${userProfile.height} cm\n`;
        if (userProfile.bmi) context += `- BMI: ${userProfile.bmi}\n`;
        if (userProfile.goalType) context += `- Goal: ${userProfile.goalType}\n`;
        if (userProfile.diseases && userProfile.diseases.length > 0) {
            context += `- Health Conditions: ${userProfile.diseases.join(', ')}\n`;
        }
        if (userProfile.allergies && userProfile.allergies.length > 0) {
            context += `- Allergies: ${userProfile.allergies.join(', ')}\n`;
        }
        if (userProfile.dietaryPreference) {
            context += `- Dietary Preference: ${userProfile.dietaryPreference}\n`;
        }
        if (userProfile.bloodReports) {
            context += `- Previous Blood Reports: ${userProfile.bloodReports}\n`;
        }
        if (userProfile.caloricGoal) {
            context += `- Daily Caloric Goal: ${userProfile.caloricGoal} kcal\n`;
        }
        if (userProfile.macroSplit) {
            context += `- Macro Split: Carbs ${userProfile.macroSplit.carbs}%, Protein ${userProfile.macroSplit.protein}%, Fats ${userProfile.macroSplit.fats}%\n`;
        }
    }
    
    // Add activity context
    if (activities && activities.length > 0) {
        const recentActivities = activities.slice(-10);
        const totalCalories = recentActivities.reduce((sum, a) => sum + (a.calories || 0), 0);
        const avgDuration = recentActivities.reduce((sum, a) => sum + (a.duration || 0), 0) / recentActivities.length;
        context += `\nRecent Activities (last ${recentActivities.length}):\n`;
        context += `- Total calories burned: ${totalCalories} kcal\n`;
        context += `- Average duration: ${Math.round(avgDuration)} minutes\n`;
        context += `- Activity types: ${[...new Set(recentActivities.map(a => a.type))].join(', ')}\n`;
    }
    
    // Add meal context
    if (meals && meals.length > 0) {
        const recentMeals = meals.slice(-10);
        const totalCalories = recentMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const avgProtein = recentMeals.reduce((sum, m) => sum + (m.protein || 0), 0) / recentMeals.length;
        context += `\nRecent Meals (last ${recentMeals.length}):\n`;
        context += `- Total calories consumed: ${totalCalories} kcal\n`;
        context += `- Average protein: ${Math.round(avgProtein)}g\n`;
        context += `- Meal types: ${[...new Set(recentMeals.map(m => m.type))].join(', ')}\n`;
    }
    
    return context;
};

// FAQ data
const FAQ_DATA = [
    {
        question: "How do I log a meal?",
        answer: "Go to the Meal Log page, enter your food item, select meal type (breakfast/lunch/dinner/snack), enter quantity and nutritional information. The system can auto-fill nutrition data from the database or API."
    },
    {
        question: "How do I track activities?",
        answer: "Navigate to Activity Tracker, select activity type, enter duration, and calories will auto-calculate. You can also use AI recommendations for personalized activity suggestions."
    },
    {
        question: "How do I generate recipes?",
        answer: "Go to Recipe Generator, enter ingredients you have or a recipe name. The AI will generate personalized recipes based on your health profile, allergies, and dietary preferences."
    },
    {
        question: "What is the difference between Free and Pro?",
        answer: "Free tier includes basic tracking features. Pro tier includes advanced AI recommendations, detailed analytics, personalized meal plans, and priority support."
    },
    {
        question: "How do I update my profile?",
        answer: "Go to Profile page, update your information including health conditions, allergies, goals, and preferences. Changes are saved automatically."
    },
    {
        question: "Can I upload my medical reports?",
        answer: "Yes! Use the chatbot's report upload feature to analyze your blood tests, medical reports, or health documents. The AI will provide personalized insights and recommendations."
    },
    {
        question: "How are diet plans generated?",
        answer: "Diet plans are AI-generated based on your health profile, medical reports, activity levels, goals, and dietary preferences. They include beneficial foods, foods to avoid, and supplement recommendations."
    },
    {
        question: "What data does the chatbot have access to?",
        answer: "The chatbot has access to your profile (age, weight, health conditions, allergies), recent activities, meal logs, and any reports you upload. This helps provide personalized recommendations."
    }
];

// @desc    Chat with ChatGPT (Report Analysis Chatbot)
// @route   POST /api/chatbot/chat
// @access  Public
const chatWithBot = async (req, res) => {
    try {
        const { message, conversationHistory = [], userProfile, activities = [], meals = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Check if API key is configured
        let openai;
        try {
            openai = getOpenAI();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Build system prompt with user context - Focused on report analysis
        const userContext = buildUserContext(userProfile, activities, meals);
        
        const systemPrompt = `You are VitaTrackr Report Analysis AI, a specialized health assistant focused on analyzing medical reports and creating diet plans. You help users with:
- Analyzing medical and health reports
- Creating personalized diet plans based on reports
- Recommending beneficial foods for specific health conditions
- Suggesting foods to avoid or limit
- Recommending supplements based on report findings
- Suggesting further medical tests

${userContext ? `\nUser Context:\n${userContext}\n` : ''}

Guidelines:
- Focus on report analysis and diet planning
- Be specific about food recommendations based on report findings
- Always prioritize health and safety
- If you don't know something, admit it and suggest consulting a healthcare professional
- Keep responses concise but informative
- Reference specific report values when available`;

        // Build conversation messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            if (msg.role && msg.content) {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        });

        // Add current message
        messages.push({ role: 'user', content: message });

        console.log('[ChatGPT] Sending chat request...');
        
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        });

        const response = completion.choices[0].message.content;

        console.log('[ChatGPT] Chat response received');

        res.json({
            success: true,
            data: {
                response: response,
                model: completion.model,
                usage: completion.usage
            }
        });
    } catch (error) {
        console.error('[ChatGPT Chat Error]', {
            message: error.message,
            stack: error.stack
        });

        let errorMessage = 'Failed to get response from ChatGPT';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        }

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Get FAQ answers
// @route   GET /api/chatbot/faq
// @access  Public
const getFAQ = async (req, res) => {
    try {
        res.json({
            success: true,
            data: FAQ_DATA
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Analyze uploaded report and generate summary + diet plan
// @route   POST /api/chatbot/analyze-report
// @access  Public
const analyzeReport = async (req, res) => {
    try {
        const { reportText, userProfile, activities = [], meals = [] } = req.body;

        if (!reportText || reportText.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Report text is required'
            });
        }

        // Check if API key is configured
        let openai;
        try {
            openai = getOpenAI();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        const userContext = buildUserContext(userProfile, activities, meals);

        // Build prompt for report analysis
        const prompt = `You are a health and nutrition AI assistant analyzing a medical/health report.

${userContext ? `User Context:\n${userContext}\n` : ''}

Report to Analyze:
${reportText}

Please provide a comprehensive analysis in the following JSON format:
{
    "summary": "A 3-4 line summary of the key findings from the report",
    "dietPlan": {
        "description": "A personalized diet plan based on the report findings and user profile",
        "beneficialFoods": [
            {"food": "Food name", "reason": "Why it's beneficial"},
            ...
        ],
        "foodsToAvoid": [
            {"food": "Food name", "reason": "Why to avoid/limit"},
            ...
        ],
        "supplements": [
            {"supplement": "Supplement name", "dosage": "Recommended dosage", "reason": "Why recommended based on report"},
            ...
        ],
        "furtherTests": [
            {"test": "Test name", "reason": "Why this test is recommended"},
            ...
        ]
    }
}

Important:
- Base recommendations on the actual report values and findings
- Consider the user's existing health conditions, allergies, and dietary preferences
- Consider their recent meal logs and activity patterns
- Be specific and actionable
- Ensure recommendations are safe and evidence-based
- If report values are normal, still provide general health recommendations
- Return ONLY valid JSON, no markdown formatting`;

        console.log('[ChatGPT] Analyzing report...');

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a health and nutrition AI assistant. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3, // Lower temperature for more consistent analysis
            max_tokens: 2000
        });

        let analysisText = completion.choices[0].message.content.trim();

        // Clean up response (remove markdown code blocks if present)
        if (analysisText.startsWith('```json')) {
            analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (analysisText.startsWith('```')) {
            analysisText = analysisText.replace(/```\n?/g, '');
        }

        const analysis = JSON.parse(analysisText);

        console.log('[ChatGPT] Report analysis completed');

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('[ChatGPT Report Analysis Error]', {
            message: error.message,
            stack: error.stack
        });

        let errorMessage = 'Failed to analyze report';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Failed to parse analysis. Please try again.';
        }

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Generate diet plan table
// @route   POST /api/chatbot/diet-plan
// @access  Public
const generateDietPlan = async (req, res) => {
    try {
        const { reportAnalysis, userProfile, activities = [], meals = [] } = req.body;

        // Check if API key is configured
        let openai;
        try {
            openai = getOpenAI();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        const userContext = buildUserContext(userProfile, activities, meals);

        const prompt = `Based on the following report analysis and user profile, generate a comprehensive diet plan table.

${userContext ? `User Context:\n${userContext}\n` : ''}

${reportAnalysis ? `Report Analysis:\n${typeof reportAnalysis === 'string' ? reportAnalysis : JSON.stringify(reportAnalysis, null, 2)}\n` : ''}

Generate a detailed diet plan in JSON format:
{
    "summary": "Brief 2-3 line summary of the diet plan",
    "beneficialFoods": [
        {
            "category": "Fruits",
            "items": [
                {"name": "Food name", "benefits": "Specific benefits", "serving": "Recommended serving size"}
            ]
        },
        {
            "category": "Vegetables",
            "items": [...]
        },
        {
            "category": "Proteins",
            "items": [...]
        },
        {
            "category": "Grains",
            "items": [...]
        },
        {
            "category": "Dairy/Alternatives",
            "items": [...]
        },
        {
            "category": "Nuts & Seeds",
            "items": [...]
        }
    ],
    "foodsToAvoid": [
        {"food": "Food name", "reason": "Why to avoid/limit", "alternative": "Healthier alternative if available"}
    ],
    "supplements": [
        {"name": "Supplement name", "dosage": "Recommended dosage", "timing": "When to take", "reason": "Why recommended based on report and diet"}
    ],
    "furtherTests": [
        {"test": "Test name", "frequency": "How often", "reason": "Why recommended"}
    ],
    "mealSuggestions": {
        "breakfast": ["Meal suggestion 1", "Meal suggestion 2", "Meal suggestion 3"],
        "lunch": ["Meal suggestion 1", "Meal suggestion 2", "Meal suggestion 3"],
        "dinner": ["Meal suggestion 1", "Meal suggestion 2", "Meal suggestion 3"],
        "snacks": ["Snack suggestion 1", "Snack suggestion 2"]
    }
}

Return ONLY valid JSON, no markdown formatting.`;

        console.log('[ChatGPT] Generating diet plan...');

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a nutritionist AI. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2500
        });

        let planText = completion.choices[0].message.content.trim();

        // Clean up response
        if (planText.startsWith('```json')) {
            planText = planText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (planText.startsWith('```')) {
            planText = planText.replace(/```\n?/g, '');
        }

        const dietPlan = JSON.parse(planText);

        console.log('[ChatGPT] Diet plan generated');

        res.json({
            success: true,
            data: dietPlan
        });
    } catch (error) {
        console.error('[ChatGPT Diet Plan Error]', {
            message: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate diet plan'
        });
    }
};

// @desc    Customer Support Chat with ChatGPT
// @route   POST /api/chatbot/support-chat
// @access  Public
const supportChat = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Check if API key is configured
        let openai;
        try {
            openai = getOpenAI();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        // Build system prompt for customer support
        const systemPrompt = `You are VitaTrackr Customer Support AI, a helpful assistant that helps users understand and use the VitaTrackr website. You help with:
- Explaining how to use different features of the website
- Answering questions about navigation and functionality
- Providing guidance on meal logging, activity tracking, recipe generation
- Explaining the difference between Free and Pro subscriptions
- Helping with profile setup
- General questions about the website

Guidelines:
- Be friendly, professional, and helpful
- Focus on website functionality and features
- Provide step-by-step instructions when needed
- Reference specific pages and features by name
- Keep responses concise and clear
- If asked about health advice, redirect to the Report Analysis feature
- Use emojis sparingly for better readability`;

        // Build conversation messages
        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            if (msg.role && msg.content) {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        });

        // Add current message
        messages.push({ role: 'user', content: message });

        console.log('[ChatGPT Support] Sending chat request...');
        
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
        });

        const response = completion.choices[0].message.content;

        console.log('[ChatGPT Support] Chat response received');

        res.json({
            success: true,
            data: {
                response: response,
                model: completion.model,
                usage: completion.usage
            }
        });
    } catch (error) {
        console.error('[ChatGPT Support Chat Error]', {
            message: error.message,
            stack: error.stack
        });

        let errorMessage = 'Failed to get response from ChatGPT';
        if (error.message.includes('API key')) {
            errorMessage = getApiKeyErrorMessage();
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        }

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

// @desc    Generate 7-day diet plan
// @route   POST /api/chatbot/7day-plan
// @access  Public
const generate7DayPlan = async (req, res) => {
    try {
        const { reportAnalysis, baseDietPlan, userProfile, activities = [], meals = [] } = req.body;

        // Check if API key is configured
        let openai;
        try {
            openai = getOpenAI();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message || getApiKeyErrorMessage()
            });
        }

        const userContext = buildUserContext(userProfile, activities, meals);

        const prompt = `Generate a comprehensive 7-day personalized diet plan based on the following information. PRIMARY sources are the base diet plan and user profile overview. Report analysis is optional and supplementary.

${userContext ? `User Profile Overview (PRIMARY - Use this as the main context):\n${userContext}\n` : ''}

${baseDietPlan ? `Base Diet Plan (PRIMARY - Base the 7-day plan on this):\n${typeof baseDietPlan === 'string' ? baseDietPlan : JSON.stringify(baseDietPlan, null, 2)}\n` : ''}

${reportAnalysis ? `Report Analysis (OPTIONAL - Use only if available, as supplementary information):\n${typeof reportAnalysis === 'string' ? reportAnalysis : JSON.stringify(reportAnalysis, null, 2)}\n` : ''}

Generate a detailed 7-day diet plan in JSON format:
{
    "summary": "Brief summary of the 7-day plan",
    "days": [
        {
            "date": "Day 1 date (optional)",
            "meals": {
                "breakfast": "Meal name/description",
                "lunch": "Meal name/description",
                "dinner": "Meal name/description",
                "snacks": "Snack suggestions"
            },
            "notes": "Any specific notes for this day"
        },
        {
            "date": "Day 2 date (optional)",
            "meals": {
                "breakfast": "Meal name/description",
                "lunch": "Meal name/description",
                "dinner": "Meal name/description",
                "snacks": "Snack suggestions"
            },
            "notes": "Any specific notes for this day"
        },
        ... (7 days total)
    ]
}

Important:
- PRIMARY: Base recommendations primarily on the base diet plan and user profile overview
- The base diet plan should be the foundation for meal suggestions and structure
- Use the user profile overview (health conditions, allergies, dietary preferences, goals, activity levels) as the main context
- OPTIONAL: Report analysis is supplementary - use it only if provided and to enhance recommendations
- Consider the user's health conditions, allergies, and dietary preferences from the profile
- Ensure variety across the 7 days
- Make meals practical and achievable
- Include specific meal suggestions for each day that align with the base diet plan
- Return ONLY valid JSON, no markdown formatting`;

        console.log('[ChatGPT] Generating 7-day plan...');

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a nutritionist AI. Always respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 3000
        });

        let planText = completion.choices[0].message.content.trim();

        // Clean up response
        if (planText.startsWith('```json')) {
            planText = planText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (planText.startsWith('```')) {
            planText = planText.replace(/```\n?/g, '');
        }

        const sevenDayPlan = JSON.parse(planText);

        console.log('[ChatGPT] 7-day plan generated');

        res.json({
            success: true,
            data: sevenDayPlan
        });
    } catch (error) {
        console.error('[ChatGPT 7-Day Plan Error]', {
            message: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate 7-day plan'
        });
    }
};

module.exports = {
    chatWithBot,
    supportChat,
    getFAQ,
    analyzeReport,
    generateDietPlan,
    generate7DayPlan
};

