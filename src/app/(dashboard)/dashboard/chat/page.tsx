"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const session = useSession();
  const preferredLanguage = session.data?.user?.preferredLanguage ?? "en";
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggested = useMemo(
    () => [t("chat.prompt1"), t("chat.prompt2"), t("chat.prompt3"), t("chat.prompt4")],
    [t]
  );

  useEffect(() => {
    // No separate “get messages” endpoint yet; we start once the user sends.
    // Keep UI responsive.
    setMessages([]);
  }, []);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          lang: preferredLanguage,
        }),
      });

      const json = (await resp.json().catch(() => null)) as
        | { error?: string; ok?: boolean; messages?: ChatMessage[]; crisisDetected?: boolean }
        | null;

      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error ?? "Chat failed");
      }

      const nextMessages = Array.isArray(json.messages) ? json.messages : [];
      setMessages(nextMessages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="text-sm text-muted">{t("chat.title")}</div>
        <h1 className="mt-1 text-3xl font-display tracking-tight">
          {t("chat.heading")}
        </h1>
        <p className="mt-2 text-muted">
          {t("chat.subtitle")}
        </p>
      </div>

      <div className="glass-card p-5">
        {error ? (
          <div
            className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-rose text-sm"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="flex-1">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 min-h-[340px] max-h-[520px] overflow-auto">
              {messages.length ? (
                <div className="space-y-3">
                  {messages.map((m, idx) => (
                    <div
                      key={`${m.timestamp}-${idx}`}
                      className={[
                        "rounded-xl border px-4 py-3 whitespace-pre-wrap text-sm",
                        m.role === "user"
                          ? "border-teal/25 bg-white/5"
                          : "border-white/10 bg-white/5",
                      ].join(" ")}
                    >
                      <div className="text-xs text-muted mb-1">
                        {m.role === "user" ? t("chat.user") : t("chat.bot")}
                      </div>
                      {m.content}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted">
                  {t("chat.startHint")}
                </div>
              )}
            </div>
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-3">
            <div className="text-sm text-muted">{t("chat.suggestedPrompts")}</div>
            <div className="space-y-2">
              {suggested.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setInput(s);
                    send(s);
                  }}
                  disabled={busy}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm hover:bg-white/10 disabled:opacity-60"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-muted">{t("chat.helpline")}</div>
              <div className="mt-1 text-sm">
                {t("chat.crisisImmediateDanger")}
              </div>
              <div className="mt-3">
                <Link
                  href="/resources/crisis"
                  className="inline-flex items-center gap-2 rounded-xl border border-rose/35 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 shadow-roseGlow"
                >
                  {t("chat.openCrisis")}
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
            placeholder={t("chat.placeholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const toSend = input;
                setInput("");
                void send(toSend);
              }
            }}
            aria-label="Chat message"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const toSend = input;
              setInput("");
              void send(toSend);
            }}
            className="rounded-lg bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow disabled:opacity-60"
          >
            {busy ? t("chat.sending") : t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

