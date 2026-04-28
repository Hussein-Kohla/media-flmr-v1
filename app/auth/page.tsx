"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const { setAuth } = useAuth();
  const registerMutation = useMutation(api.auth.register);
  const signInMutation = useMutation(api.auth.signIn);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      if (tab === "signup") {
        const result = await registerMutation({ email, password });
        setAuth({ email, userId: result.userId as string, token: result.token });
      } else {
        const result = await signInMutation({ email, password });
        setAuth({ email: result.email, userId: result.userId as string, token: result.token });
      }
      router.push("/");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("Invalid password") || msg.includes("password")) {
        setError("Invalid email or password");
      } else if (msg.includes("already") || msg.includes("exists")) {
        setError("An account with this email already exists");
      } else {
        setError(tab === "signup" ? "Failed to create account. Please try again." : "Sign in failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8b5cf6]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d946ef]/8 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group mb-6">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-full blur-lg opacity-50 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-16 h-16 rounded-full bg-white overflow-hidden shadow-2xl">
              <Image src="/2021-01-15.webp" alt="MediaFLMR" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Media<span className="text-[#8b5cf6]">FLMR</span>
          </h1>
          <p className="text-white/30 text-sm mt-1 tracking-widest uppercase font-medium">Agency Pipeline</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/[0.04] p-1 mb-8">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? "bg-[#8b5cf6] text-white shadow-lg"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@agency.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-12 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {tab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {tab === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {tab === "signup" && (
            <p className="mt-6 text-center text-xs text-white/25 leading-relaxed">
              By creating an account, your data is completely isolated.<br />
              No one else can see your clients, projects, or content.
            </p>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          v1.1.0 beta — Media FLMR Agency Pipeline
        </p>
      </div>
    </div>
  );
}
