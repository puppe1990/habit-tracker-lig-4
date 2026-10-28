"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { pad } from "../../../lib/habits/dates";
import HabitCell from "./HabitCell";
import HabitHeader from "./HabitHeader";

function weekdayLabel(year, month, day) {
  return new Date(year, month, day).toLocaleDateString("pt-BR", { weekday: "short" });
}

function HabitHeaderCell({ habit, habitIndex, style, stats, onRenameHabit, onRemoveHabit }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.05 * habitIndex }}
      className={style}
    >
      <HabitHeader habit={habit} stats={stats} onRename={onRenameHabit} onRemove={onRemoveHabit} />
    </motion.div>
  );
}

function HorizontalGrid({
  habits,
  daysArray,
  year,
  month,
  monthRecords,
  completionForHabit,
  onRenameHabit,
  onRemoveHabit,
  onCycleDay,
  onClearDay,
}) {
  const totalDays = daysArray.length;

  return (
    <div className="min-w-[800px]">
      <div
        className="grid gap-1"
        style={{ gridTemplateRows: `60px repeat(${habits.length}, minmax(80px, 1fr))` }}
      >
        <div className="sticky top-0 z-10 -mx-2 -mt-2 rounded-2xl bg-white/90 p-2 shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `120px repeat(${totalDays}, minmax(60px, 1fr))` }}
          >
            <div className="flex items-center justify-center text-sm font-semibold text-slate-600">
              Hábitos
            </div>
            {daysArray.map((day, dayIndex) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * dayIndex }}
                className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 px-2 py-2 text-xs font-semibold shadow-sm ring-1 ring-indigo-200/50"
              >
                <span className="text-slate-800">{pad(day)}</span>
                <span className="text-slate-500">{weekdayLabel(year, month, day)}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {habits.map((habit, habitIndex) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * habitIndex }}
            className="grid gap-1"
            style={{ gridTemplateColumns: `120px repeat(${totalDays}, minmax(60px, 1fr))` }}
          >
            <HabitHeaderCell
              habit={habit}
              habitIndex={habitIndex}
              style="sticky left-0 z-10 -ml-2 -my-1 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50"
              stats={completionForHabit(habit.id)}
              onRenameHabit={onRenameHabit}
              onRemoveHabit={onRemoveHabit}
            />
            {daysArray.map((day, dayIndex) => (
              <motion.div
                key={`${habit.id}-${day}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * (habitIndex + dayIndex) }}
                className="border-r border-slate-200/40 p-2 hover:bg-slate-50/50 transition-colors"
              >
                <HabitCell
                  day={day}
                  mark={monthRecords[habit.id]?.[day]}
                  onCycle={() => onCycleDay(habit.id, day)}
                  onClear={() => onClearDay(habit.id, day)}
                />
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VerticalGrid({
  habits,
  daysArray,
  year,
  month,
  monthRecords,
  completionForHabit,
  onRenameHabit,
  onRemoveHabit,
  onCycleDay,
  onClearDay,
}) {
  return (
    <div className="min-w-[800px]">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `100px repeat(${habits.length}, minmax(140px, 1fr))` }}
      >
        <div />
        {habits.map((habit, index) => (
          <HabitHeaderCell
            key={habit.id}
            habit={habit}
            habitIndex={index}
            style="sticky top-0 z-10 -mx-2 -mt-2 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50"
            stats={completionForHabit(habit.id)}
            onRenameHabit={onRenameHabit}
            onRemoveHabit={onRemoveHabit}
          />
        ))}

        {daysArray.map((day, dayIndex) => (
          <Fragment key={day}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * dayIndex }}
              className="sticky left-0 z-10 -ml-2 -my-1 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50"
            >
              <span className="text-slate-800">
                {pad(day)}/{pad(month + 1)}
              </span>
              <span className="text-slate-500 text-xs">{weekdayLabel(year, month, day)}</span>
            </motion.div>
            {habits.map((habit, habitIndex) => (
              <motion.div
                key={`${habit.id}-${day}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * (dayIndex + habitIndex) }}
                className="border-b border-slate-200/40 p-2 hover:bg-slate-50/50 transition-colors"
              >
                <HabitCell
                  day={day}
                  mark={monthRecords[habit.id]?.[day]}
                  onCycle={() => onCycleDay(habit.id, day)}
                  onClear={() => onClearDay(habit.id, day)}
                />
              </motion.div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default function HabitCalendar(props) {
  const Grid = props.isHorizontalLayout ? HorizontalGrid : VerticalGrid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="overflow-auto rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 p-6 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-sm"
    >
      <Grid {...props} />
    </motion.div>
  );
}
