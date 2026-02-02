# Email Configuration Guide

This guide will help you set up email sending for VitaTrackr's email verification and password reset features.

## Quick Setup

1. **Create a `.env` file** in the root directory (if it doesn't exist)
2. **Add the email configuration** based on your email service (see options below)
3. **Restart your server**

## Email Service Options

### Option 1: Gmail (Recommended for Development)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "VitaTrackr" as the name
   - Copy the generated 16-character password
3. Add to `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM=noreply@vitatrackr.com
   ```

### Option 2: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API Key:
   - Go to Settings > API Keys
   - Create a new API Key with "Mail Send" permissions
   - Copy the API key
3. Verify your sender email/domain
4. Add to `.env`:
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@vitatrackr.com
   ```

### Option 3: Custom SMTP Server

If you have your own SMTP server (e.g., from your hosting provider):

```env
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@vitatrackr.com
```

**Common SMTP Settings:**
- **Gmail**: `smtp.gmail.com`, Port `587`, Secure `false`
- **Outlook**: `smtp-mail.outlook.com`, Port `587`, Secure `false`
- **Yahoo**: `smtp.mail.yahoo.com`, Port `587`, Secure `false`
- **Custom**: Check with your email provider

## Complete .env Example

```env
# Database
MONGODB_URI=mongodb://localhost:27017/vitatrackr

# Email Configuration (Gmail Example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@vitatrackr.com

# Other API Keys (if needed)
# OPENAI_API_KEY=your-key
# GEMINI_API_KEY=your-key
```

## Testing Email Configuration

1. Start your server: `npm start`
2. Try to register a new user
3. Check the console for email sending status:
   - ✅ `Email sent successfully` = Working!
   - ⚠️ `Email credentials not configured` = Add email config to `.env`
   - ❌ `Error sending email` = Check your credentials

## Troubleshooting

### Gmail Issues
- **"Less secure app access"**: Use App Passwords instead (recommended)
- **"Authentication failed"**: Make sure you're using an App Password, not your regular password
- **"Connection timeout"**: Check your firewall/network settings

### SendGrid Issues
- **"Invalid API key"**: Verify the API key is correct and has "Mail Send" permissions
- **"Sender not verified"**: Verify your sender email/domain in SendGrid dashboard

### General Issues
- **Emails not sending**: Check server console for error messages
- **Emails going to spam**: Verify your sender email and consider using a custom domain
- **Connection errors**: Verify SMTP host, port, and security settings

## Security Notes

- **Never commit `.env` file** to version control
- **Use App Passwords** for Gmail (not your main password)
- **Rotate API keys** regularly
- **Use environment variables** in production (not hardcoded values)

## Production Recommendations

For production, consider:
1. **SendGrid** or **AWS SES** for reliable email delivery
2. **Custom domain** for professional email addresses
3. **Email templates** for better branding
4. **Email queue system** (like Bull or RabbitMQ) for high volume
5. **Email analytics** to track delivery rates

---

**Need Help?** Check the server console logs for detailed error messages.
