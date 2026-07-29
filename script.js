// ---------- GET ELEMENTS FROM THE HTML ----------

const sessionForm = document.getElementById("sessionForm");
const sessionDate = document.getElementById("sessionDate");
const sessionType = document.getElementById("sessionType");
const difficultyLevel = document.getElementById("difficultyLevel");
const calmnessScore = document.getElementById("calmnessScore");
const cryingAmount = document.getElementById("cryingAmount");
const longestAbsence = document.getElementById("longestAbsence");
const sessionNotes = document.getElementById("sessionNotes");

const totalSessions = document.getElementById("totalSessions");
const totalMinutes = document.getElementById("totalMinutes");
const averageCalmness = document.getElementById("averageCalmness");
const highestLevel = document.getElementById("highestLevel");

const recommendationReason = document.getElementById(
    "recommendationReason"
);
const todaySessionCount = document.getElementById("todaySessionCount");
const useRecommendationButton = document.getElementById(
    "useRecommendationButton"
);

const sessionTableBody = document.getElementById("sessionTableBody");
const historyMessage = document.getElementById("historyMessage");
const exportButton = document.getElementById("exportButton");
const clearButton = document.getElementById("clearButton");


// ---------- TRAINING SESSION DEFINITIONS ----------

// The website treats the training plan as 12 steps:
// 10-minute Levels 1 to 6, followed by 15-minute Levels 1 to 6.
const trainingStages = [
    {
        duration: 10,
        level: 1,
        difficulty: "Very easy",
        focus: "Stay close to the pen and reward calm moments."
    },
    {
        duration: 10,
        level: 2,
        difficulty: "Easy",
        focus: "Sit a small distance away and return calmly to reward."
    },
    {
        duration: 10,
        level: 3,
        difficulty: "Easy-medium",
        focus: "Move around the room while Milo remains in the pen."
    },
    {
        duration: 10,
        level: 4,
        difficulty: "Medium",
        focus: "Add very short one-to-three-second disappearances."
    },
    {
        duration: 10,
        level: 5,
        difficulty: "Medium-hard",
        focus: "Mix room movement with three-to-five-second absences."
    },
    {
        duration: 10,
        level: 6,
        difficulty: "Hard",
        focus: "Practise varied distances and short unpredictable absences."
    },
    {
        duration: 15,
        level: 1,
        difficulty: "Very easy",
        focus: "Extend the easy nearby session while keeping Milo comfortable."
    },
    {
        duration: 15,
        level: 2,
        difficulty: "Easy",
        focus: "Use gentle distance changes during the longer session."
    },
    {
        duration: 15,
        level: 3,
        difficulty: "Easy-medium",
        focus: "Move naturally around the room for longer calm periods."
    },
    {
        duration: 15,
        level: 4,
        difficulty: "Medium",
        focus: "Mix visible movement with brief out-of-sight repetitions."
    },
    {
        duration: 15,
        level: 5,
        difficulty: "Medium-hard",
        focus: "Use varied short absences with easy recovery repetitions."
    },
    {
        duration: 15,
        level: 6,
        difficulty: "Hard",
        focus: "Practise the full mixture of distance, movement and absences."
    }
];


// ---------- LOAD AND PREPARE SAVED SESSIONS ----------

// localStorage keeps the data in this browser.
// The same key is used as the earlier website, so old sessions remain available.
let sessions = JSON.parse(localStorage.getItem("miloSessions")) || [];


// ---------- DATE AND SORTING HELPERS ----------

