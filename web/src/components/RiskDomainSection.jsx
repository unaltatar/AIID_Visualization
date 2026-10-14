import { useMemo, useState } from 'react'
import { computeCoverage, countByRiskDomain } from '../lib/aggregate'
import { RiskDomainChart } from './RiskDomainChart'
import { SubdomainChart } from './SubdomainChart'

export function RiskDomainSection({ incidents }) {
  const domains = useMemo(() => countByRiskDomain(incidents).filter((row) => !row.isGap), [incidents])
  const coveragePct = useMemo(() => computeCoverage(incidents).riskDomain, [incidents])
  const [manualSelection, setManualSelection] = useState(null)
  const selected = domains.some((row) => row.domain === manualSelection) ? manualSelection : (domains[0]?.domain ?? null)

  return (
    <section className="chart-card" id="risk-domain">
      <h2>Incidents by risk domain</h2>
      <p className="chart-note">
        MIT risk taxonomy, {coveragePct}% of incidents in the current selection are classified. "Not classified"
        incidents have no MIT risk domain on record, it is a data gap rather than a category. Click a domain bar to
        see its subdomains.
      </p>
      {domains.length === 0 ? (
        <p className="chart-note">No incidents in this year range.</p>
      ) : (
        <>
          <RiskDomainChart incidents={incidents} onSelectDomain={setManualSelection} />
          {selected && <SubdomainChart incidents={incidents} domain={selected} />}
        </>
      )}
    </section>
  )
}
