"use client";

import { motion } from "framer-motion";

export default function CalendarFooter({ onClearMonth }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/60 p-6 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm"
    >
      <div className="max-w-prose">
        <p className="text-sm text-slate-600">
          💡 <span className="font-semibold">Dica:</span> Clique em um círculo para alternar entre{" "}
          <span className="font-bold text-emerald-600">cumprido</span> (verde) e{" "}
          <span className="font-bold text-red-600">não cumprido</span> (vermelho). Clique com o
          botão direito para limpar.
        </p>
      </div>
      <motion.button
        onClick={onClearMonth}
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🗑️ Limpar mês atual
      </motion.button>
    </motion.div>
  );
}
