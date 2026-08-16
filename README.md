# SkillBox — complete MVP starter

This is a clean restart based on the supplied SkillBox sketches: Skill Windows, visual candidate proof, candidate intro video, recruiter hiring flow, jobs and applications.

## Stack
React + TypeScript + Vite • Supabase Auth • PostgreSQL • Storage • custom SMTP • Cloudflare Pages

## Setup
1. Create a NEW Supabase project.
2. Supabase SQL Editor → run `supabase/schema.sql`.
3. Authentication → URL Configuration: set local site URL `http://localhost:5173` and redirect URLs `http://localhost:5173/reset` and `http://localhost:5173/auth/callback`.
4. Configure custom SMTP in Supabase Authentication → Emails → SMTP Settings. Do not put SMTP credentials in frontend env.
5. Copy `.env.example` to `.env.local` and fill the Supabase URL + publishable key.
6. `npm install`
7. `npm run dev`
8. Test signup email, login, forgot-password and reset-password before inviting users.

## Production deployment
Build with `npm run build`, output `dist`. Cloudflare Pages can host the static React app. Set the same two VITE_* environment variables in the deployment settings. Keep resumes/videos in Supabase Storage.

Do not put `service_role`/secret keys in VITE_* variables or the frontend.

## Free-tier reality
Supabase Free currently includes 50,000 MAU, 500 MB database, 1 GB storage, 5 GB egress and 200 peak realtime connections. Resend Free currently provides 3,000 emails/month and 100/day if you use it as SMTP. These are enough for a small MVP if usage is modest, but they are not an uptime/SLA guarantee. Supabase may pause low-activity Free projects and Free database backups are limited. For a business-critical company service, budget for a paid plan later.

Vercel Hobby is not the recommended host for this company project because its current terms restrict Hobby to personal/non-commercial use. Use Cloudflare Pages for the free/static MVP path and review terms before commercial launch.

## Current MVP routes
/, /jobs, /jobs/:id, /skills, /skills/:name, /register, /login, /forgot, /reset, /candidate, /candidate/profile, /candidate/:id, /recruiter, /recruiter/company, /recruiter/jobs/new, /recruiter/applications

## Security baseline
RLS is enabled in the SQL schema. Candidate/recruiter ownership is enforced for writes. Applications have a unique `(job_id,candidate_id)` constraint. Passwords are handled by Supabase Auth, not the profiles table. Private resume/video buckets are owner-restricted.

Before production, add file upload UI with MIME/size validation and signed URLs for authorized recruiter access to private files; add rate limiting for any custom server endpoints; test RLS with candidate and recruiter accounts; add monitoring and a backup/recovery plan.
