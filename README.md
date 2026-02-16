# LAB68DEV CV Builder

A brutalist SaaS resume builder application built with Next.js 16, featuring passwordless authentication, six resume templates, and PDF export with dynamic font support.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, React 19, Turbopack)
- **Language:** TypeScript (strict mode)
- **Database:** Neon (Serverless Postgres)
- **ORM:** Drizzle ORM 0.45.1
- **Authentication:** Auth.js v5 (passwordless magic links via Resend)
- **Styling:** Tailwind CSS 4 (brutalist design system)
- **State Management:** Zustand 5.0.11
- **PDF Export:** @react-pdf/renderer 4.3.2
- **Email:** Resend 6.9.2
- **Fonts:** 10 Google Fonts (Inter, Roboto, Lato, Open Sans, Montserrat, Raleway, Merriweather, Playfair Display, Source Sans 3, Nunito)

## Features

- Passwordless authentication with magic links (sign-in and sign-up toggle)
- Dashboard with bento grid layout
- Split-view resume builder (form + live preview)
- Auto-save with 2-second debounce
- Six resume templates with matching PDF export
- Clickable URLs in both preview and PDF (website, LinkedIn, GitHub)
- 10 Google Fonts selectable per resume
- Tag-based input for skills and project technologies
- Row-level security (RLS) via Server Actions
- Mobile-responsive with preview toggle

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Neon Database
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Auth.js
AUTH_SECRET="your-secret-here"  # Generate with: npx auth secret
AUTH_URL="http://localhost:3000"  # Do NOT set this on Vercel (auto-detected)

