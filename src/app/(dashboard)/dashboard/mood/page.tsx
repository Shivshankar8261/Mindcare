"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const timeOfDayOptions = [
  { value: "MORNING", labelKey: "mood.timeOfDayLabels.MORNING" },
  { value: "MIDDAY", labelKey: "mood.timeOfDayLabels.MIDDAY" },
  { value: "AFTERNOON", labelKey: "mood.timeOfDayLabels.AFTERNOON" },
  { value: "EVENING", labelKey: "mood.timeOfDayLabels.EVENING" },
  { value: "NIGHT", labelKey: "mood.timeOfDayLabels.NIGHT" },
] as const;

const emotionOptions = [
  "CALM",
  "ANXIOUS",
  "HAPPY",
  "SAD",
  "STRESSED",
  "LONELY",
  "ANGRY",
  "OVERWHELMED",
  "MOTIVATED",
  "NUMB",
  "GRATEFUL",
  "TIRED",
];

type TimeOfDayValue = (typeof timeOfDayOptions)[number]["value"];

export default function MoodCheckInPage() {
  const { t } = useTranslation();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDayValue>("MORNING");
  const [moodScore, setMoodScore] = useState(7);
  const [emotions, setEmotions] = useState<string[]>(["CALM"]);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [note, setNote] = useState("");
  const [academicPressure, setAcademicPressure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [history, setHistory] = useState<
    Array<{
      id: string;
      timestamp: string;
      moodScore: number;
      emotions: unknown;
      energyLevel: number;
      sleepQuality: number;
      note: string;
      academicPressure: boolean;
      timeOfDay: TimeOfDayValue;
    }>
  >([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/mood?limit=10")
      .then((r) => r.json().catch(() => null))
      .then((json) => {
        if (!mounted) return;
        if (json?.ok && Array.isArray(json.entries)) {
          setHistory(json.entries);
        }
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  function toggleEmotion(label: string) {
    setEmotions((prev) => {
      if (prev.includes(label)) return prev.filter((e) => e !== label);
      if (prev.length >= 5) return prev;
      return [...prev, label];
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const resp = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeOfDay,
          moodScore,
          emotions,
          energyLevel,
          sleepQuality,
          note,
          academicPressure,
        }),
      });
      const json = (await resp.json().catch(() => null)) as
        | { error?: string; ok?: boolean; streak?: number; xpPoints?: number; updated?: boolean }
        | null;
      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error ?? "Failed to submit mood");
      }

      if (typeof json?.streak === "number") {
        setSuccess(t("mood.checkinSavedWithStreak", { streak: json.streak }));
      } else {
        setSuccess(t("mood.checkinSaved"));
      }
      setNote("");
      // refresh history
      const next = await fetch("/api/mood?limit=10")
        .then((r) => r.json())
        .catch(() => null);
      if (next?.ok && Array.isArray(next.entries)) setHistory(next.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("mood.errorSubmitMood"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="text-sm text-muted">{t("mood.title")}</div>
        <h1 className="mt-1 text-3xl font-display tracking-tight">
          {t("mood.howAreYouFeeling")}
        </h1>
        <p className="mt-2 text-muted">
          {t("mood.subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-card p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="tod">
              {t("mood.timeOfDay")}
            </label>
            <select
              id="tod"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as TimeOfDayValue)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
            >
              {timeOfDayOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="mood">
              {t("mood.moodScore", { value: moodScore })}
            </label>
            <input
              id="mood"
              type="range"
              min={1}
              max={10}
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted">{t("mood.energy", { value: energyLevel })}</div>
            <input
              type="range"
              min={1}
              max={5}
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted">{t("mood.sleepQuality", { value: sleepQuality })}</div>
            <input
              type="range"
              min={1}
              max={5}
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <div className="text-sm text-muted">{t("mood.emotionsTitle")}</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emotionOptions.map((emo) => {
              const checked = emotions.includes(emo);
              return (
                <label
                  key={emo}
                  className={[
                    "flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors",
                    checked
                      ? "border-teal/30 bg-white/10 shadow-tealGlow"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEmotion(emo)}
                    aria-label={t(`mood.emotions.${emo}`)}
                  />
                  <span className="text-sm">{t(`mood.emotions.${emo}`)}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted">{t("mood.academicPressure")}</label>
            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={academicPressure}
                onChange={(e) => setAcademicPressure(e.target.checked)}
              />
              <span className="text-sm">{t("mood.academicPressureYes")}</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted">{t("mood.noteLabel")}</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[100px] rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
              placeholder={t("mood.notePlaceholder")}
              maxLength={5000}
            />
          </div>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-lg bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow disabled:opacity-60"
          >
            {busy ? t("common.saving") : t("mood.saveCheckIn")}
          </button>
        </div>
      </form>

      <section className="glass-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted">{t("mood.recentCheckIns")}</div>
            <div className="mt-1 text-xl font-display">
              {t("mood.lastEntries", { count: Math.min(10, history.length) })}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {history.length ? (
            history.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted">
                      {t(`mood.timeOfDayLabels.${h.timeOfDay}`)} •{" "}
                      {new Date(h.timestamp).toLocaleString()}
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {t("mood.moodWord")}: {h.moodScore}/10
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {t("mood.energyWord")} {h.energyLevel}/5 • {t("mood.sleepWord")}{" "}
                      {h.sleepQuality}/5
                    </div>
                    {h.note ? (
                      <div className="mt-2 text-sm">
                        <span className="text-muted">{t("mood.noteWord")}: </span>
                        {h.note}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted">
                    {h.academicPressure
                      ? t("mood.academicPressureYesDisplay")
                      : t("mood.academicPressureNoDisplay")}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
              {t("mood.noCheckinsYet")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

