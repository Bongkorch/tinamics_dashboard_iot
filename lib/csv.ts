export type CsvValue = string | number | null | undefined;

export type CsvColumn<T> = {
  key: string;
  header: string;
  value: (row: T) => CsvValue;
  numeric?: boolean;
};

export const CSV_BOM = '﻿';

const RISKY_PREFIX = /^[=+\-@]/;

function escapeCell(raw: CsvValue): string {
  if (raw == null) return '';

  let value = String(raw);

  if (typeof raw === 'string' && RISKY_PREFIX.test(value)) {
    value = `'${value}`;
  }

  if (/[",\r\n]/.test(value)) {
    value = `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function csvHeaderLine<T>(columns: CsvColumn<T>[]): string {
  return columns.map((c) => escapeCell(c.header)).join(',');
}

export function csvRowLine<T>(row: T, columns: CsvColumn<T>[]): string {
  return columns.map((c) => escapeCell(c.value(row))).join(',');
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  return [CSV_BOM + csvHeaderLine(columns), ...rows.map((row) => csvRowLine(row, columns))].join('\r\n');
}

function tsvCell(raw: CsvValue): string {
  return raw == null ? '' : String(raw).replace(/[\t\r\n]+/g, ' ');
}

export function toTsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((c) => tsvCell(c.header)).join('\t')];
  for (const row of rows) lines.push(columns.map((c) => tsvCell(c.value(row))).join('\t'));
  return lines.join('\r\n');
}

export function csvBlob(csv: string): Blob {
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, csv: string): void {
  downloadBlob(filename, csvBlob(csv));
}
