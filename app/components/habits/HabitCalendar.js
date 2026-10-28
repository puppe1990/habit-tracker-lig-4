"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { pad } from "../../../lib/habits/dates";
import HabitCell from "./HabitCell";
import HabitHeader from "./HabitHeader";

function weekdayLabel(year, month, day) {
  return new Date(year, month, day).toLocaleDateString("pt-BR", { weekday: "short" });
}

function isSameCalendarDay(year, month, day) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

function HabitHeaderCell({ habit, style, stats, onRenameHabit, onRemoveHabit }) {
  return (
    <div className={style}>
      <HabitHeader habit={habit} stats={stats} onRename={onRenameHabit} onRemove={onRemoveHabit} />
    </div>
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
        style={{ gridTemplateRows: `56px repeat(${habits.length}, minmax(84px, 1fr))` }}
      >
        <div className="sticky top-0 z-10 -mx-1 -mt-1 rounded-2xl bg-black/35 p-1.5 backdrop-blur-sm">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `132px repeat(${totalDays}, minmax(56px, 1fr))` }}
          >
            <div className="flex items-center justify-center font-display text-xs tracking-[0.22em] text-white/70">
              LINHA
            </div>
            {daysArray.map((day) => (
              <div
                key={day}
                className={`flex flex-col items-center justify-center rounded-xl px-1 py-1.5 text-[11px] font-semibold ${
                  isSameCalendarDay(year, month, day) ? "bg-black/25 text-gold" : "text-white/90"
                }`}
              >
                <span className="font-display text-base leading-none tracking-wide">
                  {pad(day)}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-white/55">
                  {weekdayLabel(year, month, day)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {habits.map((habit) => (
          <div
            key={habit.id}
            className="grid gap-1"
            style={{ gridTemplateColumns: `132px repeat(${totalDays}, minmax(56px, 1fr))` }}
          >
            <HabitHeaderCell
              habit={habit}
              style="board-plaque sticky left-0 z-10 -ml-1 my-0.5 p-3"
              stats={completionForHabit(habit.id)}
              onRenameHabit={onRenameHabit}
              onRemoveHabit={onRemoveHabit}
            />
            {daysArray.map((day) => (
              <HabitCell
                key={`${habit.id}-${day}`}
                day={day}
                mark={monthRecords[habit.id]?.[day]}
                isToday={isSameCalendarDay(year, month, day)}
                onCycle={() => onCycleDay(habit.id, day)}
                onClear={() => onClearDay(habit.id, day)}
              />
            ))}
          </div>
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
        style={{ gridTemplateColumns: `108px repeat(${habits.length}, minmax(140px, 1fr))` }}
      >
        <div />
        {habits.map((habit) => (
          <HabitHeaderCell
            key={habit.id}
            habit={habit}
            style="board-plaque sticky top-0 z-10 -mx-1 -mt-1 p-4"
            stats={completionForHabit(habit.id)}
            onRenameHabit={onRenameHabit}
            onRemoveHabit={onRemoveHabit}
          />
        ))}

        {daysArray.map((day) => (
          <Fragment key={day}>
            <div
              className={`board-plaque sticky left-0 z-10 -ml-1 my-0.5 flex items-center justify-between px-3 py-2.5 text-sm font-semibold ${
                isSameCalendarDay(year, month, day) ? "text-gold" : ""
              }`}
            >
              <span className="font-display text-base tracking-wide">
                {pad(day)}/{pad(month + 1)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-white/55">
                {weekdayLabel(year, month, day)}
              </span>
            </div>
            {habits.map((habit) => (
              <HabitCell
                key={`${habit.id}-${day}`}
                day={day}
                mark={monthRecords[habit.id]?.[day]}
                isToday={isSameCalendarDay(year, month, day)}
                onCycle={() => onCycleDay(habit.id, day)}
                onClear={() => onClearDay(habit.id, day)}
              />
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="board-shell overflow-auto p-5"
    >
      <Grid {...props} />
    </motion.div>
  );
}
