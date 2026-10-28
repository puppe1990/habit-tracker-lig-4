const CSV_HEADER = ["Habit ID", "Habit Name", "Month", "Day", "Status"];
const VALID_STATUSES = ["done", "missed"];
const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function escapeCsvField(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function exportHabitsToCsv(habits, records) {
  const rows = [CSV_HEADER.join(",")];

  for (const habit of habits) {
    for (const [monthKey, monthRecords] of Object.entries(records)) {
      const habitRecords = monthRecords?.[habit.id];
      if (!habitRecords) continue;

      for (const [day, status] of Object.entries(habitRecords)) {
        rows.push([habit.id, escapeCsvField(habit.name), monthKey, day, status].join(","));
      }
    }
  }

  return rows.join("\n");
}

export function parseCsvRows(csvText) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(current.trim());
      if (row.some((field) => field !== "")) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current.trim());
  if (row.some((field) => field !== "")) rows.push(row);

  return rows;
}

function isValidDay(day) {
  const dayNumber = parseInt(day, 10);
  return Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 31;
}

function isInvalidDataRow(fields) {
  if (fields.length < CSV_HEADER.length) return true;

  const [habitId, habitName, monthKey, day, status] = fields;
  if (!habitId || !habitName || !monthKey || !day || !status) return true;
  if (!VALID_STATUSES.includes(status)) return true;
  if (!MONTH_KEY_PATTERN.test(monthKey)) return true;

  return !isValidDay(day);
}

function addImportedRecord(
  habitsById,
  recordsByMonth,
  [habitId, habitName, monthKey, day, status],
) {
  if (!habitsById.has(habitId)) {
    habitsById.set(habitId, { id: habitId, name: habitName });
  }

  recordsByMonth[monthKey] ??= {};
  recordsByMonth[monthKey][habitId] ??= {};
  recordsByMonth[monthKey][habitId][day] = status;
}

export function importHabitsFromCsv(csvText) {
  const rows = parseCsvRows(csvText.trim());
  if (rows.length < 2) {
    throw new Error(
      `CSV sem linhas de dados: recebido ${rows.length} linha(s), esperado cabeçalho + ao menos 1 registro`,
    );
  }

  const header = rows[0];
  if (header.length < CSV_HEADER.length) {
    throw new Error(
      `Cabeçalho CSV inválido: recebido ${header.length} coluna(s), esperado ${CSV_HEADER.join(", ")}`,
    );
  }

  const habitsById = new Map();
  const recordsByMonth = {};
  let validRows = 0;
  let invalidRows = 0;

  for (const fields of rows.slice(1)) {
    if (isInvalidDataRow(fields)) {
      invalidRows += 1;
      continue;
    }

    addImportedRecord(habitsById, recordsByMonth, fields);
    validRows += 1;
  }

  if (validRows === 0) {
    throw new Error(`Nenhuma linha válida no CSV: ${invalidRows} linha(s) rejeitada(s)`);
  }

  return {
    habits: Array.from(habitsById.values()),
    records: recordsByMonth,
    stats: { validRows, invalidRows },
  };
}
