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

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getMonthKey(year, monthIndex) {
  return `${year}-${pad(monthIndex + 1)}`;
}

export function formatMonthLabel(year, monthIndex) {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}
