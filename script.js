const { plans: trainingPlans, capabilities, references } = window.SETTLEPATH_PLAN_DATA;

const config = window.SETTLEPATH_SUPABASE_CONFIG || window.MILO_SUPABASE_CONFIG || {};
const cleanedSupabaseUrl = String(config.supabaseUrl || "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

const INTERNAL_LOGIN_DOMAIN = "accounts.settlepath.app";
const ACTIVE_DOG_STORAGE_PREFIX = "settlepath-active-dog";
const APP_VERSION = "20";

const byId = id => document.getElementById(id);

const authScreen = byId("authScreen");
const appShell = byId("appShell");
const showSignInButton = byId("showSignInButton");
const showCreateButton = byId("showCreateButton");
const signInForm = byId("signInForm");
const createAccountForm = byId("createAccountForm");
const signInUsername = byId("signInUsername");
const signInPassword = byId("signInPassword");
const createUsername = byId("createUsername");
const createPassword = byId("createPassword");
const confirmPassword = byId("confirmPassword");
const authMessage = byId("authMessage");

const dogSelector = byId("dogSelector");
const addDogButton = byId("addDogButton");
const accountButton = byId("accountButton");
const avatarInitial = byId("avatarInitial");
const accountDialog = byId("accountDialog");
const accountUsername = byId("accountUsername");
const changePasswordButton = byId("changePasswordButton");
const signOutButton = byId("signOutButton");
const passwordDialog = byId("passwordDialog");
const passwordForm = byId("passwordForm");
const currentPasswordInput = byId("currentPassword");
const newPasswordInput = byId("newPassword");
const newPasswordConfirm = byId("newPasswordConfirm");
const passwordMessage = byId("passwordMessage");

const dashboardTitle = byId("dashboardTitle");
const dashboardSubtitle = byId("dashboardSubtitle");
const emptyDogState = byId("emptyDogState");
const trackerContent = byId("trackerContent");
const emptyAddDogButton = byId("emptyAddDogButton");

const totalSessionsElement = byId("totalSessions");
const averageCalmnessElement = byId("averageCalmness");
const longestAbsenceElement = byId("longestAbsence");
const currentRouteElement = byId("currentRoute");

const recommendedStage = byId("recommendedStage");
const recommendationBadge = byId("recommendationBadge");
const recommendedPlanTitle = byId("recommendedPlanTitle");
const recommendedPlanTarget = byId("recommendedPlanTarget");
const recommendationReason = byId("recommendationReason");
const useRecommendationButton = byId("useRecommendationButton");
const viewRecommendationButton = byId("viewRecommendationButton");
const todayCountBadge = byId("todayCountBadge");
const todaySessionList = byId("todaySessionList");

const sessionForm = byId("sessionForm");
const sessionDate = byId("sessionDate");
const trainingPlanSelect = byId("trainingPlan");
const selectedPlanHelp = byId("selectedPlanHelp");
const viewSelectedPlanButton = byId("viewSelectedPlanButton");
const calmnessScore = byId("calmnessScore");
const vocalisation = byId("vocalisation");
const absenceMinutes = byId("absenceMinutes");
const absenceSeconds = byId("absenceSeconds");
const sessionNotes = byId("sessionNotes");
const saveSessionButton = byId("saveSessionButton");

const historyMessage = byId("historyMessage");
const historyList = byId("historyList");
const exportButton = byId("exportButton");
const importButton = byId("importButton");
const importFileInput = byId("importFileInput");

const planSearch = byId("planSearch");
const planPathFilters = byId("planPathFilters");
const plansGrid = byId("plansGrid");
const planDetail = byId("planDetail");
const plansPageDescription = byId("plansPageDescription");
const planDialog = byId("planDialog");
const planDialogContent = byId("planDialogContent");
const sourceList = byId("sourceList");

const profileHeading = byId("profileHeading");
const profileDogName = byId("profileDogName");
const profileDogDetails = byId("profileDogDetails");
const dogProfileInitial = byId("dogProfileInitial");
const profileTrainingStyle = byId("profileTrainingStyle");
const profileStartingLevel = byId("profileStartingLevel");
const profilePreferredPath = byId("profilePreferredPath");
const profileOutdoor = byId("profileOutdoor");
const editProfileButton = byId("editProfileButton");
const profileAddDogButton = byId("profileAddDogButton");

const dogDialog = byId("dogDialog");
const dogForm = byId("dogForm");
const dogDialogTitle = byId("dogDialogTitle");
const closeDogDialogButton = byId("closeDogDialogButton");
const editingDogId = byId("editingDogId");
const dogName = byId("dogName");
const dogBreed = byId("dogBreed");
const dogGender = byId("dogGender");
const dogBirthDate = byId("dogBirthDate");
const dogAgeMonths = byId("dogAgeMonths");
const dogPronouns = byId("dogPronouns");
const dogOutdoorAvailable = byId("dogOutdoorAvailable");
const dogStartingCapability = byId("dogStartingCapability");
const dogPreferredPath = byId("dogPreferredPath");
const deleteDogButton = byId("deleteDogButton");

const installAppButton = byId("installAppButton");
const profileInstallButton = byId("profileInstallButton");
const refreshButton = byId("refreshButton");
const syncStatus = byId("syncStatus");
const loadingScreen = byId("loadingScreen");
const loadingMessage = byId("loadingMessage");

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;
let dogs = [];
let activeDogId = null;
let sessions = [];
let currentRecommendation = null;
let displayedPlanId = null;
let activePlanFilter = "all";
let deferredInstallPrompt = null;
let isLoading = false;

function isConfigured() {
    return Boolean(
        cleanedSupabaseUrl &&
        config.supabasePublishableKey &&
        !cleanedSupabaseUrl.includes("YOUR_PROJECT") &&
        !config.supabasePublishableKey.includes("PASTE_YOUR")
    );
}

function setLoading(visible, message = "Loading SettlePath...") {
    loadingMessage.textContent = message;
    loadingScreen.hidden = !visible;
}

function showAuthMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle("error", isError);
    authMessage.classList.toggle("success", Boolean(message) && !isError);
}

