"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const TOKEN_STYLES = {
  done: {
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    shadow: "shadow-emerald-200/50",
    ring: "ring-emerald-300/50",
    icon: <CheckCircle2 className="h-3 w-3 text-white" />,
    title: "Cumprido",
  },
  missed: {
    bg: "bg-gradient-to-br from-red-400 to-red-600",
    shadow: "shadow-red-200/50",
    ring: "ring-red-300/50",
    icon: <XCircle className="h-3 w-3 text-white" />,
    title: "Não cumprido",
  },
  empty: {
    bg: "bg-gradient-to-br from-slate-200 to-slate-300",
    shadow: "shadow-slate-200/50",
    ring: "ring-slate-300/50",
    icon: null,
    title: "Sem marcação",
  },
};

export default function HabitToken({ state }) {
  const styles = TOKEN_STYLES[state] ?? TOKEN_STYLES.empty;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={state || "empty"}
        initial={{ y: -24, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          hover: { duration: 0.2 },
        }}
        className={`
            group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full 
            ${styles.bg} ${styles.shadow} ring-2 ${styles.ring}
            shadow-lg transition-all duration-200 hover:shadow-xl
          `}
        title={styles.title}
      >
        {styles.icon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
          >
            {styles.icon}
          </motion.div>
        )}
        <div
          className={`absolute inset-0 rounded-full ${styles.bg} opacity-0 blur-sm transition-opacity group-hover:opacity-30`}
        />
      </motion.div>
    </AnimatePresence>
  );
}
