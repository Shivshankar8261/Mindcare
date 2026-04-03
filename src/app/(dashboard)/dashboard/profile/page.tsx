// Client component so we can translate UI strings.
"use client";

import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

import { getLanguageLabel } from "@/lib/languages";
import ConsentToggle from "@/components/profile/ConsentToggle";

export default function ProfilePage() {
  const { t } = useTranslation();
  const session = useSession();
  const user = session.data?.user;
  const preferredLanguage = user?.preferredLanguage ?? "en";

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="text-sm text-muted">{t("profile.title")}</div>
            <h1 className="mt-1 text-3xl font-display tracking-tight">
              {t("profile.heading")}
            </h1>
            <p className="mt-2 text-muted">{t("profile.subtitle")}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <LanguageSwitcher currentLanguage={preferredLanguage} />
            <div className="mt-3 text-xs text-muted">
              {t("profile.currentLanguage")} {getLanguageLabel(preferredLanguage)}
            </div>
          </div>

          <ConsentToggle initialValue={Boolean(user?.consentCounselor)} />
        </div>
      </div>
    </div>
  );
}

