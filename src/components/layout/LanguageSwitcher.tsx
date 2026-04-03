"use client";

import { useEffect, useMemo, useState } from "react";
import { mindcareLanguages, getLanguageDir, getLanguageLabel } from "@/lib/languages";
import { MINDCARE_I18N_COMMON_CACHE_VERSION } from "@/lib/mindcareI18nShared";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({
  currentLanguage,
}: {
  currentLanguage: string;
}) {
  const [lang, setLang] = useState(currentLanguage);
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  const dir = useMemo(() => getLanguageDir(lang), [lang]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("mindcare_lang");
      const next = stored ?? currentLanguage;
      setLang(next);
      document.documentElement.lang = next;
      document.documentElement.dir = getLanguageDir(next);
      window.localStorage.setItem("mindcare_lang", next);
    } catch {
      // Ignore if localStorage is unavailable.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onChange(next: string) {
    if (busy) return;
    setBusy(true);
    setLang(next);
    try {
      // Make the UI direction update instantly.
      window.localStorage.setItem("mindcare_lang", next);
      document.documentElement.lang = next;
      document.documentElement.dir = getLanguageDir(next);

      await fetch("/api/profile/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLanguage: next }),
      });

      // Translate dashboard UI strings on-demand (cached in localStorage).
      const cacheKey = `mindcare_i18n_common_${next}_v${MINDCARE_I18N_COMMON_CACHE_VERSION}`;
      const hasCache = window.localStorage.getItem(cacheKey);
      const looksLikeEnglish = (() => {
        if (!hasCache) return false;
        try {
          const parsed = JSON.parse(hasCache) as Record<string, string>;
          return next !== "en" && parsed?.["nav.dashboard"] === "Dashboard";
        } catch {
          return false;
        }
      })();

      if (next !== "en" && (!hasCache || looksLikeEnglish)) {
        const resp = await fetch("/api/i18n/translate-common", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetLang: next }),
        }).catch(() => null);

        const json = resp
          ? ((await resp.json().catch(() => null)) as
              | { ok?: boolean; common?: Record<string, string> }
              | null)
          : null;
        if (json?.ok && json.common) {
          window.localStorage.setItem(cacheKey, JSON.stringify(json.common));
        }
      }

      // Reload so server-rendered strings (dashboard greeting etc.) refresh.
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2" dir={dir}>
      <label htmlFor="language" className="text-sm text-muted">
        {t("auth.language")}
      </label>
      <select
        id="language"
        value={lang}
        onChange={(e) => onChange(e.target.value)}
        disabled={busy}
        aria-label="Language selector"
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
      >
        {mindcareLanguages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <div className="hidden sm:block text-xs text-muted">
        {getLanguageLabel(lang)}
      </div>
    </div>
  );
}

