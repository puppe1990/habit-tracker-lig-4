import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { habitLifetimeSummary, monthCompletion, monthStats } from "../lib/habits/stats.js";

describe("monthCompletion", () => {
  it("zera percentual sem marcações", () => {
    expect(monthCompletion({})).toEqual({ done: 0, missed: 0, totalMarked: 0, pct: 0 });
  });

  it("calcula taxa sobre os dias marcados", () => {
    expect(monthCompletion({ 1: "done", 2: "done", 3: "missed", 4: "done" })).toEqual({
      done: 3,
      missed: 1,
      totalMarked: 4,
      pct: 75,
    });
  });

  it("mantém percentual entre 0 e 100 para dados aleatórios", () => {
    faker.seed(2026);

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const dayCount = faker.number.int({ min: 0, max: 30 });
      const habitRecords = {};
      for (let day = 1; day <= dayCount; day += 1) {
        habitRecords[day] = faker.helpers.arrayElement(["done", "missed"]);
      }

      const result = monthCompletion(habitRecords);
      expect(result.pct).toBeGreaterThanOrEqual(0);
      expect(result.pct).toBeLessThanOrEqual(100);
      expect(result.totalMarked).toBe(result.done + result.missed);
    }
  });
});

describe("monthStats", () => {
  it("conta feitos, falhas, taxa e melhor sequência do mês", () => {
    const stats = monthStats({ 1: "done", 2: "done", 3: "missed", 4: "done" }, 5);

    expect(stats).toEqual({
      done: 3,
      missed: 1,
      marked: 4,
      totalDays: 5,
      rate: 75,
      bestStreak: 2,
    });
  });

  it("não conta dias após o fim do mês", () => {
    const stats = monthStats({ 30: "done", 31: "done" }, 30);

    expect(stats.done).toBe(1);
    expect(stats.bestStreak).toBe(1);
  });
});

describe("habitLifetimeSummary", () => {
  it("retorna zeros sem registros", () => {
    expect(habitLifetimeSummary({}, "h1")).toEqual({
      totalCumprido: 0,
      isBroken: false,
      maxStreak: 0,
    });
  });

  it("conta dias cumpridos desde a última falha", () => {
    const records = {
      "2026-09": { h1: { 1: "missed", 2: "done", 3: "done" } },
    };

    expect(habitLifetimeSummary(records, "h1")).toEqual({
      totalCumprido: 2,
      isBroken: false,
      maxStreak: 2,
    });
  });

  it("considera sequência entre meses consecutivos", () => {
    const records = {
      "2026-09": { h1: { 30: "done" } },
      "2026-10": { h1: { 1: "done", 2: "done" } },
    };

    expect(habitLifetimeSummary(records, "h1").maxStreak).toBe(3);
  });

  it("quebra sequência com dias sem registro", () => {
    const records = {
      "2026-09": { h1: { 1: "done", 3: "done", 4: "done" } },
    };

    expect(habitLifetimeSummary(records, "h1").maxStreak).toBe(2);
  });

  it("marca hábito abandonado e zera os dias cumpridos", () => {
    const records = {
      "2026-09": {
        h1: {
          1: "done",
          2: "missed",
          3: "missed",
          4: "missed",
          5: "missed",
          6: "missed",
          7: "missed",
          8: "missed",
        },
        h2: { 1: "done", 2: "done" },
      },
    };

    const summary = habitLifetimeSummary(records, "h1");

    expect(summary.isBroken).toBe(true);
    expect(summary.totalCumprido).toBe(0);
  });

  it("ignora registros de outros hábitos", () => {
    const records = { "2026-09": { h1: { 1: "done" }, h2: { 1: "missed" } } };

    expect(habitLifetimeSummary(records, "h1")).toEqual({
      totalCumprido: 1,
      isBroken: false,
      maxStreak: 1,
    });
  });
});
