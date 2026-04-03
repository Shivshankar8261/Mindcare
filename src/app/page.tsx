"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const helplines = [
  { label: "iCall", value: "9152987821" },
  { label: "Vandrevala Foundation", value: "1860-2662-345" },
  { label: "NIMHANS", value: "080-46110007" },
  { label: "Snehi", value: "044-24640050" },
];

const headlineByLang: Array<{ code: string; text: string }> = [
  { code: "hi", text: "आपकी भावनाओं की परवाह है" },
  { code: "bn", text: "আপনার আবেগের যত্ন নেওয়া হয়" },
  { code: "te", text: "మీ భావాలను మనం చూసుకుంటాం" },
  { code: "mr", text: "तुमच्या भावना जपल्या जातात" },
  { code: "ta", text: "உங்கள் உணர்வுகள் கவனிக்கப்படுகின்றன" },
  { code: "ur", text: "آپ کی جذبات کی دیکھ بھال" },
  { code: "gu", text: "તમારી લાગણીઓનું ધ્યાન રાખીએ છીએ" },
  { code: "kn", text: "ನಿಮ್ಮ ಭಾವನೆಗಳ ಆರೈಕೆ" },
  { code: "od", text: "ଆପଣଙ୍କ ଭାବନାର ଯତ୍ନ" },
  { code: "ml", text: "നിങ്ങളുടെ വികാരങ്ങളെ പരിചരിക്കുന്നു" },
  { code: "pa", text: "ਤੁਹਾਡੀਆਂ ਭਾਵਨਾਵਾਂ ਦੀ ਸੰਭਾਲ" },
  { code: "as", text: "আপোনাৰ অনুভৱৰ যত্ন" },
  { code: "mai", text: "अहाँक भावनाके ख्याल" },
  { code: "sa", text: "भवन्तः भावानां चिन्ता" },
  { code: "kok", text: "तुमच्या भावनांची काळजी" },
  { code: "sd", text: "توهان جي جذبن جو خيال" },
  { code: "doi", text: "तुआड्या भावनां दी پرवਾਹ" },
  { code: "mni", text: "শুভেচ্ছা, আপোনাৰ ভাবনা" },
  { code: "brx", text: "তোমাৰ অনুভৱৰ যত্ন" },
  { code: "sat", text: "ᱟᱱᱛᱟᱡᱤ ᱠᱟᱨ ᱠᱮᱭᱟ" },
  { code: "ks", text: "تمہاری جذبات کی پرواہ" },
  { code: "ne", text: "तपाईंको भावनाको ख्याल" },
];

const rangeSafeDelay = 999999;

function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    const id = window.setInterval(callback, delay);
    return () => window.clearInterval(id);
  }, [callback, delay]);
}

function FloatingOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 left-10 w-64 h-64 rounded-full bg-teal/20 blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 rounded-full bg-saffron/15 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-rose/10 blur-3xl"
        animate={{ y: [0, -16, 0], x: [0, 9, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function LandingPage() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const currentHeadline = headlineByLang[headlineIndex]?.text ?? headlineByLang[0].text;

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useInterval(
    () => setHeadlineIndex((i) => (i + 1) % headlineByLang.length),
    reduceMotion ? rangeSafeDelay : 2600
  );

  const features = [
    {
      title: "Mood Check-ins",
      body: "5 moments a day to understand how you feel — and why.",
      icon: Heart,
    },
    {
      title: "AI Journal Analysis",
      body: "Dominant emotions, distress signals, and 3 coping suggestions.",
      icon: Sparkles,
    },
    {
      title: "MindBot Chat",
      body: "A compassionate companion — crisis-safe with instant helpline surfacing.",
      icon: MessageCircle,
    },
    {
      title: "Analytics That Matter",
      body: "Trends, sleep-vs-mood correlation, best/worst time of day.",
      icon: TrendingUp,
    },
    {
      title: "Privacy First",
      body: "Journal encrypted at rest. Anonymous chat stores nothing.",
      icon: ShieldCheck,
    },
    {
      title: "Counselor Insights",
      body: "Students can opt-in to counselor visibility — aggregate trends by department.",
      icon: Heart,
    },
  ];

  const testimonials = [
    { quote: "MindCare made my stress feel understandable, not scary.", by: "Second-year student" },
    { quote: "The daily check-in is quick — and it genuinely helps.", by: "Hostel resident" },
    { quote: "I finally learned what triggers my anxiety.", by: "Engineering student" },
  ];

  const [testIdx, setTestIdx] = useState(0);
  useInterval(
    () => setTestIdx((i) => (i + 1) % testimonials.length),
    reduceMotion ? rangeSafeDelay : 4200
  );

  return (
    <div className="relative">
      <FloatingOrbs />

      <div className="sticky top-0 z-40">
        <div className="glass-card mx-4 sm:mx-6 mt-3 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="shrink-0 rounded-xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/10 transition hover:ring-black/20"
              aria-label="MindCare — Vidyashilp University, home"
            >
              <Image
                src="/mindcare-logo.png"
                alt="MindCare — Vidyashilp University. AI-powered emotional wellness platform."
                width={280}
                height={153}
                className="h-8 w-auto sm:h-10 md:h-11"
                priority
              />
            </Link>
            <div className="hidden sm:block h-8 w-px bg-white/15 shrink-0" aria-hidden />
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm">
              Crisis Support
            </div>
            <div className="text-sm text-muted">
              iCall: <span className="text-foreground font-semibold">9152987821</span>
            </div>
          </div>
          <Link
            href="/resources/crisis"
            className="rounded-xl border border-rose/35 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 shadow-roseGlow"
            aria-label="Open crisis support page"
          >
            Get help now
          </Link>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal shadow-tealGlow" />
                <span className="text-sm text-muted">
                  22 Languages • 24/7 AI Support • 100% Private
                </span>
              </div>

              <div className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={headlineIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-5xl sm:text-6xl font-display tracking-tight"
                    aria-live="polite"
                  >
                    {currentHeadline}
                  </motion.h1>
                </AnimatePresence>

                <h2 className="mt-4 text-2xl text-muted">
                  MindCare — AI-powered emotional wellness for Vidyashilp University students
                </h2>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-teal px-6 py-3 font-semibold text-background shadow-tealGlow text-center"
                >
                  Get Started Free
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-foreground hover:bg-white/10"
                >
                  See How It Works
                </a>
                <Link
                  href="/auth/login"
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-foreground hover:bg-white/10 text-center"
                >
                  Login
                </Link>
              </div>

              <div className="mt-6 text-sm text-muted">
                No judgement. No diagnosis. Just support that meets you where you are.
              </div>
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <Image
                  src="/illustrations/mindcare-mascot.svg"
                  alt="MindCare friendly mascot"
                  width={160}
                  height={160}
                  priority={false}
                />
                <div className="text-sm text-muted">What you get</div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {[
                  "Daily mood check-ins with energy + sleep signals",
                  "Encrypted journals with AI emotion insight",
                  "MindBot chat with instant crisis helpline surfacing",
                  "Trends dashboard: sleep vs mood, stress patterns, best times",
                ].map((t, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-start gap-3"
                  >
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-saffron shadow-saffronGlow" />
                    <span className="text-sm">{t}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-muted">Indian Mental Health Helplines</div>
                <div className="mt-2 space-y-2">
                  {helplines.map((h) => (
                    <div
                      key={h.label}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-muted">{h.label}</span>
                      <span className="font-semibold">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="text-center mb-8">
          <div className="text-sm text-muted">Key Features</div>
          <div className="mt-2 text-3xl font-display">Built for real student life</div>
          <div className="mt-2 text-muted">
            Exam pressure, hostel loneliness, and day-to-day mental load — MindCare responds with warmth.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-teal/30 bg-white/5 p-2 shadow-tealGlow">
                    <Icon aria-hidden size={18} className="text-teal" />
                  </div>
                  <div className="font-semibold">{f.title}</div>
                </div>
                <div className="mt-2 text-sm text-muted">{f.body}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="text-center mb-8">
          <div className="text-sm text-muted">How it works</div>
          <div className="mt-2 text-3xl font-display">Fast setup, lasting support</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Create your account", body: "Use your university email and choose your language." },
            { step: "2", title: "Daily check-ins + encrypted journals", body: "Track mood, emotions, sleep, and energy — with AI insight." },
            { step: "3", title: "See trends + get support", body: "MindBot helps day-to-day, and counselors can help when you opt in." },
          ].map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="glass-card p-6"
            >
              <div className="text-xs text-muted">Step {s.step}</div>
              <div className="mt-2 text-xl font-display">{s.title}</div>
              <div className="mt-2 text-sm text-muted">{s.body}</div>
              <div className="mt-4 flex items-center gap-2 text-sm text-teal">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal shadow-tealGlow" />
                <span>Support that feels human</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="text-center mb-8">
          <div className="text-sm text-muted">Testimonials</div>
          <div className="mt-2 text-3xl font-display">Students feel seen</div>
        </div>

        <div className="glass-card p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={testIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className="text-lg sm:text-xl font-display">
                “{testimonials[testIdx].quote}”
              </div>
              <div className="mt-3 text-muted text-sm">
                — {testimonials[testIdx].by}
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestIdx(i)}
                    aria-label={`Show testimonial ${i + 1}`}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      i === testIdx ? "bg-teal shadow-tealGlow" : "bg-white/15",
                    ].join(" ")}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-display text-xl">MindCare</div>
            <div className="mt-1 text-sm text-muted">
              Vidyashilp University • AI-powered emotional wellness platform
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/auth/register"
              className="rounded-xl bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow"
            >
              Get Started Free
            </Link>
            <Link
              href="/resources/crisis"
              className="rounded-xl border border-rose/35 bg-white/5 px-4 py-2 font-semibold hover:bg-white/10 shadow-roseGlow"
            >
              Crisis Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
