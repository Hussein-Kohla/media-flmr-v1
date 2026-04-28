import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { AppProvider } from "@/lib/context_fixed";
import { AuthProvider } from "@/lib/auth-context";
import AuthGuard from "@/components/auth/AuthGuard";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agency Operations Dashboard",
  description: "Unified system for managing clients, editing, and publishing",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppProvider>
          <ConvexClientProvider>
            <AuthProvider>
              <AuthGuard>{children}</AuthGuard>
            </AuthProvider>
          </ConvexClientProvider>
        </AppProvider>
      </body>
    </html>
  );
}
