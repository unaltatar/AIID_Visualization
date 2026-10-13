import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import XLSX from 'xlsx'

const HEADER_ROW = 2
const DATA_START_ROW = 3

const FIELDS = {
  'Incident ID': 'id',
  date: 'date',
  year: 'year',
  title: 'title',
  description: 'description',
  deployer: 'deployer',
  developer: 'developer',
  harmed: 'harmed',
  'Date Modified': 'dateModified',
  report_count: 'reportCount',
  'Risk Domain': 'riskDomain',
  'Risk Subdomain': 'riskSubdomain',
  'Responsible Entity': 'responsibleEntity',
  Intent: 'intent',
  Timing: 'timing',
  'Data Sources': 'dataSources',
  'Location Region': 'locationRegion',
  'Country Code': 'countryCode',
  'Sector of Deployment': 'sectorOfDeployment',
  'Autonomy Level': 'autonomyLevel',
  'Lives Lost': 'livesLost',
  Injuries: 'injuries',
}

function normalizeCell(value) {
  return value === '' || value === undefined ? null : value
}

function parseMaybeJsonArray(value) {
  if (typeof value !== 'string' || !value.startsWith('[')) return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function parseIncidentRows(rows) {
  const headerRow = rows[HEADER_ROW]
  const idColumnIndex = headerRow ? headerRow.indexOf('Incident ID') : -1
  if (idColumnIndex === -1) {
    throw new Error('Unexpected Incidents sheet layout: "Incident ID" not found in row 3')
  }

  const columnIndexByField = {}
  for (const [header, field] of Object.entries(FIELDS)) {
    const idx = headerRow.indexOf(header)
    if (idx !== -1) columnIndexByField[field] = idx
  }

  const incidents = []
  for (const row of rows.slice(DATA_START_ROW)) {
    if (!row || row[idColumnIndex] == null) continue
    const incident = {}
    for (const [field, idx] of Object.entries(columnIndexByField)) {
      const value = normalizeCell(row[idx])
      incident[field] = field === 'sectorOfDeployment' ? parseMaybeJsonArray(value) : value
    }
    incidents.push(incident)
  }
  return incidents
}

export function buildMeta(incidents, sourceFileName) {
  const total = incidents.length
  const dates = incidents.map((incident) => incident.date).filter(Boolean).sort()
  const coverage = (field) =>
    total === 0 ? 0 : Math.round((incidents.filter((incident) => incident[field] != null).length / total) * 1000) / 10

  return {
    totalIncidents: total,
    dateRange: { min: dates[0] ?? null, max: dates[dates.length - 1] ?? null },
    lastFetched: new Date().toISOString(),
    sourceFileName,
    coverage: {
      riskDomain: coverage('riskDomain'),
      responsibleEntity: coverage('responsibleEntity'),
      intent: coverage('intent'),
      timing: coverage('timing'),
      locationRegion: coverage('locationRegion'),
      autonomyLevel: coverage('autonomyLevel'),
    },
  }
}

async function main() {
  const cacheDir = path.join(import.meta.dirname, '..', '.cache')
  // XLSX.readFile relies on this build's own Node/fs detection, which does not work under native
  // ESM. Reading the buffer ourselves and calling XLSX.read sidesteps that entirely.
  const buffer = await fs.readFile(path.join(cacheDir, 'snapshot.xlsx'))
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheet = workbook.Sheets.Incidents
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })

  const incidents = parseIncidentRows(rows)
  const date = await fs.readFile(path.join(cacheDir, 'snapshot-date.txt'), 'utf8').catch(() => null)
  const sourceFileName = date ? `AIID_Excel_Export-${date}.xlsx` : 'unknown'
  const meta = buildMeta(incidents, sourceFileName)

  await fs.writeFile(path.join(cacheDir, 'incidents.next.json'), JSON.stringify(incidents, null, 2))
  await fs.writeFile(path.join(cacheDir, 'meta.next.json'), JSON.stringify(meta, null, 2))
  console.log(`Transformed ${incidents.length} incidents from ${sourceFileName}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
}
