"use client";
// Sortable, country-filterable event detection log.
// The `country` filter is owned by PageEvents (shared with StorylineTimeline's pills).
// Sort state lives here since only the table cares about it.

import { useMemo, useState } from "react";
import { SectionHead, StatusDot } from "../primitives";
import { tableData } from "@/data/dashboard";
import type { Themed } from "../ThemeContext";
import type { CountryFilter } from "./StorylineTimeline";

type SortKey = "pScore" | "f1" | "precursors";
type SortDir = "asc" | "desc";

type Column = { key: string; label: string; sortable?: boolean };
const COLS: Column[] = [
  { key: "country", label: "Country" },
  { key: "event", label: "Event" },
  { key: "date", label: "Date" },
  { key: "pScore", label: "P-Score", sortable: true },
  { key: "model", label: "Model" },
  { key: "f1", label: "F1", sortable: true },
  { key: "precursors", label: "Precursors", sortable: true },
  { key: "status", label: "Status" },
];

type Props = Themed<{ country: CountryFilter }>;

export const EventsTable = ({ theme, country }: Props) => {
  const [sortBy, setSortBy] = useState<SortKey>("pScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    let d = [...tableData];
    if (country !== "all") d = d.filter(r => r.country.toLowerCase().startsWith(country));
    d.sort((a, b) => (sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]));
    return d;
  }, [country, sortBy, sortDir]);

  const onHeaderClick = (col: Column) => {
    if (!col.sortable) return;
    const key = col.key as SortKey;
    setSortDir(sortBy === key && sortDir === "desc" ? "asc" : "desc");
    setSortBy(key);
  };

  return (
    <>
      <SectionHead title="Event Detection Log" subtitle={`${sorted.length} events`} theme={theme} />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => onHeaderClick(col)}
                  style={{
                    textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 600,
                    color: theme.textMut, textTransform: "uppercase", letterSpacing: "0.06em",
                    borderBottom: `1px solid ${theme.divider}`,
                    cursor: col.sortable ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none",
                  }}
                >
                  {col.label}{sortBy === col.key && (sortDir === "desc" ? " ↓" : " ↑")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr
                key={row.id}
                style={{ cursor: "pointer", transition: "background 0.08s" }}
                onMouseEnter={e => (e.currentTarget.style.background = theme.sidebarHi)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "9px 12px", fontSize: 12, color: theme.textSec, fontWeight: 500 }}>{row.country}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, color: theme.text, fontWeight: 500 }}>{row.event}</td>
                <td style={{ padding: "9px 12px", fontSize: 11, color: theme.textMut, fontVariantNumeric: "tabular-nums" }}>{row.date}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 700, color: row.pScore > 0.7 ? theme.green : row.pScore > 0.55 ? theme.text : theme.red, fontVariantNumeric: "tabular-nums" }}>
                  {row.pScore.toFixed(3)}
                </td>
                <td style={{ padding: "9px 12px", fontSize: 11, color: theme.textSec, fontFamily: "monospace" }}>{row.model}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: theme.text, fontVariantNumeric: "tabular-nums" }}>{row.f1.toFixed(2)}</td>
                <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600, color: theme.accent, fontVariantNumeric: "tabular-nums" }}>{row.precursors}</td>
                <td style={{ padding: "9px 12px" }}><StatusDot status={row.status} theme={theme} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
