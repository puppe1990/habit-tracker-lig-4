"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function AddHabitForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = () => {
    if (value.trim()) onAdd(value.trim());
    setValue("");
    setOpen(false);
  };

  const cancel = () => {
    setValue("");
    setOpen(false);
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {open ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Nome do hábito"
            className="w-56 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            autoFocus
          />
          <motion.button
            onClick={submit}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Adicionar
          </motion.button>
          <motion.button
            onClick={cancel}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-50 hover:shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancelar
          </motion.button>
        </motion.div>
      ) : (
        <motion.button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-white/90 to-slate-50/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:from-white hover:to-slate-50 hover:shadow-xl"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          <span>Novo hábito</span>
        </motion.button>
      )}
    </motion.div>
  );
}
