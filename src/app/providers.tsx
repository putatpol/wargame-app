"use client";

import { TeamProvider } from "@/context/TeamContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <TeamProvider>{children}</TeamProvider>;
}
