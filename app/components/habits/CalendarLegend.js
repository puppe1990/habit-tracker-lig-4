"use client";

import { motion } from "framer-motion";

const ITEMS = [
  { key: "done", label: "Feito", disc: "disc disc-done" },
  { key: "missed", label: "Falhou", disc: "disc disc-missed" },
  { key: "empty", label: "Sem jogada", disc: "legend-void" },
];

export default function CalendarLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-1.5 text-sm text-ink"
        >
          <span className={`${item.disc} !h-4 !w-4`} />
          <span className="font-medium">{item.label}</span>
        </div>
      ))}
      <p className="ml-1 text-xs text-muted">Hoje leva o anel dourado no buraco.</p>
    </motion.div>
  );
}
