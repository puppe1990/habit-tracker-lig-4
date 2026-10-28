"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function AddHabitForm({ onAdd, emphasis = false }) {
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative">
      {open ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
              if (event.key === "Escape") cancel();
            }}
            placeholder="Nome do hábito"
            className="field w-56"
            autoFocus
          />
          <button onClick={submit} className="btn-gold px-4 py-2.5 text-sm">
            Encaixar
          </button>
          <button onClick={cancel} className="tool-btn">
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={
            emphasis ? "btn-gold inline-flex items-center gap-2 px-4 py-2.5 text-sm" : "tool-btn"
          }
        >
          <Plus className="h-4 w-4" />
          Nova linha
        </button>
      )}
    </motion.div>
  );
}
