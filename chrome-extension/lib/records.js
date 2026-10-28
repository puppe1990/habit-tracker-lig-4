const MARK_CYCLE = { undefined: "done", done: "missed", missed: undefined };

export function cycleValue(currentMark) {
  return MARK_CYCLE[currentMark];
}

export function setDayState(records, monthKey, habitId, day, value) {
  const nextRecords = { ...records, [monthKey]: { ...(records[monthKey] || {}) } };
  const habitDays = { ...(nextRecords[monthKey][habitId] || {}) };

  if (value === undefined) {
    delete habitDays[day];
  } else {
    habitDays[day] = value;
  }

  nextRecords[monthKey][habitId] = habitDays;
  return nextRecords;
}

export function removeHabitRecords(records, habitId) {
  const nextRecords = { ...records };

  for (const monthKey of Object.keys(nextRecords)) {
    if (nextRecords[monthKey]?.[habitId]) {
      const { [habitId]: _removed, ...remainingHabits } = nextRecords[monthKey];
      nextRecords[monthKey] = remainingHabits;
    }
  }

  return nextRecords;
}
