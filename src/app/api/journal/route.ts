import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptString } from "@/lib/encryption";
import { decryptString } from "@/lib/encryption";
import { type Prisma } from "@/generated/prisma/client";

const payloadSchema = z.object({
  content: z.string().min(1).max(20000),
  detectedLanguage: z.string().min(2).max(10).optional().default("en"),
  emotionTags: z.array(z.string()).max(12).optional().default([]),
  distressLevel: z.number().int().min(0).max(10).optional().default(0),
  isShared: z.boolean().optional().default(false),
  aiAnalysis: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const payload = parsed.data;
  const encrypted = encryptString(payload.content);

  const created = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content: encrypted,
      detectedLanguage: payload.detectedLanguage,
      emotionTags: payload.emotionTags,
      distressLevel: payload.distressLevel,
      isShared: payload.isShared,
      aiAnalysis: (payload.aiAnalysis ?? {}) as Prisma.InputJsonValue,
    },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, ...created });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit") ?? "10";
  const limit = Math.max(1, Math.min(20, Number(limitRaw) || 10));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      detectedLanguage: true,
      emotionTags: true,
      distressLevel: true,
      isShared: true,
      aiAnalysis: true,
      content: true,
    },
  });

  // Decrypt in-memory for the UI.
  const decrypted = entries.map((e) => ({
    ...e,
    content: (() => {
      try {
        return decryptString(e.content);
      } catch {
        return "";
      }
    })(),
  }));

  return NextResponse.json({ ok: true, entries: decrypted });
}

