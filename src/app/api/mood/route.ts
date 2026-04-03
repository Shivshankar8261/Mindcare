import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimeOfDay } from "@/generated/prisma/enums";

const payloadSchema = z.object({
  timeOfDay: z.enum([
    "MORNING",
    "MIDDAY",
    "AFTERNOON",
    "EVENING",
    "NIGHT",
  ]),
  moodScore: z.number().int().min(1).max(10),
  emotions: z.array(z.string()).max(12),
  energyLevel: z.number().int().min(1).max(5),
  sleepQuality: z.number().int().min(1).max(5),
  note: z.string().max(5000).optional().default(""),
  academicPressure: z.boolean(),
  timestamp: z.string().datetime().optional(),
});

function startOfDay(d: Date) {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  return dd;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const {
    timeOfDay,
    moodScore,
    emotions,
    energyLevel,
    sleepQuality,
    note,
    academicPressure,
    timestamp,
  } = parsed.data;

  const ts = timestamp ? new Date(timestamp) : new Date();
  const dayStart = startOfDay(ts);

  // Idempotency per time-of-day slot (same day + same timeOfDay).
  const existing = await prisma.moodEntry.findFirst({
    where: {
      user: { email },
      timeOfDay,
      timestamp: {
        gte: dayStart,
        lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existing) {
    await prisma.moodEntry.update({
      where: { id: existing.id },
      data: {
        moodScore,
        emotions,
        energyLevel,
        sleepQuality,
        note,
        academicPressure,
        timestamp: ts,
      },
    });
    // Do not award streak/XPs on overwrite.
    return NextResponse.json({ ok: true, updated: true });
  }

  // Award XP (+10) and update streak only once per day (first new slot).
  const todayEntryCount = await prisma.moodEntry.count({
    where: {
      user: { email },
      timestamp: {
        gte: dayStart,
        lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const shouldUpdateStreak = todayEntryCount === 0;
  let streak = user.streak ?? 0;
  let xpPoints = user.xpPoints ?? 0;

  if (shouldUpdateStreak) {
    const yesterdayStart = new Date(dayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEntry = await prisma.moodEntry.findFirst({
      where: {
        user: { email },
        timestamp: {
          gte: yesterdayStart,
          lt: new Date(yesterdayStart.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    streak = yesterdayEntry ? streak + 1 : 1;
    xpPoints = xpPoints + 10;
  } else {
    // Additional slots same day still give XP.
    xpPoints = xpPoints + 10;
  }

  await prisma.user.update({
    where: { email },
    data: { streak, xpPoints },
  });

  await prisma.moodEntry.create({
    data: {
      userId: user.id,
      timeOfDay: timeOfDay as TimeOfDay,
      timestamp: ts,
      moodScore,
      emotions,
      energyLevel,
      sleepQuality,
      note,
      academicPressure,
    },
  });

  return NextResponse.json({ ok: true, updated: false, streak, xpPoints });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit") ?? "10";
  const limit = Math.max(1, Math.min(50, Number(limitRaw) || 10));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const entries = await prisma.moodEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      timestamp: true,
      moodScore: true,
      emotions: true,
      energyLevel: true,
      sleepQuality: true,
      note: true,
      academicPressure: true,
      timeOfDay: true,
    },
  });

  return NextResponse.json({ ok: true, entries });
}

