"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const role = session.user?.user_metadata?.role || "STAFF";
      if (role === "STAFF" && pathname !== "/dashboard/orders") {
        router.push("/dashboard/orders");
      } else {
        setAuthenticated(true);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthenticated(false);
        router.push("/login");
      } else if (session) {
        const role = session.user?.user_metadata?.role || "STAFF";
        if (role === "STAFF" && pathname !== "/dashboard/orders") {
          router.push("/dashboard/orders");
        } else {
          setAuthenticated(true);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
          <p className="text-sm font-semibold text-slate-500">ກຳລັງກວດສອບສິດເຂົ້າໃຊ້ງານ...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
