// Demo datasets for the Dashboard pages (Models, Events).
// Pure data — no React, no theme.

export const f1HistoryData = [
  { day: 1, SVM: 0.41, MISVM: 0.66, rMIL: 0.65, nMIL: 0.67 },
  { day: 2, SVM: 0.33, MISVM: 0.64, rMIL: 0.56, nMIL: 0.68 },
  { day: 3, SVM: 0.30, MISVM: 0.69, rMIL: 0.55, nMIL: 0.74 },
  { day: 4, SVM: 0.39, MISVM: 0.64, rMIL: 0.66, nMIL: 0.71 },
  { day: 5, SVM: 0.39, MISVM: 0.62, rMIL: 0.51, nMIL: 0.75 },
  { day: 6, SVM: 0.47, MISVM: 0.63, rMIL: 0.55, nMIL: 0.75 },
  { day: 7, SVM: 0.42, MISVM: 0.62, rMIL: 0.60, nMIL: 0.71 },
  { day: 8, SVM: 0.51, MISVM: 0.70, rMIL: 0.58, nMIL: 0.74 },
  { day: 9, SVM: 0.39, MISVM: 0.71, rMIL: 0.59, nMIL: 0.67 },
  { day: 10, SVM: 0.48, MISVM: 0.63, rMIL: 0.59, nMIL: 0.74 },
];

export const betaSensitivity = [
  { beta: "0.1", MX: 0.89, BR: 0.71, AR: 0.72 },
  { beta: "0.2", MX: 0.88, BR: 0.77, AR: 0.70 },
  { beta: "0.3", MX: 0.85, BR: 0.76, AR: 0.70 },
  { beta: "0.4", MX: 0.87, BR: 0.70, AR: 0.66 },
  { beta: "0.5", MX: 0.85, BR: 0.78, AR: 0.73 },
  { beta: "0.6", MX: 0.85, BR: 0.69, AR: 0.72 },
  { beta: "0.7", MX: 0.86, BR: 0.76, AR: 0.72 },
  { beta: "0.8", MX: 0.89, BR: 0.71, AR: 0.74 },
  { beta: "0.9", MX: 0.88, BR: 0.71, AR: 0.73 },
  { beta: "1.0", MX: 0.87, BR: 0.71, AR: 0.75 },
];

export const cosineTimeSeries = [
  { day: 1, mean: 0.59, upper: 0.88, lower: 0.30 },
  { day: 2, mean: 0.55, upper: 0.92, lower: 0.25 },
  { day: 3, mean: 0.53, upper: 0.82, lower: 0.28 },
  { day: 4, mean: 0.58, upper: 0.85, lower: 0.32 },
  { day: 5, mean: 0.70, upper: 0.90, lower: 0.38 },
  { day: 6, mean: 0.57, upper: 0.80, lower: 0.22 },
  { day: 7, mean: 0.55, upper: 0.78, lower: 0.30 },
  { day: 8, mean: 0.63, upper: 0.85, lower: 0.35 },
  { day: 9, mean: 0.60, upper: 0.82, lower: 0.33 },
  { day: 10, mean: 0.57, upper: 0.83, lower: 0.28 },
];

export const precursorStoryline = [
  { date: "07-28", score: 0.568, label: "Migrant agenda", topic: null },
  { date: "07-29", score: 0.448, label: "Technical default", topic: null },
  { date: "07-30", score: 0.606, label: "Poverty standard", topic: "Poverty" },
  { date: "07-31", score: 0.621, label: "Unresolved debts", topic: "Debt Crisis" },
  { date: "08-01", score: 0.638, label: "Debt crisis ICJ", topic: null },
  { date: "08-03", score: 0.646, label: "Gov. imagination", topic: "Government" },
  { date: "08-05", score: 0.772, label: "Layoffs, blocked hwy", topic: null },
];

export const probDistData = (() => {
  const d = [];
  for (let i = 10; i <= 90; i += 2) {
    const x = i / 100;
    d.push({
      x: x.toFixed(2),
      Negative: Math.round(360 * Math.exp(-Math.pow((x - 0.35) / 0.12, 2))),
      Positive: Math.round(200 * Math.exp(-Math.pow((x - 0.55) / 0.15, 2))),
    });
  }
  return d;
})();

export const tableData = [
  { id: 1, country: "Argentina", event: "Labor Protest", date: "2014-08-07", pScore: 0.772, model: "nMIL^Δ", f1: 0.74, precursors: 7, status: "detected" },
  { id: 2, country: "Mexico", event: "Congressional Fire", date: "2014-11-11", pScore: 0.834, model: "nMIL^Δ", f1: 0.75, precursors: 10, status: "detected" },
  { id: 3, country: "Brazil", event: "Transit Strike", date: "2014-06-12", pScore: 0.681, model: "MI-SVM", f1: 0.69, precursors: 5, status: "detected" },
  { id: 4, country: "Argentina", event: "Debt Default", date: "2014-07-30", pScore: 0.606, model: "rMIL^avg", f1: 0.62, precursors: 4, status: "partial" },
  { id: 5, country: "Mexico", event: "Student March", date: "2014-11-01", pScore: 0.641, model: "nMIL^Δ", f1: 0.71, precursors: 6, status: "detected" },
  { id: 6, country: "Brazil", event: "Police Clash", date: "2014-09-15", pScore: 0.553, model: "SVM", f1: 0.47, precursors: 3, status: "missed" },
  { id: 7, country: "Argentina", event: "Highway Blockade", date: "2014-08-05", pScore: 0.820, model: "nMIL^Δ", f1: 0.74, precursors: 8, status: "detected" },
  { id: 8, country: "Mexico", event: "Teacher Protest", date: "2014-11-10", pScore: 0.931, model: "nMIL^Δ", f1: 0.75, precursors: 9, status: "detected" },
];
