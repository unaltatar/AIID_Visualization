export function YearRangeFilter({ minYear, maxYear, from, to, onChange }) {
  const span = maxYear - minYear || 1
  const fromPct = ((from - minYear) / span) * 100
  const toPct = ((to - minYear) / span) * 100
  const isFullRange = from === minYear && to === maxYear

  return (
    <div className="year-range-filter">
      <span className="year-range-label">Filter by year</span>
      <div className="year-range-track">
        <div className="year-range-rail" />
        <div className="year-range-fill" style={{ left: `${fromPct}%`, width: `${toPct - fromPct}%` }} />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={from}
          aria-label="From year"
          onChange={(event) => onChange({ from: Math.min(Number(event.target.value), to), to })}
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={to}
          aria-label="To year"
          onChange={(event) => onChange({ from, to: Math.max(Number(event.target.value), from) })}
        />
      </div>
      <span className="year-range-values">
        {from} to {to}
      </span>
      {!isFullRange && (
        <button type="button" className="year-range-reset" onClick={() => onChange({ from: minYear, to: maxYear })}>
          Reset
        </button>
      )}
    </div>
  )
}
