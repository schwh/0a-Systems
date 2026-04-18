"use client";
import { useEffect, useRef, useState } from "react";
import {
  Menu, Home, LayoutDashboard, BarChart3, Table2, Layers, Globe, Settings,
} from "lucide-react";
import { useTheme } from "./ThemeContext";

export type NavTarget =
  | "home"
  | "overview"
  | "models"
  | "events"
  | "pipeline"
  | "countries"
  | "settings";

const ITEMS: { id: NavTarget; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "models", label: "Models", icon: BarChart3 },
  { id: "events", label: "Events", icon: Table2 },
  { id: "pipeline", label: "Pipeline", icon: Layers },
  { id: "countries", label: "Countries", icon: Globe },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Props {
  current: NavTarget;
  onNavigate: (t: NavTarget) => void;
}

const OPEN_MS = 340;
const CLOSE_MS = 220;

export default function CornerMenu({ current, onNavigate }: Props) {
  const { theme: c } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const open = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
    setMounted(true);
    // next frame so the mount renders at scale(0) before flipping to scale(1)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  const close = () => {
    setVisible(false);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
      closeTimer.current = null;
    }, CLOSE_MS);
  };

  const toggle = () => { (mounted && visible) ? close() : open(); };

  useEffect(() => {
    if (!mounted) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const pick = (id: NavTarget) => {
    close();
    // wait for close animation to begin, then navigate
    window.setTimeout(() => onNavigate(id), 80);
  };

  const active = mounted && visible;

  return (
    <div ref={ref} style={{ position: "absolute", top: 16, left: 16, zIndex: 50 }}>
      <button
        aria-label="Menu"
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active || hover ? c.accentDim : "transparent",
          color: active || hover ? c.text : c.textSec,
          transition: "background 0.25s cubic-bezier(0.16,1,0.3,1), color 0.25s ease",
          backdropFilter: hover || active ? "blur(10px)" : undefined,
        }}
      >
        <Menu size={15} />
      </button>

      {mounted && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            minWidth: 188,
            background: c.panel,
            border: `1px solid ${c.dividerStrong}`,
            borderRadius: 10,
            padding: 5,
            boxShadow: "0 14px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02)",
            backdropFilter: "blur(18px)",
            transformOrigin: "top left",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.35)",
            filter: visible ? "blur(0)" : "blur(6px)",
            transition: visible
              ? `opacity ${OPEN_MS}ms cubic-bezier(0.16,1,0.3,1), transform ${OPEN_MS}ms cubic-bezier(0.16,1,0.3,1), filter ${OPEN_MS}ms cubic-bezier(0.16,1,0.3,1)`
              : `opacity ${CLOSE_MS}ms cubic-bezier(0.4,0,1,1), transform ${CLOSE_MS}ms cubic-bezier(0.4,0,1,1), filter ${CLOSE_MS}ms cubic-bezier(0.4,0,1,1)`,
            willChange: "transform, opacity, filter",
          }}
        >
          <div
            style={{
              padding: "8px 10px 10px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: c.textMut,
              borderBottom: `1px solid ${c.divider}`,
              marginBottom: 4,
            }}
          >
            0a Systems
          </div>
          {ITEMS.map(item => (
            <Row
              key={item.id}
              label={item.label}
              Icon={item.icon}
              active={current === item.id}
              onClick={() => pick(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  label, Icon, active, onClick,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: () => void;
}) {
  const { theme: c } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 10px",
        borderRadius: 7,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? c.accent : hover ? c.text : c.textSec,
        background: hover ? c.sidebarHi : "transparent",
        transition: "background 0.12s ease, color 0.12s ease",
      }}
    >
      <Icon size={14} />
      {label}
    </div>
  );
}
