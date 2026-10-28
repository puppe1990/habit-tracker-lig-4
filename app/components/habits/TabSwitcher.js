"use client";

import { motion } from "framer-motion";

const TABS = [
  { id: "calendar", label: "Tabuleiro" },
  { id: "summary", label: "Placar" },
];

export default function TabSwitcher({ activeTab, onChangeTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      <div className="flex gap-1 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className="score-tab"
            data-active={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
