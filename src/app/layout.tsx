import type { Metadata } from "next";
import "./globals.css";
import MindcareI18nProvider from "@/components/providers/I18nProvider";
import { mindcareRootBodyClassName } from "@/lib/mindcareFonts";

export const metadata: Metadata = {
  title: "MindCare — Vidyashilp University",
  description:
    "A student emotional wellness companion: check in with your mood, access supportive resources, and build healthier habits with privacy in mind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={mindcareRootBodyClassName} suppressHydrationWarning>
        <MindcareI18nProvider>{children}</MindcareI18nProvider>
      </body>
    </html>
  );
}
