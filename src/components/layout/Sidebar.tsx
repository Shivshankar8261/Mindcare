"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  BookOpen,
  HeartPulse,
  MessageSquare,
  CalendarClock,
  User,
  Sparkles,
  Home,
} from "lucide-react";

const nav = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: Home },
  { href: "/dashboard/mood", labelKey: "nav.mood", icon: HeartPulse },
  { href: "/dashboard/journal", labelKey: "nav.journal", icon: BookOpen },
  { href: "/dashboard/chat", labelKey: "nav.mindbot", icon: MessageSquare },
  { href: "/dashboard/analytics", labelKey: "nav.analytics", icon: LineChart },
  { href: "/dashboard/resources", labelKey: "nav.resources", icon: Sparkles },
  {
    href: "/dashboard/appointments",
    labelKey: "nav.appointments",
    icon: CalendarClock,
  },
  { href: "/dashboard/profile", labelKey: "nav.profile", icon: User },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="hidden md:block w-72 shrink-0">
      <div className="glass-card p-3 sticky top-4">
        <div className="text-xs text-muted px-3 py-2">Navigation</div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/10 border border-teal/30 text-foreground shadow-tealGlow"
                    : "bg-transparent hover:bg-white/5 border border-transparent",
                ].join(" ")}
                aria-label={t(item.labelKey)}
              >
                <Icon aria-hidden size={18} />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

