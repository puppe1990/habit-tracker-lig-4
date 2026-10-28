"use client";

import { motion } from "framer-motion";
import EmptyState from "./EmptyState";

export default function SummaryTab({ habits, summaryForHabit, onAdd }) {
  const summaries = habits.map((habit) => ({ habit, summary: summaryForHabit(habit.id) }));
  const totalCumprido = summaries.reduce((sum, item) => sum + item.summary.totalCumprido, 0);

  if (habits.length === 0) {
    return <EmptyState onAdd={onAdd} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <div className="board-shell px-6 py-8 text-center">
        <p className="font-display text-sm tracking-[0.28em] text-gold">PLACAR</p>
        <h2 className="mt-1 font-display text-4xl uppercase tracking-wide">Em jogo</h2>
        <p className="mt-2 text-sm text-white/70">
          Verdes depois do último vermelho. A falha zera a linha.
        </p>
        <div className="mt-6 inline-flex items-center gap-4 rounded-2xl bg-black/25 px-6 py-4">
          <span className="disc disc-done disc-lg" />
          <div className="text-left">
            <div className="font-display text-5xl leading-none tracking-wide">{totalCumprido}</div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              em curso
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaries.map(({ habit, summary }, index) => (
          <motion.article
            key={habit.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * index }}
            className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-ink">{habit.name}</h3>
              <span className="disc disc-done" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-black/5 px-3 py-2 dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Em curso
                </p>
                <p className="font-display text-2xl text-ink">{summary.totalCumprido}</p>
              </div>
              <div className="rounded-xl bg-black/5 px-3 py-2 dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Sequência
                </p>
                <p className="font-display text-2xl text-ink">{summary.maxStreak}</p>
              </div>
            </div>

            {summary.isBroken && (
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-disc-missed">
                <span className="disc disc-missed !h-3 !w-3" />
                Sequência quebrada
              </p>
            )}

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-muted">
                <span>Rumo a 30</span>
                <span>{summary.totalCumprido}/30</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((summary.totalCumprido / 30) * 100, 100)}%` }}
                  transition={{ duration: 0.7, delay: 0.1 * index }}
                  className="h-full rounded-full bg-gradient-to-r from-[#9effb8] to-disc-done"
                />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