function showPasswordMessage(message, isError = false) {
    passwordMessage.textContent = message;
    passwordMessage.classList.toggle("error", isError);
    passwordMessage.classList.toggle("success", Boolean(message) && !isError);
}

function normaliseUsername(value) {
    return String(value || "").trim().toLowerCase();
}

function isValidUsername(username) {
    return /^[a-z0-9_]{3,24}$/.test(username);
}

function usernameToInternalEmail(username) {
    return `${normaliseUsername(username)}@${INTERNAL_LOGIN_DOMAIN}`;
}

function getLocalDateText(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(dateText) {
    if (!dateText) return "Unknown date";
    return new Date(`${dateText}T00:00:00`).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Number(totalSeconds) || 0);
    if (!seconds) return "None";
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    if (minutes < 60) return remainder ? `${minutes} min ${remainder} sec` : `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function capitalise(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function getActiveDog() {
    return dogs.find(dog => dog.id === activeDogId) || null;
}

function getPronounSet(dog = getActiveDog()) {
    const key = dog?.pronouns || "they";
    if (key === "he") return { subject: "he", object: "him", possessive: "his" };
    if (key === "she") return { subject: "she", object: "her", possessive: "her" };
    return { subject: "they", object: "them", possessive: "their" };
}

function personaliseText(text, dog = getActiveDog()) {
    if (!text) return "";
    const name = dog?.name || "your dog";
    const pronouns = getPronounSet(dog);
    return String(text)
        .replaceAll("{name}", name)
        .replaceAll("{Subject}", capitalise(pronouns.subject))
        .replaceAll("{subject}", pronouns.subject)
        .replaceAll("{Object}", capitalise(pronouns.object))
        .replaceAll("{object}", pronouns.object)
        .replaceAll("{Possessive}", capitalise(pronouns.possessive))
        .replaceAll("{possessive}", pronouns.possessive)
        .replaceAll("Milo's", `${name}'s`)
        .replaceAll("Milo", name)
        .replace(/\bHe\b/g, capitalise(pronouns.subject))
        .replace(/\bhe\b/g, pronouns.subject)
        .replace(/\bHim\b/g, capitalise(pronouns.object))
        .replace(/\bhim\b/g, pronouns.object)
        .replace(/\bHis\b/g, capitalise(pronouns.possessive))
        .replace(/\bhis\b/g, pronouns.possessive);
}

function getPlan(planId) {
    return trainingPlans.find(plan => plan.id === planId) || null;
}

function getPathPlans(path) {
    return trainingPlans
        .filter(plan => plan.path === path)
        .sort((a, b) => a.orderInPath - b.orderInPath);
}

function getCapability(capabilityId) {
    return capabilities.find(item => item.id === capabilityId) || capabilities[0];
}

function getPathLabel(path) {
    if (path === "pen") return "Pen / enclosed area";
    if (path === "home") return "Room / home departures";
    if (path === "outdoor") return "Secure outdoor practice";
    return "Training";
}

function getTrainingStyleLabel(style) {
    if (style === "pen") return "Pen or enclosed safe area";
    if (style === "no_pen") return "No pen: room, home and optional outdoor";
    if (style === "both") return "Pen and non-pen plans";
    return "Not selected";
}

function getAvailablePaths(dog = getActiveDog()) {
    if (!dog) return [];
    const paths = [];
    if (dog.training_style === "pen" || dog.training_style === "both") paths.push("pen");
    if (dog.training_style === "no_pen" || dog.training_style === "both") paths.push("home");
    if (
        (dog.training_style === "no_pen" || dog.training_style === "both") &&
        dog.outdoor_available
    ) {
        paths.push("outdoor");
    }
    return paths;
}

function getAvailablePlans(dog = getActiveDog()) {
    const paths = getAvailablePaths(dog);
    return trainingPlans.filter(plan => paths.includes(plan.path));
}

function getStartingPlan(dog = getActiveDog()) {
    if (!dog) return null;
    const paths = getAvailablePaths(dog);
    const preferredPath = paths.includes(dog.preferred_path) ? dog.preferred_path : paths[0];
    const pathPlans = getPathPlans(preferredPath);
    if (!pathPlans.length) return null;

    const capabilitySeconds = getCapability(dog.starting_capability).seconds;
    if (capabilitySeconds <= 0) return pathPlans[0];

    const exactOrNext = pathPlans.find(plan => Number(plan.targetSeconds) >= capabilitySeconds);
    return exactOrNext || pathPlans.at(-1);
}

function targetText(plan) {
    return plan?.targetSeconds > 0
        ? `Target: ${formatDuration(plan.targetSeconds)} out of sight`
        : "No planned absence";
}

function formatDogAge(dog) {
    if (!dog) return "";
    if (dog.birth_date) {
        const birth = new Date(`${dog.birth_date}T00:00:00`);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
        if (now.getDate() < birth.getDate()) months -= 1;
        months = Math.max(0, months);
        if (months < 24) return `${months} month${months === 1 ? "" : "s"} old`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem ? `${years} yr ${rem} mo` : `${years} year${years === 1 ? "" : "s"} old`;
    }
    if (dog.age_months) {
        const months = Number(dog.age_months);
        if (months < 24) return `About ${months} month${months === 1 ? "" : "s"} old`;
        const years = Math.floor(months / 12);
        const rem = months % 12;
        return rem ? `About ${years} yr ${rem} mo` : `About ${years} year${years === 1 ? "" : "s"} old`;
    }
    return "Age not recorded";
}

