import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toISODate(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const rangeRaw = url.searchParams.get("range") ?? "30";
  const rangeDays = Math.max(7, Math.min(90, Number(rangeRaw) || 30));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (rangeDays - 1));
  start.setHours(0, 0, 0, 0);

  const entries = await prisma.moodEntry.findMany({
    where: {
      userId: user.id,
      timestamp: { gte: start },
    },
    select: { timestamp: true, moodScore: true },
  });

  const byDay = new Map<string, number[]>();
  for (const e of entries) {
    const day = toISODate(e.timestamp);
    const arr = byDay.get(day) ?? [];
    arr.push(e.moodScore);
    byDay.set(day, arr);
  }

  const series: Array<{ day: string; mood: number }> = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = toISODate(d);
    const arr = byDay.get(dayKey) ?? [];
    const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 6;
    const label = i === 0 ? "Today" : `${rangeDays - i}d`;
    series.push({ day: label, mood: avg });
  }

  return NextResponse.json({ ok: true, series });
}

