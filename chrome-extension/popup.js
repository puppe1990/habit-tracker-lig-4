/* global chrome */
const STORAGE_KEY = "habit_tracker_extension_netlify_v1";
const API_BASE = "https://habit-tracker-lig-4.netlify.app";

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selectedDay: new Date().getDate(),
  sessionToken: null,
  user: null,
  habits: [],
  records: {},
};

let saveTimer = null;

const monthLabel = document.getElementById("month-label");
const daysStrip = document.getElementById("days-strip");
const habitsList = document.getElementById("habits-list");
const addHabitForm = document.getElementById("add-habit-form");
const newHabitInput = document.getElementById("new-habit-input");
const habitTemplate = document.getElementById("habit-item-template");

const authView = document.getElementById("auth-view");
const trackerView = document.getElementById("tracker-view");
const logoutBtn = document.getElementById("logout-btn");
const authError = document.getElementById("auth-error");

const tabSignin = document.getElementById("tab-signin");
const tabSignup = document.getElementById("tab-signup");
const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");

function pad(value) {
  return value < 10 ? `0${value}` : String(value);
}

function getMonthKey(year, month) {
  return `${year}-${pad(month + 1)}`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function setAuthError(message) {
  if (!message) {
    authError.textContent = "";
    authError.classList.add("hidden");
    return;
  }
  authError.textContent = message;
  authError.classList.remove("hidden");
}

function setAuthMode(mode) {
  const signinActive = mode === "signin";
  tabSignin.classList.toggle("active", signinActive);
  tabSignup.classList.toggle("active", !signinActive);
  signinForm.classList.toggle("hidden", !signinActive);
  signupForm.classList.toggle("hidden", signinActive);
  setAuthError("");
}

function updateViewBySession() {
  const loggedIn = Boolean(state.user && state.sessionToken);
  authView.classList.toggle("hidden", loggedIn);
  trackerView.classList.toggle("hidden", !loggedIn);
  logoutBtn.classList.toggle("hidden", !loggedIn);

  const subtitle = document.querySelector(".brand p");
  subtitle.textContent = loggedIn ? `Logado como ${state.user.name}` : "LIG-4 no popup";
}

function loadStorage() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      const raw = localStorage.getItem(STORAGE_KEY);
      resolve(raw ? JSON.parse(raw) : null);
      return;
    }

    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] ?? null);
    });
  });
}

function persistStorage() {
  const payload = {
    sessionToken: state.sessionToken,
    user: state.user,
    habits: state.habits,
    records: state.records,
  };

  if (!chrome?.storage?.local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return;
  }

  chrome.storage.local.set({ [STORAGE_KEY]: payload });
}

function clearSessionLocal() {
  state.sessionToken = null;
  state.user = null;
  state.habits = [];
  state.records = {};
  persistStorage();
}

async function apiRequest(pathname, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (state.sessionToken) {
    headers.set("Authorization", `Bearer ${state.sessionToken}`);
  }

  const response = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
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
  state.records = data?.state?.records && typeof data.state.records === "object" ? data.state.records : {};
  persistStorage();
  return true;
}

function getCurrentCellState(habitId) {
  const mk = getMonthKey(state.year, state.month);
  return state.records?.[mk]?.[habitId]?.[state.selectedDay];
}

function setCurrentCellState(habitId, value) {
  const mk = getMonthKey(state.year, state.month);
  const monthMap = state.records[mk] ? { ...state.records[mk] } : {};
  const habitMap = monthMap[habitId] ? { ...monthMap[habitId] } : {};

  if (value === undefined) {
    delete habitMap[state.selectedDay];
  } else {
    habitMap[state.selectedDay] = value;
  }

  monthMap[habitId] = habitMap;
  state.records[mk] = monthMap;
}

function cycleValue(currentValue) {
  if (currentValue === undefined) return "done";
  if (currentValue === "done") return "missed";
  return undefined;
}

function changeMonth(delta) {
  const date = new Date(state.year, state.month + delta, 1);
  state.year = date.getFullYear();
  state.month = date.getMonth();

  const maxDay = daysInMonth(state.year, state.month);
  if (state.selectedDay > maxDay) {
    state.selectedDay = maxDay;
  }

  render();
}

