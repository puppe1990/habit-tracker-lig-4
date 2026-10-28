"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Flame, XCircle } from "lucide-react";
import EmptyState from "./EmptyState";

export default function SummaryTab({ habits, summaryForHabit, onAdd }) {
  const summaries = habits.map((habit) => ({ habit, summary: summaryForHabit(habit.id) }));
  const totalCumprido = summaries.reduce((sum, item) => sum + item.summary.totalCumprido, 0);

  if (habits.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 p-6 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Resumo dos Hábitos</h2>
          <p className="text-slate-600 mb-4">Total de dias cumpridos sem interrupção</p>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 shadow-lg ring-1 ring-emerald-200/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <div className="text-3xl font-bold text-emerald-700">{totalCumprido}</div>
              <div className="text-sm font-medium text-emerald-600">dias cumpridos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaries.map(({ habit, summary }, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-xl hover:ring-indigo-300/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {habit.name}
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200/50">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-semibold">{summary.totalCumprido}</span>
                    </div>
                    <span className="text-xs text-slate-500">dias cumpridos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-orange-700 ring-1 ring-orange-200/50">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-semibold">{summary.maxStreak}</span>
                    </div>
                    <span className="text-xs text-slate-500">maior sequência</span>
                  </div>
                  {summary.isBroken && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700 ring-1 ring-rose-200/50">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">quebrado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 shadow-sm ring-1 ring-emerald-200/50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Progresso</span>
                <span>{summary.totalCumprido} dias</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((summary.totalCumprido / 30) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                />
              </div>
            </div>

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-teal-500/0 opacity-0 blur-sm transition-opacity group-hover:opacity-10" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
