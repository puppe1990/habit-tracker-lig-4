import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import {
  MONTH_NAMES,
  daysInMonth,
  formatMonthLabel,
  getMonthKey,
  pad,
} from "../lib/habits/dates.js";

describe("pad", () => {
  it("preenche com zero à esquerda", () => {
    expect(pad(0)).toBe("00");
    expect(pad(7)).toBe("07");
    expect(pad(10)).toBe("10");
    expect(pad(31)).toBe("31");
  });
});

describe("daysInMonth", () => {
  it.each([
    [2024, 1, 29],
    [2023, 1, 28],
    [2026, 3, 30],
    [2026, 0, 31],
    [2026, 11, 31],
  ])("ano %i mês %i tem %i dias", (year, monthIndex, expected) => {
    expect(daysInMonth(year, monthIndex)).toBe(expected);
  });

  it("respeita fevereiro bissexto em anos aleatórios", () => {
    faker.seed(4242);

    for (let attempt = 0; attempt < 25; attempt += 1) {
      const year = faker.number.int({ min: 1900, max: 2100 });
      const isLeap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      expect(daysInMonth(year, 1)).toBe(isLeap ? 29 : 28);
    }
  });
});

describe("getMonthKey / formatMonthLabel", () => {
  it("gera chave YYYY-MM com mês 1-indexado", () => {
    expect(getMonthKey(2026, 0)).toBe("2026-01");
    expect(getMonthKey(2026, 8)).toBe("2026-09");
    expect(getMonthKey(2026, 11)).toBe("2026-12");
  });

  it("usa nomes de mês em português", () => {
    expect(MONTH_NAMES).toHaveLength(12);
    expect(formatMonthLabel(2026, 0)).toBe("Janeiro 2026");
    expect(formatMonthLabel(2026, 8)).toBe("Setembro 2026");
  });

  it("mantém chave sempre no formato esperado", () => {
    faker.seed(99);

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const year = faker.number.int({ min: 1970, max: 2099 });
      const monthIndex = faker.number.int({ min: 0, max: 11 });
      expect(getMonthKey(year, monthIndex)).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    }
  });
});
