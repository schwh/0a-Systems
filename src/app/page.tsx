"use client";

import { useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import AppShell from "@/components/AppShell";
import { NavTarget } from "@/components/CornerMenu";
import HomeContent from "@/components/Homepage";
import {
  PageOverview, PageModels, PageEvents, PagePlaceholder, PageSettings,
} from "@/components/Dashboard";

const TITLES: Record<NavTarget, string> = {
  home: "Home",
  overview: "Overview",
  models: "Models",
  events: "Events",
  pipeline: "Pipeline",
  countries: "Countries",
  settings: "Settings",
};

function Router() {
  const [page, setPage] = useState<NavTarget>("home");
  const { theme: c, themeId, setThemeId } = useTheme();

  const content: Record<NavTarget, React.ReactNode> = {
    home: <HomeContent />,
    overview: <PageOverview c={c} />,
    models: <PageModels c={c} />,
    events: <PageEvents c={c} />,
    pipeline: <PagePlaceholder title="Pipeline Monitor" c={c} />,
    countries: <PagePlaceholder title="Country Analytics" c={c} />,
    settings: <PageSettings c={c} themeId={themeId} setThemeId={setThemeId} />,
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
