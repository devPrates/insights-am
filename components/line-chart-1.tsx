'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

type Row = {
  capturedAt: string;
  seriesNames: string[];
  values: number[];
  category: string;
};
const formatHourLabel = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
  }).format(d);
const floorToHour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);
const buildData = (rows: Row[]) => {
  const hours = Array.from({ length: 12 }, (_, i) => 7 + i);
  let base = { prazoTecnico: 0, atrasadas: 0, antecipadas: 0 };
  if (rows.length) {
    const latest = [...rows].sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    )[0];
    const iPrazo = latest.seriesNames.indexOf('Prazo técnico');
    const iAtraso = latest.seriesNames.indexOf('Atrasadas');
    const iAnte = latest.seriesNames.indexOf('Antecipadas');
    base = {
      prazoTecnico: Number(latest.values[iPrazo] || 0),
      atrasadas: Number(latest.values[iAtraso] || 0),
      antecipadas: Number(latest.values[iAnte] || 0),
    };
  }
  return hours.map((h) => ({ time: `${String(h).padStart(2, '0')}:00`, ...base }));
};
const useApiRows = () => {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let mounted = true;
    const fetchRows = async () => {
      try {
        const res = await fetch('/api/divcolabbrows', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && Array.isArray(json.rows)) setRows(json.rows as Row[]);
      } catch {}
    };
    fetchRows();
    const interval = setInterval(fetchRows, 900000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  return rows;
};

// Use cores definidas para categorias do domínio
const chartConfig = {
  prazoTecnico: {
    label: 'Prazo técnico',
    color: '#FACC15',
  },
  atrasadas: {
    label: 'Atrasadas',
    color: '#EF4444',
  },
  antecipadas: {
    label: 'Antecipadas',
    color: '#22C55E',
  },
} satisfies ChartConfig;

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const ChartLabel = ({ label, color }: { label: string; color: string }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-3.5 border-4 rounded-full bg-background" style={{ borderColor: color }}></div>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-sm shadow-black/5 min-w-[150px]">
        <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2.5">{label}</div>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <ChartLabel label={config?.label + ':'} color={entry.color} />
                <span className="font-semibold text-popover-foreground">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

// Chart Legend Component
const ChartLegend = ({ label, color }: { label: string; color: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="size-3.5 border-4 rounded-full bg-background border-border"
        style={{ borderColor: `${color}` }}
      ></div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
};

export default function LineChart4() {
  const rows = useApiRows();
  const collaborators = useMemo(() => Array.from(new Set(rows.map((r) => r.category))), [rows]);
  const [selected, setSelected] = useState<string | undefined>(collaborators[0]);
  const data = useMemo(() => buildData(rows.filter((r) => (selected ? r.category === selected : true))), [rows, selected]);
  const labels = useMemo(() => [
    { key: 'antecipadas', label: chartConfig.antecipadas.label, color: chartConfig.antecipadas.color },
    { key: 'prazoTecnico', label: chartConfig.prazoTecnico.label, color: chartConfig.prazoTecnico.color },
    { key: 'atrasadas', label: chartConfig.atrasadas.label, color: chartConfig.atrasadas.color },
  ], []);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="border-0 pt-6 pb-4">
          <CardTitle className="text-lg font-semibold">{selected || 'Série temporal'}</CardTitle>
          <CardToolbar>
            <div className="flex items-center gap-4 text-sm">
              {labels.map((l) => (
                <ChartLabel key={l.key} label={l.label} color={l.color} />
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {collaborators.map((c) => (
                  <DropdownMenuItem key={c} onClick={() => setSelected(c)}>
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardToolbar>
        </CardHeader>

        <CardContent className="ps-0 pe-4.5 pb-6">
          <ChartContainer
            config={chartConfig}
            className="h-[200px] w-full mb-6 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
          >
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 8"
                stroke="var(--input)"
                strokeOpacity={1}
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted-foreground)' }}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted-foreground)' }}
                tickFormatter={(value) => `${value}`}
                domain={[0, 250]}
                ticks={[0, 50, 100, 150, 200, 250]}
                tickMargin={10}
              />

              <ChartTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--input)' }} />

              <Line dataKey="antecipadas" type="monotone" stroke={chartConfig.antecipadas.color} strokeWidth={2} dot={false} />
              <Line dataKey="prazoTecnico" type="monotone" stroke={chartConfig.prazoTecnico.color} strokeWidth={2} dot={false} />
              <Line dataKey="atrasadas" type="monotone" stroke={chartConfig.atrasadas.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6">
            <ChartLegend label={chartConfig.antecipadas.label} color={chartConfig.antecipadas.color} />
            <ChartLegend label={chartConfig.prazoTecnico.label} color={chartConfig.prazoTecnico.color} />
            <ChartLegend label={chartConfig.atrasadas.label} color={chartConfig.atrasadas.color} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
