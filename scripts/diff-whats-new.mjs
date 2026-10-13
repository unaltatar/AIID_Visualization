import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

export function diffIncidents(previousIncidents, nextIncidents) {
  const previousById = new Map((previousIncidents ?? []).map((incident) => [incident.id, incident]))
  const newIncidents = []
  const updatedIncidents = []

  for (const incident of nextIncidents) {
    const previous = previousById.get(incident.id)
    if (!previous) {
      newIncidents.push(incident)
    } else if (incident.dateModified && incident.dateModified !== previous.dateModified) {
      updatedIncidents.push(incident)
    }
  }
  return { newIncidents, updatedIncidents }
}

async function main() {
  const dataDir = path.join(import.meta.dirname, '..', 'data')
  const cacheDir = path.join(import.meta.dirname, '..', '.cache')

  const previousIncidents = await readJsonIfExists(path.join(dataDir, 'incidents.json'))
  const previousMeta = await readJsonIfExists(path.join(dataDir, 'meta.json'))
  const nextIncidents = JSON.parse(await fs.readFile(path.join(cacheDir, 'incidents.next.json'), 'utf8'))
  const nextMeta = JSON.parse(await fs.readFile(path.join(cacheDir, 'meta.next.json'), 'utf8'))

  const { newIncidents, updatedIncidents } = diffIncidents(previousIncidents, nextIncidents)

  const whatsNew = {
    generatedAt: new Date().toISOString(),
    previousSnapshotDate: previousMeta?.lastFetched ?? null,
    currentSnapshotDate: nextMeta.lastFetched,
    newIncidents: newIncidents.map(({ id, title, date, deployer, riskDomain, reportCount }) => ({
      id,
      title,
      date,
      deployer,
      riskDomain,
      reportCount,
    })),
    updatedIncidents: updatedIncidents.map(({ id, title, dateModified }) => ({ id, title, dateModified })),
  }

  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(path.join(dataDir, 'whats-new.json'), JSON.stringify(whatsNew, null, 2))
  await fs.writeFile(path.join(dataDir, 'incidents.json'), JSON.stringify(nextIncidents, null, 2))
  await fs.writeFile(path.join(dataDir, 'meta.json'), JSON.stringify(nextMeta, null, 2))

  console.log(`New incidents: ${newIncidents.length}, updated: ${updatedIncidents.length}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
}
