// Mirrors the validated reference palette (dataviz skill, references/palette.md).
// Chart canvases need real hex values, they cannot read CSS variables the way the
// rest of the page chrome does.
export const chartTheme = {
  light: {
    surface: '#fcfcfb',
    textSecondary: '#52514e',
    muted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
    series1: '#2a78d6',
    series2: '#eb6834',
    series3: '#1baf7a',
  },
  dark: {
    surface: '#1a1a19',
    textSecondary: '#c3c2b7',
    muted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
    series1: '#3987e5',
    series2: '#d95926',
    series3: '#199e70',
  },
}
