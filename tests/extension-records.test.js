import { describe, expect, it } from "vitest";
import { cycleValue, removeHabitRecords, setDayState } from "../chrome-extension/lib/records.js";

describe("cycleValue", () => {
  it("cicla vazio → done → missed → vazio", () => {
    expect(cycleValue(undefined)).toBe("done");
    expect(cycleValue("done")).toBe("missed");
    expect(cycleValue("missed")).toBeUndefined();
  });
});

describe("setDayState", () => {
  it("retorna novo estado sem mutar o original", () => {
    const original = { "2026-09": { h1: { 1: "done" } } };
    const updated = setDayState(original, "2026-09", "h1", 2, "missed");

    expect(updated["2026-09"].h1).toEqual({ 1: "done", 2: "missed" });
    expect(original["2026-09"].h1).toEqual({ 1: "done" });
  });

  it("apaga a marca ao receber undefined", () => {
    const updated = setDayState(
      { "2026-09": { h1: { 1: "done", 2: "missed" } } },
      "2026-09",
      "h1",
      1,
      undefined,
    );

    expect(updated["2026-09"].h1).toEqual({ 2: "missed" });
  });
});

describe("removeHabitRecords", () => {
  it("remove o hábito de todos os meses", () => {
    const updated = removeHabitRecords(
      { "2026-08": { h1: { 1: "done" }, h2: { 1: "missed" } }, "2026-09": { h1: { 2: "done" } } },
      "h1",
    );

    expect(updated).toEqual({ "2026-08": { h2: { 1: "missed" } }, "2026-09": {} });
  });
});
