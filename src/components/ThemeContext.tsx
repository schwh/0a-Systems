"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeId = "Default" | "Azoth" | "Midnight" | "Forest" | "Wave";

export interface Theme {
  bg: string;
  panel: string;
  divider: string;
  dividerStrong: string;
  text: string;
  textSec: string;
  textMut: string;
  accent: string;
  accentDim: string;
  green: string;
  greenDim: string;
  red: string;
  redDim: string;
  amber: string;
  amberDim: string;
  purple: string;
  blue: string;
  cyan: string;
  sidebar: string;
  sidebarHi: string;
  chartGrid: string;
}

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  theme: Theme;
}

export const THEMES: Record<ThemeId, ThemeMeta> = {
  Default: {
    id: "Default",
    label: "Default",
    description: "Charcoal with indigo accent",
    theme: {
      bg: "#0b0b10",
      panel: "#0f0f16",
      divider: "rgba(255,255,255,0.04)",
      dividerStrong: "rgba(255,255,255,0.07)",
      text: "#e8e8f0",
      textSec: "#7a7a95",
      textMut: "#4a4a62",
      accent: "#818cf8",
      accentDim: "rgba(129,140,248,0.10)",
      green: "#34d399",
      greenDim: "rgba(52,211,153,0.10)",
      red: "#f87171",
      redDim: "rgba(248,113,113,0.10)",
      amber: "#fbbf24",
      amberDim: "rgba(251,191,36,0.10)",
      purple: "#a78bfa",
      blue: "#60a5fa",
      cyan: "#22d3ee",
      sidebar: "#0a0a0f",
      sidebarHi: "rgba(129,140,248,0.06)",
      chartGrid: "rgba(255,255,255,0.03)",
    },
  },
  Azoth: {
    id: "Azoth",
    label: "Azoth",
    description: "Burgundy over dark brown",
    theme: {
      bg: "#1a0e0f",
      panel: "#221416",
      divider: "rgba(255,220,210,0.05)",
      dividerStrong: "rgba(255,220,210,0.09)",
      text: "#f0e0dc",
      textSec: "#b08a84",
      textMut: "#6b4d48",
      accent: "#c9707a",
      accentDim: "rgba(201,112,122,0.12)",
      green: "#7fb896",
      greenDim: "rgba(127,184,150,0.10)",
      red: "#e66a6a",
      redDim: "rgba(230,106,106,0.10)",
      amber: "#e8a765",
      amberDim: "rgba(232,167,101,0.10)",
      purple: "#b07896",
      blue: "#7c98b8",
      cyan: "#6eb3b0",
      sidebar: "#150a0c",
      sidebarHi: "rgba(201,112,122,0.07)",
      chartGrid: "rgba(255,220,210,0.04)",
    },
  },
  Midnight: {
    id: "Midnight",
    label: "Midnight",
    description: "Deep navy with royal blue",
    theme: {
      bg: "#0a1020",
      panel: "#0f1830",
      divider: "rgba(180,200,255,0.05)",
      dividerStrong: "rgba(180,200,255,0.09)",
      text: "#e4ecff",
      textSec: "#7e8ba8",
      textMut: "#4a5878",
      accent: "#6b8afd",
      accentDim: "rgba(107,138,253,0.12)",
      green: "#4ade80",
      greenDim: "rgba(74,222,128,0.10)",
      red: "#f87171",
      redDim: "rgba(248,113,113,0.10)",
      amber: "#fcd34d",
      amberDim: "rgba(252,211,77,0.10)",
      purple: "#8b5cf6",
      blue: "#60a5fa",
      cyan: "#22d3ee",
      sidebar: "#070c1a",
      sidebarHi: "rgba(107,138,253,0.07)",
      chartGrid: "rgba(180,200,255,0.04)",
    },
  },
  Forest: {
    id: "Forest",
    label: "Forest",
    description: "Essex green with pewter",
    theme: {
      bg: "#0e1512",
      panel: "#131c18",
      divider: "rgba(200,220,200,0.05)",
      dividerStrong: "rgba(200,220,200,0.09)",
      text: "#e2ece4",
      textSec: "#7e9383",
      textMut: "#4e6256",
      accent: "#8fb39a",
      accentDim: "rgba(143,179,154,0.12)",
      green: "#a3c9a8",
      greenDim: "rgba(163,201,168,0.10)",
      red: "#e07a6a",
      redDim: "rgba(224,122,106,0.10)",
      amber: "#d9b06a",
      amberDim: "rgba(217,176,106,0.10)",
      purple: "#9a8fb3",
      blue: "#7aa0b5",
      cyan: "#5fb8a8",
      sidebar: "#0a110e",
      sidebarHi: "rgba(143,179,154,0.07)",
      chartGrid: "rgba(200,220,200,0.04)",
    },
  },
  Wave: {
    id: "Wave",
    label: "Wave",
    description: "Iris purple with heather",
    theme: {
      bg: "#100c1a",
      panel: "#171128",
      divider: "rgba(220,210,255,0.05)",
      dividerStrong: "rgba(220,210,255,0.09)",
      text: "#ebe4f5",
      textSec: "#9088a8",
      textMut: "#5a5170",
      accent: "#a78bfa",
      accentDim: "rgba(167,139,250,0.12)",
      green: "#6ee7b7",
      greenDim: "rgba(110,231,183,0.10)",
      red: "#f87288",
      redDim: "rgba(248,114,136,0.10)",
      amber: "#f0c674",
      amberDim: "rgba(240,198,116,0.10)",
      purple: "#c4a7f5",
      blue: "#8db4f5",
      cyan: "#7dd3e8",
      sidebar: "#0c0915",
      sidebarHi: "rgba(167,139,250,0.07)",
      chartGrid: "rgba(220,210,255,0.04)",
    },
  },
};

export const THEME_ORDER: ThemeId[] = ["Default", "Azoth", "Midnight", "Forest", "Wave"];

// Helper for any component that takes the theme plus its own props:
//   const Metric = ({ theme, label }: Themed<{ label: string }>) => ...
export type Themed<P = {}> = P & { theme: Theme };

interface ThemeCtx {
  themeId: ThemeId;
  theme: Theme;
  setThemeId: (id: ThemeId) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = "0a.theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("Default");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in THEMES) setThemeIdState(saved as ThemeId);
    } catch {}
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  };

  const theme = THEMES[themeId].theme;

  return <Ctx.Provider value={{ themeId, theme, setThemeId }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside ThemeProvider");
  return v;
}
