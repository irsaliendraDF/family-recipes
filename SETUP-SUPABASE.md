# Turning on cloud mode

updated: 2026-08-29

Right now the app runs in practice mode: it works fully, but data stays on
whichever device entered it. Cloud mode makes your phone and laptop share one
book, and lets Claude add Walmart prices and smart recipes for you. Your
decision 2026-08-29: the Supabase account goes under your and Joel's joint email.

## Your steps, in order

1. Go to supabase.com, click Start your project, and sign up with the joint
   email. The free plan is enough, no card needed.
2. Create a new project. Name: `family-recipes`. Region: pick `ca-central-1`
   (Canada). The database password it asks you to set is just for the database
   itself; save it in your password manager, the app never uses it.
3. In the left sidebar open SQL Editor, click New query, paste the entire
   contents of `supabase/schema.sql` from this folder, and press Run. It
   should say Success.
4. In the left sidebar open Authentication, then Sign In / Providers, click
   Email, and turn OFF "Confirm email". Save. (This lets you create the app
   account instantly instead of chasing a confirmation link that would point
   to the wrong place.)
5. In Project Settings, open API Keys. Copy two values and paste them to
   Claude in the chat:
   - Project URL (looks like `https://something.supabase.co`)
   - the publishable / anon key (long, starts with `eyJ` or `sb_publishable_`)
   Both are safe to share and safe to ship inside the app.
6. Claude rebuilds and redeploys. Then on the live site tap "First time here:
   create our account", sign up once with the joint email and a password you
   both know, and the book opens. Anything already typed into that device's
   practice mode comes along automatically.
7. Last step, back in Supabase: Authentication, Sign In / Providers, turn OFF
   "Allow new users to sign up". Now the two of you are in and the door is
   closed behind you.

## What Claude never does

Claude never creates the account, never signs in for you, and never handles
either password. Those steps are yours on purpose.
