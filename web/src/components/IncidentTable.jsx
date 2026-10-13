import { useMemo, useState } from 'react'

const PAGE_SIZE = 25

export function IncidentTable({ incidents }) {
  const [domainFilter, setDomainFilter] = useState('all')
  const [page, setPage] = useState(0)

  const domains = useMemo(() => {
    const set = new Set()
    for (const incident of incidents) {
      if (incident.riskDomain) set.add(incident.riskDomain)
    }
    return [...set].sort()
  }, [incidents])

  const filtered = useMemo(() => {
    const rows = domainFilter === 'all' ? incidents : incidents.filter((incident) => incident.riskDomain === domainFilter)
    return [...rows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }, [incidents, domainFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  return (
    <section className="chart-card">
      <h2>Browse incidents</h2>
      <div className="table-controls">
        <label>
          Risk domain
          <select
            value={domainFilter}
            onChange={(event) => {
              setDomainFilter(event.target.value)
              setPage(0)
            }}
          >
            <option value="all">All ({incidents.length})</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </label>
        <span className="chart-note">{filtered.length.toLocaleString('en-US')} incidents</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Deployer</th>
            <th>Risk domain</th>
            <th>Reports</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((incident) => (
            <tr key={incident.id}>
              <td>{incident.date?.slice(0, 10)}</td>
              <td>{incident.title}</td>
              <td>{incident.deployer}</td>
              <td>{incident.riskDomain ?? 'Not classified'}</td>
              <td className="num">{incident.reportCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
          Previous
        </button>
        <span>
          Page {safePage + 1} of {pageCount}
        </span>
        <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
          Next
        </button>
      </div>
    </section>
  )
}
