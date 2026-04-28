"use client";

import React, { useState } from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
  import { useApp } from "@/lib/context_fixed";
  import { Smartphone, Lock, AlertCircle, Loader2, ArrowRight, Languages } from "lucide-react";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { cn } from "@/lib/utils";

  export function LoginScreen() {
    const { t, language, toggleLanguage, theme } = useApp();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendOTP = async () => {
      if (!phoneNumber) return;
      setLoading(true);
      setError(null);
      
      // Normalize Egyptian numbers: 01... -> +201..., 1... -> +201...
      let normalized = phoneNumber.trim().replace(/\s/g, "");
      if (normalized.startsWith("0")) {
        normalized = "+2" + normalized;
      } else if (normalized.startsWith("1")) {
        normalized = "+20" + normalized;
      } else if (!normalized.startsWith("+")) {
         // Default fallback or assume already normalized
      }

      try {
        const { error: authError } = await authClient.phoneNumber.sendOtp({
          phoneNumber: normalized,
        });
        if (authError) {
          setError(t("login_error"));
        } else {
          setPhoneNumber(normalized); // Keep normalized version for verify step
          setStep("otp");
        }
      } catch (err) {
        setError(t("login_error"));
      } finally {
        setLoading(false);
      }
    };

    const handleVerify = async () => {
      if (!otp) return;
      setLoading(true);
      setError(null);
      try {
        const { error: authError } = await authClient.phoneNumber.verify({
          phoneNumber,
          code: otp,
        });
        if (authError) {
          setError(t("login_error"));
        } else {
            // Success - AuthGuard will pick up the session
        }
      } catch (err) {
        setError(t("login_error"));
      } finally {
        setLoading(false);
      }
    };

    const isArabic = language === "ar";
    const isDarkMode = theme === "dark";

    return (
      <div className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 transition-colors duration-500",
        isDarkMode ? "bg-[#07080c]" : "bg-[#fdfaf3]"
      )}>
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#d946ef]/20 blur-[120px]" />
        </div>

        {/* Language Toggle */}
        <button onClick={toggleLanguage} 
          className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs font-semibold hover:bg-card transition-all">
          <Languages className="w-4 h-4" />
          {isArabic ? "English" : "العربية"}
        </button>

        <div className="w-full max-w-[400px] relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 mb-6 group hover:scale-105 transition-transform duration-500">
               <div className="relative w-10 h-10 rounded-xl bg-white border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
                 <Image src="/images.png" alt="Media-FLMR Logo" className="w-full h-full object-cover" fill />
               </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {t("login_title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "phone" ? t("login_subtitle") : `${t("otp_placeholder")} ${phoneNumber}`}
            </p>
          </div>

          <div className="space-y-4">
            {step === "phone" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                    {t("phone")}
                  </Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t("phone_placeholder")} 
                      className="pl-11 h-12 bg-card/50 border-border focus:ring-2 focus:ring-[#8b5cf6]/20"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSendOTP}
                  disabled={loading || !phoneNumber}
                  className="w-full h-12 rounded-xl bg-[#8b5cf6] text-white font-semibold hover:bg-[#7c3aed] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {t("send_code")}
                      <ArrowRight className={cn("w-4 h-4", isArabic && "rotate-180")} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
                    {t("verify_code")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder={t("otp_placeholder")} 
                      maxLength={6}
                      className="pl-11 h-12 bg-card/50 border-border focus:ring-2 focus:ring-[#8b5cf6]/20 text-center tracking-[1em] text-lg font-bold"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleVerify}
                  disabled={loading || otp.length < 6}
                  className="w-full h-12 rounded-xl bg-[#34d399] text-white font-semibold hover:bg-[#10b981] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("verify_code")}
                </button>
                <button 
                  onClick={() => setStep("phone")}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("change_number")}
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-xs text-red-500 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
               MediaFLMR &copy; 2026
             </p>
          </div>
        </div>
      </div>
    );
  }
