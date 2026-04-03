import { NextResponse } from "next/server";
import { z } from "zod";

import { translateEnToMindcareLang } from "@/lib/googleTranslate";
import { resources } from "@/locales/resources_i18n";

const inputSchema = z.object({
  targetLang: z.string().min(2).max(10),
});

function protectPlaceholders(text: string) {
  const regex = /\{\{(\w+)\}\}/g;
  const matches: Array<{ full: string; name: string }> = [];
  let m: RegExpExecArray | null;
  // Collect placeholders without relying on Array.from/matchAll iteration flags.
  while ((m = regex.exec(text)) !== null) {
    matches.push({ full: m[0], name: m[1] });
  }
  if (!matches.length) return { text, unprotect: (t: string) => t };

  let out = text;
  const map = new Map<string, string>();
  for (const ph of matches) {
    const token = `__PH_${ph.name}__`;
    map.set(token, ph.full);
    out = out.replaceAll(ph.full, token);
  }

  return {
    text: out,
    unprotect: (translated: string) => {
      let res = translated;
      map.forEach((full, token) => {
        res = res.replaceAll(token, full);
      });
      return res;
    },
  };
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = inputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const { targetLang } = parsed.data;
  const commonEn = resources.en.common as Record<string, string>;

  if (targetLang === "en") {
    return NextResponse.json({ ok: true, lang: targetLang, common: commonEn });
  }

  const translated: Record<string, string> = {};

  const entries = Object.entries(commonEn);
  // Translate with limited concurrency to speed up onboarding translations.
  let cursor = 0;
  const concurrency = 6;
  async function worker() {
    while (true) {
      const idx = cursor;
      cursor += 1;
      if (idx >= entries.length) return;
      const [key, value] = entries[idx];
      const { text: safeText, unprotect } = protectPlaceholders(value);
      try {
        const out = await translateEnToMindcareLang(safeText, targetLang);
        translated[key] = unprotect(out);
      } catch {
        translated[key] = value;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return NextResponse.json({ ok: true, lang: targetLang, common: translated });
}

