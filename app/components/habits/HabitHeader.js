"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

export default function HabitHeader({ habit, stats, onRename, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    setEditing(false);
    if (name.trim()) onRename(habit.id, name.trim());
    else setName(habit.name);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {editing ? (
        <input
          ref={inputRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              setName(habit.name);
              setEditing(false);
            }
          }}
          className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none ring-0 focus:border-gold"
        />
      ) : (
        <button
          className="group flex w-full items-center justify-between rounded-xl px-1 text-left text-sm font-semibold text-white"
          onClick={() => setEditing(true)}
          title="Editar nome do hábito"
        >
          <span className="truncate">{habit.name}</span>
          <Pencil className="ml-2 h-3.5 w-3.5 text-white/40 transition-colors group-hover:text-gold" />
        </button>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5">
            <span className="disc disc-done !h-2.5 !w-2.5" />
            {stats.done}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-white/80">
            <span className="disc disc-missed !h-2.5 !w-2.5" />
            {stats.missed}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-sm tracking-wider text-gold">{stats.pct}%</span>
          <motion.button
            onClick={() => onRemove(habit.id)}
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-black/25 hover:text-disc-missed"
            title="Remover hábito"
            whileTap={{ scale: 0.92 }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
