import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = session?.user;
  const name = user?.name ?? "Student";
  const streak = user?.streak ?? 0;
  const xpPoints = user?.xpPoints ?? 0;
  const preferredLanguage = user?.preferredLanguage ?? "en";

  return (
    <DashboardClient
      userName={name}
      streak={streak}
      xpPoints={xpPoints}
      preferredLanguage={preferredLanguage}
    />
  );
}

