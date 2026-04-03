"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Appointment = {
  id: string;
  dateTime: string;
  status: string;
  notes: string | null;
};

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [dateTimeLocal, setDateTimeLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/appointments")
      .then((r) => r.json().catch(() => null))
      .then((json) => {
        if (!mounted) return;
        if (json?.ok && Array.isArray(json.appointments)) {
          setItems(json.appointments);
        }
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  async function onBook(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!dateTimeLocal) {
      setError(t("appointments.errorChooseDateTime"));
      return;
    }

    setBusy(true);
    try {
      const iso = new Date(dateTimeLocal).toISOString();
      const resp = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateTime: iso, notes }),
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json?.ok) {
        throw new Error(json?.error ?? "Booking failed");
      }
      setSuccess(t("appointments.requestedSuccess"));
      setNotes("");
      setDateTimeLocal("");

      const next = await fetch("/api/appointments")
        .then((r) => r.json())
        .catch(() => null);
      if (next?.ok && Array.isArray(next.appointments)) setItems(next.appointments);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="text-sm text-muted">{t("appointments.title")}</div>
        <h1 className="mt-1 text-3xl font-display tracking-tight">
          {t("appointments.subtitle")}
        </h1>
        <p className="mt-2 text-muted">
          {t("appointments.description")}
        </p>
      </div>

      <form onSubmit={onBook} className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="dt">
              {t("appointments.dateTime")}
            </label>
            <input
              id="dt"
              type="datetime-local"
              value={dateTimeLocal}
              onChange={(e) => setDateTimeLocal(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted" htmlFor="notes">
              {t("appointments.notes")}
            </label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
              maxLength={1000}
              placeholder={t("appointments.notesPlaceholder")}
            />
          </div>
        </div>

        {error ? (
          <div
            className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-rose text-sm"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {success ? (
          <div
            className="rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-teal text-sm"
            role="status"
          >
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow disabled:opacity-60"
        >
          {busy ? t("appointments.requesting") : t("appointments.requestButton")}
        </button>
      </form>

      <section className="glass-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted">{t("appointments.upcoming")}</div>
            <div className="mt-1 text-xl font-display">
              {t("appointments.upcomingLabel")}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {items.length ? (
            items.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted">
                      {new Date(a.dateTime).toLocaleString()}
                    </div>
                    <div className="mt-1 text-sm">
                      {t("appointments.status")}:{" "}
                      <span className="font-semibold">{a.status}</span>
                    </div>
                    {a.notes ? (
                      <div className="mt-2 text-sm text-muted">
                        {t("appointments.notesLabel")} {a.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
              {t("appointments.noAppointmentsYet")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