function sortSessions(list) {
    return [...list].sort((a, b) => {
        const dateDifference = new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`);
        if (dateDifference) return dateDifference;
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
}

function getSessionsForDate(dateText) {
    return sessions.filter(session => session.date === dateText);
}

function rowToSession(row) {
    return {
        id: row.id,
        date: row.session_date,
        planId: row.plan_id,
        calmness: Number(row.calmness_score),
        crying: row.vocalisation,
        absenceSeconds: Number(row.actual_absence_seconds || 0),
        notes: row.notes || "",
        createdAt: row.created_at
    };
}

function setAuthMode(mode) {
    const createMode = mode === "create";
    signInForm.hidden = createMode;
    createAccountForm.hidden = !createMode;
    showSignInButton.classList.toggle("active-tab", !createMode);
    showCreateButton.classList.toggle("active-tab", createMode);
    showAuthMessage("");
}

function showPage(pageId) {
    document.querySelectorAll(".app-page").forEach(page => {
        page.hidden = page.id !== pageId;
    });
    document.querySelectorAll("[data-page-target]").forEach(button => {
        button.classList.toggle("active-nav", button.dataset.pageTarget === pageId);
    });
    if (pageId === "plansPage") renderPlansPage();
    if (pageId === "profilePage") renderProfile();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page-target]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.pageTarget));
});

showSignInButton.addEventListener("click", () => setAuthMode("signin"));
showCreateButton.addEventListener("click", () => setAuthMode("create"));

document.querySelectorAll(".show-password-button").forEach(button => {
    button.addEventListener("click", () => {
        const input = byId(button.dataset.passwordTarget);
        const shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        button.textContent = shouldShow ? "Hide" : "Show";
    });
});

document.querySelectorAll("[data-close-dialog]").forEach(button => {
    button.addEventListener("click", () => byId(button.dataset.closeDialog)?.close());
});

function setAppVisible(signedIn) {
    authScreen.hidden = signedIn;
    appShell.hidden = !signedIn;
    if (!signedIn) showPage("dashboardPage");
}

signInForm.addEventListener("submit", async event => {
    event.preventDefault();
    const username = normaliseUsername(signInUsername.value);
    if (!isValidUsername(username)) {
        showAuthMessage("Use 3-24 letters, numbers or underscores.", true);
        return;
    }

    showAuthMessage("Signing in...");
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: usernameToInternalEmail(username),
        password: signInPassword.value
    });
    if (error) {
        showAuthMessage("Username or password is incorrect.", true);
        return;
    }
    signInForm.reset();
});

createAccountForm.addEventListener("submit", async event => {
    event.preventDefault();
    const username = normaliseUsername(createUsername.value);
    const password = createPassword.value;

    if (!isValidUsername(username)) {
        showAuthMessage("Use 3-24 letters, numbers or underscores.", true);
        return;
    }
    if (password.length < 8) {
        showAuthMessage("The password must contain at least 8 characters.", true);
        return;
    }
    if (password !== confirmPassword.value) {
        showAuthMessage("The passwords do not match.", true);
        return;
    }

    showAuthMessage("Creating account...");
    const { data, error } = await supabaseClient.auth.signUp({
        email: usernameToInternalEmail(username),
        password,
        options: { data: { username } }
    });

    if (error) {
        showAuthMessage(
            error.message.toLowerCase().includes("already")
                ? "That username is already in use."
                : error.message,
            true
        );
        return;
    }

    if (!data.session) {
        showAuthMessage(
            "Account created but email confirmation is still enabled in Supabase. Turn Confirm email off, then create the account again.",
            true
        );
        return;
    }

    createAccountForm.reset();
});

async function ensureProfile() {
    const { data, error } = await supabaseClient
        .from("dog_tracker_profiles")
        .select("user_id, username")
        .eq("user_id", currentUser.id)
        .maybeSingle();
    if (error) throw error;

    if (data) {
        currentProfile = data;
        return;
    }

    const username = normaliseUsername(
        currentUser.user_metadata?.username || currentUser.email?.split("@")[0] || "user"
    );
    const { data: inserted, error: insertError } = await supabaseClient
        .from("dog_tracker_profiles")
        .upsert({ user_id: currentUser.id, username })
        .select("user_id, username")
        .single();
    if (insertError) throw insertError;
    currentProfile = inserted;
}

async function loadDogs() {
    const { data, error } = await supabaseClient
        .from("dog_tracker_dogs")
        .select(`
            id, name, breed, birth_date, age_months, gender, pronouns,
            training_style, starting_capability, preferred_path,
            outdoor_available, profile_completed, created_at
        `)
        .order("created_at", { ascending: true });
    if (error) throw error;
    dogs = data || [];

    const stored = localStorage.getItem(`${ACTIVE_DOG_STORAGE_PREFIX}:${currentUser.id}`);
    activeDogId = dogs.some(dog => dog.id === stored) ? stored : dogs[0]?.id || null;
    renderDogSelector();
}

async function loadSessions() {
    if (!activeDogId) {
        sessions = [];
        return;
    }
    const { data, error } = await supabaseClient
        .from("dog_tracker_sessions")
        .select("id, session_date, plan_id, calmness_score, vocalisation, actual_absence_seconds, notes, created_at")
        .eq("dog_id", activeDogId)
        .order("session_date", { ascending: true })
        .order("created_at", { ascending: true });
    if (error) throw error;
    sessions = (data || []).map(rowToSession);
}

async function loadAppData(message = "Loading your dogs...") {
    if (!currentUser || isLoading) return;
    isLoading = true;
    setLoading(true, message);
    syncStatus.textContent = "Syncing...";
    try {
        await ensureProfile();
        await loadDogs();
        await loadSessions();
        renderApp();
        syncStatus.textContent = `Synced ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        if (!dogs.length) {
            openDogDialog(null, true);
        } else if (!getActiveDog()?.profile_completed) {
            openDogDialog(getActiveDog(), true);
        }
    } catch (error) {
        console.error(error);
        syncStatus.textContent = "Sync failed";
        window.alert(`Could not load SettlePath: ${error.message}`);
    } finally {
        isLoading = false;
        setLoading(false);
    }
}

function renderDogSelector() {
    dogSelector.innerHTML = dogs.length
        ? dogs.map(dog => `<option value="${dog.id}">${escapeHtml(dog.name)}</option>`).join("")
        : `<option value="">No dogs yet</option>`;
    dogSelector.value = activeDogId || "";
    dogSelector.disabled = !dogs.length;
}

function renderApp() {
    const dog = getActiveDog();
    accountUsername.textContent = currentProfile?.username || "Account";
    avatarInitial.textContent = (currentProfile?.username || "U").charAt(0).toUpperCase();

    emptyDogState.hidden = Boolean(dog);
    trackerContent.hidden = !dog;

    populateCapabilitySelect();
    renderSources();

    if (!dog) {
        dashboardTitle.textContent = "Welcome to SettlePath";
        dashboardSubtitle.textContent = "Create a dog profile and choose the training setup to begin.";
        renderProfile();
        return;
    }

    dashboardTitle.textContent = `${dog.name}'s independence training`;
    dashboardSubtitle.textContent = [
        dog.breed || "",
        formatDogAge(dog),
        getTrainingStyleLabel(dog.training_style)
    ].filter(Boolean).join(" · ");

    populatePlanSelect();
    updatePlanHelp();
    renderSummary();
    currentRecommendation = calculateRecommendation();
    renderRecommendation();
    renderToday();
    renderHistory();
    renderProfile();
    renderPlansPage();
}

function populateCapabilitySelect() {
    const current = dogStartingCapability.value;
    dogStartingCapability.innerHTML = capabilities
        .map(item => `<option value="${item.id}">${escapeHtml(item.label)}</option>`)
        .join("");
    if (capabilities.some(item => item.id === current)) dogStartingCapability.value = current;
}

function updatePreferredPathOptions() {
    const style = document.querySelector('input[name="trainingStyle"]:checked')?.value || "pen";
    const outdoor = dogOutdoorAvailable.checked;
    const current = dogPreferredPath.value;
    const paths = [];
    if (style === "pen" || style === "both") paths.push({ id: "pen", label: "Pen / enclosed area" });
    if (style === "no_pen" || style === "both") paths.push({ id: "home", label: "Another room and home exits" });
    if ((style === "no_pen" || style === "both") && outdoor) {
        paths.push({ id: "outdoor", label: "Secure outdoor practice" });
    }
    dogPreferredPath.innerHTML = paths
        .map(path => `<option value="${path.id}">${path.label}</option>`)
        .join("");
    dogPreferredPath.value = paths.some(path => path.id === current) ? current : paths[0]?.id || "";
}

document.querySelectorAll('input[name="trainingStyle"]').forEach(input => {
    input.addEventListener("change", updatePreferredPathOptions);
});
dogOutdoorAvailable.addEventListener("change", updatePreferredPathOptions);

function populatePlanSelect() {
    const dog = getActiveDog();
    const selected = trainingPlanSelect.value;
    const available = getAvailablePlans(dog);
    const paths = getAvailablePaths(dog);

    const groups = paths.map(path => {
        const options = available
            .filter(plan => plan.path === path)
            .sort((a, b) => a.orderInPath - b.orderInPath)
            .map(plan => `<option value="${plan.id}">${escapeHtml(plan.stageLabel)} - ${escapeHtml(plan.title)} (${escapeHtml(targetText(plan))})</option>`)
            .join("");
        return `<optgroup label="${escapeHtml(getPathLabel(path))}">${options}</optgroup>`;
    }).join("");

    trainingPlanSelect.innerHTML = `<option value="">Choose a training plan</option>${groups}`;
    if (available.some(plan => plan.id === selected)) trainingPlanSelect.value = selected;
}

function calculateRecommendation() {
    const dog = getActiveDog();
    const name = dog?.name || "Your dog";
    const availablePlanIds = new Set(getAvailablePlans(dog).map(plan => plan.id));
    const ordered = sortSessions(sessions).filter(session => availablePlanIds.has(session.planId));

    if (!ordered.length) {
        const plan = getStartingPlan(dog);
        return {
            plan,
            action: "start",
            badge: "Starting point",
            reason: `${name}'s profile estimates ${getCapability(dog.starting_capability).label.toLowerCase()}. Begin with this matching ${getPathLabel(plan.path).toLowerCase()} plan.`
        };
    }

    const latest = ordered.at(-1);
    const latestPlan = getPlan(latest.planId);
    const pathPlans = getPathPlans(latestPlan.path);
    const latestIndex = pathPlans.findIndex(plan => plan.id === latestPlan.id);
    const latestTwoOverall = ordered.slice(-2);
    const twoConsecutiveSame =
        latestTwoOverall.length === 2 &&
        latestTwoOverall.every(session => session.planId === latest.planId);

    if (!twoConsecutiveSame) {
        return {
            plan: latestPlan,
            action: "repeat",
            badge: "Repeat",
            reason: `${latestPlan.stageLabel} was the most recently trained plan. Repeat it once more so two results on the same plan can be compared.`
        };
    }

    const scores = latestTwoOverall.map(session => Number(session.calmness));
    const twoGood = scores.every(score => score >= 4);
    const twoBad = scores.every(score => score <= 2);

    if (twoGood) {
        if (latestIndex >= pathPlans.length - 1) {
            return {
                plan: latestPlan,
                action: "maintain",
                badge: "Maintain",
                reason: `${name} scored ${scores[0]}/5 and ${scores[1]}/5 at the highest ${getPathLabel(latestPlan.path).toLowerCase()} plan. Maintain it or manually choose another available route.`
            };
        }
        return {
            plan: pathPlans[latestIndex + 1],
            action: "upgrade",
            badge: "Move up",
            reason: `${name} scored ${scores[0]}/5 and ${scores[1]}/5 in two consecutive ${latestPlan.stageLabel} sessions. Move up one plan in the same route.`
        };
    }

    if (twoBad) {
        if (latestIndex <= 0) {
            return {
                plan: latestPlan,
                action: "easier",
                badge: "Make easier",
                reason: `${name} scored ${scores[0]}/5 and ${scores[1]}/5 on the first plan. Repeat with shorter, simpler repetitions.`
            };
        }
        return {
            plan: pathPlans[latestIndex - 1],
            action: "downgrade",
            badge: "Move down",
            reason: `${name} scored ${scores[0]}/5 and ${scores[1]}/5 in two consecutive ${latestPlan.stageLabel} sessions. Move down one plan.`
        };
    }

    return {
        plan: latestPlan,
        action: "repeat",
        badge: "Stay here",
        reason: `The two latest scores were ${scores[0]}/5 and ${scores[1]}/5. One good and one bad result, or any score of 3, keeps ${name} on the same plan.`
    };
}

function renderSummary() {
    totalSessionsElement.textContent = sessions.length;
    averageCalmnessElement.textContent = sessions.length
        ? `${(sessions.reduce((sum, session) => sum + session.calmness, 0) / sessions.length).toFixed(1)}/5`
        : "-";
    const longest = sessions.reduce((max, session) => Math.max(max, session.absenceSeconds), 0);
    longestAbsenceElement.textContent = longest ? formatDuration(longest) : "-";
    const availableIds = new Set(getAvailablePlans().map(plan => plan.id));
    const latest = sortSessions(sessions).filter(session => availableIds.has(session.planId)).at(-1);
    currentRouteElement.textContent = latest
        ? getPathLabel(getPlan(latest.planId)?.path)
        : getPathLabel(getStartingPlan()?.path);
}

function renderRecommendation() {
    const recommendation = currentRecommendation;
    const plan = recommendation?.plan;
    if (!plan) return;

    recommendedStage.textContent = plan.stageLabel;
    recommendationBadge.textContent = recommendation.badge;
    recommendedPlanTitle.textContent = plan.title;
    recommendedPlanTarget.textContent = `${getPathLabel(plan.path)} · ${targetText(plan)}`;
    recommendationReason.textContent = recommendation.reason;
    useRecommendationButton.dataset.planId = plan.id;
    viewRecommendationButton.dataset.planId = plan.id;
}

function renderToday() {
    const todaySessions = sortSessions(getSessionsForDate(getLocalDateText()));
    todayCountBadge.textContent = `${todaySessions.length} of 3`;
    if (!todaySessions.length) {
        todaySessionList.innerHTML = `<li>No sessions recorded today.</li>`;
        return;
    }
    todaySessionList.innerHTML = todaySessions.map(session => {
        const plan = getPlan(session.planId);
        return `<li><strong>${escapeHtml(plan?.title || session.planId)}</strong><br><small>Score ${session.calmness}/5 · ${formatDuration(session.absenceSeconds)}</small></li>`;
    }).join("");
}

function updatePlanHelp() {
    const plan = getPlan(trainingPlanSelect.value);
    selectedPlanHelp.textContent = plan
        ? `${plan.stageLabel} · ${getPathLabel(plan.path)} · ${targetText(plan)}`
        : "Choose a plan.";
    viewSelectedPlanButton.disabled = !plan;
}

trainingPlanSelect.addEventListener("change", updatePlanHelp);

useRecommendationButton.addEventListener("click", () => {
    const planId = useRecommendationButton.dataset.planId;
    if (!planId) return;
    trainingPlanSelect.value = planId;
    updatePlanHelp();
    sessionDate.value = getLocalDateText();
    sessionForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

viewRecommendationButton.addEventListener("click", () => {
    openPlanDialog(viewRecommendationButton.dataset.planId);
});

viewSelectedPlanButton.addEventListener("click", () => {
    if (trainingPlanSelect.value) openPlanDialog(trainingPlanSelect.value);
});

sessionForm.addEventListener("submit", async event => {
    event.preventDefault();
    const dog = getActiveDog();
    if (!dog) return;

    if (getSessionsForDate(sessionDate.value).length >= 3) {
        window.alert("Three sessions are already saved for this date.");
        return;
    }

    const plan = getPlan(trainingPlanSelect.value);
    if (!plan || !getAvailablePlans(dog).some(item => item.id === plan.id)) {
        window.alert("Choose a plan available for this dog's profile.");
        return;
    }

    const actualSeconds =
        (Number(absenceMinutes.value) || 0) * 60 +
        (Number(absenceSeconds.value) || 0);

    const payload = {
        user_id: currentUser.id,
        dog_id: dog.id,
        session_date: sessionDate.value,
        plan_id: plan.id,
        calmness_score: Number(calmnessScore.value),
        vocalisation: vocalisation.value,
        actual_absence_seconds: actualSeconds,
        notes: sessionNotes.value.trim()
    };

    saveSessionButton.disabled = true;
    setLoading(true, "Saving session...");
    const { error } = await supabaseClient.from("dog_tracker_sessions").insert(payload);
    saveSessionButton.disabled = false;
    setLoading(false);

    if (error) {
        window.alert(`Could not save the result: ${error.message}`);
        return;
    }

    sessionForm.reset();
    sessionDate.value = getLocalDateText();
    absenceMinutes.value = 0;
    absenceSeconds.value = 0;
    await loadAppData("Updating recommendations...");
});

function renderHistory() {
    const ordered = sortSessions(sessions).reverse();
    historyMessage.textContent = ordered.length
        ? `${ordered.length} saved session${ordered.length === 1 ? "" : "s"}.`
        : "No sessions recorded yet.";

    historyList.innerHTML = ordered.length
        ? ordered.map(session => {
            const plan = getPlan(session.planId);
            return `
                <article class="history-item">
                    <time class="history-date">${formatDate(session.date)}</time>
                    <section class="history-main">
                        <strong>${escapeHtml(plan?.title || session.planId)}</strong>
                        <span class="path-pill">${escapeHtml(getPathLabel(plan?.path))}</span>
                        <p class="history-meta">Score ${session.calmness}/5 · ${escapeHtml(session.crying)} vocalisation · ${formatDuration(session.absenceSeconds)}</p>
                        ${session.notes ? `<p class="history-meta">${escapeHtml(session.notes)}</p>` : ""}
                    </section>
                    <button type="button" class="delete-session-button" data-session-id="${session.id}">Delete</button>
                </article>
            `;
        }).join("")
        : `<p class="field-note">Results will appear here after the first session.</p>`;
}

historyList.addEventListener("click", async event => {
    const button = event.target.closest(".delete-session-button");
    if (!button) return;
    if (!window.confirm("Delete this training session?")) return;
    const { error } = await supabaseClient
        .from("dog_tracker_sessions")
        .delete()
        .eq("id", button.dataset.sessionId);
    if (error) {
        window.alert(error.message);
        return;
    }
    await loadAppData("Recalculating progress...");
});

function renderPlansPage() {
    const dog = getActiveDog();
    if (!dog) {
        plansGrid.innerHTML = `<p class="field-note">Add a dog profile first.</p>`;
        planDetail.innerHTML = `<p class="empty-detail">Plans are filtered by the dog profile.</p>`;
        return;
    }

    const availablePaths = getAvailablePaths(dog);
    planPathFilters.querySelectorAll("[data-path-filter]").forEach(button => {
        const path = button.dataset.pathFilter;
        button.hidden = path !== "all" && !availablePaths.includes(path);
        if (button.hidden && activePlanFilter === path) activePlanFilter = "all";
        button.classList.toggle("active-filter", activePlanFilter === path);
    });

    plansPageDescription.textContent = `${dog.name} can access: ${availablePaths.map(getPathLabel).join(", ")}.`;
    const query = planSearch.value.trim().toLowerCase();
    const availablePlans = getAvailablePlans(dog).filter(plan => {
        const pathMatch = activePlanFilter === "all" || plan.path === activePlanFilter;
        const searchText = `${plan.stageLabel} ${plan.title} ${plan.challenge} ${targetText(plan)}`.toLowerCase();
        return pathMatch && (!query || searchText.includes(query));
    });

    plansGrid.innerHTML = availablePlans.map(plan => `
        <article class="plan-card ${displayedPlanId === plan.id ? "selected-plan-card" : ""}">
            <button type="button" data-open-plan="${plan.id}">
                <span class="path-pill">${escapeHtml(getPathLabel(plan.path))}</span>
                <h3>${escapeHtml(plan.stageLabel)}<br>${escapeHtml(plan.title)}</h3>
                <p>${escapeHtml(targetText(plan))}</p>
            </button>
        </article>
    `).join("") || `<p class="field-note">No plans match this filter.</p>`;

    if (!displayedPlanId || !availablePlans.some(plan => plan.id === displayedPlanId)) {
        displayedPlanId = availablePlans[0]?.id || getAvailablePlans(dog)[0]?.id || null;
    }
    if (displayedPlanId) renderPlanDetail(displayedPlanId, planDetail);
}

planPathFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-path-filter]");
    if (!button) return;
    activePlanFilter = button.dataset.pathFilter;
    renderPlansPage();
});

