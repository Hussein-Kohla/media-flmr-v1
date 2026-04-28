"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar, Users, Video, Send, LayoutDashboard, Settings, Sun, Moon, Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context_fixed";

const routes = [
  { label: "Dashboard",  icon: LayoutDashboard, href: "/" },
  { label: "Calendar",   icon: Calendar,         href: "/calendar" },
  { label: "Clients",    icon: Users,            href: "/clients" },
  { label: "Editing",    icon: Video,            href: "/editing" },
  { label: "Publishing", icon: Send,             href: "/publishing" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, language, toggleTheme, toggleLanguage, t } = useApp();
  const isArabic = language === "ar";
  const isDarkMode = theme === "dark";

  return (
    <aside className={cn(
      "w-20 flex-shrink-0 flex flex-col h-full border-r border-white/[0.05] transition-all duration-300 items-center",
      isDarkMode ? "bg-[#07080c]" : "bg-[#f8fafc]"
    )}>
      {/* Logo */}
      <div className="w-full flex items-center justify-center py-6 border-b border-white/[0.05]">
          <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-300">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-12 h-12 rounded-full bg-white border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out">
              <Image src="/2021-01-15.webp" alt="Media-FLMR Logo" className="w-full h-full object-cover" fill />
            </div>
          </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 w-full px-3 py-6 space-y-4 overflow-y-auto flex flex-col items-center">
        {routes.map((route) => {
          const active = pathname === route.href;
          const label = t(route.label.toLowerCase());

          return (
            <div key={route.href} className="relative group">
              <Link
                href={route.href}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 hover:scale-110",
                  active
                    ? "bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-[#8b5cf6]/20"
                    : isDarkMode 
                        ? "text-white/40 hover:text-white hover:bg-white/[0.08]" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                )}
              >
                 <route.icon
                   className={cn(
                     "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
                     route.icon === Send && "rtl:rotate-180"
                   )}
                 />
                 {active && (
                   <div className="absolute left-0 -ml-3 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-lg bg-[#8b5cf6]" />
                 )}
              </Link>
              {/* Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/90 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-white/10 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
                {label}
              </div>
            </div>
          );
        })}
      </nav>


      {/* Utility Toggles & Settings */}
      <div className="w-full py-6 border-t border-white/[0.05] flex flex-col items-center space-y-4">
        {/* Theme Toggle */}
        <div className="relative group">
          <button onClick={toggleTheme} 
            className={cn("flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 hover:scale-110", 
              isDarkMode ? "hover:bg-white/[0.08]" : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"
            )}>
            <div className={cn("transition-transform duration-300 group-hover:rotate-[360deg]", isDarkMode ? "text-white/40 group-hover:text-white" : "")}>
              {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/90 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-white/10 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
            {t("dark_mode")}
          </div>
        </div>

        {/* Language Toggle */}
        <div className="relative group">
          <button onClick={toggleLanguage} 
            className={cn("flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 hover:scale-110", 
              isDarkMode ? "hover:bg-white/[0.08]" : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"
            )}>
            <div className={cn("transition-transform duration-300 group-hover:scale-110", isDarkMode ? "text-white/40 group-hover:text-white" : "")}>
              <Languages className="w-6 h-6" />
            </div>
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/90 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-white/10 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
            {isArabic ? "English" : "اللغة العربية"}
          </div>
        </div>

        {/* Settings */}
        <div className="relative group pt-2 border-t border-white/[0.05]">
          <Link href="/settings" className={cn("flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 hover:scale-110", 
            isDarkMode ? "hover:bg-[#8b5cf6]/20 bg-[#8b5cf6]/10 text-[#8b5cf6]" : "bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
          )}>
            <Settings className="w-6 h-6 transition-transform duration-500 group-hover:rotate-180" />
          </Link>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/90 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap border border-white/10 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
            {t("settings")}
          </div>
        </div>
      </div>
    </aside>
  );
}
