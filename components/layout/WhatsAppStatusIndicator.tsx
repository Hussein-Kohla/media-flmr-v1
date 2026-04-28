"use client";

import React from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

type WAStatus = "connected" | "connecting" | "disconnected" | "unknown";

const statusConfig: Record<WAStatus, { label: string; color: string; bg: string; icon: React.ElementType; pulse: boolean }> = {
  connected:    { label: "WhatsApp",     color: "#34d399", bg: "#34d39918", icon: Wifi,    pulse: false },
  connecting:   { label: "Connecting…",  color: "#fbbf24", bg: "#fbbf2418", icon: Loader2, pulse: true  },
  disconnected: { label: "Disconnected", color: "#fb7185", bg: "#fb718518", icon: WifiOff, pulse: false },
  unknown:      { label: "WA",           color: "#64748b", bg: "#64748b18", icon: WifiOff, pulse: false },
};

export function WhatsAppStatusIndicator() {
  return null;
}
