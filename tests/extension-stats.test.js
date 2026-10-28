import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { monthStats, summaryTotals } from "../chrome-extension/lib/stats.js";

describe("monthStats", () => {
  it("conta marcações, taxa e melhor sequência", () => {
    expect(monthStats({ 1: "done", 2: "done", 3: "missed", 4: "done" }, 5)).toEqual({
      done: 3,
      missed: 1,
      marked: 4,
      totalDays: 5,
      rate: 75,
      bestStreak: 2,
    });
  });

  it("zera taxa sem marcações", () => {
    expect(monthStats({}, 30)).toMatchObject({ done: 0, missed: 0, marked: 0, rate: 0 });
  });
});

describe("summaryTotals", () => {
  it("agrega métricas dos hábitos", () => {
    const stats = {
      h1: { done: 3, missed: 1, marked: 4, bestStreak: 2 },
      h2: { done: 1, missed: 0, marked: 1, bestStreak: 1 },
    };

    expect(summaryTotals([{ id: "h1" }, { id: "h2" }], (id) => stats[id])).toEqual({
      done: 4,
      missed: 1,
      marked: 5,
      bestStreak: 2,
      accuracy: 80,
    });
  });

  it("evita divisão por zero", () => {
    expect(summaryTotals([], () => ({ done: 0, missed: 0, marked: 0, bestStreak: 0 }))).toEqual({
      done: 0,
      missed: 0,
      marked: 0,
      bestStreak: 0,
      accuracy: 0,
    });
  });

  it("mantém taxa entre 0 e 100 para hábitos aleatórios", () => {
    faker.seed(1234);
    const habits = Array.from({ length: 6 }, () => ({ id: faker.string.uuid() }));
    const stats = {};
    for (const habit of habits) {
      const done = faker.number.int({ min: 0, max: 20 });
      const missed = faker.number.int({ min: 0, max: 20 });
      stats[habit.id] = { done, missed, marked: done + missed, bestStreak: done };
    }

    const totals = summaryTotals(habits, (id) => stats[id]);
    expect(totals.accuracy).toBeGreaterThanOrEqual(0);
    expect(totals.accuracy).toBeLessThanOrEqual(100);
    expect(totals.marked).toBe(totals.done + totals.missed);
  });
});
