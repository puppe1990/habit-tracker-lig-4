export function monthStats(habitMonthRecords = {}, totalDays) {
  let done = 0;
  let missed = 0;
  let marked = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  for (let day = 1; day <= totalDays; day += 1) {
    const mark = habitMonthRecords[day];

    if (mark === "done") {
      done += 1;
      marked += 1;
      currentStreak += 1;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
      continue;
    }

    if (mark === "missed") {
      missed += 1;
      marked += 1;
    }

    currentStreak = 0;
  }

  return {
    done,
    missed,
    marked,
    totalDays,
    rate: marked ? Math.round((done / marked) * 100) : 0,
    bestStreak,
  };
}

export function summaryTotals(habits, statsForHabit) {
  let done = 0;
  let missed = 0;
  let marked = 0;
  let bestStreak = 0;

  for (const habit of habits) {
    const stats = statsForHabit(habit.id);
    done += stats.done;
    missed += stats.missed;
    marked += stats.marked;
    if (stats.bestStreak > bestStreak) bestStreak = stats.bestStreak;
  }

  return {
    done,
    missed,
    marked,
    bestStreak,
    accuracy: marked ? Math.round((done / marked) * 100) : 0,
  };
}
