"use client";
// Horizontal strip of KPI cards separated by vertical dividers.

import { Metric } from "../primitives";
import { kpis } from "@/data/dashboard";
import type { Themed } from "../ThemeContext";

export const KpiStrip = ({ theme }: Themed) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, marginBottom: 32 }}>
    {kpis.map((m, i) => (
      <div
        key={i}
        style={{
          paddingLeft: i > 0 ? 24 : 0,
          paddingRight: 24,
          borderLeft: i > 0 ? `1px solid ${theme.divider}` : "none",
        }}
      >
        <Metric {...m} theme={theme} />
      </div>
    ))}
  </div>
);
