const NOT_CLASSIFIED = 'Not classified'

export function countByYear(incidents) {
  const counts = new Map()
  for (const incident of incidents) {
    if (!incident.year) continue
    counts.set(incident.year, (counts.get(incident.year) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }))
}

export function countByRiskDomain(incidents) {
  const counts = new Map()
  for (const incident of incidents) {
    const domain = incident.riskDomain ?? NOT_CLASSIFIED
    counts.set(domain, (counts.get(domain) ?? 0) + 1)
  }

  const notClassifiedCount = counts.get(NOT_CLASSIFIED) ?? 0
  counts.delete(NOT_CLASSIFIED)

  const ranked = [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([domain, count]) => ({ domain, count, isGap: false }))

  // Kept last regardless of count: it is a data gap, not a peer category, so it
  // should never be seen as competing in the ranking.
  if (notClassifiedCount > 0) {
    ranked.push({ domain: NOT_CLASSIFIED, count: notClassifiedCount, isGap: true })
  }
  return ranked
}
