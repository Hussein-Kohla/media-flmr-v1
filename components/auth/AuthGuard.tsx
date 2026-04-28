"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GlobalLayout } from "@/components/layout/GlobalLayout";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isAuthPage) {
      router.replace("/auth");
    } else if (user && isAuthPage) {
      router.replace("/");
    }
  }, [user, isLoading, isAuthPage, router]);

  // Loading state — show nothing to avoid flicker
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8b5cf6]/30 border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    );
  }

  // Auth page — render without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Not logged in — render nothing (redirect happens in useEffect)
  if (!user) return null;

  // Logged in — wrap in sidebar layout
  return <GlobalLayout>{children}</GlobalLayout>;
}
