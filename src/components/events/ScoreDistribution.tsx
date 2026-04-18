"use client";
// Positive/negative class separation on the decision boundary.

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { SectionHead, DotLegend, ChartTooltip } from "../primitives";
import { axisProps } from "../chart-styles";
import { probDistData } from "@/data/dashboard";
import type { Themed } from "../ThemeContext";

export const ScoreDistribution = ({ theme }: Themed) => (
  <>
    <SectionHead
      title="Score Distribution"
      subtitle="Positive vs. negative class separation"
      theme={theme}
      right={
        <DotLegend
          items={[
            { name: "Negative", color: theme.accent },
            { name: "Positive", color: theme.green },
          ]}
          theme={theme}
        />
      }
    />
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={probDistData} barGap={0} barCategoryGap={0}>
        <CartesianGrid stroke={theme.chartGrid} vertical={false} />
        <XAxis {...axisProps(theme)} dataKey="x" interval={4} />
        <YAxis {...axisProps(theme)} />
        <Tooltip content={<ChartTooltip theme={theme} />} />
        <Bar dataKey="Negative" fill={theme.accent} opacity={0.45} radius={0} name="Negative" />
        <Bar dataKey="Positive" fill={theme.green} opacity={0.6} radius={0} name="Positive" />
      </BarChart>
    </ResponsiveContainer>
  </>
);
