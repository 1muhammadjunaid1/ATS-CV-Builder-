# CVForge 🚀

**CVForge is a privacy-first, ATS-optimized CV builder designed to help job seekers create professional resumes with confidence. Users can build, preview, and export resumes entirely in their browser without registering an account. The platform features real-time ATS compliance scoring and an intelligent AI writing assistant that polishes professional summaries, work achievements, and project descriptions for maximum hiring impact.**

## ✨ Features
- **Privacy-First:** All core editing, theme switching, and PDF exporting happen entirely on the client side (in your browser). Your data is never saved to a database.
- **Real-Time ATS Scoring:** Get instant feedback on your CV's compatibility with Applicant Tracking Systems to ensure recruiters actually see your application.
- **Gemini AI Writing Assistant:** Connects to Google's Gemini AI to rewrite your professional summary and bullet points into highly impactful, ATS-friendly sentences.
- **Multiple Modern Themes:** Switch between clean, minimalist, and ATS-compliant visual styles with a single click.
- **PDF Export:** Render high-quality PDFs seamlessly.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Framer Motion, Zustand
- **Backend (Serverless):** Vercel Functions (`/api/enhance.ts`)
- **Authentication & Rate Limiting:** Supabase (Auth & PostgreSQL)
- **AI Integration:** Google Gemini (Gemini 2.5 Flash)

---

## 💻 Local Development Setup

### 1. Basic Setup (Core Features only)
If you only want to work on the UI, templates, and basic PDF export, **you don't need any environment variables.** 
```bash
npm install
npm run dev
```

### 2. Full Setup (with Gemini AI & Auth)
To test the AI enhancement and User login locally, you will need keys for Supabase and Google AI Studio.

1. Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your `.env` file with the following variables:
   ```env
   # Frontend Supabase configuration (No quotes needed)
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...

   # Server-only keys (For Vercel Functions)
   GEMINI_API_KEY=AIzaSy...
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```
3. Run the app using the **Vercel CLI** (since Vite doesn't run backend API routes natively):
   ```bash
   npm install -g vercel
   vercel dev
   ```

---

## 🗄️ Supabase Database Migration
To enforce the daily API limit (5 uses/day per user) for the Gemini AI feature, run the following SQL script in your Supabase SQL Editor:

```sql
create table public.usage_limits (
  user_id uuid not null,
  date date not null,
  count integer not null default 0,
  primary key (user_id, date)
);

alter table public.usage_limits enable row level security;

create policy "Users can read their own usage"
on public.usage_limits for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own usage"
on public.usage_limits for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own usage"
on public.usage_limits for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.increment_usage_limit(p_user_id uuid, p_date date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare new_count integer;
begin
  insert into usage_limits (user_id, date, count) values (p_user_id, p_date, 1)
  on conflict (user_id, date) do update
    set count = usage_limits.count + 1
    where usage_limits.count < 5
  returning count into new_count;

  if new_count is null then
    select count into new_count from usage_limits where user_id = p_user_id and date = p_date;
  end if;
  return new_count;
end;
$$;

revoke all on function public.increment_usage_limit(uuid, date) from public;
grant execute on function public.increment_usage_limit(uuid, date) to service_role;
```

## 🚀 Deployment (Vercel)
1. Deploy to Vercel via GitHub integration.
2. In **Vercel → Project Settings → Environment Variables**, add the 5 variables from your `.env` file for Production.
3. Redeploy the project.
