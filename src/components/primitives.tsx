"use client";
// Stateless UI primitives shared across Dashboard pages.
// Each takes a `theme` prop (see ThemeContext) plus element-specific props.

import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Themed } from "./ThemeContext";

type MetricProps = Themed<{
  label: string;
  value: string | number;
  change?: string | null;
  up?: boolean;
  sub?: string;
}>;

export const Metric = ({ label, value, change, up, theme, sub }: MetricProps) => (
  <div>
    <div style={{ fontSize: 10, color: theme.textMut, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: theme.text, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {change && (
        <span style={{ fontSize: 11, fontWeight: 600, color: up ? theme.green : theme.red, display: "flex", alignItems: "center", gap: 2 }}>
          {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{change}
        </span>
      )}
    </div>
    {sub && <div style={{ fontSize: 10, color: theme.textMut, marginTop: 3 }}>{sub}</div>}
  </div>
);

type SectionHeadProps = Themed<{
  title: string;
  subtitle?: string;
  right?: ReactNode;
}>;

export const SectionHead = ({ title, subtitle, theme, right }: SectionHeadProps) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: theme.textMut, marginTop: 1 }}>{subtitle}</div>}
    </div>
    {right}
  </div>
);

type LegendItem = { name: string; color: string };
type LegendProps = Themed<{ items: LegendItem[] }>;

export const LineLegend = ({ items, theme }: LegendProps) => (
  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
    {items.map(({ name, color }) => (
      <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: theme.textSec }}>
        <span style={{ width: 8, height: 2, borderRadius: 1, background: color }} />{name}
      </div>
    ))}
  </div>
);

export const DotLegend = ({ items, theme }: LegendProps) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    {items.map(({ name, color }) => (
      <div key={name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: theme.textSec }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />{name}
      </div>
    ))}
  </div>
);

type PillProps = Themed<{
  label: string;
  active: boolean;
  onClick: () => void;
}>;

export const Pill = ({ label, active, onClick, theme }: PillProps) => (
  <div onClick={onClick} style={{
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 5, cursor: "pointer",
    color: active ? "#fff" : theme.textMut, background: active ? theme.accent : "transparent",
    transition: "all 0.15s ease",
  }}>{label}</div>
);

type StatusKind = "detected" | "partial" | "missed";
type StatusDotProps = Themed<{ status: StatusKind | string }>;

export const StatusDot = ({ status, theme }: StatusDotProps) => {
  const palette: Record<string, string> = { detected: theme.green, partial: theme.amber, missed: theme.red };
  const col = palette[status] || theme.textMut;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: col }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: col }} />{status}
    </div>
  );
};

// Custom Recharts tooltip. Recharts passes { active, payload, label } when the
// tooltip renders; our extras are `theme` and optional value formatter `fmt`.
type TooltipPayloadEntry = { name?: string; value?: unknown; color?: string; stroke?: string };
type ChartTooltipProps = Themed<{
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  fmt?: (v: unknown) => string;
}>;

export const ChartTooltip = ({ active, payload, label, theme, fmt }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.dividerStrong}`, borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", fontSize: 11 }}>
      <div style={{ color: theme.textMut, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: theme.text, marginBottom: 1 }}>
          <span style={{ width: 6, height: 2, borderRadius: 1, background: p.color || p.stroke }} />
          <span style={{ color: theme.textSec }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{fmt ? fmt(p.value) : String(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const Divider = ({ theme }: Themed) => (
  <div style={{ borderTop: `1px solid ${theme.divider}`, margin: "24px 0" }} />
);
