"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error: any) {
      console.error("Login failed", error);
      // Ignore if user just closed the popup
      if (error.code !== "auth/cancelled-popup-request" && error.code !== "auth/popup-closed-by-user") {
        alert("Gagal masuk dengan Google. Silakan coba lagi.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-500/30 transform -rotate-6">
            <i className="fa-solid fa-book-open text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Masuk ke GoLib</h1>
          <p className="text-slate-500 dark:text-slate-400">Lanjutkan membaca dan kelola perpustakaan pribadimu.</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className={`w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl py-4 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all ${isLoggingIn ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]"}`}
        >
          {isLoggingIn ? (
            <i className="fa-solid fa-spinner fa-spin text-lg"></i>
          ) : (
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          )}
          {isLoggingIn ? "Memproses..." : "Masuk dengan Google"}
        </button>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-brand-500 transition-colors">
            <i className="fa-solid fa-arrow-left mr-2"></i>Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
