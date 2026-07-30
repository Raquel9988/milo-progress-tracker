# Milo Progress Tracker — Supabase Version

This version uses:

- GitHub Pages for the website
- Supabase Auth for passwordless email login
- Supabase Database for synced sessions
- Row Level Security so each signed-in user can access only their own rows

## Files

- `index.html` — full website and login interface
- `styles.css` — full design, including mobile login and sync controls
- `script.js` — training plans, recommendations, Supabase login and database code
- `supabase-config.js` — paste your Supabase URL and publishable key here
- `supabase_setup.sql` — run once in Supabase SQL Editor
- `Milo_Extended_Graded_Pen_Independence_Training_Plan.pdf` — printable guide

## Part 1 — Create the Supabase project

1. Sign in to Supabase and create a new project.
2. Wait for the project to finish setting up.
3. Open **SQL Editor**.
4. Create a new query.
5. Copy every line from `supabase_setup.sql` into the query.
6. Click **Run**.
7. Confirm that these tables now exist in Table Editor:
   - `milo_training_sessions`
   - `milo_tracker_settings`

## Part 2 — Configure passwordless login

1. Open **Authentication** in Supabase.
2. Open **Providers** and make sure **Email** is enabled.
3. Open **URL Configuration**.
4. Set **Site URL** to:

   `https://raquel9988.github.io/milo-progress-tracker/`

5. Add the same address to **Redirect URLs**:

   `https://raquel9988.github.io/milo-progress-tracker/`

The website sends a magic login link. Users enter an email address, open the email and tap the link. No password is created or entered.

## Part 3 — Copy the project details

1. In Supabase, open the project's API/API Keys area.
2. Copy the **Project URL**.
3. Copy the **Publishable key**. A legacy `anon` key also works.
4. Open `supabase-config.js`.
5. Replace both placeholders:

```javascript
window.MILO_SUPABASE_CONFIG = Object.freeze({
    supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
    supabasePublishableKey: "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE"
});
```

Never put the `service_role` key in a website or GitHub repository.

## Part 4 — Upload to GitHub

Upload and replace all of these files in the root of the existing `milo-progress-tracker` repository:

- `index.html`
- `styles.css`
- `script.js`
- `supabase-config.js`
- `Milo_Extended_Graded_Pen_Independence_Training_Plan.pdf`

You may also upload:

- `README.md`
- `supabase_setup.sql`

Commit the changes. GitHub Pages will rebuild the same website address.

## Part 5 — First login and old-data import

1. Open the GitHub Pages website.
2. Enter your email.
3. Tap **Send Login Link**.
4. Open the email from Supabase.
5. Tap the link.
6. The website opens while signed in.
7. When the old-browser-data banner appears, tap **Import Old Sessions**.

The automatic importer is shown only when:

- old local-browser sessions exist, and
- the signed-in Supabase account has no saved sessions yet.

This prevents accidental duplicate imports.

## Using it on phone and computer

Use the same email address on both devices. Each device receives its own login link, but both devices load the same Supabase data after login.

The page refreshes data when the browser window becomes active. A **Refresh Data** button is also available.

## Common problems

### The email link returns to the wrong page

Check that the exact GitHub Pages address is entered under both Site URL and Redirect URLs in Supabase.

### No email arrives

Check spam/junk mail and wait at least one minute before requesting another link.

### “Row level security” or permission error

Run the complete `supabase_setup.sql` file again and confirm that you are signed in.

### The website says Supabase is not configured

Open `supabase-config.js` and replace both placeholder values.

### The website opens but data does not sync

Confirm that the SQL completed successfully, then use **Refresh Data**. Also confirm that the same email account was used on both devices.
