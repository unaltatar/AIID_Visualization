import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { countBySubdomain } from '../lib/aggregate'
import { chartTheme } from '../lib/theme'
import { useColorScheme } from '../lib/useColorScheme'

export function SubdomainChart({ incidents, domain }) {
  const scheme = useColorScheme()
  const rows = useMemo(() => countBySubdomain(incidents, domain), [incidents, domain])

  const option = useMemo(() => {
    const theme = chartTheme[scheme]
    return {
      backgroundColor: 'transparent',
      grid: { left: 280, right: 48, top: 8, bottom: 8 },
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => `${value} incident${value === 1 ? '' : 's'}`,
      },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.subdomain),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary, width: 260, overflow: 'truncate' },
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
    <div className="subdomain-chart">
      <h3>Subdomains of {domain}</h3>
      <ReactECharts option={option} style={{ height: Math.max(140, rows.length * 36) }} notMerge />
      <details>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subdomain</th>
              <th>Incidents</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subdomain}>
                <td>{row.subdomain}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
