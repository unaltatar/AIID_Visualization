import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { countByEntity } from '../lib/orgNames'
import { chartTheme } from '../lib/theme'
import { useColorScheme } from '../lib/useColorScheme'

const LIMIT = 10

export function TopEntitiesChart({ incidents, field, title }) {
  const scheme = useColorScheme()
  const rows = useMemo(() => countByEntity(incidents, field, LIMIT), [incidents, field])

  const option = useMemo(() => {
    const theme = chartTheme[scheme]
    return {
      backgroundColor: 'transparent',
      grid: { left: 190, right: 40, top: 8, bottom: 8 },
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => `${value} mention${value === 1 ? '' : 's'}`,
      },
      xAxis: { type: 'value', show: false },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary, width: 170, overflow: 'truncate' },
      },
      series: [
        {
          type: 'bar',
          data: rows.map((row) => row.count),
          barMaxWidth: 18,
          itemStyle: { color: theme.series1, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: theme.textSecondary },
        },
      ],
    }
  }, [rows, scheme])

  return (
    <div className="top-entities-chart">
      <h3>{title}</h3>
      <ReactECharts option={option} style={{ height: Math.max(160, rows.length * 30) }} notMerge />
      <details>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Mentions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
