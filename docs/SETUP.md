# Setup Guide - Career Fit Analysis

Complete guide to setting up the Career Fit Analysis application for local development.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **OpenAI API Key** (for GPT-4 integration)

### Verify Installations

```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
psql --version    # Should show 14.x or higher
git --version     # Should show 2.x.x or higher
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/career-fit-app.git
cd career-fit-app
```

---

## Step 2: Install Dependencies

### Root Dependencies
```bash
npm install
```

### Install All Workspace Dependencies
```bash
npm run install:all
```

Or manually:
```bash
# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..
```

---

## Step 3: Set Up PostgreSQL Database

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE career_fit;

# Create user (optional, recommended for security)
CREATE USER career_fit_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE career_fit TO career_fit_user;

# Exit
\q
```

### Verify Database Connection

```bash
psql -U career_fit_user -d career_fit -h localhost
```

---

## Step 4: Configure Environment Variables

### Backend Environment

Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://career_fit_user:your_secure_password@localhost:5432/career_fit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important:**
- Replace `your_secure_password` with your PostgreSQL password
- Replace `your-super-secret-jwt-key...` with a random 32+ character string
- Replace `sk-your-openai-api-key-here` with your actual OpenAI API key

### Frontend Environment

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=Career Fit Analysis
```

---

## Step 5: Set Up Database Schema

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample careers
npm run seed
```

**Expected Output:**
- Prisma Client generated
- Database tables created
- 5-10 tech careers seeded

---

## Step 6: Start Development Servers

### Option 1: Start Both Servers Concurrently (Recommended)

```bash
# From root directory
npm run dev
```

### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 7: Verify Installation

### Check Backend
Open browser or use curl:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status": "ok", "message": "Career Fit API is running"}
```

### Check Frontend
Open browser:
```
http://localhost:5173
```

You should see the landing page.

---

## Step 8: Create Test User

### Using API (curl)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User",
    "securityQuestion": "What is your favorite color?",
    "securityAnswer": "Blue"
  }'
```

### Using Frontend
1. Go to http://localhost:5173
2. Click "Get Started"
3. Fill in registration form
4. Create account

---

## Troubleshooting

### PostgreSQL Connection Error

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**
1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-14

   # macOS/Linux
   sudo service postgresql start
   ```

2. Verify credentials in `backend/.env`

3. Check PostgreSQL is listening on port 5432:
   ```bash
   psql -U postgres -c "SHOW port;"
   ```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
1. Find and kill process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -ti:3001 | xargs kill -9
   ```

2. Or change the port in `backend/.env`

### Prisma Migration Errors

**Error:** `Migration failed` or `Schema out of sync`

**Solution:**
1. Reset database:
   ```bash
   cd backend
   npx prisma migrate reset
   ```

2. Regenerate client:
   ```bash
   npx prisma generate
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

### OpenAI API Errors

**Error:** `Invalid API key` or `Insufficient quota`

**Solution:**
1. Verify API key in `backend/.env`
2. Check OpenAI account balance
3. For POC, you can temporarily disable GPT-4 integration (use rule-based only)

### Frontend Not Loading

**Error:** Blank page or build errors

**Solution:**
1. Clear node_modules and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

2. Check console for errors
3. Ensure `VITE_API_URL` in `.env` is correct

---

## Development Workflow

### Making Changes

1. **Frontend changes:** Hot reload automatically
2. **Backend changes:** Restart dev server (nodemon should auto-restart)
3. **Database schema changes:**
   ```bash
   cd backend
   npx prisma migrate dev --name description_of_change
   ```

### Running Tests

```bash
# All tests
npm test

# Frontend only
cd frontend && npm test

# Backend only
cd backend && npm test
```

### Viewing Database

```bash
cd backend
npx prisma studio
```

Opens Prisma Studio at http://localhost:5555

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Set `NODE_ENV=production`
- [ ] Use production PostgreSQL database
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure error monitoring
- [ ] Review and update rate limiting
- [ ] Audit dependencies for vulnerabilities

---

## Useful Commands

```bash
# Install all dependencies
npm run install:all

# Start both servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Database: View with Prisma Studio
cd backend && npx prisma studio

# Database: Reset and reseed
cd backend && npx prisma migrate reset

# Database: Create new migration
cd backend && npx prisma migrate dev --name migration_name
```

---

## Need Help?

- Check [API Documentation](./API.md)
- Review [Architecture](./ARCHITECTURE.md)
- Read [PRD](./PRD.md)
- Open an issue on GitHub

---

**Happy coding! 🚀**
