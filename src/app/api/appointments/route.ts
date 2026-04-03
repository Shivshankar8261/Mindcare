import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Role } from "@/generated/prisma/enums";

const payloadSchema = z.object({
  dateTime: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const studentEmail = session?.user?.email;
  if (!studentEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const counselor = await prisma.user.findFirst({ where: { role: Role.COUNSELOR } });
  const counselorId = counselor?.id ?? student.id;

  const appt = await prisma.appointment.create({
    data: {
      studentId: student.id,
      counselorId,
      dateTime: new Date(parsed.data.dateTime),
      status: AppointmentStatus.PENDING,
      notes: parsed.data.notes ?? null,
    },
    select: { id: true, dateTime: true, status: true, notes: true, counselorId: true },
  });

  return NextResponse.json({ ok: true, appointment: appt });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const studentEmail = session?.user?.email;
  if (!studentEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const items = await prisma.appointment.findMany({
    where: { studentId: student.id },
    orderBy: { dateTime: "asc" },
    take: 10,
    select: { id: true, dateTime: true, status: true, notes: true },
  });

  return NextResponse.json({ ok: true, appointments: items });
}

