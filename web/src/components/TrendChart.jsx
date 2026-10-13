import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { countByYear } from '../lib/aggregate'
import { chartTheme } from '../lib/theme'
import { useColorScheme } from '../lib/useColorScheme'

export function TrendChart({ incidents }) {
  const scheme = useColorScheme()
  const rows = useMemo(() => countByYear(incidents), [incidents])

  const option = useMemo(() => {
    const theme = chartTheme[scheme]
    return {
      backgroundColor: 'transparent',
      grid: { left: 48, right: 16, top: 16, bottom: 32 },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value) => `${value} incident${value === 1 ? '' : 's'}`,
      },
      xAxis: {
        type: 'category',
        data: rows.map((row) => row.year),
        axisLine: { lineStyle: { color: theme.baseline } },
        axisTick: { show: false },
        axisLabel: { color: theme.muted },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: theme.gridline } },
        axisLabel: { color: theme.muted },
      },
      series: [
        {
          type: 'bar',
          data: rows.map((row) => row.count),
          barMaxWidth: 24,
          barCategoryGap: '20%',
          itemStyle: { color: theme.series1, borderRadius: [4, 4, 0, 0] },
        },
      ],
    }
  }, [rows, scheme])

  return (
    <section className="chart-card">
      <h2>Incidents per year</h2>
      <ReactECharts option={option} style={{ height: 280 }} notMerge />
      <details>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Incidents</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
