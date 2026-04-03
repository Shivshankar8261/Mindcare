"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ConsentToggle({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: boolean) {
    setValue(next);
    setError(null);
    setBusy(true);
    try {
      const resp = await fetch("/api/profile/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentCounselor: next }),
      });
      if (!resp.ok) {
        const json = (await resp.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(json?.error ?? "Failed to update");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
      // Roll back on failure.
      setValue(initialValue);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-muted">{t("profile.counselorVisibility")}</div>
      <div className="mt-2 text-sm">
        {t("profile.counselorVisibilityBody")}
      </div>

      <label className="mt-4 inline-flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value}
          disabled={busy}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm">{t("profile.consent")}</span>
      </label>

      {error ? (
        <div
          className="mt-3 rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-rose text-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

