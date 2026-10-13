import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const SNAPSHOTS_URL = 'https://incidentdatabase.ai/research/snapshots/'
const SNAPSHOT_LINK_PATTERN = /https:\/\/[^"]+AIID_Excel_Export-(\d{8})\.xlsx/g

export function findLatestSnapshot(html) {
  const matches = [...html.matchAll(SNAPSHOT_LINK_PATTERN)]
  if (matches.length === 0) {
    throw new Error('No AIID_Excel_Export .xlsx links found on the snapshots page')
  }
  return matches.reduce((latest, match) => (match[1] > latest.date ? { url: match[0], date: match[1] } : latest), {
    url: matches[0][0],
    date: matches[0][1],
  })
}

async function main() {
  const pageResponse = await fetch(SNAPSHOTS_URL)
  if (!pageResponse.ok) {
    throw new Error(`Failed to load snapshots page: HTTP ${pageResponse.status}`)
  }
  const html = await pageResponse.text()
  const { url, date } = findLatestSnapshot(html)

  const fileResponse = await fetch(url)
  if (!fileResponse.ok) {
    throw new Error(`Failed to download snapshot: HTTP ${fileResponse.status}`)
  }
  const buffer = Buffer.from(await fileResponse.arrayBuffer())

  const cacheDir = path.join(import.meta.dirname, '..', '.cache')
  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(path.join(cacheDir, 'snapshot.xlsx'), buffer)
  await fs.writeFile(path.join(cacheDir, 'snapshot-date.txt'), date)

  console.log(`Downloaded ${url} (${(buffer.length / 1024).toFixed(0)} KB)`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
}
