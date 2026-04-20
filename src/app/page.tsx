"use client";

import { useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import AppShell from "@/components/AppShell";
import { NavTarget } from "@/components/CornerMenu";
import HomeContent from "@/components/Homepage";
import {
  PageDashboard, PageModels, PageEvents, PagePlaceholder, PageSettings,
} from "@/components/Dashboard";

const TITLES: Record<NavTarget, string> = {
  home: "Home",
  dashboard: "Dashboard",
  models: "Models",
  events: "Events",
  pipeline: "Pipeline",
  countries: "Countries",
  settings: "Settings",
};

function Router() {
  const [page, setPage] = useState<NavTarget>("home");
  const { theme, themeId, setThemeId } = useTheme();

  const content: Record<NavTarget, React.ReactNode> = {
    home: (
      <>
        <HomeContent />
        <div
          style={{
            padding: "64px 32px 48px",
            maxWidth: 1280,
            margin: "0 auto",
            borderTop: `1px solid ${theme.divider}`,
          }}
        >
          <PageDashboard theme={theme} />
        </div>
      </>
    ),
    dashboard: <PageDashboard theme={theme} />,
    models: <PageModels theme={theme} />,
    events: <PageEvents theme={theme} />,
    pipeline: <PagePlaceholder title="Pipeline Monitor" theme={theme} />,
    countries: <PagePlaceholder title="Country Analytics" theme={theme} />,
    settings: <PageSettings theme={theme} themeId={themeId} setThemeId={setThemeId} />,
  };

  return (
    <AppShell
      current={page}
      onNavigate={setPage}
      title={page === "home" ? undefined : TITLES[page]}
      fullBleed={page === "home"}
    >
      {content[page]}
    </AppShell>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
