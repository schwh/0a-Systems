"use client";
// Precursor escalation timeline for the Events page.
// The country filter pills sit here but actually drive EventsTable below —
// preserving the existing coupling so behaviour is identical.

import { SectionHead, Pill } from "../primitives";
import { precursorStoryline } from "@/data/dashboard";
import type { Themed } from "../ThemeContext";

const COUNTRIES = ["all", "ar", "mx", "br"] as const;
export type CountryFilter = (typeof COUNTRIES)[number];

type Props = Themed<{
  country: CountryFilter;
  setCountry: (c: CountryFilter) => void;
}>;

export const StorylineTimeline = ({ theme, country, setCountry }: Props) => (
  <>
    <SectionHead
      title="Precursor Storyline — Argentina"
      subtitle="Escalation toward 2014-08-07 labor protest"
      theme={theme}
      right={
        <div style={{ display: "flex", gap: 3 }}>
          {COUNTRIES.map(cc => (
            <Pill
              key={cc}
              label={cc === "all" ? "All" : cc.toUpperCase()}
              active={country === cc}
              onClick={() => setCountry(cc)}
              theme={theme}
            />
          ))}
        </div>
      }
    />
    <div style={{ position: "relative", height: 110, marginTop: 8, marginBottom: 8 }}>
      <div style={{ position: "absolute", top: 35, left: 0, right: 0, height: 1, background: theme.dividerStrong }} />
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        {precursorStoryline.map((node, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            {node.topic
              ? <div style={{ fontSize: 10, fontWeight: 600, color: theme.accent, marginBottom: 6, whiteSpace: "nowrap" }}>{node.topic}</div>
              : <div style={{ height: 16 }} />
            }
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>{node.score.toFixed(3)}</div>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: node.score > 0.7 ? theme.red : node.score > 0.6 ? theme.amber : theme.accent,
              border: `2px solid ${theme.bg}`,
              boxShadow: `0 0 0 2px ${node.score > 0.7 ? theme.redDim : node.score > 0.6 ? theme.amberDim : theme.accentDim}`,
              position: "relative", zIndex: 2,
            }} />
            <div style={{ fontSize: 10, color: theme.textMut, marginTop: 6, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{node.date}</div>
            <div style={{ fontSize: 9, color: theme.textSec, marginTop: 2, textAlign: "center", maxWidth: 80, lineHeight: 1.3 }}>{node.label}</div>
          </div>
        ))}
      </div>
    </div>
  </>
);
