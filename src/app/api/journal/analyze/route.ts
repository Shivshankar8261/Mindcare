import { NextResponse } from "next/server";
import { z } from "zod";

import { translateEnToMindcareLang } from "@/lib/googleTranslate";

const inputSchema = z.object({
  content: z.string().min(1).max(20000),
  lang: z.string().min(2).max(10).optional().default("en"),
});

const emotionKeywords: Record<
  string,
  Array<string>
> = {
  Anxiety: ["anxious", "anxiety", "worried", "worried", "panic", "exam", "pressure", "stress"],
  Sadness: ["sad", "down", "cry", "lonely", "miss", "hopeless", "broken"],
  Anger: ["angry", "mad", "rage", "furious", "annoyed"],
  Happiness: ["happy", "grateful", "joy", "excited", "relieved", "calm", "peace"],
  Resilience: ["i can", "i will", "breathe", "step", "progress", "strong", "trying"],
};

const distressKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "i want to die",
  "die",
  "मरना",
  "आत्महत्या",
  "आत्महत्या करना",
];

function pickEmotions(text: string) {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [emo, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((k) => lower.includes(k))) found.add(emo);
  }
  // Ensure at least one tag.
  if (found.size === 0) found.add("Resilience");
  return Array.from(found).slice(0, 6);
}

function estimateDistress(text: string) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of distressKeywords) {
    if (lower.includes(kw.toLowerCase())) score += 2;
  }
  if (lower.includes("exam") || lower.includes("pressure")) score += 1;
  if (lower.includes("lonely") || lower.includes("alone")) score += 1;
  return Math.min(10, score);
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = inputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { content, lang } = parsed.data;

  const emotionTags = pickEmotions(content);
  const distressLevel = estimateDistress(content);
  const dominantEmotion = emotionTags[0] ?? "Resilience";

  const crisisDetected =
    distressLevel >= 6 ||
    emotionTags.some((e) => e === "Sadness") &&
      content.toLowerCase().includes("hopeless");

  const copingSuggestionsEn = [
    "Try a slow 4-7-8 breathing cycle for 2 minutes.",
    "Write one small next step you can do in 10 minutes.",
    "If thoughts feel overwhelming, reach out to a trusted person or helpline.",
  ];

  const copingSuggestionsByLang: Record<string, string[]> = {
    hi: [
      "2 मिनट के लिए धीमा 4-7-8 ब्रीदिंग चक्र ट्राय करें।",
      "10 मिनट में आप कर सकते हैं, ऐसा एक छोटा अगला कदम लिखिए।",
      "अगर विचार बहुत भारी लगें, तो किसी भरोसेमंद व्यक्ति या हेल्पलाइन से बात करें।",
    ],
  };

  const copingSuggestions =
    copingSuggestionsByLang[lang] ?? copingSuggestionsEn;

  // If we don't have a native translation for coping suggestions, translate them on-demand.
  if (!copingSuggestionsByLang[lang] && lang !== "en") {
    const translated: string[] = [];
    for (const s of copingSuggestions) {
      translated.push(await translateEnToMindcareLang(s, lang));
    }
    copingSuggestions.splice(0, copingSuggestions.length, ...translated);
  }

  // Light “language-aware” rendering (without requiring translation API keys).
  const languageNameMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    te: "Telugu",
    mr: "Marathi",
    ta: "Tamil",
    ur: "Urdu",
    gu: "Gujarati",
    kn: "Kannada",
    od: "Odia",
    ml: "Malayalam",
    pa: "Punjabi",
    as: "Assamese",
    mai: "Maithili",
    sa: "Sanskrit",
    kok: "Konkani",
    sd: "Sindhi",
    doi: "Dogri",
    mni: "Manipuri",
    brx: "Bodo",
    sat: "Santali",
    ks: "Kashmiri",
    ne: "Nepali",
  };

  return NextResponse.json({
    ok: true,
    crisisDetected,
    aiAnalysis: {
      detectedLanguage: lang,
      dominantEmotion,
      distressSignals: {
        distressLevel,
        crisisKeywordsHit: distressLevel >= 6,
      },
      copingSuggestions,
      nextDayMoodPrediction: Math.max(1, Math.min(10, 7 - distressLevel / 2)),
      languageHint: languageNameMap[lang] ?? "English",
    },
    emotionTags,
    distressLevel,
  });
}

