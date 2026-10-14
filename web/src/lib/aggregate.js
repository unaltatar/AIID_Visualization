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

export function countBySubdomain(incidents, domain) {
  const counts = new Map()
  for (const incident of incidents) {
    if (incident.riskDomain !== domain) continue
    const subdomain = incident.riskSubdomain ?? 'Not specified'
    counts.set(subdomain, (counts.get(subdomain) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a).map(([subdomain, count]) => ({ subdomain, count }))
}

export function countByDomainAndField(incidents, field, values) {
  const byDomain = new Map()
  for (const incident of incidents) {
    const domain = incident.riskDomain
    const value = incident[field]
    if (!domain || !value) continue
    if (!byDomain.has(domain)) byDomain.set(domain, new Map())
    const counts = byDomain.get(domain)
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const domains = [...byDomain.keys()].sort((a, b) => {
    const totalA = [...byDomain.get(a).values()].reduce((sum, n) => sum + n, 0)
    const totalB = [...byDomain.get(b).values()].reduce((sum, n) => sum + n, 0)
    return totalB - totalA
  })

  return domains.map((domain) => {
    const counts = byDomain.get(domain)
    return { domain, values: values.map((value) => counts.get(value) ?? 0) }
  })
}

export function countByRegion(incidents) {
  const counts = new Map()
  for (const incident of incidents) {
    if (!incident.locationRegion) continue
    counts.set(incident.locationRegion, (counts.get(incident.locationRegion) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([, a], [, b]) => b - a).map(([region, count]) => ({ region, count }))
}

export function filterByYearRange(incidents, from, to) {
  return incidents.filter((incident) => {
    const year = Number(incident.year)
    return year >= from && year <= to
  })
}

const COVERAGE_FIELDS = ['riskDomain', 'responsibleEntity', 'intent', 'timing', 'locationRegion', 'autonomyLevel']

export function computeCoverage(incidents) {
  const total = incidents.length
  const coverage = {}
  for (const field of COVERAGE_FIELDS) {
    coverage[field] =
      total === 0 ? 0 : Math.round((incidents.filter((incident) => incident[field] != null).length / total) * 1000) / 10
  }
  return coverage
}
