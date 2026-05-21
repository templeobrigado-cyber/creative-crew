// ---- CSV変換ユーティリティ ----

export function arrayToCSV(data: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',')
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col] ?? ''
      const str = String(val)
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  )
  return [header, ...rows].join('\n')
}

export function downloadCSV(csv: string, filename: string) {
  const bom = '﻿' // Excel用BOM
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0])
  return lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line)
      return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? '').trim()]))
    })
    .filter(row => Object.values(row).some(v => v))
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
