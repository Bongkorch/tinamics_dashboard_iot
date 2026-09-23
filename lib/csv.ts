const RISKY_PREFIX = /^[=+\-@]/;

function escapeCell(raw: string | number | null | undefined): string {
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

export function toCsv<T>(
  rows: T[],
  columns: { header: string; value: (row: T) => string | number | null | undefined }[]
): string {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(','));
  return ['﻿' + headerLine, ...lines].join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
