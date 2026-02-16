# Quick Setup Guide

Follow these steps to get your CV Builder running:

## 1. Database Setup (Neon)

1. Go to [https://neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string from the dashboard
4. It should look like: `postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

## 2. Email Setup (Resend)

1. Go to [https://resend.com](https://resend.com) and sign up
2. Navigate to **API Keys** in the dashboard
3. Create a new API key
4. Copy the key (starts with `re_`)
5. Add and verify a domain, or use their test domain for development

## 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Neon Database (paste your connection string)
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth.js Secret (run: npx auth secret)
AUTH_SECRET="your-generated-secret-here"
AUTH_URL="http://localhost:3000"

# Resend (paste your API key)
AUTH_RESEND_KEY="re_xxxxxxxxxxxxxxxxx"
EMAIL_FROM="onboarding@resend.dev"  # or your verified domain
```

**Generate AUTH_SECRET:**
```bash
npx auth secret
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Push Database Schema

```bash
npm run db:push
```

This creates all necessary tables in your Neon database.

## 6. Start Development Server

```bash
npm run dev
```

## 7. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "ENTER THE LAB"
3. Enter your email
4. Check your email for the magic link
5. Click the link to log in
6. You'll be redirected to the dashboard
7. Create a new resume and start building!

## Troubleshooting

### No email received?
- Check Resend dashboard logs
- Verify `EMAIL_FROM` is a verified domain or use `onboarding@resend.dev` for testing
- Check spam folder

### Database errors?
- Verify `DATABASE_URL` is correct
- Run `npm run db:push` again
- Check Neon dashboard for connection status

### Authentication errors?
- Verify `AUTH_SECRET` is set
- Check that middleware.ts only protects `/dashboard/*` and `/api/*` routes
- Clear browser cookies and try again

## Next Steps

1. ✅ Create your first resume
2. ✅ Fill in your personal information
3. ✅ Add experience and education
4. ✅ Switch between templates to see different layouts
5. ✅ Export to PDF when ready

## Database Management

```bash
# View database in Drizzle Studio (GUI)
npm run db:studio

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (DANGER - deletes all data!)
npm run db:drop
```

Enjoy building beautiful, brutalist resumes! 🏗️
