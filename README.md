# CVForge

CVForge is a browser-based CV builder for creating clean, ATS-friendly resumes. It combines a guided editor, live document preview, ATS feedback, PDF export, authentication, and optional Gemini-powered writing assistance.

## Features

- Three responsive CV templates for entry-level, executive, and professional profiles
- Guided editing for contact details, summary, experience, education, skills, projects, and certifications
- Live CV preview with browser persistence
- ATS scoring with section-specific feedback
- PDF export, printing, and plain-text copying
- Supabase email/password authentication with optional Google sign-in
- Gemini writing assistance with a five-use daily limit per authenticated user

## Technology

- React 19 and TypeScript
- Vite 6
- Zustand
- Framer Motion and Lucide React
- Supabase Auth and PostgreSQL
- Google Gemini API
- Vercel serverless functions
- html2pdf.js

## Requirements

- A recent Node.js LTS release
- npm
- A Supabase project for authentication and AI usage tracking
- A Google AI Studio API key for Gemini enhancements

The editor, templates, ATS scoring, and local CV storage work without external services. Authentication and AI enhancement require the environment configuration below.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Duplicate `.env.example` as `.env`.

3. Add the required environment values.

4. Start the development server:

   ```bash
   npm run dev
   ```

Vite serves both the React application and the local `/api/enhance` route. Open the local URL printed in the terminal, normally `http://127.0.0.1:5173`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Public Supabase project URL used by the browser |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase anonymous key |
| `VITE_ENABLE_GOOGLE_AUTH` | Set to `true` after enabling Google in Supabase |
| `GEMINI_API_KEY` | Server-only Google Gemini API key |
| `GEMINI_MODEL` | Gemini model used by the enhancement route |
| `SUPABASE_URL` | Server-side Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service role key |

Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` variable, and never commit `.env`.

## Supabase Setup

1. Create a Supabase project.
2. Run [`supabase/usage_limits.sql`](supabase/usage_limits.sql) in the Supabase SQL Editor.
3. Configure the local and production site URLs under Authentication.
4. Enable email/password authentication.
5. Optionally configure the Google provider and set `VITE_ENABLE_GOOGLE_AUTH=true`.

Detailed instructions are available in [`supabase/README.md`](supabase/README.md).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the frontend and local API route |
| `npm run typecheck` | Check the frontend and Vite configuration |
| `npm run build` | Type-check and create a production build in `dist` |
| `npm run preview` | Preview the production build locally |

## Project Structure

```text
api/                         Serverless Gemini enhancement route
src/components/              Authentication, branding, and CV preview components
src/hooks/                   Authentication and Gemini hooks
src/pages/                   Template gallery and CV builder
src/store/                   Persisted CV state
src/utils/                   ATS scoring and export utilities
supabase/                    Database migration and setup guide
vite.config.ts               Vite and local API configuration
vercel.json                  Production routing configuration
```

## Data and Privacy

CV data is stored in the browser through local storage. Supabase stores authentication data and daily AI usage counters. CV text is sent to the serverless enhancement route and Google Gemini only when the user explicitly requests an AI enhancement.

## Production Deployment

The repository includes a Vercel serverless API route and SPA rewrites. Add all environment variables to the deployment platform, run `npm run build`, and use `dist` as the frontend output directory. Keep all server-only keys restricted to the server environment.
