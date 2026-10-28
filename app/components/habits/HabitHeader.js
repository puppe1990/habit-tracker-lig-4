"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Edit2, Trash2, XCircle } from "lucide-react";

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
    <div className="flex flex-col gap-3">
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
          className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
        />
      ) : (
        <button
          className="group flex w-full items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-left text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          onClick={() => setEditing(true)}
          title="Editar nome do hábito"
        >
          <span className="truncate text-slate-800">{habit.name}</span>
          <Edit2 className="ml-2 h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
        </button>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-200/50">
            <CheckCircle2 className="h-3 w-3" />
            <span className="font-semibold">{stats.done}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-red-700 ring-1 ring-red-200/50">
            <XCircle className="h-3 w-3" />
            <span className="font-semibold">{stats.missed}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-2 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200/50">
            {stats.pct}%
          </span>
          <motion.button
            onClick={() => onRemove(habit.id)}
            className="rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 transition-all hover:bg-red-100 hover:shadow-sm"
            title="Remover hábito"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
