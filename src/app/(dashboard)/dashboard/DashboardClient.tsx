"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

const rangeOptions = [30, 60, 90] as const;

function buildMoodData(days: number, seed: number) {
  // Deterministic dummy data: good enough for dev dashboards.
  // moodScore: 1..10
  const out: Array<{ day: string; mood: number }> = [];
  const base = 6 + Math.min(2, Math.floor(seed / 20));
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - i) / days;
    const seasonal = Math.sin(t * Math.PI * 2) * 1.2;
    const noise = Math.sin((seed + i) * 0.7) * 0.9;
    const pressure = Math.max(0, Math.sin((i + seed) * 0.15)) * 0.8;
    let v = base + seasonal + noise - pressure;
    v = Math.max(1, Math.min(10, Math.round(v)));
    out.push({ day: i === 0 ? "Today" : `${days - i}d`, mood: v });
  }
  return out;
}

function getGreeting(lang: string, name: string) {
  const map: Record<string, string> = {
    en: `Good Morning, ${name} 🌅`,
    hi: `सुप्रभात, ${name} 🌅`,
    bn: `শুভ সকাল, ${name} 🌅`,
    te: `శుభోదయం, ${name} 🌅`,
    mr: `सुप्रभात, ${name} 🌅`,
    ta: `காலை வணக்கம், ${name} 🌅`,
    ur: `خوش آمدید, ${name} 🌅`,
    gu: `સુપ્રભાત, ${name} 🌅`,
    kn: `ಶುಭೋದಯ, ${name} 🌅`,
    od: `ଶୁଭ ସକାଳ, ${name} 🌅`,
    ml: `ശുഭദിനം, ${name} 🌅`,
    pa: `ਸੁਪਰਭਾਤ, ${name} 🌅`,
    as: `শুভ সকাল, ${name} 🌅`,
    mai: `शुभ प्रभात, ${name} 🌅`,
    sa: `शुभप्रभात, ${name} 🌅`,
    kok: `सुप्रभात, ${name} 🌅`,
    sd: `صبح بخیر, ${name} 🌅`,
    doi: `सुप्रभात, ${name} 🌅`,
    mni: `শুভ সকাল, ${name} 🌅`,
    brx: `শুভ সকাল, ${name} 🌅`,
    sat: `শুভ সকাল, ${name} 🌅`,
    ks: `خوشِ صبح, ${name} 🌅`,
    ne: `शुभ प्रभात, ${name} 🌅`,
  };
  return map[lang] ?? map.en;
}

