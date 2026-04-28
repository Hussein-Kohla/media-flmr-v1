"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="flex h-screen overflow-hidden flex-col bg-background">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      <div className="flex flex-1 overflow-hidden pt-8">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
