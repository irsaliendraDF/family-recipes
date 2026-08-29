# Phase 5: database, sign-in, deploy

updated: 2026-08-29 (rewritten after Irene's decision to use a new Supabase account under her and Joel's joint email, which replaces the original plan of a project in the DigitalFlow org)

## Goal

The app lives at a real URL, on her phone and laptop, with the data safe in a
Supabase account she and Joel own.

## How it lands, given the account is hers to create

1. The app ships with two modes. Practice mode (no keys): fully working,
   data per device. Cloud mode (keys present at build): sign-in required,
   one shared book.
2. Sign-in is email and password, created by Irene in the app, never by
   Claude. Two dashboard toggles make it clean: Confirm email off before
   sign-up, and sign-ups closed after the family accounts exist. Steps in
   `SETUP-SUPABASE.md`.
3. Schema plus row level security lives in `supabase/schema.sql`; Irene
   pastes it into the SQL editor herself since Claude has no access to the
   joint account.
4. First cloud sign-in on a device imports that device's practice data, or
   the sample data if the device is fresh. Nothing typed early is lost.
5. Deploy to Vercel (her connected account) as a static build. When she
   hands over the project URL and publishable key, Claude rebuilds with
   them and redeploys, and cloud mode is on.

## Consequence to know

Claude's Supabase connection points at the DigitalFlow account, not the
joint one, so Claude cannot write prices or suggestions into the database
directly until the joint account is connected as a Supabase connector in
her Claude settings. Until then Claude prepares SQL for her to paste, one
block, into the SQL editor.

## Done when

Irene opens the URL on her phone, signs in, and sees the book.
