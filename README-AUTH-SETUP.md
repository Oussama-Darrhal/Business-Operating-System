# Authentication & User Management Service Setup

This document describes the setup and usage of the Authentication & User Management Service for the Business Operating System (BOS).

## 🏗️ Architecture Overview

The system consists of two main components:

### 1. Backend Authentication Service (Laravel 12)
- **Location**: `backend-auth/`
- **Port**: 8000 (http://localhost:8000)
- **Framework**: Laravel 12 with PHP 8.3
- **Authentication**: Laravel Sanctum API tokens
- **Database**: MySQL (shared with other services)

### 2. Frontend Application (React)
- **Location**: `frontend/`
- **Port**: 3000 (http://localhost:3000)
- **Framework**: React 19.1 with Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Context API

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Running the Application

1. **Start all services:**
```bash
docker compose up --build
```

2. **Access the applications:**
- Frontend: http://localhost:3000
- Backend Auth API: http://localhost:8000
- PHPMyAdmin: http://localhost:8080

3. **Test the setup:**
- Visit http://localhost:3000
- You'll be redirected to the login page
- Click "Sign up here" to create a new SME account

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

#### Register SME
```http
POST /api/register-sme
Content-Type: application/json

{
    "sme_name": "Your Business Name",
    "user_name": "Admin Full Name",
    "email": "admin@yourbusiness.com",
    "password": "your_password",
    "business_type": "Retail",
    "phone": "+1234567890",
    "city": "Your City",
    "country": "Your Country"
}
```

#### User Login
```http
POST /api/login
Content-Type: application/json

{
    "email": "admin@yourbusiness.com",
    "password": "your_password"
}
```

### Protected Endpoints (Require Authentication)

#### Get User Profile
```http
GET /api/user
Authorization: Bearer {your_token}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {your_token}
```

#### Health Check
```http
GET /api/health
```

## 🔐 Multi-Tenancy Implementation

The system implements multi-tenancy at the database level:

### How it Works
1. **SME Isolation**: Each SME has a unique ID that isolates their data
2. **User Scoping**: All users belong to a specific SME (via `sme_id` foreign key)
3. **Middleware Enforcement**: `TenantScopeMiddleware` automatically applies SME-based filtering
4. **API Protection**: The `/api/user` endpoint demonstrates tenant isolation

### Database Schema
- **SMEs Table**: Stores business information
- **Users Table**: Stores user accounts with `sme_id` foreign key
- **Unique Constraints**: Email is unique per SME (not globally)

## 🗃️ Database Structure

### SMEs Table
```sql
- id (Primary Key)
- name (Business name)
- business_type
- email (Contact email)
- phone, address, city, country
- timezone (Default: UTC)
- subscription_plan (basic/premium/enterprise)
- status (active/inactive/suspended)
- created_at, updated_at
```

### Users Table
```sql
- id (Primary Key)
- sme_id (Foreign Key to smes.id)
- name, email, password
- role (admin/manager/employee/viewer)
- status (active/inactive)
- last_login_at
- created_at, updated_at
```

## 🎨 Frontend Features

### Pages
1. **Login Page** (`/login`)
   - Email and password authentication
   - Error handling and validation
   - Redirect to signup page

2. **Signup Page** (`/signup`)
   - SME registration with admin user creation
   - Form validation
   - Optional business information fields

3. **Dashboard Page** (`/dashboard`)
   - Protected route (requires authentication)
   - Displays user and SME information
   - Logout functionality
   - Multi-tenancy demonstration

### Authentication Flow
1. User registers SME → Creates SME + Admin User → Issues token
2. User logs in → Validates credentials → Issues token
3. Token stored in localStorage for subsequent requests
4. Protected routes check for valid token
5. API calls include `Authorization: Bearer {token}` header

## 🔧 Development

### Laravel Commands
```bash
# Access the backend-auth container
docker exec -it bos_backend_auth bash

# Run migrations
php artisan migrate

# Generate new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller ControllerName

# Create new model
php artisan make:model ModelName
```

### Frontend Development
```bash
# Access the frontend container
docker exec -it bos_frontend sh

# Install new package
npm install package-name

# Build for production
npm run build
```

## 🧪 Testing the Multi-Tenancy

1. **Create two SME accounts:**
   - Register "Business A" with admin-a@example.com
   - Register "Business B" with admin-b@example.com

2. **Test data isolation:**
   - Login as Business A admin
   - Note the SME information displayed
   - Logout and login as Business B admin
   - Verify different SME information is shown

3. **API Testing:**
   - Use the tokens from different SMEs
   - Call `/api/user` with each token
   - Verify each returns only their SME's data

## 🛠️ Configuration

### Environment Variables
The system uses the following key environment variables:

**Backend (Laravel):**
- `DB_HOST=mysql` (Docker service name)
- `DB_DATABASE=laravel`
- `DB_USERNAME=laravel`
- `DB_PASSWORD=password`

**Frontend (React):**
- `REACT_APP_API_URL=http://localhost:8000`

### Docker Services
- **mysql**: Shared MySQL database
- **backend-auth**: Laravel authentication service
- **frontend**: React application
- **phpmyadmin**: Database management interface

## 🔄 Next Steps

This authentication service provides the foundation for:

1. **Inventory Management Service**: Will use the same user/SME structure
2. **Complaint Management Service**: Already exists in `backend-complaints/`
3. **Additional Microservices**: Can authenticate using the same token system

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check if MySQL is running
docker ps | grep mysql

# Check database logs
docker logs bos_mysql
```

**Frontend Not Loading:**
```bash
# Check if Node.js dependencies are installed
docker exec bos_frontend npm list

# Restart frontend service
docker compose restart frontend
```

**API Token Issues:**
- Check that `Authorization: Bearer {token}` header is included
- Verify token is not expired (check Laravel logs)
- Ensure CORS is properly configured

**CORS Issues:**
- Backend is configured to accept requests from `localhost:3000`
- If accessing from different domain, update CORS configuration

---

## 📞 Support

For questions or issues with the authentication service, please refer to:
- Laravel 12 Documentation
- React Documentation
- Docker Compose Documentation 