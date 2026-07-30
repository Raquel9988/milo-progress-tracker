MILO TRACKER — HISTORY-BASED RECOMMENDATION FIX

UPLOAD AND REPLACE THESE FILES IN THE ROOT OF YOUR GITHUB REPOSITORY:
1. index.html
2. script.js
3. styles.css

KEEP YOUR EXISTING supabase-config.js FILE.
NO NEW SUPABASE SQL IS REQUIRED.

NEW RECOMMENDATION RULE
- The most recently completed plan becomes the baseline.
- Manually choosing a higher plan immediately moves the recommendation to it.
- Only one result on that plan: repeat it.
- Two consecutive scores of 4 or 5 on that same plan: upgrade one stage.
- Two consecutive scores of 1 or 2: downgrade one stage.
- One good and one bad result, or any pair containing score 3: remain on the same plan.
- Deleting a result recalculates the recommendation from the remaining history.
- Refreshing on phone or computer recalculates from Supabase history, so a stale setting cannot return Milo to Foundation 1.

FOR YOUR CURRENT HISTORY
Because the latest saved plan is Foundation 9, the tracker will recommend Foundation 9 rather than Foundation 1. After a second consecutive Foundation 9 result:
- two good scores -> Foundation 10
- two bad scores -> Foundation 8
- mixed scores -> remain at Foundation 9

AFTER UPLOADING
1. Commit the three replacement files.
2. Wait for GitHub Pages to deploy.
3. Open:
   https://raquel9988.github.io/milo-progress-tracker/?v=6
4. Refresh once.
