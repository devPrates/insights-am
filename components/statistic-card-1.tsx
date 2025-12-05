import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { WeeklyHistoryPayload } from '@/lib/weekly-history';
import { ArrowDown, ArrowUp } from 'lucide-react';

type WeeklyHistoryItem = { reference_date: string; payload: WeeklyHistoryPayload };

function sumSeries(payload: WeeklyHistoryPayload, name: string) {
  const s = payload.series.find((x) => x.name === name);
  return (s?.data || []).reduce((a, b) => a + (Number(b) || 0), 0);
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

export default function StatisticCard1({ items }: { items: WeeklyHistoryItem[] }) {
  const sorted = [...items].sort((a, b) => new Date(a.reference_date).getTime() - new Date(b.reference_date).getTime());
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const curAnte = current ? sumSeries(current.payload, 'Antecipadas') : 0;
  const curPrazo = current ? sumSeries(current.payload, 'Prazo técnico') : 0;
  const curAtraso = current ? sumSeries(current.payload, 'Atrasadas') : 0;
  const curJust = current ? sumSeries(current.payload, 'Atrasadas justificadas') : 0;
  const curTotal = curAnte + curPrazo + curAtraso + curJust;

  const prevAnte = previous ? sumSeries(previous.payload, 'Antecipadas') : 0;
  const prevPrazo = previous ? sumSeries(previous.payload, 'Prazo técnico') : 0;
  const prevAtraso = previous ? sumSeries(previous.payload, 'Atrasadas') : 0;
  const prevJust = previous ? sumSeries(previous.payload, 'Atrasadas justificadas') : 0;
  const prevTotal = prevAnte + prevPrazo + prevAtraso + prevJust;

  const mkDelta = (cur: number, prev: number) => {
    if (!prev) return { delta: 0, positive: cur >= 0 };
    const d = ((cur - prev) / prev) * 100;
    return { delta: Number(d.toFixed(1)), positive: d >= 0 };
  };

  const cards = [
    { title: 'Total', value: curTotal, prev: prevTotal, delta: mkDelta(curTotal, prevTotal) },
    { title: 'Antecipados', value: curAnte, prev: prevAnte, delta: mkDelta(curAnte, prevAnte) },
    { title: 'No prazo', value: curPrazo, prev: prevPrazo, delta: mkDelta(curPrazo, prevPrazo) },
    { title: 'Atraso', value: curAtraso, prev: prevAtraso, delta: mkDelta(curAtraso, prevAtraso) },
    { title: 'Justificado', value: curJust, prev: prevJust, delta: mkDelta(curJust, prevJust) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {cards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="border-0 pb-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-1 pb-5 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-semibold text-foreground tracking-tight">{formatNumber(stat.value)}</span>
              <Badge variant={stat.delta.positive ? 'success' : 'destructive'} appearance="light">
                {stat.delta.delta >= 0 ? <ArrowUp /> : <ArrowDown />}
                {stat.delta.delta}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">Semana anterior: <span className="font-medium text-foreground">{formatNumber(stat.prev)}</span></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
