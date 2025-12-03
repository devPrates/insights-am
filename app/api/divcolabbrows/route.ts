import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.divColabBRow.findMany({ orderBy: { capturedAt: "desc" } });
  const mapped = rows.map((r) => ({
    id: r.id.toString(),
    runId: r.runId,
    capturedAt: r.capturedAt.toISOString(),
    category: r.category,
    seriesNames: r.seriesNames,
    values: r.values.map((v) => Number(v)),
  }));
  return NextResponse.json({ rows: mapped });
}
