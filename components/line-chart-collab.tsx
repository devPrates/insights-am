"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from "./ui/card";
import { ChartConfig, ChartContainer, ChartTooltip } from "./ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type WeeklyHistoryItem = {
  reference_date: string;
  payload: {
    categories: string[];
    series: { name: string; data: number[] }[];
  };
};

const chartConfig = {
  antecipadas: { label: "Antecipadas", color: "#22C55E" },
  prazoTecnico: { label: "Prazo técnico", color: "#FACC15" },
  justificadas: { label: "Justificadas", color: "#3B82F6" },
  atrasadas: { label: "Atrasadas", color: "#EF4444" },
} satisfies ChartConfig;

function ChartLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-3.5 border-4 rounded-full bg-background" style={{ borderColor: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-sm shadow-black/5 min-w-[150px]">
        <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2.5">{label}</div>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <ChartLabel label={(config?.label || entry.dataKey) + ":"} color={entry.color} />
                <span className="font-semibold text-popover-foreground">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

function formatDayMonth(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d);
}
function buildData(category: string, items: WeeklyHistoryItem[]) {
  const out: Array<{ time: string; antecipadas: number; prazoTecnico: number; justificadas: number; atrasadas: number }> = [];
  for (const item of items) {
    const idx = item.payload.categories.indexOf(category);
    if (idx < 0) continue;
    const val = (name: string) => {
      const s = item.payload.series.find((x) => x.name === name);
      return Number(s?.data[idx] ?? 0);
    };
    out.push({
      time: formatDayMonth(item.reference_date),
      antecipadas: val("Antecipadas"),
      prazoTecnico: val("Prazo técnico"),
      justificadas: val("Atrasadas justificadas"),
      atrasadas: val("Atrasadas"),
    });
  }
  return out;
}

 

export default function LineChartCollab({ category, items }: { category: string; items: WeeklyHistoryItem[] }) {
  const data = useMemo(() => buildData(category, items), [category, items]);
  const labels = useMemo(
    () => [
      { key: "antecipadas", label: chartConfig.antecipadas.label, color: chartConfig.antecipadas.color },
      { key: "prazoTecnico", label: chartConfig.prazoTecnico.label, color: chartConfig.prazoTecnico.color },
      { key: "justificadas", label: chartConfig.justificadas.label, color: chartConfig.justificadas.color },
      { key: "atrasadas", label: chartConfig.atrasadas.label, color: chartConfig.atrasadas.color },
    ],
    []
  );
  return (
    <Card className="w-full">
      <CardHeader className="border-0 pt-6 pb-4">
        <CardTitle className="text-lg font-semibold">{category}</CardTitle>
        <CardToolbar>
          <div className="flex items-center gap-4 text-sm">
            {labels.map((l) => (
              <ChartLabel key={l.key} label={l.label} color={l.color} />
            ))}
          </div>
        </CardToolbar>
      </CardHeader>

      <CardContent className="ps-0 pe-4.5 pb-6">
        <ChartContainer config={chartConfig} className="h-[200px] w-full mb-6 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="4 8" stroke="var(--input)" strokeOpacity={1} horizontal vertical={false} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted-foreground)" }} tickMargin={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted-foreground)" }} tickFormatter={(value) => `${value}`} domain={[0, 250]} ticks={[0, 50, 100, 150, 200, 250]} tickMargin={10} />
            <ChartTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "var(--input)" }} />
            <Line dataKey="antecipadas" type="monotone" stroke={chartConfig.antecipadas.color} strokeWidth={2} dot={false} />
            <Line dataKey="prazoTecnico" type="monotone" stroke={chartConfig.prazoTecnico.color} strokeWidth={2} dot={false} />
            <Line dataKey="justificadas" type="monotone" stroke={chartConfig.justificadas.color} strokeWidth={2} dot={false} />
            <Line dataKey="atrasadas" type="monotone" stroke={chartConfig.atrasadas.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
