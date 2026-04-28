import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-provider";
import { AppProvider } from "@/lib/context_fixed";

export const metadata: Metadata = {
  title: "Sign In — Media FLMR",
  description: "Sign in or create your Media FLMR account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ConvexClientProvider>
        {children}
      </ConvexClientProvider>
    </AppProvider>
  );
}