planSearch.addEventListener("input", renderPlansPage);

plansGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-open-plan]");
    if (!button) return;
    displayedPlanId = button.dataset.openPlan;
    renderPlansPage();
});

function buildPlanDetailHtml(plan, includeCloseButton = false) {
    const close = includeCloseButton
        ? `<button type="button" class="icon-button" data-close-plan-dialog aria-label="Close">×</button>`
        : "";
    return `
        <header class="plan-detail-header">
            <section>
                <span class="path-pill">${escapeHtml(getPathLabel(plan.path))}</span>
                <p class="eyebrow">${escapeHtml(plan.stageLabel)}</p>
                <h2>${escapeHtml(plan.title)}</h2>
                <p class="plan-target">${escapeHtml(targetText(plan))}</p>
            </section>
            ${close}
        </header>
        <p><strong>Best for:</strong> ${escapeHtml(personaliseText(plan.bestFor))}</p>
        <p><strong>Goal:</strong> ${escapeHtml(personaliseText(plan.goal))}</p>
        <section class="plan-steps">
            ${plan.steps.map(step => `
                <article class="plan-step">
                    <strong>${escapeHtml(step.time)}</strong>
                    <p>${escapeHtml(personaliseText(step.action))}</p>
                    <small><strong>Reward or adjustment:</strong> ${escapeHtml(personaliseText(step.reward))}</small>
                </article>
            `).join("")}
        </section>
        <p class="plan-safety"><strong>Safety:</strong> ${escapeHtml(personaliseText(plan.safety || ""))}</p>
        <p><strong>Success check:</strong> ${escapeHtml(personaliseText(plan.success))}</p>
        <button type="button" class="primary-button choose-plan-button" data-choose-plan="${plan.id}">Use this plan</button>
    `;
}

