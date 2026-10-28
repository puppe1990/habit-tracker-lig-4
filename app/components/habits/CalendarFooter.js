"use client";

import { motion } from "framer-motion";

export default function CalendarFooter({ onClearMonth }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] px-5 py-4"
    >
      <p className="max-w-prose text-sm text-muted">
        Clique no buraco para alternar entre{" "}
        <span className="font-semibold text-ink">amarelo (feito)</span> e{" "}
        <span className="font-semibold text-ink">vermelho (falhou)</span>. Botão direito tira o
        disco.
      </p>
      <button onClick={onClearMonth} className="tool-btn text-disc-missed">
        Esvaziar o mês
      </button>
    </motion.div>
  );
}
