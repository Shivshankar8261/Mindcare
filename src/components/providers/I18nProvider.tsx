"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";
import { MINDCARE_I18N_COMMON_CACHE_VERSION } from "@/lib/mindcareI18nShared";
import { getLanguageDir, mindcareLanguages } from "@/lib/languages";

function getCachedCommon(lang: string) {
  try {
    const raw = window.localStorage.getItem(
      `mindcare_i18n_common_${lang}_v${MINDCARE_I18N_COMMON_CACHE_VERSION}`
    );
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

async function ensureCachedCommon(lang: string) {
  if (lang === "en") return;
  const cacheKey = `mindcare_i18n_common_${lang}_v${MINDCARE_I18N_COMMON_CACHE_VERSION}`;
  try {
    const existing = window.localStorage.getItem(cacheKey);
    if (existing) return;

    const resp = await fetch("/api/i18n/translate-common", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetLang: lang }),
    }).catch(() => null);

    const json = resp
      ? ((await resp.json().catch(() => null)) as
          | { ok?: boolean; common?: Record<string, string> }
          | null)
      : null;

    if (json?.ok && json.common) {
      window.localStorage.setItem(cacheKey, JSON.stringify(json.common));
      i18n.addResources(lang, "common", json.common);
    }
  } catch {
    // Ignore caching failures.
  }
}

export default function MindcareI18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("mindcare_lang");
      const next = stored && typeof stored === "string" ? stored : "en";

      const cachedCommon = getCachedCommon(next);
      if (cachedCommon) {
        // Runtime injection so the whole UI can switch instantly after language selection.
        i18n.addResources(next, "common", cachedCommon);
      }

      // Update html direction immediately for RTL languages.
      document.documentElement.lang = next;
      document.documentElement.dir = getLanguageDir(next);
      void i18n.changeLanguage(next);

      // Prewarm remaining languages in background so switching is instant.
      // Limited concurrency to keep the app responsive.
      const codes = mindcareLanguages.map((l) => l.code).filter((c) => c !== "en");
      let cursor = 0;
      const concurrency = 2;
      const runWorker = async () => {
        while (cursor < codes.length) {
          const lang = codes[cursor];
          cursor += 1;
          // eslint-disable-next-line no-await-in-loop
          await ensureCachedCommon(lang);
        }
      };
      window.setTimeout(() => {
        void Promise.all(Array.from({ length: concurrency }, () => runWorker()));
      }, 250);
    } catch {
      // If localStorage is blocked, keep default language.
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