function getLocalDateText(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setTodaysDate() {
    sessionDate.value = getLocalDateText();
}

function sortSessionsChronologically(sessionList) {
    return [...sessionList].sort(function (firstSession, secondSession) {
        const firstDate = new Date(`${firstSession.date}T00:00:00`);
        const secondDate = new Date(`${secondSession.date}T00:00:00`);

        return (
            firstDate - secondDate ||
            Number(firstSession.id) - Number(secondSession.id)
        );
    });
}

function getSessionsForDate(dateText) {
    return sortSessionsChronologically(
        sessions.filter(function (session) {
            return session.date === dateText;
        })
    );
}

function normaliseDailySessionNumbers() {
    const orderedSessions = sortSessionsChronologically(sessions);
    const dateCounts = {};

    orderedSessions.forEach(function (session) {
        dateCounts[session.date] = (dateCounts[session.date] || 0) + 1;
        session.dailySession = dateCounts[session.date];
    });

    sessions = orderedSessions;
}


// ---------- SAVE ALL SESSIONS ----------

function saveSessions() {
    localStorage.setItem("miloSessions", JSON.stringify(sessions));
}


// ---------- TRAINING STAGE HELPERS ----------

function getStageIndex(duration, level) {
    return trainingStages.findIndex(function (stage) {
        return (
            stage.duration === Number(duration) &&
            stage.level === Number(level)
        );
    });
}

function getStageForSession(session) {
    const stageIndex = getStageIndex(session.duration, session.level);

    if (stageIndex === -1) {
        return trainingStages[0];
    }

    return trainingStages[stageIndex];
}

function getStageName(stage) {
    return `${stage.duration}-minute Level ${stage.level}`;
}

function getHardestCompletedStage() {
    if (sessions.length === 0) {
        return null;
    }

    let hardestIndex = 0;

    sessions.forEach(function (session) {
        const stageIndex = getStageIndex(session.duration, session.level);

        if (stageIndex > hardestIndex) {
            hardestIndex = stageIndex;
        }
    });

    return trainingStages[hardestIndex];
}


// ---------- AUTOMATIC RECOMMENDATION LOGIC ----------

function calculateRecommendation(sessionList) {
    const orderedSessions = sortSessionsChronologically(sessionList);

    if (orderedSessions.length === 0) {
        return {
            stage: trainingStages[0],
            action: "start",
            reason:
                "Milo has no saved results yet, so begin with the easiest 10-minute session."
        };
    }

    const lastSession = orderedSessions[orderedSessions.length - 1];
    const currentStageIndex = Math.max(
        getStageIndex(lastSession.duration, lastSession.level),
        0
    );

    if (orderedSessions.length < 2) {
        return {
            stage: trainingStages[currentStageIndex],
            action: "repeat",
            reason:
                "Only one result is available. Repeat the same session until two consecutive scores can be compared."
        };
    }

    const previousSession = orderedSessions[orderedSessions.length - 2];

    const sameSession =
        Number(previousSession.duration) === Number(lastSession.duration) &&
        Number(previousSession.level) === Number(lastSession.level);

    if (!sameSession) {
        return {
            stage: trainingStages[currentStageIndex],
            action: "repeat",
            reason:
                "The two latest results used different sessions, so repeat the most recent session to build a clear score pattern."
        };
    }

    const twoHighScores =
        Number(previousSession.calmness) >= 4 &&
        Number(lastSession.calmness) >= 4;

    if (twoHighScores) {
        const nextStageIndex = Math.min(
            currentStageIndex + 1,
            trainingStages.length - 1
        );

        if (nextStageIndex === currentStageIndex) {
            return {
                stage: trainingStages[currentStageIndex],
                action: "highest",
                reason:
                    "Milo scored 4 or 5 twice in a row and has reached the hardest session in this tracker."
            };
        }

        return {
            stage: trainingStages[nextStageIndex],
            action: "move-up",
            reason:
                "Milo scored 4 or 5 twice in a row on the same session, so the next harder session is recommended."
        };
    }

    const twoLowScores =
        Number(previousSession.calmness) <= 2 &&
        Number(lastSession.calmness) <= 2;

    if (twoLowScores) {
        const easierStageIndex = Math.max(currentStageIndex - 1, 0);

        if (easierStageIndex === currentStageIndex) {
            return {
                stage: trainingStages[currentStageIndex],
                action: "easiest",
                reason:
                    "Milo scored 1 or 2 twice in a row, but he is already on the easiest session. Repeat it gently."
            };
        }

        return {
            stage: trainingStages[easierStageIndex],
            action: "move-down",
            reason:
                "Milo scored 1 or 2 twice in a row on the same session, so an easier session is recommended."
        };
    }

    return {
        stage: trainingStages[currentStageIndex],
        action: "repeat",
        reason:
            "The latest two scores do not yet form two high or two low scores, so repeat the current session."
    };
}


// ---------- FORMAT AND SAFETY HELPERS ----------

function formatDate(dateText) {
    const date = new Date(`${dateText}T00:00:00`);

    return date.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ---------- TODAY'S THREE RECOMMENDATION CARDS ----------

function updateDailySessionCard(cardNumber, completedSession, recommendation) {
    const card = document.getElementById(`dailySession${cardNumber}`);
    const badge = card.querySelector(".recommendation-badge");
    const name = card.querySelector(".recommended-session-name");
    const difficulty = card.querySelector(
        ".recommended-session-difficulty"
    );
    const focus = card.querySelector(".recommended-session-focus");
    const note = card.querySelector(".recommended-session-note");

    card.classList.remove(
        "completed-session",
        "next-session",
        "future-session"
    );

    if (completedSession) {
        const completedStage = getStageForSession(completedSession);

        card.classList.add("completed-session");
        badge.textContent = "Completed";
        name.textContent = getStageName(completedStage);
        difficulty.textContent =
            `${completedStage.difficulty} • Score ${completedSession.calmness}/5`;
        focus.textContent = completedStage.focus;
        note.textContent =
            `Saved as today's Session ${completedSession.dailySession}.`;

        return;
    }

    const todaySessions = getSessionsForDate(getLocalDateText());
    const nextSessionNumber = Math.min(todaySessions.length + 1, 3);

    if (cardNumber === nextSessionNumber) {
        card.classList.add("next-session");
        badge.textContent = "Recommended next";
        note.textContent =
            "Use this session next. It will update after you save the result.";
    } else {
        card.classList.add("future-session");
        badge.textContent = "Planned for now";
        note.textContent =
            `This will recalculate after Session ${cardNumber - 1} is saved.`;
    }

    name.textContent = getStageName(recommendation.stage);
    difficulty.textContent = recommendation.stage.difficulty;
    focus.textContent = recommendation.stage.focus;
}

function updateRecommendations() {
    const todayText = getLocalDateText();
    const todaySessions = getSessionsForDate(todayText).slice(0, 3);
    const recommendation = calculateRecommendation(sessions);

    todaySessionCount.textContent =
        `${todaySessions.length} of 3 complete`;

    if (todaySessions.length >= 3) {
        recommendationReason.textContent =
            "Milo has completed all three planned sessions for today.";
        useRecommendationButton.disabled = true;
        useRecommendationButton.textContent = "Today's Training Complete";
    } else {
        recommendationReason.textContent = recommendation.reason;
        useRecommendationButton.disabled = false;
        useRecommendationButton.textContent = "Use Next Recommendation";
    }

    for (let cardNumber = 1; cardNumber <= 3; cardNumber += 1) {
        updateDailySessionCard(
            cardNumber,
            todaySessions[cardNumber - 1],
            recommendation
        );
    }
}

function applyCurrentRecommendationToForm() {
    const todaySessions = getSessionsForDate(getLocalDateText());

    if (todaySessions.length >= 3) {
        window.alert("Milo has already completed three sessions today.");
        return;
    }

    const recommendation = calculateRecommendation(sessions);

    sessionDate.value = getLocalDateText();
    sessionType.value = String(recommendation.stage.duration);
    difficultyLevel.value = String(recommendation.stage.level);

    document.getElementById("form-heading").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

useRecommendationButton.addEventListener(
    "click",
    applyCurrentRecommendationToForm
);


// ---------- ADD A NEW SESSION ----------

sessionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const sessionsOnSelectedDate = getSessionsForDate(sessionDate.value);

    if (sessionsOnSelectedDate.length >= 3) {
        window.alert(
            "Three sessions are already saved for this date. Delete one before adding another."
        );
        return;
    }

    const newSession = {
        id: Date.now(),
        date: sessionDate.value,
        dailySession: sessionsOnSelectedDate.length + 1,
        duration: Number(sessionType.value),
        level: Number(difficultyLevel.value),
        calmness: Number(calmnessScore.value),
        crying: cryingAmount.value,
        absence: Number(longestAbsence.value),
        notes: sessionNotes.value.trim()
    };

    sessions.push(newSession);
    normaliseDailySessionNumbers();

    saveSessions();
    displaySessions();
    updateSummary();
    updateRecommendations();

    sessionForm.reset();
    setTodaysDate();
    longestAbsence.value = 0;

    // Automatically prepare the next recommended session.
    const todaySessions = getSessionsForDate(getLocalDateText());

    if (todaySessions.length < 3) {
        const nextRecommendation = calculateRecommendation(sessions);

        sessionType.value = String(nextRecommendation.stage.duration);
        difficultyLevel.value = String(nextRecommendation.stage.level);
    }
});


// ---------- DISPLAY SESSION HISTORY ----------

function displaySessions() {
    sessionTableBody.innerHTML = "";

    if (sessions.length === 0) {
        sessionTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">
                    Milo's first session will appear here.
                </td>
            </tr>
        `;

        historyMessage.textContent = "No sessions recorded yet.";
        return;
    }

    historyMessage.textContent =
        `${sessions.length} session${sessions.length === 1 ? "" : "s"} recorded.`;

    const newestFirst = sortSessionsChronologically(sessions).reverse();

    newestFirst.forEach(function (session) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${formatDate(session.date)}</td>
            <td>Session ${session.dailySession}</td>
            <td>${session.duration} min</td>
            <td>Level ${session.level}</td>
            <td>${session.calmness}/5</td>
            <td>${escapeHtml(session.crying)}</td>
            <td>${session.absence} sec</td>
            <td>${escapeHtml(session.notes || "—")}</td>
            <td>
                <button
                    type="button"
                    class="delete-button"
                    data-id="${session.id}"
                >
                    Delete
                </button>
            </td>
        `;

        sessionTableBody.appendChild(row);
    });
}


