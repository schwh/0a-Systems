import type { Theme } from "./ThemeContext";

// Shared Recharts style helpers. Each returns a plain object designed to be
// spread onto the corresponding Recharts element — e.g.:
//   <XAxis {...axisProps(theme)} dataKey="day" />
//   <Tooltip contentStyle={tooltipStyle(theme)} />
// Additional props on the element override the shared defaults.

export const axisProps = (theme: Theme) => ({
  tick: { fontSize: 10, fill: theme.textMut },
  axisLine: false as const,
  tickLine: false as const,
});

export const tooltipStyle = (theme: Theme) => ({
  background: theme.panel,
  border: `1px solid ${theme.dividerStrong}`,
  borderRadius: 8,
  fontSize: 11,
});
