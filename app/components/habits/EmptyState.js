"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import AddHabitForm from "./AddHabitForm";

export default function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-16 shadow-inner ring-1 ring-slate-200/50"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg ring-1 ring-indigo-200/50"
        >
          <Plus className="h-10 w-10 text-indigo-500" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-3 text-xl font-bold text-slate-800"
        >
          Nenhum hábito cadastrado
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mb-8 text-slate-600"
        >
          Comece adicionando seu primeiro hábito para acompanhar seu progresso diário.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <AddHabitForm onAdd={onAdd} />
        </motion.div>
      </div>
    </motion.div>
  );
}
