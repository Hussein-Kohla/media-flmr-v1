"use client"

import React from "react"
import { Sidebar } from "@/components/layout/sidebar"

export const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - sticky full height */}
      <div className="hidden md:block w-[80px] shrink-0 h-screen sticky top-0 z-40">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="flex-1 relative overflow-hidden h-screen">
        <div className="max-w-[1400px] mx-auto w-full h-full px-6 md:px-12 py-4 md:py-6">
          <div className="reveal-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
