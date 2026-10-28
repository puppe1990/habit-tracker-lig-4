"use client";

import { motion } from "framer-motion";
import HabitToken from "./HabitToken";

export default function HabitCell({ day, mark, isToday, onCycle, onClear }) {
  return (
    <div className="grid place-items-center p-1">
      <motion.button
        onClick={onCycle}
        onContextMenu={(event) => {
          event.preventDefault();
          onClear();
        }}
        className={`well ${isToday ? "well-today" : ""}`}
        aria-label={isToday ? `Hoje, dia ${day}` : `Dia ${day}`}
        title="Clique: cumpre / falha · botão direito: limpar"
        whileTap={{ scale: 0.92 }}
      >
        <HabitToken state={mark} />
      </motion.button>
    </div>
  );
}
