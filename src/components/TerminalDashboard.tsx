"use client";
import {
  useCallback, useEffect, useMemo, useRef, useState,
  type PointerEvent as RPointerEvent,
} from "react";
import { X, Plus, Minus, Maximize2 } from "lucide-react";
import type { Themed, Theme } from "./ThemeContext";

// ═══════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════

type ChartKind = "line" | "bar" | "area";
type ChartColor = "accent" | "green" | "amber" | "red" | "purple" | "blue" | "cyan";

type Vec = { x: number; y: number };
type Size = { w: number; h: number };

type ChartEl = {
  id: string; kind: ChartKind; pos: Vec; size: Size;
  label: string; color: ChartColor;
  points: Vec[];        // data coords: x in [0, xMax], y in [0, 1]
  xMax: number;         // x domain upper bound (fixed at spawn)
};
type KpiEl = { id: string; kind: "kpi"; pos: Vec; size: Size; label: string; value: string; color: ChartColor };
type NoteEl = { id: string; kind: "note"; pos: Vec; size: Size; text: string };

type CanvasElement = ChartEl | KpiEl | NoteEl;
type ElementKind = CanvasElement["kind"];

type LogEntry = { id: string; input: string; output: { kind: "ok" | "err" | "info"; text: string }[] };

type View = { pan: Vec; zoom: number };

// ═══════════════════════════════════════════════════════════════════════
//  CONSTANTS / HELPERS
// ═══════════════════════════════════════════════════════════════════════

const COLOR_KEYS: ChartColor[] = ["accent", "green", "amber", "red", "purple", "blue", "cyan"];
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3.0;

const SPAWN_SIZE: Record<ElementKind, Size> = {
  line: { w: 380, h: 240 },
  bar:  { w: 380, h: 240 },
  area: { w: 380, h: 240 },
  kpi:  { w: 210, h: 115 },
  note: { w: 240, h: 120 },
};

const MIN_SIZE: Record<ElementKind, Size> = {
  line: { w: 240, h: 170 },
  bar:  { w: 240, h: 170 },
  area: { w: 240, h: 170 },
  kpi:  { w: 140, h: 80 },
  note: { w: 140, h: 70 },
};

let idSeq = 0;
const nextId = () => `${Date.now().toString(36)}-${(idSeq++).toString(36)}`;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pickColor = (i: number): ChartColor => COLOR_KEYS[i % COLOR_KEYS.length];

const genPoints = (n = 8): Vec[] => {
  let v = 0.4 + Math.random() * 0.2;
  return Array.from({ length: n }, (_, i) => {
    v += (Math.random() - 0.5) * 0.18;
    v = clamp(v, 0.1, 0.9);
    return { x: i, y: Number(v.toFixed(3)) };
  });
};

const HELP_LINES = [
  "commands:",
  "  help                     — list commands",
  "  clear                    — remove all elements",
  "  reset                    — clear canvas and terminal",
  "  add line  [label]        — spawn a line chart",
  "  add bar   [label]        — spawn a bar chart",
  "  add area  [label]        — spawn an area chart",
  "  add kpi   <label> <val>  — spawn a kpi card",
  "  add note  <text>         — spawn a note",
  "  remove                   — remove last element",
  "canvas:",
  "  drag empty space         — pan",
  "  cmd/ctrl + wheel · pinch — zoom at cursor",
  "  drag header · corner     — move · resize",
  "  drag data point          — edit chart x/y",
];

