"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { daysInMonth, formatMonthLabel, getMonthKey } from "../lib/habits/dates";
import { DEFAULT_APP_STATE, normalizeAppState } from "../lib/habits/state";
import {
  clearMonthRecords,
  cycleDayMark,
  removeHabitRecords,
  setDayMark,
} from "../lib/habits/records";
import { habitLifetimeSummary, monthCompletion } from "../lib/habits/stats";
import { exportHabitsToCsv, importHabitsFromCsv } from "../lib/habits/csv";
import AddHabitForm from "./components/habits/AddHabitForm";
import CalendarFooter from "./components/habits/CalendarFooter";
import CalendarLegend from "./components/habits/CalendarLegend";
import EmptyState from "./components/habits/EmptyState";
import HabitCalendar from "./components/habits/HabitCalendar";
import SummaryTab from "./components/habits/SummaryTab";
import TabSwitcher from "./components/habits/TabSwitcher";
import TrackerHeader from "./components/habits/TrackerHeader";

const STORAGE_KEY = "connect4_habit_tracker_v1";

function loadLocalState() {
  try {
    return normalizeAppState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch (error) {
    console.error("Failed to parse local state:", error);
    return { ...DEFAULT_APP_STATE };
  }
}

function downloadCsvFile(csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `habit-tracker-export-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ConnectFourHabitTracker() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [habits, setHabits] = useState([]);
  const [records, setRecords] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const skipNextRemoteSaveRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const applyState = (state) => {
      setHabits(state.habits);
      setRecords(state.records);
      setDarkMode(state.darkMode);
      setIsHorizontalLayout(state.isHorizontalLayout);
      setIsLoaded(true);
    };

    const loadState = async () => {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (response.status === 401) {
          router.replace("/signin");
          return;
        }
        if (!response.ok) throw new Error("Failed to load remote state");

        const data = await response.json();
        if (cancelled) return;

        if (data?.state) {
          skipNextRemoteSaveRef.current = true;
          setCurrentUser(data.user || null);
          const state = normalizeAppState(data.state);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          applyState(state);
          return;
        }
      } catch (error) {
        // Keep remote sync enabled for transient failures (5xx/network).
        console.error("Remote state load failed, using local fallback:", error);
      }

      if (!cancelled) applyState(loadLocalState());
    };

    loadState();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined" || !isLoaded) return;

    const payload = normalizeAppState({ habits, records, darkMode, isHorizontalLayout });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    if (skipNextRemoteSaveRef.current) {
      skipNextRemoteSaveRef.current = false;
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 401) router.replace("/signin");
      } catch (error) {
        console.error("Remote state save failed:", error);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [habits, records, darkMode, isHorizontalLayout, isLoaded, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const monthKey = useMemo(() => getMonthKey(year, month), [year, month]);
  const totalDays = useMemo(() => daysInMonth(year, month), [year, month]);
  const daysArray = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);
  const monthRecords = records[monthKey] || {};

  const addHabit = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits((current) => [...current, { id: crypto.randomUUID(), name: trimmed }]);
  };

  const renameHabit = (habitId, newName) => {
    setHabits((current) =>
      current.map((habit) => (habit.id === habitId ? { ...habit, name: newName } : habit)),
    );
  };

  const removeHabit = (habitId) => {
    setHabits((current) => current.filter((habit) => habit.id !== habitId));
    setRecords((current) => removeHabitRecords(current, habitId));
  };

  const cycleDay = (habitId, day) => {
    setRecords((current) => cycleDayMark(current, monthKey, habitId, day));
  };

  const clearDay = (habitId, day) => {
    setRecords((current) => setDayMark(current, monthKey, habitId, day, undefined));
  };

  const clearCurrentMonth = () => {
    if (!confirm("Limpar todas as marcações deste mês?")) return;
    setRecords((current) => clearMonthRecords(current, monthKey));
  };

  const changeMonth = (delta) => {
    const date = new Date(year, month + delta, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Signout request failed:", error);
    } finally {
      router.replace("/signin");
    }
  };

  const handleExportCsv = () => {
    downloadCsvFile(exportHabitsToCsv(habits, records));
  };

  const handleImportCsv = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const {
          habits: importedHabits,
          records: importedRecords,
          stats,
        } = importHabitsFromCsv(event.target.result);

        const confirmMessage = [
          `Importar ${importedHabits.length} hábitos e seus registros?`,
          "",
          `• ${stats.validRows} linhas válidas processadas`,
          stats.invalidRows > 0 ? `• ${stats.invalidRows} linhas inválidas ignoradas` : null,
          "",
          "Isso substituirá todos os dados atuais.",
        ]
          .filter((line) => line !== null)
          .join("\n");

        if (!confirm(confirmMessage)) return;

        setHabits(importedHabits);
        setRecords(importedRecords);

        alert(
          [
            "Dados importados com sucesso!",
            "",
            `• ${importedHabits.length} hábitos importados`,
            `• ${stats.validRows} registros processados`,
            stats.invalidRows > 0 ? `• ${stats.invalidRows} linhas inválidas ignoradas` : null,
          ]
            .filter((line) => line !== null)
            .join("\n"),
        );
      } catch (error) {
        alert(`Erro ao importar arquivo CSV:\n\n${error.message}`);
        console.error("CSV Import Error:", error);
      }
    };
    reader.readAsText(file);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="mx-auto max-w-[1200px] p-6">
        <TrackerHeader
          user={currentUser}
          monthLabel={formatMonthLabel(year, month)}
          darkMode={darkMode}
          isHorizontalLayout={isHorizontalLayout}
          canExport={habits.length > 0}
          onSignOut={handleSignOut}
          onExportCsv={handleExportCsv}
          onImportCsv={handleImportCsv}
          onToggleLayout={() => setIsHorizontalLayout((current) => !current)}
          onToggleDarkMode={() => setDarkMode((current) => !current)}
          onPreviousMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
        />

        <TabSwitcher activeTab={activeTab} onChangeTab={setActiveTab} />

        {activeTab === "calendar" ? (
          <>
            <CalendarLegend />

            {habits.length > 0 && (
              <div className="mb-6">
                <AddHabitForm onAdd={addHabit} />
              </div>
            )}

            {habits.length === 0 ? (
              <EmptyState onAdd={addHabit} />
            ) : (
              <HabitCalendar
                habits={habits}
                daysArray={daysArray}
                year={year}
                month={month}
                isHorizontalLayout={isHorizontalLayout}
                monthRecords={monthRecords}
                completionForHabit={(habitId) => monthCompletion(monthRecords[habitId])}
                onRenameHabit={renameHabit}
                onRemoveHabit={removeHabit}
                onCycleDay={cycleDay}
                onClearDay={clearDay}
              />
            )}

            {habits.length > 0 && <CalendarFooter onClearMonth={clearCurrentMonth} />}
          </>
        ) : (
          <SummaryTab
            habits={habits}
            summaryForHabit={(habitId) => habitLifetimeSummary(records, habitId)}
            onAdd={addHabit}
          />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-slate-500">
            💾 Os dados são salvos no servidor (SQLite) com fallback local no navegador
          </p>
        </motion.div>
      </div>
    </div>
  );
}
