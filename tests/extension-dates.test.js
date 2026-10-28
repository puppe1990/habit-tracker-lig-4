import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import {
  MONTH_NAMES,
  daysInMonth,
  getAnchorDay,
  getBaseAnchorDay,
  getConnect4WindowDays,
  getMonthKey,
  pad,
} from "../chrome-extension/lib/dates.js";

const now = new Date(2026, 8, 10, 12, 0, 0);

describe("helpers de data da extensão", () => {
  it("formata mês e chave", () => {
    expect(pad(3)).toBe("03");
    expect(getMonthKey(2026, 8)).toBe("2026-09");
    expect(MONTH_NAMES[8]).toBe("Setembro");
    expect(daysInMonth(2026, 8)).toBe(30);
  });

  it("ancora no dia atual apenas no mês corrente", () => {
    expect(getBaseAnchorDay(2026, 8, now)).toBe(10);
    expect(getBaseAnchorDay(2026, 7, now)).toBe(31);
    expect(getBaseAnchorDay(2026, 9, now)).toBe(31);
  });

  it("ancora no último dia do mês passado/futuro", () => {
    expect(getAnchorDay(2026, 10, 0, now)).toEqual({ day: 30, offset: 0, maxOffset: 29 });
  });

  it("clampa offsets fora do intervalo", () => {
    expect(getAnchorDay(2026, 8, 999, now)).toEqual({ day: 1, offset: 9, maxOffset: 9 });
    expect(getAnchorDay(2026, 8, -5, now)).toEqual({ day: 10, offset: 0, maxOffset: 9 });
  });

  it("monta janela de 7 dias terminando no dia âncora", () => {
    expect(getConnect4WindowDays(2026, 8, 0, now)).toEqual([4, 5, 6, 7, 8, 9, 10]);
    expect(getConnect4WindowDays(2026, 8, 9, now)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("mantém o dia âncora dentro do mês para offsets aleatórios", () => {
    faker.seed(808);

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const year = faker.number.int({ min: 2024, max: 2030 });
      const month = faker.number.int({ min: 0, max: 11 });
      const maxOffset = getAnchorDay(year, month, 0, now).maxOffset;
      const offset = faker.number.int({ min: 0, max: maxOffset });
      const { day } = getAnchorDay(year, month, offset, now);

      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(daysInMonth(year, month));
    }
  });
});
