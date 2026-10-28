import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { exportHabitsToCsv, importHabitsFromCsv, parseCsvRows } from "../lib/habits/csv.js";

describe("parseCsvRows", () => {
  it("respeita campos entre aspas com vírgula e quebra de linha", () => {
    const rows = parseCsvRows('id,"nome, completo",2026-09,1,done\n"a""b",x,y,z,w');

    expect(rows[0]).toEqual(["id", "nome, completo", "2026-09", "1", "done"]);
    expect(rows[1]).toEqual(['a"b', "x", "y", "z", "w"]);
  });

  it("aceita CRLF e ignora linhas vazias", () => {
    const rows = parseCsvRows("a,b\r\nc,d\r\n\r\n");

    expect(rows).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("exportHabitsToCsv", () => {
  it("escapa aspas em nomes de hábito", () => {
    const csv = exportHabitsToCsv([{ id: "h1", name: 'Ler "10 páginas"' }], {
      "2026-09": { h1: { 1: "done" } },
    });

    expect(csv.split("\n")[0]).toBe("Habit ID,Habit Name,Month,Day,Status");
    expect(csv).toContain('"Ler ""10 páginas"""');
  });

  it("ignora hábitos e meses sem registros", () => {
    const csv = exportHabitsToCsv(
      [
        { id: "h1", name: "Correr" },
        { id: "h2", name: "Ler" },
      ],
      { "2026-09": { h1: { 1: "done" } }, "2026-10": {} },
    );

    expect(csv.trim().split("\n")).toHaveLength(2);
  });
});

describe("importHabitsFromCsv", () => {
  it("reconstrói hábitos e registros", () => {
    const csv = [
      "Habit ID,Habit Name,Month,Day,Status",
      "h1,Correr,2026-09,1,done",
      "h1,Correr,2026-09,2,missed",
      "h2,Ler,2026-10,3,done",
    ].join("\n");

    expect(importHabitsFromCsv(csv)).toEqual({
      habits: [
        { id: "h1", name: "Correr" },
        { id: "h2", name: "Ler" },
      ],
      records: {
        "2026-09": { h1: { 1: "done", 2: "missed" } },
        "2026-10": { h2: { 3: "done" } },
      },
      stats: { validRows: 3, invalidRows: 0 },
    });
  });

  it("conta linhas inválidas em vez de importá-las", () => {
    const csv = [
      "Habit ID,Habit Name,Month,Day,Status",
      "h1,Correr,2026-09,1,done",
      "h1,Correr,2026-13,2,done",
      "h1,Correr,2026-09,0,done",
      "h1,Correr,2026-09,1,maybe",
      "h1,Correr,2026-09,1",
      "h1,Correr,2026-09,2,missed",
    ].join("\n");

    const result = importHabitsFromCsv(csv);

    expect(result.stats).toEqual({ validRows: 2, invalidRows: 4 });
    expect(result.records["2026-09"].h1).toEqual({ 1: "done", 2: "missed" });
  });

  it("falha com contexto quando o arquivo não tem dados", () => {
    expect(() => importHabitsFromCsv("Habit ID,Habit Name,Month,Day,Status")).toThrow(
      /CSV sem linhas de dados: recebido 1 linha/,
    );
  });

  it("falha com contexto quando o cabeçalho é inválido", () => {
    expect(() => importHabitsFromCsv("a,b\nc,d")).toThrow(
      /Cabeçalho CSV inválido: recebido 2 coluna/,
    );
  });

  it("falha quando nenhuma linha é válida", () => {
    expect(() =>
      importHabitsFromCsv("Habit ID,Habit Name,Month,Day,Status\nh1,Correr,2026-09,1,maybe"),
    ).toThrow(/Nenhuma linha válida no CSV: 1 linha/);
  });

  it("faz round-trip com nomes aleatórios que contêm vírgulas e aspas", () => {
    faker.seed(31337);
    const habits = Array.from({ length: 5 }, () => ({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        `Ler, "devagar"`,
        `Correr "5km"`,
        `Meditar (10min)`,
        `Dormir "8h"`,
        `Beber água`,
      ]),
    }));
    const records = { "2026-09": {} };

    for (const habit of habits) {
      records["2026-09"][habit.id] = {
        1: "done",
        2: faker.helpers.arrayElement(["done", "missed"]),
      };
    }

    const imported = importHabitsFromCsv(exportHabitsToCsv(habits, records));

    expect(imported.habits).toEqual(habits);
    expect(imported.records).toEqual(records);
    expect(imported.stats.invalidRows).toBe(0);
  });
});
