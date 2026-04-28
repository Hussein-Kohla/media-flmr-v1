"use client";

import React, { useState, useEffect } from "react";
import {
  useAuthQuery as useQuery,
  useAuthMutation as useMutation,
} from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Mail,
  ShieldCheck,
  Database,
  User,
  Camera,
  Phone,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/lib/context_fixed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { clearAuth, token, user: authUser } = useAuth();
  const signOutMutation = useMutation(api.auth.signOut);
  const updateProfile = useMutation(api.settings.updateProfile);
  const { theme } = useApp();
  const router = useRouter();

  // States for profile editing
  const [name, setName] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user info via Convex
  const data = useQuery(api.settings.getSettings, token ? { token } : "skip");

  useEffect(() => {
    if (data?.profile) {
      setName(data.profile.name || "");
      setWaPhone(data.profile.waPhone || "");
      setAvatar(data.profile.avatar || "");
    }
  }, [data]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!token)
        throw new Error("Authentication token missing. Please sign in again.");
      await updateProfile({ name, waPhone, avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    if (token) await signOutMutation({ token }).catch(console.error);
    clearAuth();
    router.push("/auth");
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Text */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 flex items-center justify-center">
        <span className="text-[200px] font-black leading-none opacity-[0.03] whitespace-nowrap uppercase tracking-tighter">
          Account
        </span>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto py-12 px-6 space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#8b5cf6] mb-2">
            Configuration
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-foreground italic uppercase">
            Account
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Manage your professional profile and credentials.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 space-y-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 bg-white/[0.02] flex items-center justify-center relative shadow-2xl">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-40">
                    <User className="w-12 h-12" />
                  </div>
                )}
                {/* Hover Overlay */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    Change
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center shadow-lg border-2 border-background">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="pl-10 h-11 border-white/[0.08] bg-white/[0.02] focus:border-[#8b5cf6]/50 rounded-xl transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                    WhatsApp Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                    <Input
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+20 123 456 789"
                      className="pl-10 h-11 border-white/[0.08] bg-white/[0.02] focus:border-[#8b5cf6]/50 rounded-xl transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email (Read Only) */}
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 opacity-30" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Registered Email
                </div>
                <div className="text-sm font-medium opacity-80">
                  {data?.profile?.email || authUser?.email}
                </div>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/[0.05] text-[10px] font-bold opacity-30 uppercase tracking-widest">
              Verified
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className={cn(
              "w-full h-12 rounded-xl font-bold uppercase tracking-widest transition-all duration-300",
              saved
                ? "bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                : "bg-[#8b5cf6] hover:bg-[#7c3aed] shadow-[0_0_20px_rgba(139,92,246,0.3)]",
            )}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <>
                <Check className="w-5 h-5 mr-2" /> Changes Saved
              </>
            ) : (
              "Save Profile Changes"
            )}
          </Button>
        </div>

        {/* Security Info Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">
                Multi-Tenant Isolation
              </div>
              <div className="text-xs text-muted-foreground/60">
                Your workspace is cryptographically isolated.
              </div>
            </div>
            <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">
              Secure
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-sm font-bold text-red-500/80 uppercase tracking-[0.2em]">
              End Session
            </h2>
            <p className="text-xs text-muted-foreground/50">
              Your data will remain safe and isolated.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="group flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>

        <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] pb-4">
          v1.2.0 beta — Agency Pipeline
        </p>
      </div>
    </div>
  );
}
