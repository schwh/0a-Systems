// Demo datasets for the Home-page carousel slides.
// Pure data — no React, no theme. Generated once at module load so that
// randomised values (scatter, composed) stay stable across renders.

export const lineData = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  signal: 0.35 + 0.4 * Math.sin(i / 2) + i / 24,
  baseline: 0.3 + i / 30 + 0.05 * Math.cos(i / 3),
}));

export const barData = [
  { cat: "Argentina", value: 0.82, compare: 0.71 },
  { cat: "Mexico", value: 0.89, compare: 0.74 },
  { cat: "Brazil", value: 0.76, compare: 0.68 },
  { cat: "Chile", value: 0.64, compare: 0.59 },
  { cat: "Colombia", value: 0.71, compare: 0.63 },
];

export const areaData = Array.from({ length: 20 }, (_, i) => {
  const t = i / 19;
  return {
    t: i,
    positive: Math.round(240 * Math.exp(-Math.pow((t - 0.6) / 0.18, 2))),
    negative: Math.round(320 * Math.exp(-Math.pow((t - 0.35) / 0.15, 2))),
  };
});

export const radarData = [
  { metric: "Precision", model: 0.82, benchmark: 0.6 },
  { metric: "Recall", model: 0.75, benchmark: 0.55 },
  { metric: "F1", model: 0.78, benchmark: 0.58 },
  { metric: "AUC", model: 0.88, benchmark: 0.62 },
  { metric: "Lead-time", model: 0.70, benchmark: 0.45 },
  { metric: "Coverage", model: 0.84, benchmark: 0.66 },
];

export const scatterData = Array.from({ length: 50 }, () => ({
  x: Math.random(),
  y: 0.3 + 0.6 * Math.random() + 0.2 * Math.random(),
  z: 40 + Math.random() * 200,
}));

export const composedData = Array.from({ length: 10 }, (_, i) => ({
  day: `d${i + 1}`,
  events: Math.round(4 + Math.random() * 10),
  pScore: 0.5 + 0.3 * Math.sin(i / 1.7) + 0.1 * Math.random(),
}));
