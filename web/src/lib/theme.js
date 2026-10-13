// Mirrors the CSS custom properties in index.css. Chart canvases need real hex
// values, they cannot read CSS variables the way the rest of the page chrome does.
export const chartTheme = {
  light: {
    textSecondary: '#52514e',
    muted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
    series1: '#2a78d6',
  },
  dark: {
    textSecondary: '#c3c2b7',
    muted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
    series1: '#3987e5',
  },
}
