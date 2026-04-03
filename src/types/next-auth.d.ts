import type { Role, WellnessLevel } from "@/generated/prisma/enums";

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      department: string | null;
      year: number | null;
      preferredLanguage: string;
      streak: number;
      xpPoints: number;
      wellnessLevel: WellnessLevel;
    } & DefaultSession["user"];
  }
}

