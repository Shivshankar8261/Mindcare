import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthButtons from "./AuthButtons";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const preferredLanguage =
    session?.user?.preferredLanguage ?? "en";

  return (
    <header className="w-full">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="shrink-0 rounded-xl bg-white px-2 py-1 shadow-sm ring-1 ring-black/10 transition hover:ring-black/20"
          aria-label="MindCare — Vidyashilp University, dashboard home"
        >
          <Image
            src="/mindcare-logo.png"
            alt="MindCare — Vidyashilp University"
            width={240}
            height={131}
            className="h-8 w-auto sm:h-9 md:h-10"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLanguage={preferredLanguage} />
          <AuthButtons isAuthenticated={Boolean(session)} />
        </div>
      </div>
    </header>
  );
}

