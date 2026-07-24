"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Store, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານ", "error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showToast("ເຂົ້າສູ່ລະບົບສຳເລັດ!");
      router.push("/dashboard");
    } catch (err: any) {
      showToast(err.message || "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Premium Gradient Background with soft glowing blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-amber-50/40 to-orange-50/50 -z-20" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-200/40 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-200/35 blur-[120px] -z-10" />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Card Container */}
      <div className="w-full max-w-md bg-white/90 border border-slate-200/80 shadow-2xl shadow-slate-200/50 backdrop-blur-md rounded-3xl p-8 flex flex-col gap-6 relative z-10">
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-black text-slate-800 tracking-wide uppercase">ຮ້ານອາຫານ ແສນສະບາຍ</h1>
          <p className="text-xs text-slate-500 font-semibold">ລະບົບຈັດການຫຼັງຮ້ານ ແລະ ຮັບອໍເດີ້ອັດສະລິຍະ</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ອີເມວ / EMAIL
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              ລະຫັດຜ່ານ / PASSWORD
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="h-4 w-4" /> ເຂົ້າສູ່ລະບົບ
              </>
            )}
          </button>
        </form>

        {/* Demo Account Box */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center space-y-2.5">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            # ບັນຊີຕົວຢ່າງ / DEMO ACCOUNT
          </p>
          <div className="flex flex-col gap-1 text-[11px] text-slate-600 font-mono">
            <div>Email: <span className="text-slate-800 font-bold">admin@thaydev.com</span></div>
            <div>Password: <span className="text-slate-800 font-bold">123456</span></div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@thaydev.com");
              setPassword("123456");
              showToast("ป້ອນຂໍ້ມູນຕົວຢ່າງອັດຕະໂນມັດແລ້ວ!");
            }}
            className="w-full rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 py-1.5 text-[10px] font-bold transition-colors cursor-pointer"
          >
            ໃສ່ຂໍ້ມູນອັດຕະໂນມັດ (Autofill)
          </button>
        </div>
      </div>
    </div>
  );
}
