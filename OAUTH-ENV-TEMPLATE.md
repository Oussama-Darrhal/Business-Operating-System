# Environment Variables Templates

Copy these templates to your respective `.env` files and replace with your actual values.

## Client (React + Vite) .env Template

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration
VITE_API_URL=http://localhost:8000

# Application Settings
VITE_APP_NAME="Business Operating System"
VITE_APP_URL=http://localhost:5173
```

## Backend .env Template

```env
# Application
APP_NAME="SME Business Operating System"
APP_ENV=local
APP_KEY=base64:your_app_key_here
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sme_business_os
DB_USERNAME=root
DB_PASSWORD=your_password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173

# Laravel Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Session & Cache
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

CACHE_STORE=database
CACHE_PREFIX=

# Mail Configuration (Optional)
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# Logging
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug
```

## Quick Setup Instructions

1. **Client Setup:**
   ```bash
   cd client
   cp .env.example .env  # or create new .env file
   # Edit .env with your Google Client ID
   npm install
   npm run dev
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env  # or create new .env file
   # Edit .env with your database and Google OAuth credentials
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan serve
   ```

3. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Copy Client ID and Secret to your .env files

4. **Test the Integration:**
   - Visit http://localhost:5173/login
   - Click the Google sign-in button
   - Complete OAuth flow

## Important Notes

- Never commit `.env` files to version control
- Keep your Google Client Secret secure
- Use different credentials for development and production
- Ensure all URLs match between Google Console and your configuration 