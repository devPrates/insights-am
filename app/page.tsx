"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChartBarLabel } from "@/components/bar-chart-label";
import { Progress } from "@/components/ui/progress";

type DivColabBRow = {
  id: string;
  runId: string;
  capturedAt: string;
  category: string;
  seriesNames: string[];
  values: number[];
};

const MOCK_ROWS: DivColabBRow[] = [];

function useRotatingRow(rows: DivColabBRow[], intervalMs: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (rows.length ? (i + 1) % rows.length : 0));
    }, intervalMs);
    return () => clearInterval(t);
  }, [rows.length, intervalMs]);
  return { row: rows[index], index } as const;
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">{title}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}

export default function Home() {
  const [rows, setRows] = useState<DivColabBRow[]>(MOCK_ROWS);
  const { row, index } = useRotatingRow(rows, 30_000);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchRows = async () => {
      try {
        const res = await fetch("/api/divcolabbrows", { cache: "no-store" });
        if (!res.ok) return;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          if (mounted && json?.rows) setRows(json.rows as DivColabBRow[]);
        } else {
          const txt = await res.text();
          if (!txt) return;
          const parsed = JSON.parse(txt);
          if (mounted && parsed?.rows) setRows(parsed.rows as DivColabBRow[]);
        }
      } catch {}
    };
    fetchRows();
    const interval = setInterval(fetchRows, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const started = Date.now();
    setTimeout(() => setProgress(0), 0);
    const tick = setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(100, Math.floor((elapsed / 30_000) * 100));
      setProgress(pct);
    }, 250);
    return () => clearInterval(tick);
  }, [index]);

  const stats = useMemo(() => {
    const indexMap: Record<string, number> = {
      "Atrasadas justificadas": 0,
      "Atrasadas": 1,
      "Prazo técnico": 2,
      "Antecipadas": 3,
    };
    const sumByIndex = (idx: number) => rows.reduce((acc, r) => acc + (Number(r.values[idx]) || 0), 0);
    const justificado = sumByIndex(indexMap["Atrasadas justificadas"]);
    const atraso = sumByIndex(indexMap["Atrasadas"]);
    const noPrazo = sumByIndex(indexMap["Prazo técnico"]);
    const antecipados = sumByIndex(indexMap["Antecipadas"]);
    const total = justificado + atraso + noPrazo + antecipados;
    return { total, antecipados, noPrazo, atraso, justificado };
  }, [rows]);

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-center p-1">
          <Image src="/logo.png" alt="AM Contabilidade Online" width={240} height={40} />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <section className="md:col-span-1">
          <div className="flex h-full flex-col gap-3">
            <StatCard title="Total" value={stats.total} />
            <StatCard title="Antecipados" value={stats.antecipados} />
            <StatCard title="No prazo" value={stats.noPrazo} />
            <StatCard title="Atraso" value={stats.atraso} />
            <StatCard title="Justificado" value={stats.justificado} />
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="flex flex-col gap-4">
            {row ? (
              <ChartBarLabel
                title={row.category}
                titleClassName="text-2xl md:text-3xl"
                data={row.seriesNames.map((label, i) => ({ label, value: Number(row.values[i] || 0) }))}
              />
            ) : (
              <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
            <div className="rounded-lg border p-4">
              <Progress value={progress} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
