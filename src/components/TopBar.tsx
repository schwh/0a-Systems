"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { useTheme, type Theme } from "./ThemeContext";
import type { NavTarget } from "./CornerMenu";

// ─── Top-level tabs shown in the center pill ─────────────────────────────
const TABS: { id: NavTarget; label: string }[] = [
  { id: "home",          label: "Home" },
  { id: "finance",       label: "Finance" },
  { id: "biotechnology", label: "Biotechnology" },
];

// ─── Searchable directory of every page ──────────────────────────────────
const PAGES: { id: NavTarget; label: string; keywords: string[] }[] = [
  { id: "home",          label: "Home",          keywords: ["landing", "intro", "overview"] },
  { id: "dashboard",     label: "Dashboard",     keywords: ["canvas", "terminal", "workspace"] },
  { id: "finance",       label: "Finance",       keywords: ["fin", "money", "markets"] },
  { id: "biotechnology", label: "Biotechnology", keywords: ["bio", "biotech", "dna", "genome"] },
  { id: "models",        label: "Models",        keywords: ["f1", "ml", "model"] },
  { id: "events",        label: "Events",        keywords: ["storyline", "table", "timeline"] },
  { id: "pipeline",      label: "Pipeline",      keywords: ["ingest", "stages"] },
  { id: "countries",     label: "Countries",     keywords: ["country", "region", "map"] },
  { id: "settings",      label: "Settings",      keywords: ["theme", "preferences", "config"] },
];

interface Props {
  current: NavTarget;
  onNavigate: (t: NavTarget) => void;
}

export default function TopBar({ current, onNavigate }: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored: { p: typeof PAGES[number]; score: number }[] = [];
    for (const p of PAGES) {
      const label = p.label.toLowerCase();
      let score = 0;
      if (label === q) score = 100;
      else if (label.startsWith(q)) score = 80;
      else if (label.includes(q)) score = 60;
      else if (p.keywords.some(k => k === q)) score = 55;
      else if (p.keywords.some(k => k.startsWith(q))) score = 45;
      else if (p.keywords.some(k => k.includes(q))) score = 30;
      if (score > 0) scored.push({ p, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.p);
  }, [query]);

  // reset active row when results change
  useEffect(() => { setActive(0); }, [query]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ⌘/ctrl-K to focus search; Esc to blur
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (t: NavTarget) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onNavigate(t);
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (results[active]) go(results[active].id);
    } else if (e.key === "Escape") {
      setOpen(false);
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(i => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(i => Math.max(0, i - 1));
    }
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        top: 14,
        left: 0,
        right: 0,
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {/* center pill with tabs */}
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          gap: 2,
          padding: 4,
          background: theme.panel + "cc",
          border: `1px solid ${theme.dividerStrong}`,
          borderRadius: 999,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
          transition: "background 0.5s ease, border-color 0.5s ease",
        }}
      >
        {TABS.map(tab => (
          <Tab
            key={tab.id}
            label={tab.label}
            active={current === tab.id}
            onClick={() => go(tab.id)}
            theme={theme}
          />
        ))}
      </div>

      {/* right-side search */}
      <div style={{ position: "absolute", right: 16, pointerEvents: "auto" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px 6px 11px",
              background: theme.panel + "cc",
              border: `1px solid ${open ? theme.accent : theme.dividerStrong}`,
              borderRadius: 999,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              width: open ? 260 : 200,
              transition: "width 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.15s ease, background 0.5s ease",
              boxShadow: open ? `0 0 0 3px ${theme.accentDim}` : "0 8px 28px rgba(0,0,0,0.4)",
            }}
          >
            <Search size={13} style={{ color: open ? theme.accent : theme.textMut, flexShrink: 0, transition: "color 0.15s ease" }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={onSearchKey}
              placeholder="Search pages…"
              spellCheck={false}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: theme.text,
                fontSize: 12,
                fontFamily: "inherit",
              }}
            />
            <kbd
              style={{
                fontSize: 9,
                fontFamily: '"SF Mono", Menlo, monospace',
                color: theme.textMut,
                padding: "2px 5px",
                border: `1px solid ${theme.divider}`,
                borderRadius: 4,
                letterSpacing: "0.04em",
                flexShrink: 0,
              }}
            >
              ⌘K
            </kbd>
          </div>

          {/* results dropdown */}
          {open && (query.length > 0) && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                padding: 4,
                background: theme.panel + "f2",
                border: `1px solid ${theme.dividerStrong}`,
                borderRadius: 10,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {results.length === 0 ? (
                <div style={{ padding: "10px 12px", fontSize: 12, color: theme.textMut }}>
                  No matches for &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((p, i) => (
                  <ResultRow
                    key={p.id}
                    label={p.label}
                    current={p.id === current}
                    active={i === active}
                    onHover={() => setActive(i)}
                    onClick={() => go(p.id)}
                    theme={theme}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

const Tab = ({
  label, active, onClick, theme,
}: { label: string; active: boolean; onClick: () => void; theme: Theme }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "7px 16px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? theme.text : hover ? theme.text : theme.textSec,
        background: active ? theme.accentDim : hover ? theme.sidebarHi : "transparent",
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
        letterSpacing: "-0.005em",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
};

const ResultRow = ({
  label, current, active, onHover, onClick, theme,
}: {
  label: string; current: boolean; active: boolean;
  onHover: () => void; onClick: () => void; theme: Theme;
}) => (
  <div
    onMouseEnter={onHover}
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 10px",
      borderRadius: 7,
      fontSize: 12.5,
      fontWeight: active ? 600 : 500,
      color: active ? theme.text : theme.textSec,
      background: active ? theme.accentDim : "transparent",
      cursor: "pointer",
      transition: "background 0.1s ease, color 0.1s ease",
    }}
  >
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span>{label}</span>
      {current && (
        <span style={{ fontSize: 9, color: theme.textMut, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          current
        </span>
      )}
    </span>
    {active && <CornerDownLeft size={12} style={{ color: theme.textMut }} />}
  </div>
);