function renderPlanDetail(planId, container) {
    const plan = getPlan(planId);
    if (!plan) return;
    container.innerHTML = buildPlanDetailHtml(plan);
}

function openPlanDialog(planId) {
    const plan = getPlan(planId);
    if (!plan) return;
    planDialogContent.innerHTML = buildPlanDetailHtml(plan, true);
    planDialog.showModal();
}

planDialogContent.addEventListener("click", event => {
    if (event.target.closest("[data-close-plan-dialog]")) {
        planDialog.close();
        return;
    }
    const choose = event.target.closest("[data-choose-plan]");
    if (choose) {
        trainingPlanSelect.value = choose.dataset.choosePlan;
        updatePlanHelp();
        planDialog.close();
        showPage("dashboardPage");
        sessionForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
});

planDetail.addEventListener("click", event => {
    const choose = event.target.closest("[data-choose-plan]");
    if (!choose) return;
    trainingPlanSelect.value = choose.dataset.choosePlan;
    updatePlanHelp();
    showPage("dashboardPage");
    sessionForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

function renderSources() {
    sourceList.innerHTML = references.map(source => `
        <li>
            <a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>
            - ${escapeHtml(source.note)}
        </li>
    `).join("");
}

function renderProfile() {
    const dog = getActiveDog();
    editProfileButton.disabled = !dog;
    if (!dog) {
        profileHeading.textContent = "Dog profile";
        profileDogName.textContent = "No dog selected";
        profileDogDetails.textContent = "Add a profile to begin.";
        dogProfileInitial.textContent = "D";
        profileTrainingStyle.textContent = "-";
        profileStartingLevel.textContent = "-";
        profilePreferredPath.textContent = "-";
        profileOutdoor.textContent = "-";
        return;
    }

    profileHeading.textContent = `${dog.name}'s profile`;
    profileDogName.textContent = dog.name;
    dogProfileInitial.textContent = dog.name.charAt(0).toUpperCase();
    profileDogDetails.textContent = [
        dog.breed || "Breed not recorded",
        formatDogAge(dog),
        capitalise(dog.gender || "unknown")
    ].join(" · ");
    profileTrainingStyle.textContent = getTrainingStyleLabel(dog.training_style);
    profileStartingLevel.textContent = getCapability(dog.starting_capability).label;
    profilePreferredPath.textContent = getPathLabel(dog.preferred_path);
    profileOutdoor.textContent = dog.outdoor_available ? "Available and enabled" : "Not enabled";
}

function openDogDialog(dog = null, onboarding = false) {
    dogForm.reset();
    dogDialog.dataset.onboarding = onboarding ? "true" : "false";
    closeDogDialogButton.hidden = onboarding;
    editingDogId.value = dog?.id || "";
    dogDialogTitle.textContent = onboarding ? "Set up your first dog" : dog ? "Edit dog profile" : "Add a dog";
    dogName.value = dog?.name || "";
    dogBreed.value = dog?.breed || "";
    dogGender.value = dog?.gender || "unknown";
    dogBirthDate.value = dog?.birth_date || "";
    dogAgeMonths.value = dog?.age_months || "";
    dogPronouns.value = dog?.pronouns || (dog?.gender === "male" ? "he" : dog?.gender === "female" ? "she" : "they");
    const style = dog?.training_style || "pen";
    document.querySelector(`input[name="trainingStyle"][value="${style}"]`).checked = true;
    dogOutdoorAvailable.checked = Boolean(dog?.outdoor_available);
    populateCapabilitySelect();
    dogStartingCapability.value = dog?.starting_capability || "none";
    updatePreferredPathOptions();
    dogPreferredPath.value = getAvailablePaths(dog || {
        training_style: style,
        outdoor_available: dogOutdoorAvailable.checked
    }).includes(dog?.preferred_path) ? dog.preferred_path : dogPreferredPath.value;
    deleteDogButton.hidden = !dog || onboarding;
    dogDialog.showModal();
}

dogDialog.addEventListener("cancel", event => {
    if (dogDialog.dataset.onboarding === "true") event.preventDefault();
});

addDogButton.addEventListener("click", () => openDogDialog());
emptyAddDogButton.addEventListener("click", () => openDogDialog(null, true));
profileAddDogButton.addEventListener("click", () => openDogDialog());
editProfileButton.addEventListener("click", () => {
    const dog = getActiveDog();
    if (dog) openDogDialog(dog);
});

dogGender.addEventListener("change", () => {
    if (dogGender.value === "male") dogPronouns.value = "he";
    if (dogGender.value === "female") dogPronouns.value = "she";
    if (dogGender.value === "unknown") dogPronouns.value = "they";
});

dogForm.addEventListener("submit", async event => {
    event.preventDefault();
    const dogId = editingDogId.value;
    const style = document.querySelector('input[name="trainingStyle"]:checked')?.value;
    const ageMonths = dogAgeMonths.value ? Number(dogAgeMonths.value) : null;

    if (!dogBirthDate.value && !ageMonths) {
        window.alert("Enter either a date of birth or an approximate age in months.");
        return;
    }

    const values = {
        user_id: currentUser.id,
        name: dogName.value.trim(),
        breed: dogBreed.value.trim() || null,
        birth_date: dogBirthDate.value || null,
        age_months: dogBirthDate.value ? null : ageMonths,
        gender: dogGender.value,
        pronouns: dogPronouns.value,
        training_style: style,
        starting_capability: dogStartingCapability.value,
        preferred_path: dogPreferredPath.value,
        outdoor_available: dogOutdoorAvailable.checked,
        profile_completed: true
    };

    setLoading(true, "Saving dog profile...");
    let result;
    if (dogId) {
        result = await supabaseClient
            .from("dog_tracker_dogs")
            .update(values)
            .eq("id", dogId)
            .select("id")
            .single();
    } else {
        result = await supabaseClient
            .from("dog_tracker_dogs")
            .insert(values)
            .select("id")
            .single();
    }
    setLoading(false);

    if (result.error) {
        window.alert(result.error.message);
        return;
    }

    activeDogId = result.data.id;
    localStorage.setItem(`${ACTIVE_DOG_STORAGE_PREFIX}:${currentUser.id}`, activeDogId);
    dogDialog.dataset.onboarding = "false";
    dogDialog.close();
    await loadAppData("Applying the training profile...");
});

deleteDogButton.addEventListener("click", async () => {
    const dog = getActiveDog();
    if (!dog || !window.confirm(`Delete ${dog.name} and all saved sessions?`)) return;
    const { error } = await supabaseClient.from("dog_tracker_dogs").delete().eq("id", dog.id);
    if (error) {
        window.alert(error.message);
        return;
    }
    activeDogId = null;
    dogDialog.close();
    await loadAppData("Removing dog profile...");
});

dogSelector.addEventListener("change", async () => {
    activeDogId = dogSelector.value || null;
    localStorage.setItem(`${ACTIVE_DOG_STORAGE_PREFIX}:${currentUser.id}`, activeDogId || "");
    await loadSessions();
    renderApp();
});

accountButton.addEventListener("click", () => accountDialog.showModal());
changePasswordButton.addEventListener("click", () => {
    accountDialog.close();
    passwordForm.reset();
    showPasswordMessage("");
    passwordDialog.showModal();
});

passwordForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (newPasswordInput.value.length < 8) {
        showPasswordMessage("Use at least 8 characters.", true);
        return;
    }
    if (newPasswordInput.value !== newPasswordConfirm.value) {
        showPasswordMessage("The new passwords do not match.", true);
        return;
    }

    const username = currentProfile?.username;
    const signInResult = await supabaseClient.auth.signInWithPassword({
        email: usernameToInternalEmail(username),
        password: currentPasswordInput.value
    });
    if (signInResult.error) {
        showPasswordMessage("The current password is incorrect.", true);
        return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPasswordInput.value });
    if (error) {
        showPasswordMessage(error.message, true);
        return;
    }
    showPasswordMessage("Password updated.");
    passwordForm.reset();
});

