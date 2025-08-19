# Complete Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth authentication for the Business Operating System (BOS) project.

## 📋 Prerequisites

- Node.js (v18+) and npm
- PHP (v8.2+) and Composer
- MySQL or compatible database
- Google account for Google Cloud Console access

## 🔧 Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `business-operating-system` or similar
4. Click "Create"

### 1.2 Enable Google OAuth APIs

1. In your project, go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google+ API** (if available)
   - **Google Sign-In API** (if available)
   - **Identity and Access Management (IAM) API**

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill out the required fields:
   - **App name**: Business Operating System
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. **Scopes**: Click **Save and Continue** (use defaults)
6. **Test users**: Add your email for testing
7. Click **Save and Continue**

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - **Name**: BOS Frontend Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
5. Click **Create**
6. **Copy and save** your:
   - Client ID (ends with `.apps.googleusercontent.com`)
   - Client Secret

## 🔧 Step 2: Backend Configuration

### 2.1 Install Dependencies

```bash
cd backend
composer install
```

The Google OAuth library (`google/apiclient`) is already included in `composer.json`.

### 2.2 Environment Configuration

1. Create your environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `backend/.env` and add your Google OAuth credentials:
   ```env
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5173
   
   # Make sure these are also set correctly
   APP_URL=http://localhost:8000
   SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
   ```

3. Generate application key:
   ```bash
   php artisan key:generate
   ```

### 2.3 Database Setup

1. Configure your database in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=business_operating_system
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

2. Create the database:
   ```sql
   CREATE DATABASE business_operating_system;
   ```

3. Run migrations:
   ```bash
   php artisan migrate
   ```

### 2.4 Start Backend Server

```bash
php artisan serve
```

Backend will be available at: http://localhost:8000

## 🔧 Step 3: Frontend Configuration

### 3.1 Install Dependencies

```bash
cd client
npm install
```

### 3.2 Environment Configuration

1. Create your environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `client/.env`:
   ```env
   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   
   # API Configuration
   VITE_API_URL=http://localhost:8000
   
   # Application Settings
   VITE_APP_NAME="Business Operating System"
   VITE_APP_URL=http://localhost:5173
   ```

### 3.3 Start Frontend Server

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🧪 Step 4: Test the Integration

### 4.1 Test Google Login

1. Open http://localhost:5173/login
2. Click "Continue with Google" button
3. Complete the Google OAuth flow
4. You should be redirected to the dashboard

### 4.2 Test Google Registration

1. Open http://localhost:5173/signup
2. Click "Continue with Google" button
3. Complete the Google OAuth flow
4. You should be registered and redirected to the dashboard

### 4.3 Verify Backend API

You can test the backend API endpoints directly:

```bash
# Test Google login endpoint
curl -X POST http://localhost:8000/api/oauth/google/login \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "your_google_jwt_token",
    "user_info": {
      "email": "test@example.com",
      "name": "Test User"
    }
  }'
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Invalid origin" error
- Ensure your JavaScript origins in Google Cloud Console match exactly:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`

#### 2. CORS errors
- Check `SANCTUM_STATEFUL_DOMAINS` in backend `.env`
- Ensure frontend URL matches the domains list

#### 3. "Google OAuth not initialized" error
- Check that `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Verify the Client ID is correct and includes `.apps.googleusercontent.com`

#### 4. Database connection errors
- Verify database credentials in backend `.env`
- Ensure database exists and migrations are run

#### 5. "Invalid Google token" error
- Check that your Google Client ID matches between frontend and backend
- Ensure Google Client Secret is set in backend `.env`

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Check backend logs** at `backend/storage/logs/laravel.log`
3. **Verify environment variables** are loaded correctly
4. **Test API endpoints** with tools like Postman

## 🔒 Security Considerations

1. **Never commit `.env` files** to version control
2. **Keep Google Client Secret secure** - only store in backend
3. **Use HTTPS in production** - update Google Console settings
4. **Rotate credentials regularly** in production environments
5. **Set up proper CORS** for production domains

## 🚀 Production Deployment

When deploying to production:

1. **Update Google Cloud Console**:
   - Add production domains to authorized origins
   - Update redirect URIs

2. **Environment variables**:
   - Set production URLs in both frontend and backend `.env`
   - Use secure credentials storage (not plain text files)

3. **Security**:
   - Enable HTTPS
   - Update CORS settings
   - Review OAuth scopes

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Laravel and React documentation
3. Check Google OAuth documentation
4. Verify all environment variables are correctly set

## ✅ Success Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Backend `.env` configured with Google credentials
- [ ] Frontend `.env` configured with Google Client ID
- [ ] Database created and migrated
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Google login button works
- [ ] Google registration works
- [ ] Users can authenticate and access dashboard

Your Google OAuth integration is now complete! 🎉
