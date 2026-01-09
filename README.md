# Grihya - Real Estate Platform

A full-stack real estate platform built with Laravel and React, featuring property listings, agent management, blog posts, real-time chat, and home loan applications.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## 🛠 Tech Stack

### Backend
- **Framework**: Laravel 12
- **PHP**: 8.2+
- **Database**: MySQL/MariaDB (SQLite supported for development)
- **Authentication**: Laravel Sanctum
- **Real-time**: Pusher (WebSockets)
- **Queue**: Laravel Queue
- **Build Tool**: Vite

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui, Radix UI, Headless UI
- **Routing**: React Router v6
- **State Management**: React Context API
- **Maps**: Leaflet, Google Maps
- **Real-time**: Laravel Echo + Pusher
- **HTTP Client**: Axios

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2+** (check with `php -v`)
- **Composer** (PHP dependency manager)
- **Node.js 18+** and npm (check with `node -v` and `npm -v`)
- **MySQL/MariaDB** (via XAMPP, WAMP, or standalone installation)
- **Git**

### Optional but Recommended
- **Redis** (for caching and queues)
- **Pusher Account** (for real-time features)

## 📁 Project Structure

```
grihya/
├── backend/                 # Laravel API backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API & Admin controllers
│   │   │   ├── Middleware/     # Custom middleware
│   │   │   └── Resources/      # API resources
│   │   ├── Models/             # Eloquent models
│   │   ├── Mail/               # Email templates
│   │   └── Events/             # Event classes
│   ├── database/
│   │   ├── migrations/         # Database migrations
│   │   └── seeders/            # Database seeders
│   ├── routes/
│   │   ├── api.php             # API routes
│   │   └── web.php             # Web routes (admin panel)
│   ├── resources/
│   │   ├── views/              # Blade templates (admin)
│   │   ├── js/                 # Admin JavaScript
│   │   └── css/                # Styles
│   └── public/                 # Public assets
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/              # Page components
    │   ├── context/            # React Context providers
    │   ├── lib/                # Utilities & API client
    │   ├── types/              # TypeScript types
    │   └── utils/              # Helper functions
    ├── public/                 # Static assets
    └── scripts/                # Build scripts
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd grihya
```

### 2. Backend Setup

#### Install PHP Dependencies

```bash
cd backend
composer install
```

#### Install Node.js Dependencies (for Vite)

```bash
npm install
```

#### Create Environment File

```bash
cp text.env.example .env
# Or create .env manually if text.env.example doesn't exist
```

#### Generate Application Key

```bash
php artisan key:generate
```

#### Configure Database

1. Start your MySQL/MariaDB server (via XAMPP or standalone)
2. Create a new database:
   ```sql
   CREATE DATABASE grihya_db;
   ```
3. Update `.env` with your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=grihya_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

#### Run Migrations

```bash
php artisan migrate
```

#### Set Storage Permissions

```bash
chmod -R 775 storage bootstrap/cache
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Create Environment File

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=ap2
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## ⚙️ Configuration

### Backend Environment Variables

Key variables in `backend/.env`:

```env
# Application
APP_NAME=Grihya
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=grihya_db
DB_USERNAME=root
DB_PASSWORD=

# Session & Sanctum
SESSION_DRIVER=database
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=no-reply@grihya.in
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@grihya.in
MAIL_FROM_NAME="Grihya"

# Pusher (for real-time features)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
PUSHER_APP_CLUSTER=ap2

# Frontend URLs
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Key variables in `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=ap2
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## 🏃 Running the Application

### Development Mode

#### Option 1: Using Composer Script (Recommended)

In the `backend` directory:

```bash
composer run dev
```

This command runs:
- Laravel development server (`php artisan serve`)
- Queue worker (`php artisan queue:work`)
- Log viewer (`php artisan pail`)
- Vite dev server (`npm run dev`)

#### Option 2: Manual Start

**Terminal 1 - Backend Server:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Backend Assets (Vite):**
```bash
cd backend
npm run dev
```

**Terminal 3 - Queue Worker (if using queues):**
```bash
cd backend
php artisan queue:work
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173 (or port shown in terminal)
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: Check `routes/api.php` for available endpoints

