const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_RECORDS_WINDOW = 7;

export function monthCompletion(habitMonthRecords = {}) {
  const marks = Object.values(habitMonthRecords);
  const done = marks.filter((mark) => mark === "done").length;
  const missed = marks.filter((mark) => mark === "missed").length;
  const totalMarked = done + missed;

  return {
    done,
    missed,
    totalMarked,
    pct: totalMarked ? Math.round((done / totalMarked) * 100) : 0,
  };
}

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

function collectHabitRecords(records, habitId) {
  const collected = [];

  for (const [monthKey, monthRecords] of Object.entries(records)) {
    const habitRecords = monthRecords?.[habitId];
    if (!habitRecords) continue;

    const [year, month] = monthKey.split("-");
    for (const [day, status] of Object.entries(habitRecords)) {
      collected.push({
        date: new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)),
        status,
      });
    }
  }

  return collected.sort((a, b) => a.date - b.date);
}

function countDoneSinceLastMiss(habitRecords) {
  let lastMissedIndex = -1;

  for (let index = habitRecords.length - 1; index >= 0; index -= 1) {
    if (habitRecords[index].status === "missed") {
      lastMissedIndex = index;
      break;
    }
  }

  return habitRecords.slice(lastMissedIndex + 1).filter((record) => record.status === "done")
    .length;
}

function maxDoneStreak(habitRecords) {
  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate = null;
  let previousStatus = null;

  for (const { date, status } of habitRecords) {
    if (status !== "done") {
      currentStreak = 0;
      previousDate = date;
      previousStatus = status;
      continue;
    }

    const isConsecutiveDay =
      previousDate &&
      previousStatus === "done" &&
      Math.round((date - previousDate) / DAY_IN_MS) === 1;

    currentStreak = isConsecutiveDay ? currentStreak + 1 : 1;
    previousDate = date;
    previousStatus = status;
    if (currentStreak > maxStreak) maxStreak = currentStreak;
  }

  return maxStreak;
}

function isAbandoned(habitRecords) {
  const recentRecords = habitRecords.slice(-RECENT_RECORDS_WINDOW);
  const hasRecentMissed = recentRecords.some((record) => record.status === "missed");
  const hasRecentDone = recentRecords.some((record) => record.status === "done");

  return hasRecentMissed && !hasRecentDone;
}

export function habitLifetimeSummary(records, habitId) {
  const habitRecords = collectHabitRecords(records, habitId);

  if (habitRecords.length === 0) {
    return { totalCumprido: 0, isBroken: false, maxStreak: 0 };
  }

  const isBroken = isAbandoned(habitRecords);

  return {
    totalCumprido: isBroken ? 0 : countDoneSinceLastMiss(habitRecords),
    isBroken,
    maxStreak: maxDoneStreak(habitRecords),
  };
}
