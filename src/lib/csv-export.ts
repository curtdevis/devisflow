const CSV_BOM = "﻿";
const CSV_SEPARATOR = ";"; // French Excel default

// Prevent CSV injection: prefix formula-starting characters with a single quote.
// Affected characters: = + - @ (all interpreted as formula starters by Excel/Calc).
export function escapeCsvField(value: string): string {
  if (value.length > 0 && /^[=+\-@\t\r]/.test(value)) {
    value = "'" + value;
  }
  if (value.includes('"') || value.includes(",") || value.includes("\n") || value.includes(";")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeCsvField).join(CSV_SEPARATOR);
  const dataLines = rows.map((cols) => cols.map(escapeCsvField).join(CSV_SEPARATOR));
  return CSV_BOM + [headerLine, ...dataLines].join("\r\n");
}
