"use client";

import { AnimatePresence, motion } from "framer-motion";

const TITLES = {
  done: "Cumprido",
  missed: "Não cumprido",
  empty: "Sem marcação",
};

export default function HabitToken({ state }) {
  const mark = state === "done" || state === "missed" ? state : "empty";

  return (
    <AnimatePresence mode="popLayout">
      {mark === "empty" ? (
        <motion.span
          key="empty"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="well-void"
          title={TITLES.empty}
        />
      ) : (
        <motion.span
          key={mark}
          initial={{ y: -28, opacity: 0, scale: 0.82 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 460, damping: 22 }}
          className={`disc disc-${mark}`}
          title={TITLES[mark]}
        />
      )}
    </AnimatePresence>
  );
}
