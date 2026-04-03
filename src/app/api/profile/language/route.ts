import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const payloadSchema = z.object({
  preferredLanguage: z.string().min(2).max(10),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { preferredLanguage } = parsed.data;

  await prisma.user.update({
    where: { email: session.user.email },
    data: { preferredLanguage },
  });

  return NextResponse.json({ ok: true });
}

