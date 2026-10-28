export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function pad(value) {
  return value < 10 ? `0${value}` : String(value);
}

export function getMonthKey(year, month) {
  return `${year}-${pad(month + 1)}`;
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getBaseAnchorDay(year, month, now = new Date()) {
  const totalDays = daysInMonth(year, month);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  return isCurrentMonth ? Math.min(now.getDate(), totalDays) : totalDays;
}

export function getAnchorDay(year, month, dayOffset, now = new Date()) {
  const baseAnchor = getBaseAnchorDay(year, month, now);
  const maxOffset = Math.max(0, baseAnchor - 1);
  const safeOffset = Math.min(Math.max(0, dayOffset), maxOffset);

  return { day: baseAnchor - safeOffset, offset: safeOffset, maxOffset };
}

export function getConnect4WindowDays(year, month, dayOffset, now = new Date()) {
  const totalDays = daysInMonth(year, month);
  const { day: anchorDay } = getAnchorDay(year, month, dayOffset, now);
  const startDay = Math.max(1, anchorDay - 6);
  const windowDays = [];

  for (let day = startDay; day <= startDay + 6; day += 1) {
    if (day <= totalDays) windowDays.push(day);
  }

  while (windowDays.length < 7) windowDays.push(null);

  return windowDays;
}
