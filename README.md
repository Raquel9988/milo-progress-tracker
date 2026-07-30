# SettlePath Universal Dog Independence Tracker

This package replaces the pen-only tracker with a general multi-dog independence-training website and installable phone app.

## What changed

- Pen-only, no-pen, or combined training profiles
- Another-room and baby-gate training
- Repeated front-door and true home-exit practice
- Optional secure outdoor practice
- Automatic onboarding for each new dog
- Name, breed, DOB or approximate age, gender and pronouns
- Estimated starting level from "cannot be left" to 60 minutes
- Preferred starting route
- Profile page where all dog settings can be changed
- History-based recommendations:
  - two scores of 4 or 5 on the same plan -> move up
  - two scores of 1 or 2 -> move down
  - mixed scores or a score of 3 -> remain
  - a manually selected higher plan becomes the new baseline
- PWA files so the website can be installed on a phone like an app
- 65-page printable PDF guide
- Existing SettlePath dog and session data are preserved by the migration SQL

## Files to upload to GitHub

Upload every file in this folder to the root of the existing repository:

- index.html
- styles.css
- script.js
- plans.js
- supabase-config.js
- manifest.webmanifest
- service-worker.js
- icon-192.png
- icon-512.png
- SettlePath_Independence_Training_Guide.pdf

The SQL and README may also be stored in GitHub:

- supabase_setup_or_migration.sql
- README.md

## Supabase database update

Before opening the new website:

1. Open the Supabase project.
2. Open SQL Editor.
3. Create a new query.
4. Copy all contents of `supabase_setup_or_migration.sql`.
5. Press Run.

The script is designed to work after the earlier username/password setup. It adds the new dog-profile fields without deleting existing dogs or sessions.

Existing dog profiles receive pen-mode defaults and will be asked to complete the updated profile once.

## Authentication settings

In Supabase Authentication:

- Email provider: ON
- Allow new users to sign up: ON
- Confirm email: OFF
- Anonymous sign-ins: OFF
- Minimum password length: 8

The app converts the chosen username into an internal email-shaped identifier. Users only enter a username and password.

There is no email password recovery. Users should keep their passwords safely.

## GitHub Pages deployment

1. Upload and replace the files.
2. Commit the changes.
3. Wait for the newest Pages deployment to show a green tick.
4. Open the website with a cache-busting query once:

`https://raquel9988.github.io/milo-progress-tracker/?v=20`

5. Refresh once.

## Installing the app

SettlePath is a Progressive Web App.

Android / Chrome:
- Open the live website.
- Use the in-app Install app button when it appears.
- Or open the browser menu and choose Install app / Add to Home screen.

iPhone / Safari:
- Open the website in Safari.
- Tap Share.
- Choose Add to Home Screen.

The installed app and website use the same Supabase account and cloud data.

## New-user flow

After account creation or first sign-in, SettlePath requires a dog profile:

- dog name
- breed or mix (optional)
- date of birth or approximate age
- gender
- instruction pronouns
- pen, no-pen, or both
- secure outdoor area availability
- estimated current alone-time level
- preferred route for the first recommendation

After sessions are recorded, the history takes priority over the starting estimate.

## Outdoor training warning

Outdoor plans appear only after the user confirms a secure private outdoor area.

Do not use outdoor practice in dangerous weather, insecure fencing, theft-risk areas, or where the dog can escape, ingest hazards, disturb neighbours, or become distressed. Provide water, shade and shelter and monitor closely.

## Important behaviour note

The tracker is educational. A dog showing panic, self-injury, frantic escape attempts, heavy drooling, destructive exit behaviour, distress toileting or refusal of food may need help from a veterinarian or qualified clinical animal behaviour professional.
