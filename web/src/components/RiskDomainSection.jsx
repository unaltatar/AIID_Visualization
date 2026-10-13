import { useMemo, useState } from 'react'
import { countByRiskDomain } from '../lib/aggregate'
import { RiskDomainChart } from './RiskDomainChart'
import { SubdomainChart } from './SubdomainChart'

export function RiskDomainSection({ incidents, coveragePct }) {
  const domains = useMemo(() => countByRiskDomain(incidents).filter((row) => !row.isGap), [incidents])
  const [selected, setSelected] = useState(() => domains[0]?.domain ?? null)

  return (
    <section className="chart-card" id="risk-domain">
      <h2>Incidents by risk domain</h2>
      <p className="chart-note">
        MIT risk taxonomy, {coveragePct}% of incidents classified. "Not classified" incidents have no MIT risk
        domain on record, it is a data gap rather than a category. Click a domain bar to see its subdomains.
      </p>
      <RiskDomainChart incidents={incidents} onSelectDomain={setSelected} />
      {selected && <SubdomainChart incidents={incidents} domain={selected} />}
    </section>
  )
}
