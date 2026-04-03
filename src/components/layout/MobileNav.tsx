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

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card"
      style={{ borderRadius: 0 }}
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around px-2 py-2">
        {nav.slice(0, 5).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={t(item.labelKey)}
              className={[
                "flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 transition-colors",
                active
                  ? "text-teal shadow-tealGlow"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon aria-hidden size={18} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

