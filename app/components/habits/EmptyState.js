"use client";

import { motion } from "framer-motion";
import AddHabitForm from "./AddHabitForm";

const DEMO = ["done", "empty", "missed", "done", "empty", "empty", "done"];

export default function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="board-shell flex flex-col items-center px-8 py-14 text-center"
    >
      <div className="mb-8 grid grid-cols-7 gap-2" aria-hidden="true">
        {DEMO.map((state, index) => (
          <div key={index} className="well">
            {state === "empty" ? (
              <span className="well-void" />
            ) : (
              <span className={`disc disc-${state}`} />
            )}
          </div>
        ))}
      </div>
      <p className="font-display text-sm tracking-[0.28em] text-gold">PRIMEIRA JOGADA</p>
      <h3 className="mt-2 font-display text-4xl uppercase tracking-wide">O tabuleiro está vazio</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
        Crie uma linha de hábito. Cada dia é um buraco. Verde encaixa, vermelho cai do outro lado.
      </p>
      <div className="mt-8">
        <AddHabitForm onAdd={onAdd} emphasis />
      </div>
    </motion.div>
  );
}
