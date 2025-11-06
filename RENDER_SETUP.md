# Render Deployment Setup Guide

## Environment Variables Configuration

When deploying to Render, you need to add environment variables in the Render dashboard. The `.env` file is only used for local development.

### Required Environment Variables

1. **GEMINI_API_KEY** (Required)
   - Your Google Gemini API key
   - Get it from: https://makersuite.google.com/app/apikey
   - Example: `AIzaSyDbiO1jC3-Ij9Rgf8bBZthd-BsaP_n634w`

2. **MODEL** (Optional)
   - Gemini model to use
   - Default: `gemini-2.5-flash`
   - Options: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`

### How to Add Environment Variables in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your service (web service)
3. Click on **"Environment"** in the left sidebar
4. Scroll down to **"Environment Variables"** section
5. Click **"Add Environment Variable"**
6. Add each variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual API key (e.g., `AIzaSyDbiO1jC3-Ij9Rgf8bBZthd-BsaP_n634w`)
7. Click **"Save Changes"**
8. Render will automatically redeploy your service

### Optional: Add MODEL Variable

If you want to use a different model:
- **Key**: `MODEL`
- **Value**: `gemini-2.5-flash` (or `gemini-2.5-pro` for more advanced features)

### After Adding Variables

- Render will automatically restart your service
- Wait for the deployment to complete
- Check the logs to verify the API key is loaded correctly
- You should see: `[Gemini] Initializing with API key: AIzaSyDbiO...`

### Troubleshooting

If you still see "Please configure Gemini API key":
1. Verify the variable name is exactly `GEMINI_API_KEY` (case-sensitive)
2. Check that there are no extra spaces in the value
3. Make sure you clicked "Save Changes"
4. Wait for the service to redeploy (check deployment logs)
5. Check Render logs for any errors

### Security Note

- Never commit your `.env` file to Git
- Environment variables in Render are encrypted and secure
- The API key is only visible to you in the Render dashboard

