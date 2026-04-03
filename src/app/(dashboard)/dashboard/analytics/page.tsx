"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const rangeOptions = [30, 60, 90] as const;

type SeriesPoint = { day: string; mood: number };

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<(typeof rangeOptions)[number]>(30);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [busy, setBusy] = useState(false);

  async function load(nextRange: number) {
    setBusy(true);
    try {
      const json = await fetch(
        `/api/analytics/weekly?range=${encodeURIComponent(String(nextRange))}`
      ).then((r) => r.json());
      if (json?.ok && Array.isArray(json.series)) {
        setSeries(json.series);
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const avgMood = useMemo(() => {
    if (!series.length) return 0;
    const sum = series.reduce((a, b) => a + b.mood, 0);
    return Math.round(sum / series.length);
  }, [series]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="text-sm text-muted">{t("analytics.title")}</div>
        <h1 className="mt-1 text-3xl font-display tracking-tight">
          {t("analytics.subtitle")}
        </h1>
        <p className="mt-2 text-muted">
          {t("analytics.description")}
        </p>
      </div>

      <motion.section
        className="glass-card p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-muted">{t("analytics.moodTrend")}</div>
            <div className="mt-1 text-xl font-display">
              {t("analytics.lastDays", { count: range })}
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
                disabled={busy}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.length ? series : [{ day: "Today", mood: 6 }]}>
              <XAxis dataKey="day" tick={{ fill: "rgba(248,250,252,0.6)" }} hide />
              <YAxis domain={[1, 10]} tick={{ fill: "rgba(248,250,252,0.6)" }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                }}
                formatter={(value: unknown) => {
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
            <div className="text-xs text-muted">{t("analytics.averageMood")}</div>
            <div className="text-2xl font-display mt-1">{avgMood}/10</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-muted">{t("analytics.entriesInRange")}</div>
            <div className="text-2xl font-display mt-1">
              {series.length ? series.filter((p) => p.mood !== 6).length : 0}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-muted">{t("analytics.consistency")}</div>
            <div className="text-2xl font-display mt-1">
              {series.length ? Math.min(100, Math.round((series.filter((p) => p.mood !== 6).length / series.length) * 100)) : 0}%
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

