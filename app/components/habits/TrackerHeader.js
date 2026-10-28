"use client";

import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Download,
  LogOut,
  Moon,
  RotateCcw,
  RotateCw,
  Sun,
  Upload,
} from "lucide-react";

export default function TrackerHeader({
  user,
  monthLabel,
  darkMode,
  isHorizontalLayout,
  canExport,
  onSignOut,
  onExportCsv,
  onImportCsv,
  onToggleLayout,
  onToggleDarkMode,
  onPreviousMonth,
  onNextMonth,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">Habit Tracker</h1>
              <p className="text-sm text-slate-600">
                Estilo Connect 4 • Acompanhe seus hábitos diários
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              ✨ Interativo
            </span>
            <span className="rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              📱 Responsivo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm md:flex">
              <span className="font-medium">{user.name}</span>
            </div>
          )}

          <motion.button
            onClick={onSignOut}
            className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
            title="Sair da conta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sair</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={onExportCsv}
              disabled={!canExport}
              className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Exportar dados para CSV"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Exportar</span>
            </motion.button>

            <label className="group flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Importar</span>
              <input
                type="file"
                accept=".csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  onImportCsv(file);
                  event.target.value = "";
                }}
                className="hidden"
                title="Importar dados de CSV"
              />
            </label>
          </div>

          <motion.button
            onClick={onToggleLayout}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            title={isHorizontalLayout ? "Layout vertical" : "Layout horizontal"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isHorizontalLayout ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isHorizontalLayout ? (
                <RotateCcw className="h-5 w-5" />
              ) : (
                <RotateCw className="h-5 w-5" />
              )}
            </motion.div>
          </motion.button>

          <motion.button
            onClick={onToggleDarkMode}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            title={darkMode ? "Modo claro" : "Modo escuro"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: darkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.div>
          </motion.button>

          <button
            onClick={onPreviousMonth}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Mês anterior"
          >
            <motion.span
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="text-lg font-medium"
            >
              ◀
            </motion.span>
          </button>

          <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-6 py-3 text-sm font-semibold shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/90 dark:ring-slate-600/50">
            <CalendarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-800 dark:text-slate-200">{monthLabel}</span>
          </div>

          <button
            onClick={onNextMonth}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Próximo mês"
          >
            <motion.span
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="text-lg font-medium"
            >
              ▶
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
