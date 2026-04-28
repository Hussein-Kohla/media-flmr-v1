"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d+$/.test(otp)) {
      setError("Please enter a numeric code.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await (authClient.signIn.phoneNumber as any)({
        phoneNumber,
        otp,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid code. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] mx-auto mb-4 border border-[#8b5cf6]/30">
             <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Media-FLMR</h1>
          <p className="text-white/40">Secure Agency Access</p>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest pl-1">Phone Number</Label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-medium">+</span>
                   <Input 
                      type="tel" 
                      placeholder="201234567890" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 h-14 pl-8 text-lg text-white placeholder:text-white/10 focus:border-[#8b5cf6]/50 rounded-2xl"
                   />
                </div>
                <p className="text-[10px] text-white/20 px-1 italic">Include country code without + (e.g. 20 for Egypt)</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <Button disabled={isLoading || !phoneNumber} className="w-full h-14 rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-lg font-bold transition-all shadow-lg shadow-[#8b5cf6]/20">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</> : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2 text-center">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Enter Verification Code</Label>
                <p className="text-xs text-white/30 truncate">Sent to +{phoneNumber}</p>
                <Input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  value={otp} 
                   onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                   className="bg-white/5 border-white/10 h-20 text-center text-4xl font-black tracking-[0.5em] text-[#8b5cf6] placeholder:text-white/5 focus:border-[#8b5cf6]/50 rounded-2xl mt-4 focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="space-y-3">
                <Button disabled={isLoading || otp.length < 6} className="w-full h-14 rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-lg font-bold transition-all shadow-lg shadow-[#8b5cf6]/20">
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Verifying...</> : "Sign In"}
                </Button>
                <button type="button" onClick={() => setStep("phone")} className="w-full text-xs text-white/30 hover:text-white transition-colors">
                  Wrong number? Try again
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] text-white/10 mt-12 uppercase tracking-[0.3em]">
          Internal Operations • Restricted Access
        </p>
      </div>
    </div>
  );
}