signOutButton.addEventListener("click", async () => {
    accountDialog.close();
    await supabaseClient.auth.signOut();
});

refreshButton.addEventListener("click", () => loadAppData("Refreshing cloud data..."));

exportButton.addEventListener("click", () => {
    if (!sessions.length) {
        window.alert("There are no sessions to export.");
        return;
    }
    const rows = [
        ["date","plan_id","plan_title","path","calmness_score","vocalisation","actual_absence_seconds","notes"],
        ...sortSessions(sessions).map(session => {
            const plan = getPlan(session.planId);
            return [
                session.date,
                session.planId,
                plan?.title || "",
                plan?.path || "",
                session.calmness,
                session.crying,
                session.absenceSeconds,
                session.notes
            ];
        })
    ];
    const csvText = rows.map(row =>
        row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csvText], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${getActiveDog()?.name || "dog"}-settlepath-sessions.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
});

importButton.addEventListener("click", () => importFileInput.click());

function parseCsvLine(line) {
    const values = [];
    let current = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === '"') {
            if (quoted && line[index + 1] === '"') {
                current += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (char === "," && !quoted) {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

importFileInput.addEventListener("change", async () => {
    const file = importFileInput.files[0];
    importFileInput.value = "";
    if (!file || !getActiveDog()) return;

    try {
        const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
        const headers = parseCsvLine(lines[0]).map(value => value.trim().toLowerCase());
        const rows = lines.slice(1).map(parseCsvLine);
        const indexOf = (...names) => names.map(name => headers.indexOf(name)).find(index => index >= 0) ?? -1;

        const dateIndex = indexOf("date", "session_date");
        const planIndex = indexOf("plan_id", "plan id");
        const calmIndex = indexOf("calmness_score", "calmness score", "calmness");
        const vocalIndex = indexOf("vocalisation", "crying");
        const absenceIndex = indexOf("actual_absence_seconds", "longest absence (seconds)", "absence");
        const notesIndex = indexOf("notes");

        if (dateIndex < 0 || planIndex < 0 || calmIndex < 0) {
            throw new Error("The CSV needs date, plan_id and calmness_score columns.");
        }

        const availableIds = new Set(getAvailablePlans().map(plan => plan.id));
        const payload = rows.map(row => ({
            user_id: currentUser.id,
            dog_id: activeDogId,
            session_date: row[dateIndex],
            plan_id: row[planIndex],
            calmness_score: Number(row[calmIndex]),
            vocalisation: ["None","A little","Moderate","A lot"].includes(row[vocalIndex]) ? row[vocalIndex] : "A little",
            actual_absence_seconds: Number(row[absenceIndex] || 0),
            notes: row[notesIndex] || ""
        })).filter(item =>
            /^\d{4}-\d{2}-\d{2}$/.test(item.session_date) &&
            availableIds.has(item.plan_id) &&
            item.calmness_score >= 1 &&
            item.calmness_score <= 5
        );

        if (!payload.length) throw new Error("No valid sessions matched this dog's available plan routes.");
        const { error } = await supabaseClient.from("dog_tracker_sessions").insert(payload);
        if (error) throw error;
        await loadAppData("Importing session history...");
    } catch (error) {
        window.alert(`Could not import the CSV: ${error.message}`);
    }
});

function updateInstallButtons() {
    const canInstall = Boolean(deferredInstallPrompt);
    installAppButton.hidden = !canInstall;
    profileInstallButton.disabled = !canInstall;
    profileInstallButton.textContent = canInstall ? "Install app" : "Use browser menu to install";
}

async function requestAppInstall() {
    if (!deferredInstallPrompt) {
        window.alert("Use your browser menu and choose Add to Home screen or Install app.");
        return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallButtons();
}

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtons();
});
window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButtons();
});
installAppButton.addEventListener("click", requestAppInstall);
profileInstallButton.addEventListener("click", requestAppInstall);

async function initialise() {
    sessionDate.value = getLocalDateText();
    populateCapabilitySelect();
    renderSources();
    updateInstallButtons();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(`service-worker.js?v=${APP_VERSION}`).catch(console.error);
    }

    if (!isConfigured()) {
        showAuthMessage(
            "Supabase is not configured. Open supabase-config.js and add the Project URL and publishable key.",
            true
        );
        return;
    }

    if (!window.supabase) {
        showAuthMessage("The Supabase library could not load. Check the internet connection.", true);
        return;
    }

    supabaseClient = window.supabase.createClient(
        cleanedSupabaseUrl,
        config.supabasePublishableKey,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false
            }
        }
    );

    const { data } = await supabaseClient.auth.getSession();
    currentUser = data.session?.user || null;
    setAppVisible(Boolean(currentUser));
    if (currentUser) await loadAppData();

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        currentUser = session?.user || null;
        if (!currentUser) {
            currentProfile = null;
            dogs = [];
            sessions = [];
            activeDogId = null;
            setAppVisible(false);
            showAuthMessage("");
            return;
        }
        setAppVisible(true);
        await loadAppData();
    });
}

initialise();
