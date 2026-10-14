import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { computeCoverage, countByRegion } from '../lib/aggregate'
import { chartTheme } from '../lib/theme'
import { useColorScheme } from '../lib/useColorScheme'

export function GeographyChart({ incidents }) {
  const scheme = useColorScheme()
  const rows = useMemo(() => countByRegion(incidents), [incidents])
  const coveragePct = useMemo(() => computeCoverage(incidents).locationRegion, [incidents])

  const option = useMemo(() => {
    const theme = chartTheme[scheme]
    return {
      backgroundColor: 'transparent',
      grid: { left: 140, right: 48, top: 8, bottom: 8 },
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => `${value} incident${value === 1 ? '' : 's'}`,
      },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.region),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary },
      },
      series: [
        {
          type: 'bar',
          data: rows.map((row) => row.count),
          barMaxWidth: 20,
          itemStyle: { color: theme.series1, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: theme.textSecondary },
        },
      ],
    }
  }, [rows, scheme])

  return (
    <section className="chart-card" id="geography">
      <h2>Incidents by region</h2>
      <p className="chart-note">
        Location Region is recorded for {coveragePct}% of incidents in the current selection. This shows only that
        tagged subset, so read it as a sample rather than a complete geographic picture. A country-level map was
        considered and skipped for now: at this coverage it would mostly show gaps, not signal.
      </p>
      <ReactECharts option={option} style={{ height: Math.max(160, rows.length * 36) }} notMerge />
      <details>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Incidents</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.region}>
                <td>{row.region}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
