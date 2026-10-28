/* global chrome */
import { createApiClient, isUnauthorizedResponse } from "./lib/api.js";
import { MONTH_NAMES, getAnchorDay, getMonthKey } from "./lib/dates.js";
import { removeHabitRecords, setDayState } from "./lib/records.js";
import { createStateStore } from "./lib/store.js";
import { createAuthView } from "./ui/authView.js";
import { renderHabitsList } from "./ui/habitsView.js";
import { renderSummary } from "./ui/summaryView.js";

const STORAGE_KEY = "habit_tracker_extension_netlify_v1";
const API_BASE = "https://habit-tracker-lig-4.apps.gestaobem.com";

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  dayOffset: 0,
  activeTab: "tracker",
  sessionToken: null,
  user: null,
  habits: [],
  records: {},
};

let saveTimer = null;

const nodes = {
  monthLabel: document.getElementById("month-label"),
  habitsList: document.getElementById("habits-list"),
  addHabitForm: document.getElementById("add-habit-form"),
  newHabitInput: document.getElementById("new-habit-input"),
  habitTemplate: document.getElementById("habit-item-template"),
  logoutBtn: document.getElementById("logout-btn"),
  tabTracker: document.getElementById("tab-tracker"),
  tabSummary: document.getElementById("tab-summary"),
  trackerPanel: document.getElementById("tracker-panel"),
  summaryPanel: document.getElementById("summary-panel"),
  summaryOverview: document.getElementById("summary-overview"),
  summaryList: document.getElementById("summary-list"),
  tabSignin: document.getElementById("tab-signin"),
  tabSignup: document.getElementById("tab-signup"),
  signinForm: document.getElementById("signin-form"),
  signupForm: document.getElementById("signup-form"),
};

const store = createStateStore({
  storageKey: STORAGE_KEY,
  chromeStorage: globalThis.chrome?.storage?.local,
  webStorage: globalThis.localStorage,
});

const apiRequest = createApiClient({
  baseUrl: API_BASE,
  getToken: () => state.sessionToken,
});

const authView = createAuthView({
  authView: document.getElementById("auth-view"),
  trackerView: document.getElementById("tracker-view"),
  logoutBtn: nodes.logoutBtn,
  subtitle: document.querySelector(".brand p"),
  tabSignin: nodes.tabSignin,
  tabSignup: nodes.tabSignup,
  signinForm: nodes.signinForm,
  signupForm: nodes.signupForm,
  authError: document.getElementById("auth-error"),
});

function persistStorage() {
  store.save({
    sessionToken: state.sessionToken,
    user: state.user,
    habits: state.habits,
    records: state.records,
  });
}

function clearSessionLocal() {
  state.sessionToken = null;
  state.user = null;
  state.habits = [];
  state.records = {};
  persistStorage();
}

function setTrackerMode(mode) {
  if (!nodes.tabTracker || !nodes.tabSummary || !nodes.trackerPanel || !nodes.summaryPanel) return;

  state.activeTab = mode === "summary" ? "summary" : "tracker";
  nodes.tabTracker.classList.toggle("active", state.activeTab === "tracker");
  nodes.tabSummary.classList.toggle("active", state.activeTab === "summary");
  nodes.trackerPanel.classList.toggle("hidden", state.activeTab !== "tracker");
  nodes.summaryPanel.classList.toggle("hidden", state.activeTab !== "summary");
}

function renderHabits() {
  renderHabitsList({
    listNode: nodes.habitsList,
    template: nodes.habitTemplate,
    habits: state.habits,
    records: state.records,
    year: state.year,
    month: state.month,
    dayOffset: state.dayOffset,
    onSetMark: setMark,
    onShiftDay: shiftDay,
    onRenameHabit: renameHabit,
    onDeleteHabit: deleteHabit,
  });
}

function renderSummaryPanel() {
  renderSummary({
    overviewNode: nodes.summaryOverview,
    listNode: nodes.summaryList,
    habits: state.habits,
    records: state.records,
    year: state.year,
    month: state.month,
  });
}

function render() {
  const loggedIn = Boolean(state.user && state.sessionToken);
  authView.updateSession({ loggedIn, userName: state.user?.name });
  if (!loggedIn) return;

  nodes.monthLabel.textContent = `${MONTH_NAMES[state.month]} ${state.year}`;
  setTrackerMode(state.activeTab);
  renderHabits();
  renderSummaryPanel();
}

function scheduleRemoteSave() {
  persistStorage();
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {
    try {
      const payload = {
        habits: state.habits,
        records: state.records,
        darkMode: false,
        isHorizontalLayout: true,
      };
      const { response, data } = await apiRequest("/api/state", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        clearSessionLocal();
        render();
        authView.setError("Sessão expirada. Faça login novamente.");
        return;
      }

      if (!response.ok) {
        console.error("Remote save failed:", data?.error || response.statusText);
      }
    } catch (error) {
      console.error("Remote save error:", error);
    }
  }, 300);
}

function setMark(habitId, day, value) {
  state.records = setDayState(
    state.records,
    getMonthKey(state.year, state.month),
    habitId,
    day,
    value,
  );
  scheduleRemoteSave();
  renderHabits();
}

