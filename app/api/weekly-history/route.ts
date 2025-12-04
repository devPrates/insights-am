import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.weeklyHistory.findMany({
      orderBy: { reference_date: "asc" },
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: "failed_to_fetch_weekly_history" }, { status: 500 });
  }
}