### Production Build

#### Backend

```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

#### Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

## 💻 Development

### Code Style

- **Backend**: Laravel Pint (PHP CS Fixer)
  ```bash
  cd backend
  ./vendor/bin/pint
  ```

- **Frontend**: ESLint + Prettier
  ```bash
  cd frontend
  npm run lint
  ```

### Database Migrations

Create a new migration:
```bash
php artisan make:migration create_example_table
```

Run migrations:
```bash
php artisan migrate
```

Rollback last migration:
```bash
php artisan migrate:rollback
```

### Testing

```bash
cd backend
php artisan test
```

### Seeding Database

```bash
php artisan db:seed
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Property Endpoints

- `GET /api/properties` - List properties (with filters)
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/{id}` - Get property details
- `POST /api/properties` - Create property (requires auth)
- `PUT /api/properties/{id}` - Update property (requires auth)
- `DELETE /api/properties/{id}` - Delete property (requires auth)
- `GET /api/my/properties` - Get user's properties (requires auth)

### Blog Endpoints

- `GET /api/posts` - List blog posts
- `GET /api/posts/{slug}` - Get blog post by slug
- `POST /api/posts` - Create blog post (requires auth)
- `PUT /api/posts/{slug}` - Update blog post (requires auth)
- `DELETE /api/posts/{slug}` - Delete blog post (requires auth)
- `POST /api/posts/{slug}/comments` - Add comment

### Chat Endpoints

- `POST /api/chat/start` - Start conversation (requires auth)
- `GET /api/chat/conversations/{token}/messages` - Get messages
- `POST /api/chat/conversations/{token}/messages` - Send message
- `POST /api/chat/conversations/{token}/read` - Mark as read

### User Endpoints

- `GET /api/agents` - List agents
- `GET /api/agents/{id}/contact` - Get agent contact (requires auth)

### Home Loan Endpoints

- `POST /api/home-loans/applications` - Submit application
- `POST /api/home-loans/partner-leads` - Submit partner lead

All endpoints return JSON responses. Authentication uses Laravel Sanctum (Bearer tokens).

## 🔧 Troubleshooting

### Common Issues

#### 1. PHP Version Error
**Error**: `Your requirements could not be resolved`
**Solution**: Ensure PHP 8.2+ is installed. Check with `php -v`

#### 2. Composer Not Found
**Error**: `composer: command not found`
**Solution**: Install Composer from https://getcomposer.org/download/

#### 3. Database Connection Error
**Error**: `SQLSTATE[HY000] [2002] Connection refused`
**Solution**: 
- Ensure MySQL/MariaDB is running
- Check database credentials in `.env`
- Verify database exists

#### 4. Permission Denied (Storage)
**Error**: `The stream or file could not be opened`
**Solution**:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache  # Linux
```

#### 5. Vite Assets Not Loading
**Error**: Assets return 404
**Solution**: 
- Ensure `npm run dev` is running in backend directory
- Check `vite.config.js` configuration
- Clear browser cache

#### 6. CORS Errors
**Error**: `Access to fetch blocked by CORS policy`
**Solution**: 
- Check `config/cors.php` settings
- Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`
- Ensure frontend URL is whitelisted

#### 7. Pusher Connection Failed
**Error**: Real-time features not working
**Solution**:
- Verify Pusher credentials in `.env`
- Check `BROADCAST_DRIVER=pusher`
- Ensure frontend has correct `VITE_PUSHER_KEY` and `VITE_PUSHER_CLUSTER`

### Debugging

Enable debug mode in `backend/.env`:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

View logs:
```bash
tail -f backend/storage/logs/laravel.log
```

Or use Laravel Pail:
```bash
php artisan pail
```

## 📝 Additional Notes

- The admin panel is accessible at `/admin` (requires admin authentication)
- Real-time chat requires Pusher configuration
- Google OAuth requires Google Cloud Console setup
- Email functionality requires SMTP configuration
- File uploads are stored in `storage/app/public/`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

[Specify your license here]

---

For more information, refer to:
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

