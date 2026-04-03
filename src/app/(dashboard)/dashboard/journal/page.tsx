"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";

type Analysis = {
  ok: true;
  crisisDetected: boolean;
  aiAnalysis: Record<string, unknown>;
  emotionTags: string[];
  distressLevel: number;
};

export default function JournalPage() {
  const session = useSession();
  const preferredLanguage = session.data?.user?.preferredLanguage ?? "en";
  const { t } = useTranslation();

  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isShared, setIsShared] = useState(false);
  const [entries, setEntries] = useState<
    Array<{
      id: string;
      createdAt: string;
      content: string;
      detectedLanguage: string;
      emotionTags: unknown;
      distressLevel: number;
      isShared: boolean;
      aiAnalysis: unknown;
    }>
  >([]);

  const contentPreview = useMemo(() => content.trim().slice(0, 80), [content]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/journal?limit=5")
      .then((r) => r.json().catch(() => null))
      .then((json) => {
        if (!mounted) return;
        if (json?.ok && Array.isArray(json.entries)) {
          setEntries(json.entries);
        }
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  async function onAnalyze() {
    setError(null);
    setSuccess(null);
    if (!content.trim()) {
      setError(t("journal.errorWriteFirst"));
      return;
    }

    setAnalysisBusy(true);
    try {
      const resp = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, lang: preferredLanguage }),
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error ?? "Analysis failed");
      }
      setAnalysis(json as Analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalysisBusy(false);
    }
  }

  async function onSave() {
    setError(null);
    setSuccess(null);
    if (!content.trim()) {
      setError(t("journal.errorWriteBeforeSave"));
      return;
    }

    setBusy(true);
    try {
      const resp = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          detectedLanguage: preferredLanguage,
          emotionTags: analysis?.emotionTags ?? [],
          distressLevel: analysis?.distressLevel ?? 0,
          isShared,
          aiAnalysis: analysis?.aiAnalysis ?? undefined,
        }),
      });

      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error ?? "Save failed");
      }

      setSuccess(t("journal.saved"));
      setContent("");
      setAnalysis(null);

      const next = await fetch("/api/journal?limit=5")
        .then((r) => r.json())
        .catch(() => null);
      if (next?.ok && Array.isArray(next.entries)) setEntries(next.entries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="text-sm text-muted">{t("journal.title")}</div>
        <h1 className="mt-1 text-3xl font-display tracking-tight">
          {t("journal.headline")}
        </h1>
        <p className="mt-2 text-muted">
          {t("journal.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="journal">
              {t("journal.entryLabel")}
            </label>
            <textarea
              id="journal"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[260px] rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
              placeholder={t("journal.entryPlaceholder")}
              maxLength={20000}
            />
            <div className="text-xs text-muted">
              {content.length}/20000{" "}
              {contentPreview ? `• ${t("journal.preview")}: “${contentPreview}”` : ""}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={analysisBusy || busy}
              className="rounded-lg bg-saffron px-4 py-2 font-semibold text-background shadow-saffronGlow disabled:opacity-60"
            >
              {analysisBusy ? t("common.analyzing") : t("journal.analyzeButton")}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={busy || analysisBusy}
              className="rounded-lg bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow disabled:opacity-60"
            >
              {busy ? t("common.saving") : t("journal.saveButton")}
            </button>

            <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
              />
              {t("journal.shareLabel")}
            </label>
          </div>

          {error ? (
            <div
              className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-rose text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}
          {success ? (
            <div
              className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-teal text-sm"
              role="status"
              aria-live="polite"
            >
              {success}
            </div>
          ) : null}
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="text-sm text-muted">{t("journal.insightPreview")}</div>
          {analysis ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-muted">{t("journal.dominantEmotion")}</div>
                <div className="mt-1 text-lg font-semibold">
                  {typeof analysis.aiAnalysis.dominantEmotion === "string"
                    ? t(
                        `journal.emotionTag.${analysis.aiAnalysis.dominantEmotion}`
                      )
                    : "—"}
                </div>
                <div className="mt-2 text-xs text-muted">
                  {t("journal.distressLevel")}: {analysis.distressLevel}/10
                </div>
                {analysis.crisisDetected ? (
                  <div className="mt-3 text-sm text-rose font-semibold">
                    {t("journal.crisisDetected")}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-muted">{t("journal.emotionTags")}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.emotionTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted"
                    >
                      {t(`journal.emotionTag.${tag}`)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-muted">{t("journal.copingSuggestions")}</div>
                <ul className="mt-2 space-y-2 text-sm">
                  {Array.isArray(analysis.aiAnalysis.copingSuggestions)
                    ? analysis.aiAnalysis.copingSuggestions.map((s, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-teal">•</span>
                          <span>{String(s)}</span>
                        </li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
              {t("journal.analyzeEmpty")}
            </div>
          )}
        </div>
      </div>

      <section className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted">{t("journal.recentEntries")}</div>
            <div className="mt-1 text-xl font-display">{t("journal.preview")}</div>
          </div>
        </div>

        {entries.length ? (
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted">
                      {new Date(e.createdAt).toLocaleString()} • {t("journal.langLabel")}{" "}
                      {e.detectedLanguage}
                    </div>
                    <div className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">
                      {e.content.slice(0, 400)}
                      {e.content.length > 400 ? "…" : ""}
                    </div>
                    {typeof e.distressLevel === "number" ? (
                      <div className="mt-3 text-xs text-muted">
                        {t("journal.distressLevel")}: {e.distressLevel}/10
                      </div>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted whitespace-nowrap">
                    {e.isShared ? t("journal.shared") : t("journal.private")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
            {t("journal.noEntriesYet")}
          </div>
        )}
      </section>
    </div>
  );
}

