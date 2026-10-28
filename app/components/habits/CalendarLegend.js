"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export default function CalendarLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6 flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 shadow-sm ring-1 ring-emerald-200/50">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm ring-1 ring-emerald-300/50">
          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
        </div>
        <span className="text-sm font-medium text-emerald-700">Cumprido</span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 shadow-sm ring-1 ring-red-200/50">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm ring-1 ring-red-300/50">
          <XCircle className="h-2.5 w-2.5 text-white" />
        </div>
        <span className="text-sm font-medium text-red-700">Não cumprido</span>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-3 shadow-sm ring-1 ring-slate-200/50">
        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 shadow-sm ring-1 ring-slate-300/50" />
        <span className="text-sm font-medium text-slate-600">Sem marcação</span>
      </div>
    </motion.div>
  );
}
