const FEED_LIMIT = 20

export function WhatsNewFeed({ whatsNew }) {
  const all = whatsNew.newIncidents
  const items = [...all].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, FEED_LIMIT)

  return (
    <section className="chart-card" id="whats-new">
      <h2>New this week</h2>
      {all.length === 0 ? (
        <p className="chart-note">No new incidents since the last snapshot.</p>
      ) : (
        <ul className="feed-list">
          {items.map((item) => (
            <li key={item.id}>
              <span className="feed-title">{item.title}</span>
              <span className="feed-meta">
                {item.date?.slice(0, 10)} &middot; {item.deployer} &middot; {item.riskDomain ?? 'Not classified'}
              </span>
            </li>
          ))}
        </ul>
      )}
      {all.length > FEED_LIMIT && (
        <p className="chart-note">Showing the {FEED_LIMIT} most recent of {all.length.toLocaleString('en-US')} new incidents.</p>
      )}
      {whatsNew.updatedIncidents.length > 0 && (
        <p className="chart-note">{whatsNew.updatedIncidents.length} other incident(s) were edited this week.</p>
      )}
    </section>
  )
}
