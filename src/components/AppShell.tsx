"use client";
import { ReactNode } from "react";
import { useTheme } from "./ThemeContext";
import CornerMenu, { NavTarget } from "./CornerMenu";
import TopBar from "./TopBar";

interface Props {
  current: NavTarget;
  onNavigate: (t: NavTarget) => void;
  title?: string;
  fullBleed?: boolean;
  children: ReactNode;
}

export default function AppShell({ current, onNavigate, title, fullBleed, children }: Props) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
        position: "relative",
        transition: "background 0.5s ease, color 0.5s ease",
        overflowX: "hidden",
      }}
    >
      <CornerMenu current={current} onNavigate={onNavigate} />
      <TopBar current={current} onNavigate={onNavigate} />

      {title && (
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 60,
            fontSize: 12,
            fontWeight: 600,
            color: theme.textSec,
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
            transition: "color 0.5s ease",
          }}
        >
          <span style={{ color: theme.textMut }}>/</span>
          <span key={title} style={{ animation: "titleFade 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
            {title}
          </span>
        </div>
      )}

      <main
        key={current}
        style={{
          padding: fullBleed ? 0 : "64px 32px 48px",
          maxWidth: fullBleed ? "none" : 1280,
          margin: fullBleed ? 0 : "0 auto",
          animation: "pageFade 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {children}
      </main>

      <style>{`
        @keyframes pageFade {
          from { opacity: 0; filter: blur(6px); transform: translateY(6px); }
          to { opacity: 1; filter: blur(0); transform: none; }
        }
        @keyframes titleFade {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
