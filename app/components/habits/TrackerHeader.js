"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LogOut,
  Moon,
  RotateCcw,
  RotateCw,
  Sun,
  Upload,
} from "lucide-react";
import BrandMark from "./BrandMark";

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
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-8 flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark size={52} />
          <div>
            <p className="font-display text-[11px] tracking-[0.34em] text-gold">TABULEIRO</p>
            <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-ink">
              LIG-4
            </h1>
            <p className="mt-1 text-sm text-muted">
              {user?.name ? `${user.name} · hábitos em disco` : "Hábitos em disco"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-1 shadow-[0_10px_24px_rgba(8,18,40,0.08)]">
            <button
              onClick={onPreviousMonth}
              className="tool-btn tool-btn-icon border-0 bg-transparent shadow-none"
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-[168px] px-2 text-center">
              <p className="font-display text-2xl uppercase leading-none tracking-wider text-ink">
                {monthLabel}
              </p>
            </div>
            <button
              onClick={onNextMonth}
              className="tool-btn tool-btn-icon border-0 bg-transparent shadow-none"
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <motion.button
          onClick={onExportCsv}
          disabled={!canExport}
          className="tool-btn"
          title="Exportar dados para CSV"
          whileTap={{ scale: 0.97 }}
        >
          <Download className="h-4 w-4" />
          Exportar
        </motion.button>

        <label className="tool-btn cursor-pointer" title="Importar dados de CSV">
          <Upload className="h-4 w-4" />
          Importar
          <input
            type="file"
            accept=".csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              onImportCsv(file);
              event.target.value = "";
            }}
            className="hidden"
          />
        </label>

        <motion.button
          onClick={onToggleLayout}
          className="tool-btn tool-btn-icon"
          title={isHorizontalLayout ? "Layout vertical" : "Layout horizontal"}
          whileTap={{ scale: 0.97 }}
        >
          {isHorizontalLayout ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <RotateCw className="h-4 w-4" />
          )}
        </motion.button>

        <motion.button
          onClick={onToggleDarkMode}
          className="tool-btn tool-btn-icon"
          title={darkMode ? "Mesa clara" : "Mesa escura"}
          whileTap={{ scale: 0.97 }}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>

        <motion.button
          onClick={onSignOut}
          className="tool-btn text-disc-missed"
          title="Sair da conta"
          whileTap={{ scale: 0.97 }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </motion.button>
      </div>
    </motion.header>
  );
}
