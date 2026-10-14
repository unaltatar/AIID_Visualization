import { useMemo } from 'react'
import { computeCoverage } from '../lib/aggregate'

const TAXONOMY_LABELS = {
  riskDomain: 'Risk domain',
  responsibleEntity: 'Responsible entity',
  intent: 'Intent',
  timing: 'Timing',
  locationRegion: 'Location region',
  autonomyLevel: 'Autonomy level',
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function CoveragePanel({ incidents, meta }) {
  const coverage = useMemo(() => computeCoverage(incidents), [incidents])

  return (
    <section className="chart-card" id="about">
      <h2>About this data</h2>
      <p className="chart-note">
        AIID classifies incidents against several taxonomies, and not every incident is covered by all of them. The
        percentages below are how much of the {incidents.length.toLocaleString('en-US')} incidents in the current
        selection carry each field. A chart built on a sparsely covered field is reading a smaller sample than the
        selection, not the whole thing.
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(coverage).map(([field, pct]) => (
            <tr key={field}>
              <td>{TAXONOMY_LABELS[field] ?? field}</td>
              <td className="num">{pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="chart-note">
        Source:{' '}
        <a href="https://incidentdatabase.ai" target="_blank" rel="noreferrer">
          AI Incident Database
        </a>
        , snapshot {meta.sourceFileName}, fetched {formatDate(meta.lastFetched)}.
      </p>
    </section>
  )
}
