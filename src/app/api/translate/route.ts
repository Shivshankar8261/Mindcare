import { NextResponse } from "next/server";
import { z } from "zod";

import { mindcareLangToGoogleTarget } from "@/lib/googleTranslate";

const payloadSchema = z.object({
  text: z.string().min(1),
  targetLang: z.string().min(2).max(10),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { text, targetLang } = parsed.data;

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ translatedText: text });
  }

  const googleTarget = mindcareLangToGoogleTarget(targetLang, "cloud");

  // Google Cloud Translation v2 REST endpoint (API key based).
  const url =
    "https://translation.googleapis.com/language/translate/v2";
  const resp = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      target: googleTarget,
      format: "text",
    }),
  }).catch(() => null);

  if (!resp || !resp.ok) {
    return NextResponse.json({ translatedText: text });
  }

  const data = (await resp.json().catch(() => null)) as
    | { data?: { translations?: Array<{ translatedText?: string }> } }
    | null;

  const translatedText =
    data?.data?.translations?.[0]?.translatedText ?? text;
  return NextResponse.json({ translatedText });
}

