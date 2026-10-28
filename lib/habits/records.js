const MARK_CYCLE = { undefined: "done", done: "missed", missed: undefined };

export function nextMark(currentMark) {
  return MARK_CYCLE[currentMark];
}

export function setDayMark(records, monthKey, habitId, day, value) {
  const monthRecords = { ...records, [monthKey]: { ...(records[monthKey] || {}) } };
  const habitDays = { ...(monthRecords[monthKey][habitId] || {}) };

  if (value === undefined) {
    delete habitDays[day];
  } else {
    habitDays[day] = value;
  }

  monthRecords[monthKey][habitId] = habitDays;
  return monthRecords;
}

export function cycleDayMark(records, monthKey, habitId, day) {
  const current = records[monthKey]?.[habitId]?.[day];
  return setDayMark(records, monthKey, habitId, day, nextMark(current));
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

export function clearMonthRecords(records, monthKey) {
  return { ...records, [monthKey]: {} };
}