function shiftDay(delta) {
  const { maxOffset } = getAnchorDay(state.year, state.month, 0);
  state.dayOffset = Math.min(Math.max(0, state.dayOffset + delta), maxOffset);
  renderHabits();
}

function renameHabit(habit) {
  const updated = prompt("Editar hábito", habit.name);
  if (!updated) return;

  const trimmed = updated.trim();
  if (!trimmed) return;

  habit.name = trimmed;
  scheduleRemoteSave();
  renderHabits();
}

function deleteHabit(habit) {
  if (!confirm(`Remover o hábito "${habit.name}"?`)) return;

  state.habits = state.habits.filter((item) => item.id !== habit.id);
  state.records = removeHabitRecords(state.records, habit.id);
  scheduleRemoteSave();
  renderHabits();
}

function changeMonth(delta) {
  const date = new Date(state.year, state.month + delta, 1);
  state.year = date.getFullYear();
  state.month = date.getMonth();
  state.dayOffset = 0;
  render();
}

async function loadRemoteState() {
  const { response, data } = await apiRequest("/api/state", { method: "GET" });

  if (response.status === 401) {
    clearSessionLocal();
    return false;
  }

  if (!response.ok) {
    throw new Error(data?.error || "Falha ao carregar hábitos");
  }

  state.user = data.user || state.user;
  state.habits = Array.isArray(data?.state?.habits) ? data.state.habits : [];
  state.records =
    data?.state?.records && typeof data.state.records === "object" ? data.state.records : {};
  persistStorage();
  return true;
}

async function signIn(email, password) {
  const { response, data } = await apiRequest("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    authView.setError(data?.error || "Falha ao autenticar.");
    return false;
  }

  state.sessionToken = data.sessionToken;
  state.user = data.user;
  await loadRemoteState();
  persistStorage();
  return true;
}

async function signUp(name, email, password) {
  const { response, data } = await apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    authView.setError(data?.error || "Falha ao criar conta.");
    return false;
  }

  state.sessionToken = data.sessionToken;
  state.user = data.user;
  await loadRemoteState();
  persistStorage();
  return true;
}

function setupAuthEvents() {
  nodes.tabSignin.addEventListener("click", () => authView.setMode("signin"));
  nodes.tabSignup.addEventListener("click", () => authView.setMode("signup"));

  nodes.signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authView.setError("");

    const email = document.getElementById("signin-email").value.trim().toLowerCase();
    const password = document.getElementById("signin-password").value;

    try {
      if (!(await signIn(email, password))) return;
      nodes.signinForm.reset();
      render();
    } catch (error) {
      console.error(error);
      authView.setError("Erro de conexão com o backend.");
    }
  });

  nodes.signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authView.setError("");

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    if (!name || !email || password.length < 6) {
      authView.setError("Preencha todos os campos e use senha com 6+ caracteres.");
      return;
    }

    try {
      if (!(await signUp(name, email, password))) return;
      nodes.signupForm.reset();
      render();
    } catch (error) {
      console.error(error);
      authView.setError("Erro de conexão com o backend.");
    }
  });

  nodes.logoutBtn.addEventListener("click", async () => {
    try {
      await apiRequest("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Signout failed:", error);
    }

    clearSessionLocal();
    authView.setMode("signin");
    render();
  });
}

function setupTrackerEvents() {
  if (nodes.tabTracker && nodes.tabSummary) {
    nodes.tabTracker.addEventListener("click", () => setTrackerMode("tracker"));
    nodes.tabSummary.addEventListener("click", () => {
      setTrackerMode("summary");
      renderSummaryPanel();
    });
  }

  document.getElementById("prev-month").addEventListener("click", () => changeMonth(-1));
  document.getElementById("next-month").addEventListener("click", () => changeMonth(1));

  nodes.addHabitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = nodes.newHabitInput.value.trim();
    if (!value) return;

    state.habits.push({ id: crypto.randomUUID(), name: value });
    nodes.newHabitInput.value = "";
    scheduleRemoteSave();
    renderHabits();
  });
}

async function bootstrapSession() {
  const persisted = await store.load();
  if (persisted?.sessionToken) state.sessionToken = persisted.sessionToken;
  if (persisted?.user) state.user = persisted.user;
  if (Array.isArray(persisted?.habits)) state.habits = persisted.habits;
  if (persisted?.records && typeof persisted.records === "object") {
    state.records = persisted.records;
  }

  if (!state.sessionToken) return;

  try {
    const { response, data } = await apiRequest("/api/auth/me", { method: "GET" });
    if (isUnauthorizedResponse(response, data)) {
      clearSessionLocal();
      return;
    }

    if (!response.ok) throw new Error(data?.error || "Falha ao validar sessão");

    state.user = data.user;
    await loadRemoteState();
  } catch (error) {
    console.error("Session bootstrap failed:", error);
    authView.setError("Não foi possível validar a sessão agora. Tente novamente em instantes.");
  }
}

async function bootstrap() {
  authView.setupPasswordToggles();
  setupAuthEvents();
  setupTrackerEvents();
  authView.setMode("signin");
  await bootstrapSession();
  render();
}

bootstrap();
