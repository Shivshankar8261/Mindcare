import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { authOptions } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import DashboardSessionProvider from "@/components/providers/DashboardSessionProvider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <DashboardSessionProvider session={session}>
      <div className="min-h-screen pb-20">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-4">
            <Sidebar />
            <main className="flex-1 py-4">{children}</main>
          </div>
        </div>
        <MobileNav />
      </div>
    </DashboardSessionProvider>
  );
}

