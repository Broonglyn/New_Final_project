# SMS Notifications Setup Guide

## Overview
The Civil Registry system now includes SMS notifications that will be sent to users' phone numbers when:
- They register for a new account (welcome SMS)
- Their application status changes (status update SMS)

## Prerequisites
1. A Twilio account (sign up at https://www.twilio.com/)
2. A Twilio phone number
3. Twilio Account SID and Auth Token

## Setup Instructions

### Step 1: Get Twilio Credentials
1. Sign up for a free Twilio account at https://www.twilio.com/
2. Go to your Twilio Console Dashboard
3. Find your Account SID and Auth Token
4. Purchase a phone number from Twilio (required for sending SMS)

### Step 2: Configure Environment Variables
Set these environment variables on your server:

```bash
export TWILIO_ACCOUNT_SID="your_actual_account_sid_here"
export TWILIO_AUTH_TOKEN="your_actual_auth_token_here"
export TWILIO_PHONE_NUMBER="your_twilio_phone_number_here"
```

### Step 3: Alternative - Update Settings File
If you prefer to set credentials directly in the code, update `civil_backend/settings.py`:

```python
# Replace these with your actual Twilio credentials
TWILIO_ACCOUNT_SID = 'your_actual_account_sid_here'
TWILIO_AUTH_TOKEN = 'your_actual_auth_token_here'
TWILIO_PHONE_NUMBER = 'your_twilio_phone_number_here'
```

### Step 4: Test SMS Functionality
1. Start your Django server: `python manage.py runserver`
2. Register a new user with a valid phone number
3. Change an application status as an admin
4. Check if SMS messages are received

## SMS Message Types

### Welcome SMS
Sent when a user registers:
```
Welcome to Civil Registry System, [User Name]! You can now submit applications for various documents. Visit our website to get started.

Civil Registry System
```

### Application Status SMS
Sent when application status changes:
- **Submitted**: "Your application [REF] has been submitted and is under review."
- **Approved**: "Great news! Your application [REF] has been approved."
- **Ready**: "Your document for application [REF] is ready for collection! Please visit your selected branch."
- **Rejected**: "Unfortunately, your application [REF] has been rejected. Please contact us for more information."

## Phone Number Format
The system automatically handles phone number formatting:
- Accepts: +263712345678, 0712345678, 263712345678
- Converts to: +263712345678 (Zimbabwe format)

## Troubleshooting

### Common Issues
1. **"SMS service not configured"** - Check your Twilio credentials
2. **"Authentication Error"** - Verify Account SID and Auth Token
3. **"Phone number not available"** - User must have a phone number in their profile
4. **"Failed to send SMS"** - Check Twilio account balance and phone number validity

### Testing
To test SMS without real credentials, the system will log errors but continue working normally. The in-app notifications will still work.

## Cost Considerations
- Twilio charges per SMS sent
- Free trial accounts have limited credits
- Monitor your Twilio usage to avoid unexpected charges

## Security Notes
- Never commit real Twilio credentials to version control
- Use environment variables for production deployments
- Consider rate limiting for SMS sending to prevent abuse
