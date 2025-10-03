# Royal FC - Quick Start Guide

Get Royal FC running locally in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (or use the in-memory version for testing)

## Option 1: Quick Start (In-Memory - No Database Required)

Perfect for testing and development without setting up a database.

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Visit `http://localhost:5173` and you're ready to go!

**Note:** Data will reset when you restart the server.

## Option 2: Full Setup (With PostgreSQL Database)

For persistent data and production-like environment.

### Step 1: Set Up Database

Choose one of these free options:

**Neon (Recommended):**
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Go to Settings → Database → Copy connection string

### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Step 3: Set Up Database

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with initial data (31 players, sample tournament)
npm run db:seed
```

### Step 4: Start Development

```bash
# Start both server and client
npm run dev
```

Visit `http://localhost:5173`

## Default Login Credentials

- **Admin Access:**
  - Username: `admin`
  - Password: `admin123`

- **Exco Access:**
  - Username: `exco`
  - Password: `exco123`

## What's Included

After seeding, you'll have:
- ✅ 31 players with positions and skill ratings
- ✅ 1 active tournament (Summer Tournament)
- ✅ 2 teams with match history
- ✅ 3 fixtures (2 completed, 1 upcoming)
- ✅ Admin and Exco user accounts

## Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Start only client (Vite)
npm run dev:server       # Start only server (Express)

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database with data
npm run db:studio        # Open Prisma Studio (GUI)

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Features to Try

1. **View Players** - Browse the 31-player roster
2. **Team Generator** - Create balanced teams for matches
3. **Tournaments** - View active tournament and standings
4. **Leaderboard** - Check top scorers and stats
5. **Admin Panel** - Manage players, fixtures, and results (login required)

## Troubleshooting

### Port Already in Use

If port 5173 or 5000 is in use:
```bash
# Kill the process or change ports in:
# - vite.config.ts (client port)
# - server/index.ts (server port)
```

### Database Connection Error

1. Verify DATABASE_URL in .env is correct
2. Check database is running and accessible
3. Try regenerating Prisma client: `npm run db:generate`

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Players Not Showing

```bash
# Re-run the seed script
npm run db:seed
```

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for full documentation
- Explore the `/docs` folder for detailed guides

## Need Help?

- Check the console for error messages
- Review server logs in terminal
- Open browser DevTools (F12) for frontend errors
- Verify all environment variables are set correctly

Happy coding! ⚽
