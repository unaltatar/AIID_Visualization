import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import { countByDomainAndField } from '../lib/aggregate'
import { chartTheme } from '../lib/theme'
import { useColorScheme } from '../lib/useColorScheme'

const DIMENSIONS = {
  responsibleEntity: { label: 'Responsible entity', values: ['AI', 'Human', 'Other'] },
  intent: { label: 'Intent', values: ['Intentional', 'Unintentional', 'Other'] },
}

export function DomainBreakdownChart({ incidents }) {
  const scheme = useColorScheme()
  const [dimension, setDimension] = useState('responsibleEntity')
  const { label, values } = DIMENSIONS[dimension]

  const rows = useMemo(() => countByDomainAndField(incidents, dimension, values), [incidents, dimension, values])

  const option = useMemo(() => {
    const theme = chartTheme[scheme]
    const seriesColors = [theme.series1, theme.series2, theme.series3]
    return {
      backgroundColor: 'transparent',
      grid: { left: 230, right: 24, top: 40, bottom: 24 },
      legend: { top: 0, left: 230, textStyle: { color: theme.textSecondary } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: theme.gridline } },
        axisLabel: { color: theme.muted },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.domain),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary, width: 210, overflow: 'truncate' },
      },
      series: values.map((value, index) => ({
        name: value,
        type: 'bar',
        stack: 'total',
        barMaxWidth: 20,
        itemStyle: { color: seriesColors[index], borderColor: theme.surface, borderWidth: 2 },
        data: rows.map((row) => row.values[index]),
      })),
    }
  }, [rows, scheme, values])

  return (
    <section className="chart-card">
      <div className="chart-header">
        <h2>Risk domain by {label.toLowerCase()}</h2>
        <div className="segmented">
          {Object.entries(DIMENSIONS).map(([key, config]) => (
            <button
              key={key}
              type="button"
              className={key === dimension ? 'active' : ''}
              onClick={() => setDimension(key)}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 320 }} notMerge />
      <details>
        <summary>View as table</summary>
        <table className="data-table">
          <thead>
            <tr>
              <th>Risk domain</th>
              {values.map((value) => (
                <th key={value}>{value}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.domain}>
                <td>{row.domain}</td>
                {row.values.map((value, index) => (
                  <td key={values[index]}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
