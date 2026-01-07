# ChatGPT AI Chatbot Integration Setup Guide

## Overview
VitaTrackr now includes an AI-powered chatbot powered by OpenAI's ChatGPT! The chatbot can help with health questions, analyze medical reports, generate personalized diet plans, and provide FAQ answers.

## Features

### 🤖 AI Chat Assistant
- **Conversational AI**: Chat naturally with the AI assistant about health, nutrition, and fitness
- **Context-Aware**: The chatbot has access to your profile, activities, and meal logs for personalized responses
- **FAQ System**: Quick access to frequently asked questions
- **Report Analysis**: Upload medical reports for AI-powered analysis
- **Diet Plan Generation**: Get personalized diet plans based on your reports and profile

### 📊 Report Analysis Features
- **3-4 Line Summary**: Quick overview of key findings
- **Beneficial Foods Table**: Foods recommended for your health condition
- **Foods to Avoid**: What to limit or avoid based on your report
- **Supplements**: Personalized supplement recommendations
- **Further Tests**: Recommended medical tests based on your report

### 🍽️ Diet Plan Features
- **Categorized Food Lists**: Organized by food groups (Fruits, Vegetables, Proteins, etc.)
- **Meal Suggestions**: Breakfast, lunch, dinner, and snack ideas
- **Serving Recommendations**: Specific serving sizes for each food
- **Health Benefits**: Why each food is beneficial for you

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the API key (you'll need it in the next step)

### 2. Configure Environment Variable

Open your `.env` file in the root of the project and add:

```bash
OPENAI_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with the actual API key you got from OpenAI Platform.

### 3. Optional: Configure Model

You can specify which OpenAI model to use (default is `gpt-4o-mini`):

```bash
OPENAI_MODEL=gpt-4o-mini
```

Available models:
- `gpt-4o-mini` (default, fast and cost-effective)
- `gpt-4o` (more advanced, higher cost)
- `gpt-4-turbo` (high quality)
- `gpt-3.5-turbo` (legacy, cheaper)

### 4. Restart the Server

After adding the API key, restart your development server:

```bash
# Stop the current server (Ctrl+C if running in terminal)
# Then restart it
npm start
```

## How to Use

### Chat with the AI

1. Navigate to **"AI Chat"** in the navbar
2. Type your question in the chat input
3. Press Enter or click the send button
4. The AI will respond with personalized answers based on your profile

### Upload and Analyze Reports

1. Click **"Upload Report"** button in the chat
2. Either:
   - Upload a text file (.txt, .csv)
   - Paste report text directly
3. Click **"Analyze Report"**
4. View the summary, beneficial foods, foods to avoid, supplements, and test recommendations

### Generate Diet Plan

1. Option 1: After analyzing a report, click **"Generate Detailed Diet Plan"**
2. Option 2: Click **"Diet Plan"** button directly (uses your profile data)
3. View comprehensive diet plan with:
   - Categorized beneficial foods
   - Foods to avoid with alternatives
   - Supplement recommendations
   - Further test suggestions
   - Meal suggestions for breakfast, lunch, dinner, and snacks

### View FAQs

1. Click **"FAQ"** button in the chat
2. Browse frequently asked questions
3. Click on any FAQ to see the answer

## API Endpoints

### Chat with Bot
```
POST /api/chatbot/chat
Body: {
  "message": "Your question",
  "conversationHistory": [...],
  "userProfile": {...},
  "activities": [...],
  "meals": [...]
}
```

### Get FAQs
```
GET /api/chatbot/faq
```

### Analyze Report
```
POST /api/chatbot/analyze-report
Body: {
  "reportText": "Report content...",
  "userProfile": {...},
  "activities": [...],
  "meals": [...]
}
```

### Upload Report File
```
POST /api/chatbot/upload-report
Content-Type: multipart/form-data
Body: {
  "report": File,
  "userProfile": JSON string,
  "activities": JSON string,
  "meals": JSON string
}
```

### Generate Diet Plan
```
POST /api/chatbot/diet-plan
Body: {
  "reportAnalysis": {...},
  "userProfile": {...},
  "activities": [...],
  "meals": [...]
}
```

## Data Access

The chatbot has access to:
- **User Profile**: Age, weight, height, BMI, health conditions, allergies, dietary preferences, goals
- **Recent Activities**: Last 10 activities with calories burned and duration
- **Recent Meals**: Last 10 meals with nutritional information
- **Medical Reports**: Any reports you upload for analysis

This data is used to provide personalized, context-aware responses.

## Troubleshooting

### "OpenAI API key not configured" Error

**Problem**: The `.env` file doesn't have `OPENAI_API_KEY` set properly.

**Solution**: 
1. Check your `.env` file has the correct API key
2. Restart the server after adding the key
3. Make sure there are no extra spaces around the `=` sign

### "Rate limit exceeded" Error

**Problem**: You've exceeded OpenAI's rate limits.

**Solution**:
1. Wait a few moments and try again
2. Check your OpenAI account usage and billing
3. Consider upgrading your OpenAI plan if needed

### Report Analysis Not Working

**Problem**: Report analysis fails or returns errors.

**Solution**:
1. Ensure report text is clear and readable
2. For PDF files, extract text first and paste it
3. For images, use OCR to extract text first
4. Check that your API key has sufficient credits

### Diet Plan Not Generating

**Problem**: Diet plan generation fails.

**Solution**:
1. Ensure you have a user profile set up
2. Try analyzing a report first, then generate diet plan
3. Check API key and credits
4. Ensure report analysis completed successfully

## Security Notes

1. **Never commit API keys to Git**: The `.env` file is already in `.gitignore`
2. **Use environment variables**: In production (e.g., Render, Heroku), set environment variables securely
3. **API Key rotation**: Rotate keys periodically for security
4. **Data Privacy**: All data is sent to OpenAI's API. Review OpenAI's privacy policy

## Cost Considerations

- **Free Tier**: OpenAI provides free credits for new accounts
- **Pay-as-you-go**: Charges apply after free credits are exhausted
- **Model Costs**: Different models have different costs per token
  - `gpt-4o-mini`: Most cost-effective
  - `gpt-4o`: Higher quality, higher cost
- **Rate Limits**: Be mindful of request limits in production

For development and moderate usage, the free tier should be sufficient.

## Next Steps

Once set up:
1. Try chatting with the AI about your health goals
2. Upload a sample report to test analysis
3. Generate a personalized diet plan
4. Explore the FAQ section
5. Use the chatbot for meal and activity recommendations

Enjoy your AI-powered health assistant! 🤖✨

