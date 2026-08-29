# Turning on cloud mode

updated: 2026-08-29

Right now the app runs in practice mode: it works fully, but data stays on
whichever device entered it. Cloud mode makes your phone and laptop share one
book, and lets Claude add Walmart prices and smart recipes for you. Your
decision 2026-08-29: the Supabase account goes under your and Joel's joint email.

## Your steps, in order

The account and project already exist (project id `cwahillofydbbpjuhrmv`,
created by Irene 2026-08-29, so the URL is
`https://cwahillofydbbpjuhrmv.supabase.co`). What remains:

1. In the left sidebar open SQL Editor, click New query, paste the entire
   contents of `supabase/schema.sql` from this folder, and press Run. It
   should say Success.
2. In the left sidebar open Authentication, then Sign In / Providers, click
   Email, and turn OFF "Confirm email". Save. (This lets you create the app
   account instantly instead of chasing a confirmation link that would point
   to the wrong place.)
3. In Project Settings, open API Keys. Copy the publishable / anon key (long,
   starts with `eyJ` or `sb_publishable_`) and paste it to Claude in the
   chat. It is safe to share and safe to ship inside the app.
4. Claude rebuilds and redeploys. Then on the live site tap "First time here:
   create our account", sign up once with the joint email and a password you
   both know, and the book opens. Anything already typed into that device's
   practice mode comes along automatically.
5. Last step, back in Supabase: Authentication, Sign In / Providers, turn OFF
   "Allow new users to sign up". Now the two of you are in and the door is
   closed behind you.

## What Claude never does

Claude never creates the account, never signs in for you, and never handles
either password. Those steps are yours on purpose.
