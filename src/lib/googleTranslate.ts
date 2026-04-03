/**
 * Maps MindCare language codes to Google Translate `target` / `tl` codes.
 * The public gtx endpoint rejects some ISO codes and Odia must use `or`, not `od`.
 */
export type GoogleTranslateClient = "cloud" | "gtx";

export function mindcareLangToGoogleTarget(
  mindcareCode: string,
  client: GoogleTranslateClient
): string {
  if (mindcareCode === "en") return "en";

  if (client === "gtx") {
    const gtxMap: Record<string, string> = {
      od: "or",
      kok: "gom",
      mni: "mni-Mtei",
      brx: "hi",
      ks: "ur",
    };
    return gtxMap[mindcareCode] ?? mindcareCode;
  }

  const cloudMap: Record<string, string> = {
    od: "or",
    kok: "gom",
  };
  return cloudMap[mindcareCode] ?? mindcareCode;
}

function parseGtxTranslation(json: unknown): string | null {
  if (Array.isArray(json) && json.length > 0 && Array.isArray(json[0])) {
    const level1 = json[0] as unknown[];
    if (level1.length > 0 && Array.isArray(level1[0])) {
      const level2 = level1[0] as unknown[];
      if (level2.length > 0 && typeof level2[0] === "string") {
        return level2[0];
      }
    }
  }
  return null;
}

/** Translates from English to the given MindCare UI language (handles API key + gtx fallback). */
export async function translateEnToMindcareLang(
  text: string,
  mindcareLang: string
): Promise<string> {
  if (mindcareLang === "en") return text;

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  const client: GoogleTranslateClient = apiKey ? "cloud" : "gtx";
  const target = mindcareLangToGoogleTarget(mindcareLang, client);

  if (apiKey) {
    const url = "https://translation.googleapis.com/language/translate/v2";
    const resp = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: target,
        format: "text",
      }),
    }).catch(() => null);
    if (!resp || !resp.ok) return text;
    const data = (await resp.json().catch(() => null)) as
      | { data?: { translations?: Array<{ translatedText?: string }> } }
      | null;
    return data?.data?.translations?.[0]?.translatedText ?? text;
  }

  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t";
  const resp = await fetch(
    `${url}&tl=${encodeURIComponent(target)}&q=${encodeURIComponent(text)}`
  ).catch(() => null);
  if (!resp || !resp.ok) return text;
  if (resp.headers.get("content-type")?.includes("text/html")) {
    return text;
  }
  const json = (await resp.json().catch(() => null)) as unknown;
  return parseGtxTranslation(json) ?? text;
}
