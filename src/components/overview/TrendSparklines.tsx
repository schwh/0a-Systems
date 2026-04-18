"use client";
// Small 10-day sparkline per KPI, using the same `kpis` list as KpiStrip so
// labels and trends stay aligned without index coupling between arrays.

import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts";
import { SectionHead } from "../primitives";
import { kpis } from "@/data/dashboard";
import type { Themed } from "../ThemeContext";

export const TrendSparklines = ({ theme }: Themed) => (
  <>
    <SectionHead title="Trend Overview" subtitle="10-day sparklines for each key metric" theme={theme} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
      {kpis.map((m, i) => {
        const data = m.trend.map((v, j) => ({ d: j, v }));
        const min = Math.min(...m.trend);
        const max = Math.max(...m.trend);
        return (
          <div key={i}>
            <div style={{ fontSize: 10, color: theme.textMut, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
              {m.label}
            </div>
            <ResponsiveContainer width="100%" height={48}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`sp${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.accent} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[min * 0.9, max * 1.05]} hide />
                <Area type="monotone" dataKey="v" stroke={theme.accent} strokeWidth={1.5} fill={`url(#sp${i})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  </>
);
