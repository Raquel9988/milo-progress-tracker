# SettlePath v35 - Puppy route rewrite

This update rewrites every plan to use the generic word **Puppy** and removes preparation-only minutes.

## Main changes

- Room plans now follow the same pattern as pen training: sit nearby, wait for calm, approach the doorway, leave briefly, close the door, return calmly, and reward calmness.
- House plans progress through front-door exits of 1 second, 2 seconds, 5 seconds, 10 seconds, 30 seconds, 1 minute, 5 minutes, 10 minutes, 30 minutes and 60 minutes.
- Outdoor plans progress through going indoors while Puppy remains in a secure private outdoor area for 1 second, 2 seconds, 5 seconds, 10 seconds, 30 seconds, 1 minute and 5 minutes.
- Every minute contains the main training activity. Safety preparation remains in the checklist rather than using training minutes.
- Only leave when Puppy is calm. Reward after returning when Puppy is calm.
- Two scores of 4 or 5 on the same plan move up; two scores of 1 or 2 move down; mixed scores repeat the plan.

## Deployment

Upload every file in this folder to the root of the GitHub Pages repository and replace the existing files. No new Supabase migration is required if the universal migration was already run.

Open the deployed version with `?v=33` once to force a fresh cache.

---


## v32 authentication fix

This version fixes a Supabase sign-in deadlock caused by making asynchronous
database calls directly inside `onAuthStateChange`.

Run `supabase_setup_or_migration.sql` again. It now adds the
`settlepath_username_available()` function. When somebody tries to create an
account using an existing username, the website displays:

> That username already exists. Choose Sign in instead.

Upload every file from this package so `index.html`, `script.js`,
`service-worker.js`, and the v32 cache all match.

# SettlePath Universal Dog Independence Tracker

This package replaces the pen-only tracker with a general multi-dog independence-training website and installable phone app.

## What changed

- Pen-only, no-pen, or combined training profiles
- Closed-room and room-door training
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
- 155-page printable PDF guide
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
- SettlePath_Complete_Minute_by_Minute_Guide.pdf

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

`https://raquel9988.github.io/milo-progress-tracker/?v=35`

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

The tracker is educational. A dog showing panic, self-injury, frantic escape attempts, heavy drooling, destructive exit behaviour, stress-related accidents or refusal of food may need help from a veterinarian or qualified clinical animal behaviour professional.


## Version 30 changes

- The Plans page is now an in-place accordion. A plan opens directly beneath its own title instead of showing instructions at the bottom or in a separate column.
- Multiple plans can remain expanded for comparison.
- Added Expand shown plans and Collapse all controls.
- Added a puppy-cute colour system using purple, pink, orange, red and blue.
- Every pen, room/home and secure outdoor plan contains one clear instruction for every minute of the full session.
- Added quick setup checklists, calm verbal cues and colour-coded reward/adjustment boxes.
- Updated the printable PDF to match the website.

After uploading, open the site with `?v=35` once so the new service worker and files replace the old cache.


## v32 login behaviour

- The shared website opens on the Sign in page by default.
- Selecting **Stay logged in on this device** stores the Supabase session persistently on that device.
- Leaving it unchecked keeps the session only for the current browser/app session.
- **Sign out / switch account** clears the saved session so another person can sign in on the same device.
- Different people can use the same public link with separate usernames, dogs and training records.
- No additional SQL migration is required for this login change.


## v35 route corrections

- Every plan uses the generic word **Puppy**.
- No timed minute is used for area inspection or another preparation-only task.
- Room plans use a real room door: sit with Puppy, wait for calm, approach the door, leave briefly, close the door, return calmly and reward calmness.
- House plans use the front door and progress through 1 second, 2 seconds, 5 seconds, 10 seconds, 30 seconds, 1 minute, 5 minutes, 10 minutes, 30 minutes and 60 minutes.
- Outdoor plans keep Puppy in a secure private outdoor space while the owner goes indoors for 1 second, 2 seconds, 5 seconds, 10 seconds, 30 seconds, 1 minute and 5 minutes.
- No room or house plan assumes access to separate barrier equipment.
- Open the deployed site once with `?v=35` to replace the previous app cache.


## v35 outdoor-hour progression

The secure outdoor route now contains 16 graded plans:

- Calm together outside
- 1 second, 2 seconds, 5 seconds, 10 seconds and 30 seconds indoors
- 1 minute, 2 minutes, 3 minutes and 5 minutes indoors
- 10 minutes, 15 minutes, 20 minutes, 30 minutes, 45 minutes and 60 minutes indoors

Every long plan includes one instruction for every challenge minute and requires camera or audio monitoring. Recent history and today's sessions now show both the level and plan name, for example `Level 12/26 · Bridge to 30 Seconds`.
