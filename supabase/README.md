# Supabase Setup

This project uses Supabase for authentication and for tracking the Gemini AI daily usage limit.

## 1. Create a Supabase project

Create a project at https://supabase.com/dashboard and wait until the project is fully provisioned.

## 2. Configure authentication

In your Supabase project dashboard:

1. Open Authentication -> URL Configuration.
2. Set Site URL to:
   - `http://127.0.0.1:5173`
3. Add this Redirect URL:
   - `http://127.0.0.1:5173`

Email/password auth is enough for local setup. Google login is optional and can be configured later from Authentication -> Providers -> Google.

Keep Google hidden locally unless you have configured the Google provider:

```env
VITE_ENABLE_GOOGLE_AUTH=false
```

After Google is configured in Supabase, change it to:

```env
VITE_ENABLE_GOOGLE_AUTH=true
```

## 3. Add the database objects

Open SQL Editor in Supabase and run the full contents of:

```text
supabase/usage_limits.sql
```

This creates:

- `public.usage_limits`
- Row Level Security policies for authenticated users
- `public.increment_usage_limit(...)`, used by the backend to reserve one AI use

## 4. Fill local environment variables

In `.env`, keep your existing `GEMINI_API_KEY` and add these Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-legacy-anon-key

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-legacy-service-role-key
```

For this repo's current backend code, use the legacy `anon` and `service_role` keys from Supabase Dashboard -> Settings -> API Keys -> Legacy API Keys.

Do not commit `.env`.