// ---------- DELETE ONE SESSION ----------

sessionTableBody.addEventListener("click", function (event) {
    if (!event.target.classList.contains("delete-button")) {
        return;
    }

    const sessionId = Number(event.target.dataset.id);

    const shouldDelete = window.confirm(
        "Delete this training session?"
    );

    if (!shouldDelete) {
        return;
    }

    sessions = sessions.filter(function (session) {
        return Number(session.id) !== sessionId;
    });

    normaliseDailySessionNumbers();
    saveSessions();
    displaySessions();
    updateSummary();
    updateRecommendations();
});


// ---------- UPDATE SUMMARY CARDS ----------

function updateSummary() {
    totalSessions.textContent = sessions.length;

    const minutes = sessions.reduce(function (total, session) {
        return total + Number(session.duration);
    }, 0);

    totalMinutes.textContent = minutes;

    if (sessions.length === 0) {
        averageCalmness.textContent = "0/5";
        highestLevel.textContent = "None";
        return;
    }

    const calmnessTotal = sessions.reduce(function (total, session) {
        return total + Number(session.calmness);
    }, 0);

    const calmnessAverage = calmnessTotal / sessions.length;

    averageCalmness.textContent = `${calmnessAverage.toFixed(1)}/5`;

    const hardestStage = getHardestCompletedStage();

    highestLevel.textContent = getStageName(hardestStage);
}


