# Phase 5: database, sign-in, deploy

updated: 2026-08-29

## Goal

The app lives at a real URL, on her phone and laptop, with her data safe in Supabase.

## Steps

1. Create the Supabase project (free tier, confirm $0 before creating).
2. Tables: recipes, pantry_items, meal_plans, suggestions. Row level security on all of them: only Irene's email (irene@digitalflowconsulting.ca) can read or write.
3. Sign-in: magic link to her email. She signs herself in; Claude never handles a password.
4. Swap the local data layer for the Supabase one. Migrate anything created locally.
5. Deploy to Vercel. Verify the live URL works, including sign-in, at mobile width.

## Done when

Irene opens the URL on her phone, signs in with the emailed link, and sees the book.
