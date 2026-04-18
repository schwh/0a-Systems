"use client";
// Pipeline health indicators. The `tone` field in data is mapped to a theme
// color here so that data stays theme-agnostic.

import { SectionHead } from "../primitives";
import { systemStatus } from "@/data/dashboard";
import type { Theme, Themed } from "../ThemeContext";

type Tone = "ok" | "warn" | "error";

const toneColor = (theme: Theme, tone: Tone | string): string => {
  if (tone === "ok") return theme.green;
  if (tone === "warn") return theme.amber;
  if (tone === "error") return theme.red;
  return theme.textMut;
};

export const SystemStatus = ({ theme }: Themed) => (
  <>
    <SectionHead title="System Status" subtitle="Pipeline health at a glance" theme={theme} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
      {systemStatus.map((s, i) => {
        const color = toneColor(theme, s.tone);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}44` }} />
            <span style={{ fontSize: 12, color: theme.textSec, fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 10, color, fontWeight: 600, marginLeft: "auto" }}>{s.status}</span>
          </div>
        );
      })}
    </div>
  </>
);