// ═══════════════════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export const TerminalDashboard = ({ theme }: Themed) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [view, setView] = useState<View>({ pan: { x: 0, y: 0 }, zoom: 1 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  // keep terminal log scrolled to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // native wheel listener so we can preventDefault (React wheel is passive)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.0025);
        const v = viewRef.current;
        const newZoom = clamp(v.zoom * factor, ZOOM_MIN, ZOOM_MAX);
        const worldX = (mx - v.pan.x) / v.zoom;
        const worldY = (my - v.pan.y) / v.zoom;
        setView({ zoom: newZoom, pan: { x: mx - worldX * newZoom, y: my - worldY * newZoom } });
      } else {
        setView(v => ({ ...v, pan: { x: v.pan.x - e.deltaX, y: v.pan.y - e.deltaY } }));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // pan by dragging empty canvas background
  const onBgPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    const bg = (e.target as HTMLElement).closest("[data-canvas-bg='true']");
    if (!bg) return;
    e.preventDefault();
    const startPan = viewRef.current.pan;
    const startX = e.clientX, startY = e.clientY;
    const onMove = (ev: PointerEvent) => {
      setView(v => ({ ...v, pan: { x: startPan.x + (ev.clientX - startX), y: startPan.y + (ev.clientY - startY) } }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.cursor = "grabbing";
  };

  // screen → world for the current viewport center
  const viewportCenterWorld = useCallback((): Vec => {
    const r = viewportRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    const v = viewRef.current;
    return { x: (r.width / 2 - v.pan.x) / v.zoom, y: (r.height / 2 - v.pan.y) / v.zoom };
  }, []);

  const spawnPos = useCallback((size: Size): Vec => {
    const c = viewportCenterWorld();
    const jitter = (elements.length % 8) * 18;
    return { x: c.x - size.w / 2 + jitter, y: c.y - size.h / 2 + jitter };
  }, [elements.length, viewportCenterWorld]);

  const updateElement = useCallback((id: string, patch: Partial<CanvasElement>) => {
    setElements(prev => prev.map(e => (e.id === id ? { ...e, ...patch } as CanvasElement : e)));
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements(prev => prev.filter(e => e.id !== id));
  }, []);

  const resetView = () => setView({ pan: { x: 0, y: 0 }, zoom: 1 });
  const zoomBy = (factor: number) => {
    const r = viewportRef.current?.getBoundingClientRect();
    if (!r) return;
    const mx = r.width / 2, my = r.height / 2;
    const v = viewRef.current;
    const newZoom = clamp(v.zoom * factor, ZOOM_MIN, ZOOM_MAX);
    const wx = (mx - v.pan.x) / v.zoom, wy = (my - v.pan.y) / v.zoom;
    setView({ zoom: newZoom, pan: { x: mx - wx * newZoom, y: my - wy * newZoom } });
  };

  // ─── COMMANDS ─────────────────────────────────────────────────────────

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const outputs: LogEntry["output"] = [];
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const rest = trimmed.slice(parts[0].length).trim();

    if (cmd === "help" || cmd === "?") {
      HELP_LINES.forEach(t => outputs.push({ kind: "info", text: t }));
    } else if (cmd === "clear") {
      setElements([]); outputs.push({ kind: "ok", text: "canvas cleared" });
    } else if (cmd === "reset") {
      setElements([]); setLog([]); resetView(); return;
    } else if (cmd === "remove" || cmd === "undo" || cmd === "pop") {
      let removed = false;
      setElements(prev => (prev.length === 0 ? prev : (removed = true, prev.slice(0, -1))));
      outputs.push(removed ? { kind: "ok", text: "removed last element" } : { kind: "err", text: "nothing to remove" });
    } else if (cmd === "add") {
      const subParts = rest.split(/\s+/);
      const sub = (subParts[0] || "").toLowerCase();
      const subRest = rest.slice(sub.length).trim();
      const color = pickColor(elements.length);

      if (sub === "line" || sub === "bar" || sub === "area") {
        const label = subRest || `${sub} #${elements.filter(e => e.kind === sub).length + 1}`;
        const size = SPAWN_SIZE[sub];
        const points = genPoints(8);
        const el: ChartEl = {
          id: nextId(), kind: sub, pos: spawnPos(size), size,
          label, color, points, xMax: points.length - 1,
        };
        setElements(p => [...p, el]);
        outputs.push({ kind: "ok", text: `spawned ${sub} — "${label}" · drag points to edit` });
      } else if (sub === "kpi") {
        const m = subRest.match(/^(?:"([^"]+)"|(\S+))\s+(.+)$/);
        if (!m) outputs.push({ kind: "err", text: 'usage: add kpi <label> <value>   e.g. add kpi "Active users" 12,480' });
        else {
          const label = m[1] ?? m[2], value = m[3];
          const size = SPAWN_SIZE.kpi;
          setElements(p => [...p, { id: nextId(), kind: "kpi", pos: spawnPos(size), size, label, value, color }]);
          outputs.push({ kind: "ok", text: `spawned kpi — ${label}: ${value}` });
        }
      } else if (sub === "note") {
        if (!subRest) outputs.push({ kind: "err", text: "usage: add note <text>" });
        else {
          const size = SPAWN_SIZE.note;
          setElements(p => [...p, { id: nextId(), kind: "note", pos: spawnPos(size), size, text: subRest }]);
          outputs.push({ kind: "ok", text: "pinned note to canvas" });
        }
      } else if (!sub) {
        outputs.push({ kind: "err", text: "usage: add <line|bar|area|kpi|note> ..." });
      } else {
        outputs.push({ kind: "err", text: `unknown element: ${sub}` });
      }
    } else {
      outputs.push({ kind: "err", text: `unknown command: ${cmd}. type 'help'` });
    }

    setLog(prev => [...prev, { id: nextId(), input: trimmed, output: outputs }]);
  };

  const commandHistory = useMemo(() => log.map(l => l.input), [log]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { runCommand(input); setInput(""); setHistIdx(null); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!commandHistory.length) return;
      const n = histIdx === null ? commandHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(n); setInput(commandHistory[n]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === null) return;
      const n = histIdx + 1;
      if (n >= commandHistory.length) { setHistIdx(null); setInput(""); }
      else { setHistIdx(n); setInput(commandHistory[n]); }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); setLog([]);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)", minHeight: 560, gap: 14 }}>
      {/* CANVAS VIEWPORT */}
      <div
        ref={viewportRef}
        onPointerDown={onBgPointerDown}
        style={{
          flex: 1, minHeight: 0, position: "relative",
          borderRadius: 12, border: `1px solid ${theme.divider}`,
          background: theme.bg, overflow: "hidden",
          cursor: "grab",
          transition: "border-color 0.5s ease, background-color 0.5s ease",
        }}
      >
        {/* dotted background (tied to zoom/pan via CSS custom props) */}
        <div
          data-canvas-bg="true"
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.dividerStrong} 1px, transparent 0)`,
            backgroundSize: `${22 * view.zoom}px ${22 * view.zoom}px`,
            backgroundPosition: `${view.pan.x}px ${view.pan.y}px`,
            pointerEvents: "auto",
          }}
        />

        {/* world layer — transformed */}
        <div
          style={{
            position: "absolute", top: 0, left: 0,
            transform: `translate(${view.pan.x}px, ${view.pan.y}px) scale(${view.zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
            pointerEvents: "none",   // children re-enable
          }}
        >
          {elements.map(el => (
            <Card
              key={el.id}
              el={el}
              theme={theme}
              zoom={view.zoom}
              onPatch={patch => updateElement(el.id, patch)}
              onRemove={() => removeElement(el.id)}
            />
          ))}
        </div>

        {/* canvas header — screen-space */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", pointerEvents: "none",
            fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
            color: theme.textMut,
            background: `linear-gradient(to bottom, ${theme.bg} 0%, transparent 100%)`,
          }}
        >
          <span>canvas · {elements.length} {elements.length === 1 ? "element" : "elements"}</span>
          <span style={{ color: theme.textMut }}>drag · scroll · pinch</span>
        </div>

        {/* zoom controls — screen-space */}
        <div
          style={{
            position: "absolute", top: 12, right: 12,
            display: "flex", alignItems: "center", gap: 2,
            padding: 3, borderRadius: 8,
            background: theme.panel, border: `1px solid ${theme.dividerStrong}`,
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
            pointerEvents: "auto",
          }}
        >
          <ZoomBtn theme={theme} onClick={() => zoomBy(1 / 1.2)} ariaLabel="Zoom out"><Minus size={12} /></ZoomBtn>
          <div
            onClick={resetView}
            title="Reset view"
            style={{
              fontSize: 10, fontWeight: 600, color: theme.textSec, cursor: "pointer",
              padding: "0 8px", minWidth: 46, textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(view.zoom * 100)}%
          </div>
          <ZoomBtn theme={theme} onClick={() => zoomBy(1.2)} ariaLabel="Zoom in"><Plus size={12} /></ZoomBtn>
          <ZoomBtn theme={theme} onClick={resetView} ariaLabel="Reset view"><Maximize2 size={11} /></ZoomBtn>
        </div>

        {/* empty state */}
        {elements.length === 0 && <EmptyState theme={theme} />}
      </div>

      {/* TERMINAL */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          height: 240, flexShrink: 0,
          display: "flex", flexDirection: "column",
          borderRadius: 12, border: `1px solid ${theme.dividerStrong}`,
          background: theme.panel, overflow: "hidden",
          fontFamily: '"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
          transition: "border-color 0.5s ease, background 0.5s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: `1px solid ${theme.divider}`, background: theme.sidebar }}>
          <Dot color="#ff5f57" /><Dot color="#febc2e" /><Dot color="#28c840" />
          <span style={{ marginLeft: 10, fontSize: 11, color: theme.textMut, letterSpacing: "0.04em" }}>
            0a-systems · dashboard
          </span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px 4px", fontSize: 12.5, lineHeight: 1.55, color: theme.textSec }}>
          {log.length === 0 && (
            <div style={{ color: theme.textMut }}>
              type <span style={{ color: theme.accent }}>help</span> to list commands · arrow keys recall history
            </div>
          )}
          {log.map(entry => (
            <div key={entry.id} style={{ marginBottom: 8 }}>
              <div style={{ color: theme.text }}>
                <span style={{ color: theme.accent, marginRight: 8 }}>›</span>{entry.input}
              </div>
              {entry.output.map((o, i) => (
                <div key={i} style={{
                  color: o.kind === "err" ? theme.red : o.kind === "ok" ? theme.green : theme.textSec,
                  paddingLeft: 18, whiteSpace: "pre-wrap",
                }}>{o.text}</div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderTop: `1px solid ${theme.divider}`, background: theme.bg }}>
          <span style={{ color: theme.accent, fontSize: 13, fontWeight: 600 }}>›</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            placeholder="add line, add kpi, help…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: theme.text, fontFamily: "inherit", fontSize: 13, caretColor: theme.accent,
            }}
          />
          <span aria-hidden style={{
            width: 7, height: 14, background: theme.accent, borderRadius: 1, opacity: 0.85,
            animation: "termBlink 1.1s steps(2) infinite",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes termBlink { 50% { opacity: 0; } }
        @keyframes canvasPop {
          0%   { opacity: 0; filter: blur(8px); transform: translateY(10px) scale(0.96); }
          60%  { filter: blur(0); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default TerminalDashboard;

// ═══════════════════════════════════════════════════════════════════════
//  SCREEN-SPACE DECOR
// ═══════════════════════════════════════════════════════════════════════

const Dot = ({ color }: { color: string }) => (
  <span style={{ width: 11, height: 11, borderRadius: "50%", background: color, opacity: 0.9 }} />
);

const ZoomBtn = ({ theme, onClick, children, ariaLabel }: {
  theme: Theme; onClick: () => void; children: React.ReactNode; ariaLabel: string;
}) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={e => e.stopPropagation()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={ariaLabel}
      style={{
        width: 24, height: 24, border: "none", borderRadius: 6,
        background: hover ? theme.accentDim : "transparent",
        color: hover ? theme.text : theme.textSec,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >{children}</button>
  );
};

const EmptyState = ({ theme }: { theme: Theme }) => (
  <div style={{
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: theme.textMut, fontSize: 12, lineHeight: 1.7, textAlign: "center",
    padding: 40, pointerEvents: "none",
  }}>
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
      color: theme.accent, marginBottom: 14,
    }}>empty canvas</div>
    <div style={{ fontSize: 14, color: theme.textSec, marginBottom: 6 }}>
      the canvas is blank — drop commands in the terminal to build it up.
    </div>
    <div style={{ color: theme.textMut }}>
      try&nbsp;<code style={{ color: theme.accent, fontFamily: '"SF Mono", Menlo, monospace' }}>add line signal</code>
      &nbsp;·&nbsp;<code style={{ color: theme.accent, fontFamily: '"SF Mono", Menlo, monospace' }}>add kpi &quot;Active users&quot; 12,480</code>
      &nbsp;·&nbsp;<code style={{ color: theme.accent, fontFamily: '"SF Mono", Menlo, monospace' }}>help</code>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
//  CARD  — draggable · resizable
// ═══════════════════════════════════════════════════════════════════════

function Card({
  el, theme, zoom, onPatch, onRemove,
}: {
  el: CanvasElement; theme: Theme; zoom: number;
  onPatch: (patch: Partial<CanvasElement>) => void;
  onRemove: () => void;
}) {
  const color =
    el.kind === "note" ? theme.accent : theme[(el as ChartEl | KpiEl).color];

  // drag header → move
  const startMove = (e: RPointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const start = { cx: e.clientX, cy: e.clientY, px: el.pos.x, py: el.pos.y };
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.cx) / zoom;
      const dy = (ev.clientY - start.cy) / zoom;
      onPatch({ pos: { x: start.px + dx, y: start.py + dy } });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.cursor = "grabbing";
  };

  // drag corner → resize (width and height independent)
  const startResize = (e: RPointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const min = MIN_SIZE[el.kind];
    const start = { cx: e.clientX, cy: e.clientY, w: el.size.w, h: el.size.h };
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.cx) / zoom;
      const dy = (ev.clientY - start.cy) / zoom;
      onPatch({ size: {
        w: Math.max(min.w, start.w + dx),
        h: Math.max(min.h, start.h + dy),
      }});
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.cursor = "nwse-resize";
  };

  const HEADER_H = 26;

  return (
    <div
      style={{
        position: "absolute",
        left: el.pos.x, top: el.pos.y,
        width: el.size.w, height: el.size.h,
        background: theme.panel,
        border: `1px solid ${theme.divider}`,
        borderRadius: 10,
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        animation: "canvasPop 0.5s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column",
        pointerEvents: "auto",
        overflow: "hidden",
      }}
      onPointerDown={e => e.stopPropagation()}
    >
      {/* header — drag handle */}
      <div
        onPointerDown={startMove}
        style={{
          height: HEADER_H, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 8px 0 10px",
          borderBottom: `1px solid ${theme.divider}`,
          background: theme.sidebar,
          cursor: "grab", userSelect: "none",
          fontSize: 10, fontWeight: 600, color: theme.textSec,
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, opacity: 0.9 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {el.kind === "note" ? "note" : el.kind === "kpi" ? `kpi · ${(el as KpiEl).label}` : `${el.kind} · ${(el as ChartEl).label}`}
          </span>
        </span>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onRemove}
          aria-label="Remove"
          style={{
            width: 18, height: 18, border: "none", borderRadius: 4,
            background: "transparent", color: theme.textMut, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.redDim; e.currentTarget.style.color = theme.red; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textMut; }}
        ><X size={11} /></button>
      </div>

      {/* body */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {el.kind === "kpi"  && <KpiBody  el={el} theme={theme} color={color} />}
        {el.kind === "note" && <NoteBody el={el} theme={theme} onPatch={onPatch as (p: Partial<NoteEl>) => void} />}
        {(el.kind === "line" || el.kind === "bar" || el.kind === "area") && (
          <ChartBody
            el={el}
            theme={theme}
            color={color}
            zoom={zoom}
            onPointsChange={pts => onPatch({ points: pts } as Partial<ChartEl>)}
          />
        )}
      </div>

      {/* resize handle — bottom-right corner */}
      <div
        onPointerDown={startResize}
        title="Drag to resize"
        style={{
          position: "absolute", right: 0, bottom: 0,
          width: 16, height: 16, cursor: "nwse-resize",
          display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
          padding: 2,
          color: theme.textMut,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M 1 9 L 9 1 M 4 9 L 9 4 M 7 9 L 9 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  CARD BODIES
// ═══════════════════════════════════════════════════════════════════════

const KpiBody = ({ el, theme, color }: { el: KpiEl; theme: Theme; color: string }) => (
  <div style={{ padding: "14px 14px 10px", display: "flex", flexDirection: "column", height: "100%" }}>
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMut }}>{el.label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: theme.text, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{el.value}</div>
    <div style={{ flex: 1 }} />
    <div style={{ width: 28, height: 2, background: color, borderRadius: 2, opacity: 0.8 }} />
  </div>
);

const NoteBody = ({ el, theme }: { el: NoteEl; theme: Theme; onPatch: (p: Partial<NoteEl>) => void }) => (
  <div style={{ padding: "12px 14px", fontSize: 13, color: theme.text, lineHeight: 1.55, whiteSpace: "pre-wrap", height: "100%", overflow: "auto" }}>
    {el.text}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
//  CHART BODY — custom SVG with draggable data points
// ═══════════════════════════════════════════════════════════════════════

function ChartBody({
  el, theme, color, zoom, onPointsChange,
}: {
  el: ChartEl; theme: Theme; color: string; zoom: number;
  onPointsChange: (pts: Vec[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // observe body size so we can draw an SVG at the live pixel dimensions
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const pad = { t: 10, r: 12, b: 20, l: 30 };
  const w = dims.w, h = dims.h;
  const plotW = Math.max(1, w - pad.l - pad.r);
  const plotH = Math.max(1, h - pad.t - pad.b);

  const toPx = useCallback((p: Vec) => ({
    x: pad.l + (p.x / el.xMax) * plotW,
    y: pad.t + (1 - p.y) * plotH,
  }), [el.xMax, plotW, plotH]);

  const toData = useCallback((px: number, py: number): Vec => ({
    x: clamp((px - pad.l) / plotW, 0, 1) * el.xMax,
    y: clamp(1 - (py - pad.t) / plotH, 0, 1),
  }), [el.xMax, plotW, plotH]);

  // stable ordering for line/area rendering (don't mutate source)
  const sorted = useMemo(() => [...el.points].sort((a, b) => a.x - b.x), [el.points]);
  const linePath = sorted.map((p, i) => {
    const { x, y } = toPx(p);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
  const areaPath = linePath
    ? `${linePath} L ${(pad.l + plotW).toFixed(2)} ${(pad.t + plotH).toFixed(2)} L ${pad.l} ${(pad.t + plotH).toFixed(2)} Z`
    : "";

  const startDragPoint = (idx: number) => (e: RPointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragIdx(idx);
    const startPx = toPx(el.points[idx]);
    const start = { cx: e.clientX, cy: e.clientY };

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.cx) / zoom;
      const dy = (ev.clientY - start.cy) / zoom;
      const nextPt = toData(startPx.x + dx, startPx.y + dy);
      const next = el.points.slice();
      next[idx] = nextPt;
      onPointsChange(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragIdx(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // gridlines
  const gridY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      {w > 0 && h > 0 && (
        <svg
          width={w} height={h}
          style={{ display: "block", userSelect: "none" }}
          onPointerDown={e => e.stopPropagation()}
        >
          {/* gridlines */}
          {gridY.map((g, i) => {
            const y = pad.t + (1 - g) * plotH;
            return (
              <line key={i} x1={pad.l} x2={pad.l + plotW} y1={y} y2={y} stroke={theme.chartGrid} strokeWidth={1} />
            );
          })}

          {/* y-axis labels */}
          <text x={pad.l - 6} y={pad.t + 4} textAnchor="end" fontSize={9} fill={theme.textMut} fontFamily="inherit">1.0</text>
          <text x={pad.l - 6} y={pad.t + plotH + 3} textAnchor="end" fontSize={9} fill={theme.textMut} fontFamily="inherit">0.0</text>

          {/* x-axis baseline */}
          <line
            x1={pad.l} x2={pad.l + plotW}
            y1={pad.t + plotH} y2={pad.t + plotH}
            stroke={theme.dividerStrong} strokeWidth={1}
          />
          <text x={pad.l} y={pad.t + plotH + 13} fontSize={9} fill={theme.textMut} fontFamily="inherit">x=0</text>
          <text x={pad.l + plotW} y={pad.t + plotH + 13} textAnchor="end" fontSize={9} fill={theme.textMut} fontFamily="inherit">x={el.xMax}</text>

          {/* data layer */}
          {el.kind === "area" && (
            <>
              <defs>
                <linearGradient id={`g-${el.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#g-${el.id})`} />
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
            </>
          )}
          {el.kind === "line" && (
            <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {el.kind === "bar" && el.points.map((p, i) => {
            const { x, y } = toPx(p);
            const base = pad.t + plotH;
            const bw = Math.max(4, (plotW / (el.xMax + 1)) * 0.65);
            return (
              <rect
                key={`b-${i}`}
                x={x - bw / 2}
                y={Math.min(y, base)}
                width={bw}
                height={Math.abs(base - y)}
                fill={color}
                fillOpacity={0.85}
                rx={2}
              />
            );
          })}

          {/* drag handles — on top for every kind */}
          {el.points.map((p, i) => {
            const { x, y } = toPx(p);
            const active = dragIdx === i || hoverIdx === i;
            return (
              <g key={`h-${i}`}>
                {active && (
                  <>
                    {/* vertical guide */}
                    <line x1={x} x2={x} y1={pad.t} y2={pad.t + plotH} stroke={color} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
                    {/* value readout */}
                    <g transform={`translate(${clamp(x, pad.l + 24, pad.l + plotW - 24)}, ${clamp(y - 12, pad.t + 10, pad.t + plotH)})`}>
                      <rect x={-22} y={-10} width={44} height={13} rx={3} fill={theme.bg} stroke={theme.dividerStrong} />
                      <text x={0} y={0} textAnchor="middle" fontSize={9} fill={theme.text} fontFamily="inherit" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {p.x.toFixed(1)}, {p.y.toFixed(2)}
                      </text>
                    </g>
                  </>
                )}
                <circle
                  cx={x} cy={y}
                  r={active ? 5.5 : 4}
                  fill={theme.bg}
                  stroke={color}
                  strokeWidth={active ? 2.5 : 2}
                  style={{ cursor: "grab", transition: "r 0.15s ease, stroke-width 0.15s ease" }}
                  onPointerDown={startDragPoint(i)}
                  onPointerEnter={() => setHoverIdx(i)}
                  onPointerLeave={() => setHoverIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
