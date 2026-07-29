MILO'S PEN TRAINING PROGRESS TRACKER — UPDATED VERSION

FILES
1. index.html
2. styles.css
3. script.js

HOW TO OPEN THE WEBSITE
1. Keep all three website files inside the same folder.
2. Double-click index.html.
3. The website opens in your normal browser.

NEW RECOMMENDATION FEATURE
- The website plans three training sessions per day.
- It shows Session 1, Session 2 and Session 3 in the
  "Recommended Training for Today" section.
- The next recommendation recalculates whenever a result is saved.
- Completed sessions are marked in green.
- The next recommended session is highlighted in purple.
- Later sessions show the current provisional recommendation and
  recalculate after the earlier session is saved.

AUTOMATIC PROGRESSION RULE
The tracker uses 12 ordered training stages:
- 10-minute Levels 1 to 6
- 15-minute Levels 1 to 6

Two consecutive scores of 4 or 5 on the same length and level:
- Move to the next harder session.

Two consecutive scores of 1 or 2 on the same length and level:
- Move to the previous easier session.

Any other score combination:
- Repeat the most recently completed session.

SAVING
The website uses the same localStorage key as the earlier version:
miloSessions

To keep sessions already saved in the earlier tracker, replace the old
index.html, styles.css and script.js files with these updated files inside
the SAME original folder. Browser storage for locally opened files can depend
on the file location, so opening the updated tracker from a completely new
folder may start with an empty history.

IMPORTANT
- A maximum of three sessions can be saved per date.
- Clearing browser site data can erase locally saved sessions.
- Use Export CSV regularly to create a backup.
- No database or internet connection is required.
