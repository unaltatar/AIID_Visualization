function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function KpiStrip({ meta, newCount }) {
  const tiles = [
    { label: 'Total incidents', value: meta.totalIncidents.toLocaleString('en-US') },
    { label: 'New this week', value: newCount.toLocaleString('en-US') },
    { label: 'Tracked since', value: meta.dateRange.min?.slice(0, 4) ?? 'unknown' },
    { label: 'Last updated', value: formatDate(meta.lastFetched) },
  ]

  return (
    <section className="kpi-strip">
      {tiles.map((tile) => (
        <div className="kpi-tile" key={tile.label}>
          <span className="kpi-label">{tile.label}</span>
          <span className="kpi-value">{tile.value}</span>
        </div>
      ))}
    </section>
  )
}
