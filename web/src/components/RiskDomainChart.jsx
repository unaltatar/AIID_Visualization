import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { countByRiskDomain } from '../lib/aggregate'
import { chartTheme } from '../lib/theme'
import { useColorScheme } from '../lib/useColorScheme'

export function RiskDomainChart({ incidents, onSelectDomain }) {
  const scheme = useColorScheme()
  const rows = useMemo(() => countByRiskDomain(incidents), [incidents])

  const option = useMemo(() => {
    const theme = chartTheme[scheme]
    return {
      backgroundColor: 'transparent',
      grid: { left: 230, right: 48, top: 8, bottom: 8 },
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => `${value} incident${value === 1 ? '' : 's'}`,
      },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.domain),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary, width: 210, overflow: 'truncate' },
      },
      series: [
        {
          type: 'bar',
          data: rows.map((row) => row.count),
          barMaxWidth: 20,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params) => (rows[params.dataIndex].isGap ? theme.muted : theme.series1),
          },
          label: { show: true, position: 'right', color: theme.textSecondary },
        },
      ],
    }
  }, [rows, scheme])

  const onEvents = useMemo(
    () => ({
      click: (params) => {
        const row = rows[params.dataIndex]
        if (row && !row.isGap) onSelectDomain(row.domain)
      },
    }),
    [rows, onSelectDomain],
  )

  return (
    <div className="risk-domain-chart">
      <ReactECharts option={option} onEvents={onEvents} style={{ height: 320 }} notMerge />
      <details>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Risk domain</th>
              <th>Incidents</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.domain}>
                <td>{row.domain}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
