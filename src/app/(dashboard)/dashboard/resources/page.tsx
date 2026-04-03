"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Heart, ShieldCheck, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const helplines = [
  { label: "iCall", value: "9152987821", note: "24/7 support" },
  { label: "Vandrevala Foundation", value: "1860-2662-345" },
  { label: "NIMHANS", value: "080-46110007" },
  { label: "Snehi", value: "044-24640050" },
];

type BreathPhase = "INHALE" | "HOLD" | "EXHALE";

export default function ResourcesPage() {
  const { t } = useTranslation();
  const durations = useMemo(() => ({ INHALE: 4, HOLD: 7, EXHALE: 8 }), []);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("INHALE");
  const [remaining, setRemaining] = useState(4);

  const phaseColor = useMemo(() => {
    switch (phase) {
      case "INHALE":
        return "border-teal/30 shadow-tealGlow";
      case "HOLD":
        return "border-saffron/30 shadow-saffronGlow";
      case "EXHALE":
        return "border-rose/30 shadow-roseGlow";
    }
  }, [phase]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (remaining > 0) return;

    setPhase((p) => {
      if (p === "INHALE") {
        setRemaining(durations.HOLD);
        return "HOLD";
      }
      if (p === "HOLD") {
        setRemaining(durations.EXHALE);
        return "EXHALE";
      }
      setRemaining(durations.INHALE);
      return "INHALE";
    });
  }, [remaining, running, durations]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="text-sm text-muted">{t("resources.title")}</div>
        <h1 className="mt-1 text-3xl font-display tracking-tight">
          {t("resources.subtitle")}
        </h1>
        <p className="mt-2 text-muted">
          {t("resources.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="glass-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted">
            <ShieldCheck size={16} aria-hidden />
            {t("resources.helplinesTitle")}
          </div>
          <h2 className="mt-2 text-xl font-display tracking-tight">
            {t("resources.rightNowTitle")}
          </h2>
          <p className="mt-2 text-muted">
            {t("resources.rightNowBody")}
          </p>

          <div className="mt-5 space-y-3">
            {helplines.map((h) => (
              <a
                key={h.label}
                href={`tel:${h.value}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-4 flex items-start justify-between gap-3 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal/70"
                aria-label={`Call ${h.label} at ${h.value}`}
              >
                <div>
                  <div className="text-sm text-muted">{h.label}</div>
                  <div className="mt-1 font-semibold">{h.value}</div>
                  {h.note ? <div className="mt-1 text-xs text-muted">{h.note}</div> : null}
                </div>
                <div className="rounded-lg border border-white/15 bg-white/5 p-2">
                  <Phone aria-hidden size={18} className="text-teal" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="glass-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Heart size={16} aria-hidden />
            {t("resources.breathingTitle")}
          </div>
          <h2 className="mt-2 text-xl font-display tracking-tight">
            {t("resources.breathingTechnique")}
          </h2>
          <p className="mt-2 text-muted">
            {t("resources.breathingBody")}
          </p>

          <div className="mt-5 flex items-center justify-center">
            <motion.div
              className={[
                "w-56 h-56 rounded-full border flex items-center justify-center bg-white/5",
                "shadow-tealGlow/30",
                phaseColor,
              ].join(" ")}
              animate={{ scale: phase === "INHALE" ? 1.05 : phase === "EXHALE" ? 0.94 : 1 }}
              transition={{ duration: 0.35 }}
              role="img"
              aria-label={`Breathing phase: ${phase}`}
            >
              <div className="text-center">
                <div className="text-sm text-muted uppercase tracking-wide">{phase}</div>
                <div className="mt-2 text-4xl font-display">{remaining}</div>
                <div className="mt-1 text-xs text-muted">{remaining}s</div>
              </div>
            </motion.div>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setRunning((r) => {
                  const next = !r;
                  if (next) {
                    setPhase("INHALE");
                    setRemaining(durations.INHALE);
                  }
                  return next;
                });
              }}
              className="rounded-xl bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow disabled:opacity-60"
              aria-label={running ? t("resources.pause") : t("resources.start")}
            >
              {running ? t("resources.pause") : t("resources.start")}
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setPhase("INHALE");
                setRemaining(durations.INHALE);
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold"
              aria-label={t("resources.reset")}
            >
              {t("resources.reset")}
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-muted">{t("resources.tip")}</div>
                <div className="mt-1 text-sm text-foreground/90">
                  {t("resources.tipBody")}
                </div>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-2">
                <Volume2 aria-hidden size={18} className="text-teal" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {running ? (
              <motion.div
                key="running"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-xl border border-rose/30 bg-white/5 p-4"
                aria-live="polite"
              >
                <div className="text-sm text-muted">{t("resources.safeCycle")}</div>
                <div className="mt-1 text-sm">
                  {t("resources.phaseLabel")}{" "}
                  <span className="font-semibold">{phase}</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