// ---------- EXPORT THE DATA AS A CSV FILE ----------

exportButton.addEventListener("click", function () {
    if (sessions.length === 0) {
        window.alert("There are no sessions to export yet.");
        return;
    }

    const headings = [
        "Date",
        "Daily session",
        "Duration (minutes)",
        "Difficulty level",
        "Calmness score",
        "Crying",
        "Longest absence (seconds)",
        "Notes"
    ];

    const rows = sortSessionsChronologically(sessions).map(function (session) {
        return [
            session.date,
            session.dailySession,
            session.duration,
            session.level,
            session.calmness,
            session.crying,
            session.absence,
            session.notes
        ];
    });

    const csvLines = [headings, ...rows].map(function (row) {
        return row.map(function (value) {
            const safeValue = String(value).replaceAll('"', '""');
            return `"${safeValue}"`;
        }).join(",");
    });

    const csvText = csvLines.join("\n");
    const csvFile = new Blob([csvText], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(csvFile);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "milo-pen-training-progress.csv";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    URL.revokeObjectURL(downloadUrl);
});


// ---------- CLEAR ALL SAVED DATA ----------

clearButton.addEventListener("click", function () {
    if (sessions.length === 0) {
        window.alert("There are no sessions to clear.");
        return;
    }

    const shouldClear = window.confirm(
        "Delete every saved training session? This cannot be undone."
    );

    if (!shouldClear) {
        return;
    }

    sessions = [];

    saveSessions();
    displaySessions();
    updateSummary();
    updateRecommendations();

    sessionForm.reset();
    setTodaysDate();
    longestAbsence.value = 0;
    applyRecommendedValuesWithoutScrolling();
});


// ---------- FORM RECOMMENDATION HELPER ----------

function applyRecommendedValuesWithoutScrolling() {
    const todaySessions = getSessionsForDate(getLocalDateText());

    if (todaySessions.length >= 3) {
        sessionType.value = "";
        difficultyLevel.value = "";
        return;
    }

    const recommendation = calculateRecommendation(sessions);

    sessionType.value = String(recommendation.stage.duration);
    difficultyLevel.value = String(recommendation.stage.level);
}


// ---------- RUN WHEN THE PAGE FIRST OPENS ----------

normaliseDailySessionNumbers();
saveSessions();

setTodaysDate();
displaySessions();
updateSummary();
updateRecommendations();
applyRecommendedValuesWithoutScrolling();
