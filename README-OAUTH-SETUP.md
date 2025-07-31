# OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the SME Business Operating System.

## Prerequisites

Before setting up OAuth, ensure you have:
- A Google Account
- Access to Google Cloud Console
- Your application running locally or deployed

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 2. Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity Services API" if available

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in the required application information:
     - App name: "SME Business Operating System"
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes: `email`, `profile`
   - Add test users if in testing mode

4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "SME BOS Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)

5. Download the JSON file or copy the Client ID and Client Secret

## Environment Variables Setup

### Frontend Environment Variables (.env)

Create or update your `frontend/.env` file with:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
```

**Example:**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
REACT_APP_API_BASE_URL=http://localhost:8000
```

### Backend Environment Variables (.env)

Add these to your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000

# Note: Make sure these match your existing database configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

**Example:**
```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sme_business_os
DB_USERNAME=root
DB_PASSWORD=your_password
```

## Required Environment Variables Summary

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789012-abc...apps.googleusercontent.com` |
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789012-abc...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-1234567890abcdef...` |
| `GOOGLE_REDIRECT_URI` | OAuth Redirect URI | `http://localhost:3000` |

## Installation and Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
composer install
```

### 2. Database Setup

```bash
cd backend
php artisan migrate
```

### 3. Start Development Servers

**Backend (Laravel):**
```bash
cd backend
php artisan serve
```

**Frontend (React):**
```bash
cd frontend
npm start
```

## Testing OAuth Integration

### 1. Test Google Login

1. Navigate to `http://localhost:3000/login`
2. Click the Google sign-in button
3. Complete the Google OAuth flow
4. You should be redirected to the dashboard

### 2. Test Google Registration

1. Navigate to `http://localhost:3000/signup`
2. Click the Google sign-up button
3. Complete the Google OAuth flow
4. You should be redirected to the dashboard with a new account

## Troubleshooting

### Common Issues

#### 1. "Invalid Client" Error
- **Cause:** Incorrect Client ID or domain mismatch
- **Solution:** 
  - Verify the Client ID in both frontend and backend `.env` files
  - Ensure the domain is added to authorized origins in Google Console

#### 2. "Popup Blocked" Error
- **Cause:** Browser blocking OAuth popup
- **Solution:** Allow popups for your domain or use redirect flow

#### 3. "Token Verification Failed"
- **Cause:** Backend can't verify Google token
- **Solution:** 
  - Ensure Google API Client is properly installed: `composer require google/apiclient`
  - Check backend logs for specific error messages

#### 4. "CORS Error"
- **Cause:** Cross-origin request blocked
- **Solution:** Ensure CORS is properly configured in Laravel

### Debug Steps

1. **Check Browser Console:** Look for JavaScript errors
2. **Check Backend Logs:** `storage/logs/laravel.log`
3. **Verify Environment Variables:** Ensure all required variables are set
4. **Test API Endpoints:** Use Postman to test OAuth endpoints directly

## Production Deployment

### Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files
   - Use environment-specific configuration
   - Ensure production URLs are properly configured

2. **Google Console Configuration:**
   - Add production domains to authorized origins
   - Update redirect URIs for production
   - Consider domain verification for production use

3. **HTTPS:**
   - Use HTTPS in production
   - Update all OAuth URLs to use HTTPS

### Production Environment Variables

**Frontend:**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_production_client_id
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

**Backend:**
```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com
```

## Future OAuth Providers

The system is designed to support additional OAuth providers:

- **Facebook:** Ready to implement with similar structure
- **Apple:** Ready to implement with similar structure
- **Microsoft:** Can be added following the same pattern

To add new providers:
1. Create provider-specific methods in `AuthController`
2. Add provider configuration to `config/services.php`
3. Update frontend OAuth utility
4. Add provider-specific routes

## Support

If you encounter issues:

1. Check this README for common solutions
2. Review browser console and backend logs
3. Verify all environment variables are correctly set
4. Ensure Google Cloud Console configuration matches your setup

## Security Notes

- Keep your Client Secret secure and never expose it in frontend code
- Regularly rotate OAuth credentials
- Monitor OAuth usage in Google Cloud Console
- Implement rate limiting for OAuth endpoints in production
- Consider implementing additional security measures like PKCE for enhanced security 