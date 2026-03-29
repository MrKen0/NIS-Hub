"use client";

/**
 * Client-side Providers
 * ----------------------
 * Wraps the app with context providers that need "use client".
 * The root layout.tsx is a Server Component, so we can't put
 * client-only providers there directly — this component bridges the gap.
 */

import { AuthProvider } from "@/lib/auth/AuthContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
