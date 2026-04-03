"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getLanguageDir } from "@/lib/languages";

const copy: Record<
  string,
  { title: string; subtitle: string; go: string; login: string }
> = {
  en: {
    title: "Page not found",
    subtitle:
      "The page you&apos;re looking for doesn&apos;t exist (or isn&apos;t enabled yet).",
    go: "Go to landing",
    login: "Login",
  },
  hi: {
    title: "पृष्ठ नहीं मिला",
    subtitle:
      "आप जिस पेज को ढूंढ रहे हैं वह मौजूद नहीं है (या अभी सक्षम नहीं है)।",
    go: "होमपेज पर जाएं",
    login: "लॉगिन",
  },
  bn: {
    title: "পৃষ্ঠা পাওয়া যায়নি",
    subtitle:
      "আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই (বা এখনো চালু করা হয়নি)।",
    go: "হোমে যান",
    login: "লগইন",
  },
  te: {
    title: "పేజీ కనబడలేదు",
    subtitle:
      "మీరు వెతుకుతున్న పేజీ లేదు (లేదా ఇంకా యాక్టివ్ చేయలేదు)।",
    go: "హోమ్‌కి వెళ్లండి",
    login: "లాగిన్",
  },
  mr: {
    title: "पेज सापडले नाही",
    subtitle: "तुम्ही शोधत असलेले पेज अस्तित्वात नाही (किंवा अजून सक्षम नाही).",
    go: "मुख्य पृष्ठावर जा",
    login: "लॉगिन",
  },
  ta: {
    title: "பக்கம் கிடைக்கவில்லை",
    subtitle:
      "நீங்கள் தேடும் பக்கம் இல்லை (அல்லது இன்னும் இயக்கப்படவில்லை).",
    go: "முகப்புக்கு செல்லவும்",
    login: "உள்நுழை",
  },
  ur: {
    title: "صفحہ نہیں ملا",
    subtitle:
      "جس صفحے کی آپ تلاش کر رہے ہیں وہ موجود نہیں یا ابھی فعال نہیں۔",
    go: "ہوم پر جائیں",
    login: "لاگ اِن",
  },
};

export default function NotFound() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("mindcare_lang");
      if (stored) setLang(stored);
    } catch {
      // ignore
    }
  }, []);

  const dir = getLanguageDir(lang);
  const c = copy[lang] ?? copy.en;

  return (
    <main
      className="min-h-screen px-4 py-10 max-w-2xl mx-auto"
      dir={dir}
      lang={lang}
    >
      <div className="glass-card p-6">
        <div className="text-sm text-muted">{c.title}</div>
        <h1 className="mt-2 text-2xl font-display tracking-tight">404</h1>
        <p className="mt-2 text-muted">{c.subtitle}</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="rounded-xl bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow"
          >
            {c.go}
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold"
          >
            {c.login}
          </Link>
        </div>
      </div>
    </main>
  );
}

