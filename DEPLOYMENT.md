# Royal FC - Production Deployment Guide

This guide will help you deploy Royal FC to Vercel with PostgreSQL database.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database** - Use one of these options:
   - [Neon](https://neon.tech) (Recommended - Free tier available)
   - [Supabase](https://supabase.com) (Free tier available)
   - [Railway](https://railway.app)
   - [Render](https://render.com)

## Step 1: Set Up PostgreSQL Database

### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)
4. Save this for later - you'll need it for environment variables

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your database password

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory (for local development):

```env
# Database
DATABASE_URL="your-postgresql-connection-string-here"

# Authentication
SESSION_SECRET="your-random-secret-key-here"
JWT_SECRET="your-jwt-secret-key-here"

# Default Credentials (Change in production!)
DEFAULT_ADMIN_PASSWORD="admin123"
DEFAULT_EXCO_PASSWORD="exco123"

# Environment
NODE_ENV="production"
```

**Important:** Generate secure random strings for SESSION_SECRET and JWT_SECRET. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Set Up Database Schema

Run these commands in order:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

## Step 4: Deploy to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts and set environment variables when asked

### Method 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist/public`

5. Add Environment Variables in Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `DATABASE_URL`
     - `SESSION_SECRET`
     - `JWT_SECRET`
     - `DEFAULT_ADMIN_PASSWORD`
     - `DEFAULT_EXCO_PASSWORD`
     - `NODE_ENV` = `production`

6. Click "Deploy"

## Step 5: Post-Deployment

### Run Database Migrations on Vercel

After first deployment, you need to seed the database:

1. Go to your Vercel project dashboard
2. Go to Settings → Functions
3. Add a new function or use Vercel CLI:

```bash
vercel env pull .env.production
npm run db:seed
```

Or manually run the seed script with your production DATABASE_URL.

### Verify Deployment

1. Visit your deployed URL
2. Test login with:
   - **Admin:** username: `admin`, password: `admin123` (or your custom password)
   - **Exco:** username: `exco`, password: `exco123` (or your custom password)

## Step 6: Security Checklist

- [ ] Change default admin and exco passwords
- [ ] Use strong, random SESSION_SECRET and JWT_SECRET
- [ ] Enable SSL for database connection
- [ ] Set up custom domain with HTTPS
- [ ] Review and update CORS settings if needed
- [ ] Enable Vercel's security features (DDoS protection, etc.)

## Database Management

### View Database (Prisma Studio)

```bash
npm run db:studio
```

This opens a GUI at `http://localhost:5555` to view and edit data.

### Create Database Migrations

When you make schema changes:

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Deploy to production
npm run db:migrate
```

### Backup Database

Use your database provider's backup features:
- **Neon:** Automatic backups included
- **Supabase:** Go to Database → Backups
- **Railway:** Automatic backups available

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `dependencies` (not `devDependencies`)
3. Verify DATABASE_URL is set correctly

### Database Connection Issues

1. Check if DATABASE_URL includes `?sslmode=require`
2. Verify database is accessible from Vercel's IP ranges
3. Check database provider's connection limits

### Authentication Not Working

1. Verify SESSION_SECRET and JWT_SECRET are set
2. Check CORS settings in `server/index.ts`
3. Ensure cookies are enabled in browser

### Players Not Showing

1. Run the seed script: `npm run db:seed`
2. Check database has data using Prisma Studio
3. Verify API endpoints are working

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Analytics to track:
- Page views
- Performance metrics
- Error rates

### Database Monitoring

- **Neon:** Built-in monitoring dashboard
- **Supabase:** Database → Reports

## Updating the Application

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel auto-deploys from main branch

Or use Vercel CLI:
```bash
vercel --prod
```

## Environment-Specific Behavior

The application automatically detects the environment:

- **Development (local):** Uses in-memory storage (data resets on restart)
- **Production (Vercel):** Uses PostgreSQL database (persistent storage)

This is controlled in `server/services/storage-impl.ts`:
```typescript
const USE_DATABASE = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';
```

## Support

For issues:
1. Check Vercel deployment logs
2. Review database provider logs
3. Check browser console for frontend errors
4. Review server logs in Vercel Functions

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
