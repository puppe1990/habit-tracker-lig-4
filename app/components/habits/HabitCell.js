"use client";

import { motion } from "framer-motion";
import HabitToken from "./HabitToken";

export default function HabitCell({ day, mark, onCycle, onClear }) {
  return (
    <div className="flex h-12 items-center justify-center p-1">
      <motion.button
        onClick={onCycle}
        onContextMenu={(event) => {
          event.preventDefault();
          onClear();
        }}
        className="group relative grid place-items-center rounded-2xl p-2 transition-all duration-200 hover:bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        aria-label={`Dia ${day}`}
        title="Clique: cumpre/miss; Botão direito: limpar"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <HabitToken state={mark} />
        <div className="absolute inset-0 rounded-2xl bg-indigo-100/0 transition-colors group-hover:bg-indigo-100/30" />
      </motion.button>
    </div>
  );
}