# Resend (for magic links)
AUTH_RESEND_KEY="re_xxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
```

Get your Resend API key at [https://resend.com/api-keys](https://resend.com/api-keys).

### 3. Database Setup

Push the Drizzle schema to your Neon database:

```bash
npm run db:push
```

This creates the following tables:

- `users` -- User accounts
- `accounts` -- OAuth/email provider links
- `sessions` -- Session tokens
- `verification_tokens` -- Magic link tokens
- `resumes` -- Resume data (JSONB storage)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Scripts

```bash
npm run db:generate   # Generate migrations
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema changes (development)
npm run db:studio     # Open Drizzle Studio (database GUI)
npm run db:drop       # Drop all tables (destructive)
```

## Project Structure

```
src/
├── actions/
│   └── resume.ts                  # Server Actions with RLS
├── app/
│   ├── api/export/[id]/           # PDF export endpoint (Node.js runtime)
│   ├── builder/[id]/              # Resume builder route
│   ├── dashboard/                 # User dashboard
│   ├── login/                     # Auth pages (login, verify, error)
│   ├── globals.css                # Brutalist design system
│   └── layout.tsx                 # Root layout
├── components/
│   ├── builder/
│   │   ├── forms/                 # PersonalInfo, Experience, Education, Skills, Projects
│   │   ├── templates/             # 6 preview templates
│   │   ├── builder-client.tsx     # Auto-save + split-view logic
│   │   ├── builder-form.tsx       # Tabbed form navigation
│   │   ├── builder-header.tsx     # Title, template/font selectors, export
│   │   └── builder-preview.tsx    # 8.5 x 11 inch paper preview
│   ├── dashboard/                 # CreateResumeButton, ResumeCard
│   └── pdf/                       # 6 PDF templates (@react-pdf/renderer)
├── db/
│   ├── index.ts                   # Drizzle + Neon client
│   └── schema.ts                  # Database schema + types
├── hooks/
│   └── use-debounce.ts            # Auto-save debounce (2s delay)
├── lib/
│   ├── constants.ts               # EMPTY_RESUME_DATA, TEMPLATES
│   ├── fonts.ts                   # Google Fonts configuration
│   ├── pdf-font-loader.ts         # Dynamic PDF font registration
│   └── url-helpers.ts             # URL normalization and display labels
├── store/
│   └── resume-store.ts            # Zustand state management
├── types/
│   └── next-auth.d.ts             # Session type augmentation
├── auth.ts                        # Auth.js v5 configuration
└── middleware.ts                  # Route protection
```

## Templates

Six templates are available, each with a matching preview component and PDF component:

| Template | Style | Layout |
|----------|-------|--------|
| Lab Protocol | Brutalist sidebar | Black 2.5-inch sidebar with white text; contact, links, skills, and education on the sidebar; experience and projects in the main area |
| The Executive | Traditional top-down | Large header with contact info, professional summary, traditional section ordering |
| Mono Stack | Developer-oriented | Monospace typography, code-style section headers, technical layout |
| Clean Slate | Minimal | Generous whitespace, clean lines, subtle section dividers |
| Bold Impact | High contrast | Bold typography, strong visual hierarchy, prominent section headers |
| Compact Pro | Space-efficient | Dense layout optimized for fitting maximum content on one page |

## Design Philosophy

This application follows a brutalist design aesthetic:

- Zero border radius -- square corners everywhere
- Monochrome palette -- black and white only
- Inverted focus states -- black background, white text
- Visible borders -- 1px black borders on all interactive elements
- Monospace labels -- uppercase, tracking-wider
- Grid overlays on the landing page
- Industrial typography using the Archivo font family

The design intentionally feels raw and industrial -- no smooth gradients, no rounded corners, no subtle shadows. Pure function.

## Authentication Flow

1. User enters email on `/login`
2. Magic link sent via Resend
3. User clicks link in email
4. Redirected to `/login/verify` (confirmation page)
5. Auth.js validates token and creates session
6. Redirected to `/dashboard`

## Resume Builder

### Form Sections

- **Personal Info:** Name, email, phone, location, website, LinkedIn, GitHub, summary
- **Experience:** Company, position, dates, location, description, highlights
- **Education:** Institution, degree, field, GPA, dates
- **Skills:** Categories with tag-based input
- **Projects:** Name, URL, description, technologies (tags), highlights

### Auto-Save

- Debounced with 2-second delay
- Saves on every field change
- Shows save status in header (SAVING / SAVED with timestamp)
- Uses Zustand dirty tracking to prevent unnecessary saves

### Font Selection

Each resume can use one of 10 Google Fonts. The selected font applies to both the live preview and the exported PDF. Fonts are loaded dynamically for PDF rendering via `pdf-font-loader.ts`.

### Clickable URLs

Website, LinkedIn, and GitHub links are rendered as clickable elements in both the preview and exported PDF. Display labels are auto-generated (for example, `github.com/username` instead of the full URL).

## Deployment

### Vercel

1. Push to GitHub
2. Import the repository in Vercel
3. Set environment variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_RESEND_KEY`, `EMAIL_FROM`
4. Do not set `AUTH_URL` -- Vercel auto-detects it via `VERCEL_URL`
5. Deploy

### Environment Variables for Production

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."           # Generate a new secret for production
AUTH_RESEND_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
```

## Troubleshooting

### JWTSessionError: no matching decryption secret

Middleware is running on public routes. Verify that `src/middleware.ts` matcher config only includes protected routes (`/dashboard/*`, `/api/resumes/*`, `/api/export/*`).

### Magic link not sending

1. Verify `AUTH_RESEND_KEY` is set correctly
2. Check `EMAIL_FROM` is a verified domain in Resend
3. Check the Resend dashboard for email logs

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Check the Neon dashboard for the connection string
3. Ensure `?sslmode=require` is in the connection string
4. Run `npm run db:push` to create tables

### PDF export not working

1. Check browser console for errors
2. Verify the `/api/export/[id]` route is protected by middleware
3. Check that resume data is saved before exporting
4. The export route requires Node.js runtime (not Edge)

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text.

## Credits

Built with brutalist design principles by lab68dev.
