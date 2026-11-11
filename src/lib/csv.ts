// A small CSV reader: handles quoted fields, doubled quotes, commas and line breaks inside
// quotes, Windows line endings and the byte-order mark Excel adds. Blank lines are skipped.
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const endRow = () => {
    row.push(field);
    field = "";
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (inQuotes) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      endRow();
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) endRow();
  return rows;
}
