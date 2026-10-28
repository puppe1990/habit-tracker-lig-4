import { daysInMonth, getMonthKey } from "../lib/dates.js";
import { monthStats, summaryTotals } from "../lib/stats.js";
import { clearNode, createNode } from "./dom.js";

function appendMetric(container, label, value) {
  const metricNode = createNode("div", "summary-metric");
  metricNode.append(
    createNode("div", "summary-metric-label", label),
    createNode("div", "summary-metric-value", value),
  );
  container.appendChild(metricNode);
}

function createSummaryItem(habit, stats) {
  const item = createNode("article", "summary-item");
  item.appendChild(createNode("h3", "summary-item-title", habit.name));

  const metrics = createNode("div", "summary-metrics");
  appendMetric(metrics, "Feitos", String(stats.done));
  appendMetric(metrics, "Falhas", String(stats.missed));
  appendMetric(metrics, "Taxa", `${stats.rate}%`);
  appendMetric(metrics, "Melhor sequência", String(stats.bestStreak));

  item.appendChild(metrics);
  return item;
}

function appendOverviewCard(container, label, value) {
  const card = createNode("article", "summary-card");
  card.append(
    createNode("div", "summary-card-label", label),
    createNode("div", "summary-card-value", value),
  );
  container.appendChild(card);
}

export function renderSummary({ overviewNode, listNode, habits, records, year, month }) {
  clearNode(overviewNode);
  clearNode(listNode);

  if (habits.length === 0) {
    listNode.appendChild(createNode("div", "empty", "Sem hábitos para resumir neste mês."));
    return;
  }

  const monthKey = getMonthKey(year, month);
  const totalDays = daysInMonth(year, month);
  const statsForHabit = (habitId) => monthStats(records?.[monthKey]?.[habitId] || {}, totalDays);

  for (const habit of habits) {
    listNode.appendChild(createSummaryItem(habit, statsForHabit(habit.id)));
  }

  const totals = summaryTotals(habits, statsForHabit);
  appendOverviewCard(overviewNode, "Feitos", String(totals.done));
  appendOverviewCard(overviewNode, "Falhas", String(totals.missed));
  appendOverviewCard(overviewNode, "Taxa geral", `${totals.accuracy}%`);
  appendOverviewCard(overviewNode, "Melhor sequência", String(totals.bestStreak));
}
