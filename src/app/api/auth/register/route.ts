import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";
import { z } from "zod";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80),
  department: z.string().min(1).max(80),
  year: z.number().int().min(1).max(10),
  preferredLanguage: z.string().min(2).max(10),
  wellnessGoals: z.array(z.string().min(1)).min(1).max(5),
});

export async function POST(req: Request) {
  // Allow editing `.env.local` during dev without restarting the server.
  // Only reload when DATABASE_URL is missing/blank.
  if ((process.env.DATABASE_URL ?? "").trim().length === 0) {
    dotenv.config({ path: ".env.local", override: true });
  }

  const json = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const {
    email,
    password,
    name,
    department,
    year,
    preferredLanguage,
    wellnessGoals,
  } = parsed.data;

  const normalizedEmail = email.toLowerCase();
  if (!normalizedEmail.endsWith("@vidyashilp.edu.in")) {
    return NextResponse.json(
      { error: "Use your university email address" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Account already exists. Please login." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        role: Role.STUDENT,
        department,
        year,
        preferredLanguage,
        passwordHash,
        wellnessGoals,
        consentCounselor: false,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unexpected registration error";
    const code =
      typeof (error as { code?: unknown }).code === "string"
        ? ((error as { code: string }).code as string)
        : undefined;

    const dbConfigured =
      (process.env.DATABASE_URL ?? "").trim().length > 0;

    return NextResponse.json(
      {
        error:
          `Registration failed: Prisma could not connect to the database.${code ? ` (code: ${code})` : ""} ${message}.\n\n` +
          `DATABASE_URL configured: ${dbConfigured ? "yes" : "no"}.\n` +
          "Check that:\n" +
          "1) Add a non-empty `DATABASE_URL` in `mindcare/.env.local` (Supabase → Project Settings → Database → Connection string).\n" +
          "2) Restart the dev server after updating env.\n" +
          "3) Run `npx prisma migrate dev` to apply the schema.",
      },
      { status: 503 }
    );
  }
}