function renderDays() {
  daysStrip.textContent = "";
  const totalDays = daysInMonth(state.year, state.month);

  for (let day = 1; day <= totalDays; day += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-btn ${day === state.selectedDay ? "active" : ""}`;
    button.textContent = day;
    button.addEventListener("click", () => {
      state.selectedDay = day;
      render();
    });
    daysStrip.appendChild(button);
  }
}

function setStateButtonAppearance(button, value) {
  button.classList.remove("state-empty", "state-done", "state-missed");

  if (value === "done") {
    button.classList.add("state-done");
    button.textContent = "Feito";
    return;
  }

  if (value === "missed") {
    button.classList.add("state-missed");
    button.textContent = "Falhou";
    return;
  }

  button.classList.add("state-empty");
  button.textContent = "Sem marcação";
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
        setAuthError("Sessão expirada. Faça login novamente.");
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

function renderHabits() {
  habitsList.textContent = "";

  if (state.habits.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Sem hábitos ainda. Crie o primeiro acima.";
    habitsList.appendChild(empty);
    return;
  }

  for (const habit of state.habits) {
    const node = habitTemplate.content.firstElementChild.cloneNode(true);
    const nameButton = node.querySelector(".habit-name");
    const editButton = node.querySelector(".edit-btn");
    const deleteButton = node.querySelector(".delete-btn");
    const stateButton = node.querySelector(".state-btn");

    nameButton.textContent = habit.name;
    nameButton.title = habit.name;

    const updateStateButton = () => {
      setStateButtonAppearance(stateButton, getCurrentCellState(habit.id));
    };

    stateButton.addEventListener("click", () => {
      const next = cycleValue(getCurrentCellState(habit.id));
      setCurrentCellState(habit.id, next);
      scheduleRemoteSave();
      updateStateButton();
    });

    const editHabit = () => {
      const updated = prompt("Editar hábito", habit.name);
      if (!updated) return;

      const trimmed = updated.trim();
      if (!trimmed) return;

      habit.name = trimmed;
      scheduleRemoteSave();
      renderHabits();
    };

    nameButton.addEventListener("click", editHabit);
    editButton.addEventListener("click", editHabit);

    deleteButton.addEventListener("click", () => {
      const confirmed = confirm(`Remover o hábito \"${habit.name}\"?`);
      if (!confirmed) return;

      state.habits = state.habits.filter((item) => item.id !== habit.id);
      for (const monthKey of Object.keys(state.records)) {
        if (state.records[monthKey]?.[habit.id]) {
          delete state.records[monthKey][habit.id];
        }
      }

      scheduleRemoteSave();
      renderHabits();
    });

    updateStateButton();
    habitsList.appendChild(node);
  }
}

function render() {
  updateViewBySession();
  if (!state.user || !state.sessionToken) return;

  monthLabel.textContent = `${monthNames[state.month]} ${state.year}`;
  renderDays();
  renderHabits();
}

function setupTrackerEvents() {
  document.getElementById("prev-month").addEventListener("click", () => changeMonth(-1));
  document.getElementById("next-month").addEventListener("click", () => changeMonth(1));

  addHabitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = newHabitInput.value.trim();
    if (!value) return;

    state.habits.push({
      id: crypto.randomUUID(),
      name: value,
    });

    newHabitInput.value = "";
    scheduleRemoteSave();
    renderHabits();
  });
}

function setupAuthEvents() {
  tabSignin.addEventListener("click", () => setAuthMode("signin"));
  tabSignup.addEventListener("click", () => setAuthMode("signup"));

  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthError("");

    const email = document.getElementById("signin-email").value.trim().toLowerCase();
    const password = document.getElementById("signin-password").value;

    try {
      const { response, data } = await apiRequest("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setAuthError(data?.error || "Falha ao autenticar.");
        return;
      }

      state.sessionToken = data.sessionToken;
      state.user = data.user;
      await loadRemoteState();
      persistStorage();
      signinForm.reset();
      render();
    } catch (error) {
      console.error(error);
      setAuthError("Erro de conexão com o backend.");
    }
  });

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthError("");

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;

    if (!name || !email || password.length < 6) {
      setAuthError("Preencha todos os campos e use senha com 6+ caracteres.");
      return;
    }

    try {
      const { response, data } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        setAuthError(data?.error || "Falha ao criar conta.");
        return;
      }

      state.sessionToken = data.sessionToken;
      state.user = data.user;
      await loadRemoteState();
      persistStorage();
      signupForm.reset();
      render();
    } catch (error) {
      console.error(error);
      setAuthError("Erro de conexão com o backend.");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await apiRequest("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Signout failed:", error);
    }

    clearSessionLocal();
    setAuthMode("signin");
    render();
  });
}

async function bootstrapSession() {
  const persisted = await loadStorage();
  if (persisted?.sessionToken) state.sessionToken = persisted.sessionToken;
  if (persisted?.user) state.user = persisted.user;
  if (persisted?.habits) state.habits = persisted.habits;
  if (persisted?.records) state.records = persisted.records;

  if (!state.sessionToken) return;

  try {
    const { response, data } = await apiRequest("/api/auth/me", { method: "GET" });
    if (!response.ok || !data?.user) {
      clearSessionLocal();
      return;
    }

    state.user = data.user;
    await loadRemoteState();
  } catch (error) {
    console.error("Session bootstrap failed:", error);
    clearSessionLocal();
  }
}

async function bootstrap() {
  const maxDay = daysInMonth(state.year, state.month);
  if (state.selectedDay > maxDay) {
    state.selectedDay = maxDay;
  }

  setupAuthEvents();
  setupTrackerEvents();
  setAuthMode("signin");
  await bootstrapSession();
  render();
}

bootstrap();
