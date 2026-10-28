import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import {
  clearMonthRecords,
  cycleDayMark,
  nextMark,
  removeHabitRecords,
  setDayMark,
} from "../lib/habits/records.js";

describe("nextMark", () => {
  it("cicla vazio → done → missed → vazio", () => {
    expect(nextMark(undefined)).toBe("done");
    expect(nextMark("done")).toBe("missed");
    expect(nextMark("missed")).toBeUndefined();
  });
});

describe("setDayMark", () => {
  it("cria mês/hábito/dia sem mutar o estado original", () => {
    const original = { records: { "2026-09": { abc: { 1: "done" } } } }.records;
    const snapshot = structuredClone(original);

    const updated = setDayMark(original, "2026-09", "abc", 2, "missed");

    expect(updated["2026-09"].abc[2]).toBe("missed");
    expect(updated["2026-09"].abc[1]).toBe("done");
    expect(original).toEqual(snapshot);
    expect(updated).not.toBe(original);
    expect(updated["2026-09"]).not.toBe(original["2026-09"]);
  });

  it("remove a marca quando value é undefined", () => {
    const records = { "2026-09": { abc: { 1: "done", 2: "missed" } } };

    const updated = setDayMark(records, "2026-09", "abc", 1, undefined);

    expect(updated["2026-09"].abc).toEqual({ 2: "missed" });
  });
});

describe("cycleDayMark", () => {
  it("avança o ciclo do dia no mês corrente", () => {
    let records = {};

    records = cycleDayMark(records, "2026-09", "abc", 5);
    expect(records["2026-09"].abc[5]).toBe("done");

    records = cycleDayMark(records, "2026-09", "abc", 5);
    expect(records["2026-09"].abc[5]).toBe("missed");

    records = cycleDayMark(records, "2026-09", "abc", 5);
    expect(records["2026-09"].abc[5]).toBeUndefined();
  });

  it("mantém invariantes para sequências aleatórias", () => {
    faker.seed(5150);
    const habitId = faker.string.uuid();
    const monthKey = "2026-09";
    let records = {};

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const day = faker.number.int({ min: 1, max: 30 });
      records = cycleDayMark(records, monthKey, habitId, day);
      const mark = records[monthKey][habitId]?.[day];
      expect([undefined, "done", "missed"]).toContain(mark);
    }
  });
});

describe("removeHabitRecords", () => {
  it("remove o hábito de todos os meses mantendo os demais", () => {
    const records = {
      "2026-08": { abc: { 1: "done" }, xyz: { 1: "missed" } },
      "2026-09": { abc: { 2: "done" } },
      "2026-10": {},
    };

    const updated = removeHabitRecords(records, "abc");

    expect(updated).toEqual({
      "2026-08": { xyz: { 1: "missed" } },
      "2026-09": {},
      "2026-10": {},
    });
    expect(records["2026-08"].abc).toBeDefined();
  });
});

describe("clearMonthRecords", () => {
  it("zera só o mês alvo", () => {
    const records = { "2026-08": { abc: { 1: "done" } }, "2026-09": { abc: { 2: "done" } } };

    const updated = clearMonthRecords(records, "2026-09");

    expect(updated["2026-09"]).toEqual({});
    expect(updated["2026-08"]).toEqual({ abc: { 1: "done" } });
  });
});
