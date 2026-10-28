"use client";

import { motion } from "framer-motion";

const TABS = [
  { id: "calendar", label: "📅 Calendário" },
  { id: "summary", label: "📊 Resumo" },
];

export default function TabSwitcher({ activeTab, onChangeTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6"
    >
      <div className="flex gap-2 rounded-2xl bg-white/60 p-2 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm">
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