export default function DashboardClient({
  userName,
  streak,
  xpPoints,
  preferredLanguage,
}: {
  userName: string;
  streak: number;
  xpPoints: number;
  preferredLanguage: string;
}) {
  const { t } = useTranslation();
  const [range, setRange] = useState<(typeof rangeOptions)[number]>(30);
  const moodData = useMemo(
    () => buildMoodData(range, streak * 7 + xpPoints),
    [range, streak, xpPoints]
  );

  const avgMood = useMemo(() => {
    const sum = moodData.reduce((acc, d) => acc + d.mood, 0);
    return Math.round(sum / Math.max(1, moodData.length));
  }, [moodData]);

  const wellnessScore = useMemo(() => {
    const s = Math.min(100, Math.round((avgMood / 10) * 70 + Math.min(30, streak * 0.3)));
    return s;
  }, [avgMood, streak]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-display tracking-tight">
          {getGreeting(preferredLanguage, userName)}
        </h1>
        <p className="mt-2 text-muted">{t("dashboard.yourMindCareUpdates")}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.section
          className="glass-card p-5 lg:col-span-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/illustrations/journal-sticker.svg"
              alt="Journal sticker"
              width={64}
              height={64}
              priority={false}
              className="rounded-xl border border-white/10 bg-white/5"
            />
            <div>
              <div className="text-sm text-muted">{t("dashboard.welcomeBack")}</div>
              <div className="font-display tracking-tight">
                {userName}
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 mt-4">
            <div>
              <div className="text-sm text-muted">{t("dashboard.streak")}</div>
              <div className="mt-1 text-4xl font-display shadow-saffronGlow">
                {streak} 🔥
              </div>
              <div className="mt-1 text-muted text-sm">
                {t("dashboard.keepGoing")}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
              <div className="text-xs text-muted">{t("dashboard.xp")}</div>
              <div className="text-lg font-semibold">{xpPoints}</div>
            </div>
          </div>
          <Link
            href="/dashboard/mood"
            className="mt-4 block rounded-xl bg-teal px-4 py-2 text-background font-semibold text-center shadow-tealGlow"
            aria-label="Go to mood check-in"
          >
            {t("dashboard.dailyMoodCheckin")}
          </Link>
        </motion.section>

        <section
          className="glass-card p-5 lg:col-span-2"
          aria-label="Weekly mood analytics"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted">{t("dashboard.moodTrend")}</div>
              <div className="mt-1 text-xl font-display">
                {t("dashboard.lastDays", { count: range })}
              </div>
            </div>
            <div className="flex gap-2">
              {rangeOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-label={`Show mood trend for ${r} days`}
                  className={[
                    "rounded-lg border px-3 py-1 text-sm transition-colors",
                    r === range
                      ? "border-teal/40 bg-white/10 shadow-tealGlow"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-muted",
                  ].join(" ")}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>

          <div className="h-[260px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <XAxis dataKey="day" tick={{ fill: "rgba(248,250,252,0.6)" }} hide />
                <YAxis
                  domain={[1, 10]}
                  tick={{ fill: "rgba(248,250,252,0.6)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                  }}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    return [`Mood ${n}/10`, "Mood"];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-muted">{t("dashboard.averageMood")}</div>
              <div className="text-2xl font-display mt-1">{avgMood}/10</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-muted">{t("dashboard.aiWellnessScore")}</div>
              <div className="text-2xl font-display mt-1">{wellnessScore}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-muted">{t("dashboard.daysTracked")}</div>
              <div className="text-2xl font-display mt-1">
                {Math.min(100, 12 + Math.floor(streak * 0.7))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted">
                {t("dashboard.recentJournalEntries")}
              </div>
              <div className="mt-1 text-xl font-display">
                {t("dashboard.preview")}
              </div>
            </div>
            <Link
              href="/dashboard/journal"
              className="text-sm text-teal hover:underline underline-offset-4"
            >
              {t("dashboard.viewAll")}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                title: t("dashboard.previewJournal1Title"),
                body: t("dashboard.previewJournal1Body"),
              },
              {
                title: t("dashboard.previewJournal2Title"),
                body: t("dashboard.previewJournal2Body"),
              },
              {
                title: t("dashboard.previewJournal3Title"),
                body: t("dashboard.previewJournal3Body"),
              },
            ].map((e, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-sm text-muted">{e.title}</div>
                <div className="mt-2 text-foreground/90">{e.body}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="glass-card p-5">
          <div className="text-sm text-muted">{t("dashboard.upcomingAppointment")}</div>
          <div className="mt-2 text-xl font-display">{t("dashboard.thisWeek")}</div>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm">
              <span className="text-muted">{t("dashboard.when")}</span> Wed, 10:30 AM
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted">{t("dashboard.with")}</span> Counselor (assigned)
            </div>
            <div className="mt-3">
              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center gap-2 rounded-xl border border-teal/35 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                {t("dashboard.manageAppointment")}
              </Link>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm text-muted">{t("dashboard.dailyWellnessTip")}</div>
            <div className="mt-2 text-foreground/90">
              {t("dashboard.tryBreathingTip")}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl bg-saffron px-3 py-2 text-background font-semibold shadow-saffronGlow"
                aria-label={t("dashboard.startBreathing")}
                onClick={() => {
                  // No modal yet; keep as interactive CTA for now.
                  window.location.href = "/resources";
                }}
              >
                {t("dashboard.startBreathing")}
              </button>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted">{t("dashboard.todayMoodCheckin")}</div>
              <div className="mt-1 text-xl font-display">
                {t("dashboard.readyWhenYouAre")}
              </div>
            </div>
            <Link
              href="/dashboard/mood"
              className="rounded-xl border border-rose/35 bg-white/5 px-4 py-2 text-foreground shadow-roseGlow hover:bg-white/10"
              aria-label={t("dashboard.dailyMoodCheckin")}
            >
              {t("dashboard.checkInNow")}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

