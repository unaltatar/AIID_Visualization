function formatValue(value) {
  if (value === null || value === undefined) return 'Not recorded'
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not recorded'
  return String(value)
}

const FIELDS = [
  ['Deployer', 'deployer'],
  ['Developer', 'developer'],
  ['Harmed', 'harmed'],
  ['Responsible entity', 'responsibleEntity'],
  ['Intent', 'intent'],
  ['Timing', 'timing'],
  ['Risk domain', 'riskDomain'],
  ['Risk subdomain', 'riskSubdomain'],
  ['Location region', 'locationRegion'],
  ['Country', 'countryCode'],
  ['Sector of deployment', 'sectorOfDeployment'],
  ['Autonomy level', 'autonomyLevel'],
  ['Lives lost', 'livesLost'],
  ['Injuries', 'injuries'],
  ['Linked reports', 'reportCount'],
]

export function IncidentDetail({ incident }) {
  return (
    <div className="incident-detail">
      {incident.description && <p className="incident-detail-description">{incident.description}</p>}
      <dl className="incident-detail-fields">
        {FIELDS.map(([label, field]) => (
          <div key={field}>
            <dt>{label}</dt>
            <dd>{formatValue(incident[field])}</dd>
          </div>
        ))}
      </dl>
      <a href={`https://incidentdatabase.ai/cite/${incident.id}`} target="_blank" rel="noreferrer">
        View incident {incident.id} on AIID
      </a>
    </div>
  )
}
