import { daysInMonth, getAnchorDay, getConnect4WindowDays, getMonthKey } from "../lib/dates.js";
import { cycleValue } from "../lib/records.js";
import { clearNode, createNode } from "./dom.js";

const DAY_PAGE_STEP = 7;
const MARK_LABELS = { done: "feito", missed: "falhou" };

export function setStateButtonAppearance(button, value) {
  button.classList.remove("state-empty", "state-done", "state-missed");

  if (value === "done") {
    button.classList.add("state-done");
    button.textContent = "Feito";
    return;
  }

  if (value === "missed") {
    button.classList.add("state-missed");
    button.textContent = "Falhou";
    return;
  }

  button.classList.add("state-empty");
  button.textContent = "Sem marcação";
}

function renderConnect4Strip({
  daysNode,
  tokensNode,
  habitRecords,
  year,
  month,
  dayOffset,
  onSetMark,
}) {
  clearNode(daysNode);
  clearNode(tokensNode);

  const totalDays = daysInMonth(year, month);
  const windowDays = getConnect4WindowDays(year, month, dayOffset);

  for (const day of windowDays) {
    daysNode.appendChild(createNode("div", "connect4-day", day ? String(day) : "·"));

    const token = createNode("div", "connect4-token");

    if (day && day <= totalDays) {
      const value = habitRecords[day];
      if (value === "done") token.classList.add("done");
      if (value === "missed") token.classList.add("missed");
      token.title = `Dia ${day}: ${MARK_LABELS[value] ?? "sem marcação"}`;
      token.addEventListener("click", () => onSetMark(day, cycleValue(value)));
    } else {
      token.title = "Fora do mês";
    }

    tokensNode.appendChild(token);
  }
}

export function renderHabitsList({
  listNode,
  template,
  habits,
  records,
  year,
  month,
  dayOffset,
  onSetMark,
  onShiftDay,
  onRenameHabit,
  onDeleteHabit,
}) {
  clearNode(listNode);

  if (habits.length === 0) {
    listNode.appendChild(createNode("div", "empty", "Sem hábitos ainda. Crie o primeiro acima."));
    return;
  }

  const monthKey = getMonthKey(year, month);
  const anchor = getAnchorDay(year, month, dayOffset);

  for (const habit of habits) {
    const node = template.content.firstElementChild.cloneNode(true);
    const nameButton = node.querySelector(".habit-name");
    const editButton = node.querySelector(".edit-btn");
    const deleteButton = node.querySelector(".delete-btn");
    const stateButton = node.querySelector(".state-btn");
    const previousDayButton = node.querySelector(".prev-strip-day");
    const nextDayButton = node.querySelector(".next-strip-day");
    const connect4Days = node.querySelector(".connect4-days");
    const connect4Strip = node.querySelector(".connect4-strip");
    const habitRecords = records?.[monthKey]?.[habit.id] || {};

    nameButton.textContent = habit.name;
    nameButton.title = habit.name;

    setStateButtonAppearance(stateButton, habitRecords[anchor.day]);
    stateButton.addEventListener("click", () => {
      onSetMark(habit.id, anchor.day, cycleValue(habitRecords[anchor.day]));
    });

    nameButton.addEventListener("click", () => onRenameHabit(habit));
    editButton.addEventListener("click", () => onRenameHabit(habit));
    deleteButton.addEventListener("click", () => onDeleteHabit(habit));

    if (previousDayButton) {
      previousDayButton.disabled = dayOffset >= anchor.maxOffset;
      previousDayButton.addEventListener("click", () => onShiftDay(DAY_PAGE_STEP));
    }

    if (nextDayButton) {
      nextDayButton.disabled = dayOffset <= 0;
      nextDayButton.addEventListener("click", () => onShiftDay(-DAY_PAGE_STEP));
    }

    renderConnect4Strip({
      daysNode: connect4Days,
      tokensNode: connect4Strip,
      habitRecords,
      year,
      month,
      dayOffset,
      onSetMark: (day, value) => onSetMark(habit.id, day, value),
    });

    listNode.appendChild(node);
  }
}
