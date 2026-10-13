// deployer/developer cells are comma-joined lists of entity names (AIID's own
// title-casing mangles some brand names, e.g. "Openai"). Fix noticed cases here
// as they come up, this is not meant to be exhaustive.
const ALIASES = {
  Openai: 'OpenAI',
}

export function splitEntities(value) {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ALIASES[name] ?? name)
}

export function countByEntity(incidents, field, limit) {
  const counts = new Map()
  for (const incident of incidents) {
    for (const name of splitEntities(incident[field])) {
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}
