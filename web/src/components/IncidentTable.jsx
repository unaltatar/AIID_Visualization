import { Fragment, useMemo, useState } from 'react'
import { IncidentDetail } from './IncidentDetail'

const PAGE_SIZE = 25

function matchesSearch(incident, query) {
  if (!query) return true
  const haystack = `${incident.title ?? ''} ${incident.deployer ?? ''} ${incident.developer ?? ''}`.toLowerCase()
  return haystack.includes(query)
}

export function IncidentTable({ incidents }) {
  const [domainFilter, setDomainFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState(null)

  const domains = useMemo(() => {
    const set = new Set()
    for (const incident of incidents) {
      if (incident.riskDomain) set.add(incident.riskDomain)
    }
    return [...set].sort()
  }, [incidents])

  const years = useMemo(() => {
    const set = new Set()
    for (const incident of incidents) {
      if (incident.year) set.add(incident.year)
    }
    return [...set].sort().reverse()
  }, [incidents])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = incidents.filter((incident) => {
      if (domainFilter !== 'all' && incident.riskDomain !== domainFilter) return false
      if (yearFilter !== 'all' && incident.year !== yearFilter) return false
      return matchesSearch(incident, query)
    })
    return rows.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  }, [incidents, domainFilter, yearFilter, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function updateFilter(setter, value) {
    setter(value)
    setPage(0)
  }

  return (
    <section className="chart-card" id="browse">
      <h2>Browse incidents</h2>
      <div className="table-controls">
        <input
          type="search"
          placeholder="Search title or organization..."
          value={search}
          onChange={(event) => updateFilter(setSearch, event.target.value)}
        />
        <label>
          Risk domain
          <select value={domainFilter} onChange={(event) => updateFilter(setDomainFilter, event.target.value)}>
            <option value="all">All</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select value={yearFilter} onChange={(event) => updateFilter(setYearFilter, event.target.value)}>
            <option value="all">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
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
            <Fragment key={incident.id}>
              <tr
                className="incident-row"
                onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
              >
                <td>{incident.date?.slice(0, 10)}</td>
                <td>{incident.title}</td>
                <td>{incident.deployer}</td>
                <td>{incident.riskDomain ?? 'Not classified'}</td>
                <td className="num">{incident.reportCount}</td>
              </tr>
              {expandedId === incident.id && (
                <tr className="incident-row-detail">
                  <td colSpan={5}>
                    <IncidentDetail incident={incident} />
                  </td>
                </tr>
              )}
            </Fragment>
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
