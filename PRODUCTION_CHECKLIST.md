# Royal FC - Production Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel with PostgreSQL.

## Pre-Deployment

### 1. Database Setup
- [ ] Create PostgreSQL database (Neon/Supabase/Railway)
- [ ] Copy database connection string
- [ ] Test database connection locally
- [ ] Verify SSL mode is enabled (`?sslmode=require`)

### 2. Environment Variables
- [ ] Create `.env` file from `.env.example`
- [ ] Set `DATABASE_URL` with your PostgreSQL connection string
- [ ] Generate secure `SESSION_SECRET` (32+ characters)
- [ ] Generate secure `JWT_SECRET` (32+ characters)
- [ ] Set strong `DEFAULT_ADMIN_PASSWORD`
- [ ] Set strong `DEFAULT_EXCO_PASSWORD`
- [ ] Set `NODE_ENV=production`

### 3. Local Testing
- [ ] Run `npm install`
- [ ] Run `npm run db:generate` (generate Prisma client)
- [ ] Run `npm run db:push` (create database tables)
- [ ] Run `npm run db:seed` (populate with initial data)
- [ ] Run `npm run dev` (test locally)
- [ ] Test admin login
- [ ] Test player CRUD operations
- [ ] Test team generator
- [ ] Test tournament features

### 4. Code Review
- [ ] All TypeScript errors resolved
- [ ] No console.errors in production code
- [ ] API endpoints tested
- [ ] Authentication working correctly
- [ ] CORS configured for production domain

## Deployment to Vercel

### 5. Vercel Project Setup
- [ ] Push code to GitHub repository
- [ ] Create new project on Vercel
- [ ] Import GitHub repository
- [ ] Set framework preset to "Vite"
- [ ] Set build command to `npm run vercel-build`
- [ ] Set output directory to `dist/public`

### 6. Vercel Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `DATABASE_URL` = `your-postgresql-connection-string`
- [ ] `SESSION_SECRET` = `your-secure-random-string`
- [ ] `JWT_SECRET` = `your-secure-random-string`
- [ ] `DEFAULT_ADMIN_PASSWORD` = `your-admin-password`
- [ ] `DEFAULT_EXCO_PASSWORD` = `your-exco-password`
- [ ] `NODE_ENV` = `production`

**Important:** Set all variables for "Production", "Preview", and "Development" environments.

### 7. Initial Deployment
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Verify deployment URL is accessible

### 8. Post-Deployment Database Setup
After first successful deployment:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.production
npm run db:seed

# Option 2: Manually with production DATABASE_URL
DATABASE_URL="your-production-url" npm run db:seed
```

- [ ] Database seeded with initial data
- [ ] Verify 31 players exist
- [ ] Verify admin and exco users created
- [ ] Verify sample tournament created

## Post-Deployment Testing

### 9. Functionality Testing
- [ ] Visit production URL
- [ ] Test homepage loads
- [ ] Test players page shows all 31 players
- [ ] Test admin login (username: admin)
- [ ] Test exco login (username: exco)
- [ ] Test team generator with 10+ players
- [ ] Test tournament page
- [ ] Test leaderboard
- [ ] Test contact form submission
- [ ] Test creating new player (admin)
- [ ] Test updating player stats (exco)
- [ ] Test creating tournament (exco)
- [ ] Test recording match results (exco)

### 10. Performance & Security
- [ ] Check page load times (< 3 seconds)
- [ ] Verify HTTPS is enabled
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Verify API responses are fast (< 500ms)
- [ ] Check for console errors in browser
- [ ] Verify authentication tokens are httpOnly
- [ ] Test logout functionality

### 11. Database Verification
- [ ] Open Prisma Studio: `npm run db:studio`
- [ ] Verify users table has admin and exco
- [ ] Verify players table has 31 players
- [ ] Verify tournaments table has sample data
- [ ] Verify fixtures table has sample matches
- [ ] Check all foreign key relationships

## Production Maintenance

### 12. Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure database monitoring (Neon/Supabase dashboard)
- [ ] Set up uptime monitoring (optional: UptimeRobot)

### 13. Backup Strategy
- [ ] Verify database automatic backups enabled
- [ ] Document backup restoration process
- [ ] Test database backup/restore (optional)
- [ ] Export initial data as JSON backup

### 14. Security Hardening
- [ ] Change default admin password
- [ ] Change default exco password
- [ ] Review and update CORS origins
- [ ] Enable rate limiting (if needed)
- [ ] Review Vercel security settings
- [ ] Set up custom domain with SSL
- [ ] Configure CSP headers (optional)

### 15. Documentation
- [ ] Update README with production URL
- [ ] Document admin credentials (securely)
- [ ] Create user guide for club members
- [ ] Document API endpoints
- [ ] Share deployment guide with team

## Troubleshooting Guide

### Build Fails
1. Check Vercel build logs
2. Verify all dependencies in `package.json`
3. Run `npm run build` locally to reproduce
4. Check Node.js version compatibility

### Database Connection Issues
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from Vercel IPs
3. Ensure SSL mode is enabled
4. Test connection using Prisma Studio

### Authentication Not Working
1. Verify `SESSION_SECRET` and `JWT_SECRET` are set
2. Check CORS configuration
3. Verify cookies are enabled
4. Check browser console for errors

### Data Not Showing
1. Verify database was seeded: `npm run db:seed`
2. Check API endpoints return data
3. Verify Prisma client is generated
4. Check network tab for API errors

## Rollback Plan

If deployment fails:

1. **Revert to Previous Deployment:**
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "Promote to Production"

2. **Database Rollback:**
   - Restore from database backup
   - Or re-run seed script: `npm run db:seed`

3. **Code Rollback:**
   - Revert Git commits
   - Push to main branch
   - Vercel auto-deploys

## Success Criteria

Deployment is successful when:

- ✅ Website loads at production URL
- ✅ All 31 players visible on players page
- ✅ Admin can login and manage data
- ✅ Team generator creates balanced teams
- ✅ Tournaments display correctly
- ✅ Database persists data across deployments
- ✅ No console errors in browser
- ✅ Mobile responsive design works
- ✅ All API endpoints respond correctly
- ✅ Authentication flow works end-to-end

## Next Steps After Deployment

1. **Share with Club Members:**
   - Send production URL
   - Provide login credentials (for admins/exco)
   - Create user guide

2. **Monitor Performance:**
   - Check Vercel Analytics daily
   - Monitor database usage
   - Track error rates

3. **Gather Feedback:**
   - Collect user feedback
   - Track feature requests
   - Monitor bug reports

4. **Plan Updates:**
   - Schedule regular updates
   - Plan new features
   - Maintain documentation

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Production URL:** _____________

**Database Provider:** _____________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
