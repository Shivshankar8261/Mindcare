import { DM_Serif_Display, Hind } from "next/font/google";

export const mindcareHind = Hind({
  subsets: ["latin", "latin-ext", "devanagari"],
  weight: "400",
  variable: "--font-hind",
  display: "swap",
});

export const mindcareDmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

/** Shared body classes for root layout and global-error (which does not inherit the root layout). */
export const mindcareRootBodyClassName = `${mindcareHind.variable} ${mindcareDmSerif.variable} bg-background text-foreground antialiased`;
