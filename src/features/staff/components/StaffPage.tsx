"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/lib/format";
import { Users, UserPlus, Trash2, ShieldAlert, Key, UserCheck, X } from "lucide-react";

type StaffUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  createdAt: string;
};

export function StaffPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Add user modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionToken(session.access_token);
        setCurrentUser(session.user);
      }
    };
    initAuth();
  }, []);

  const fetchUsers = async () => {
    if (!sessionToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const err = await res.json();
        showToast(err.error || "ບໍ່ສາມາດດຶງລາຍຊື່ຜູ້ໃຊ້ໄດ້", "error");
      }
    } catch {
      showToast("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      fetchUsers();
    }
  }, [sessionToken]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !role) {
      setModalError("ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ");
      return;
    }
    if (password.length < 6) {
      setModalError("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }

    setModalLoading(true);
    setModalError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (res.ok) {
        showToast("ເພີ່ມບັນຊີພະນັກງານໃໝ່ສຳເລັດ!");
        setIsAddModalOpen(false);
        // Reset states
        setEmail("");
        setPassword("");
        setName("");
        setRole("STAFF");
        fetchUsers();
      } else {
        const err = await res.json();
        setModalError(err.error || "ສ້າງບັນຊີພະນັກງານລົ້ມເຫຼວ");
      }
    } catch {
      setModalError("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, currentName: string, newRole: "ADMIN" | "STAFF") => {
    if (userId === currentUser?.id) {
      showToast("ທ່ານບໍ່ສາມາດປ່ຽນແປງບົດບາດຂອງຕົນເອງໄດ້", "error");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ name: currentName, role: newRole }),
      });

      if (res.ok) {
        showToast("ອັບເດດບົດບາດສຳເລັດ!");
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "ອັບເດດລົ້ມເຫຼວ", "error");
      }
    } catch {
      showToast("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ", "error");
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (userId === currentUser?.id) {
      showToast("ທ່ານບໍ່ສາມາດລຶບບັນຊີຂອງຕົນເອງໄດ້", "error");
      return;
    }

    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບັນຊີພະນັກງານ "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (res.ok) {
        showToast("ລຶບບັນຊີພະນັກງານສຳເລັດ!");
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "ລຶບບັນຊີລົ້ມເຫຼວ", "error");
      }
    } catch {
      showToast("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ", "error");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">ໜ້າຫຼັກ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>ຈັດການພະນັກງານ & ບົດບາດ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
            >
              <UserPlus className="h-4 w-4" /> ເພີ່ມພະນັກງານໃໝ່
            </button>
          </div>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.message}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> ຈັດການພະນັກງານ & ບົດບາດ (Staff Roles)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ຈັດການບັນຊີ ແລະ ແບ່ງສິດທິຜູ້ໃຊ້ງານລະຫວ່າງຜູ້ດູແລລະບົບ (ADMIN) ແລະ ພະນັກງານ (STAFF)
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">ກຳລັງໂຫລດລາຍຊື່ພະນັກງານ...</p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3 text-left">ພະນັກງານ</th>
                      <th className="px-5 py-3 text-left">ອີເມວ</th>
                      <th className="px-5 py-3 text-left">ວັນທີເພີ່ມ</th>
                      <th className="px-5 py-3 text-center">ບົດບາດສິດທິ</th>
                      <th className="px-5 py-3 text-center">ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {users.map((staff) => (
                      <tr key={staff.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-4 font-bold flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                            {staff.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>
                            {staff.name}
                            {staff.id === currentUser?.id && (
                              <span className="ml-1.5 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 border">
                                ຂ້ອຍ
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">{staff.email}</td>
                        <td className="px-5 py-4 text-slate-500 text-xs">{formatDateTime(staff.createdAt)}</td>
                        <td className="px-5 py-4 text-center">
                          <select
                            value={staff.role}
                            disabled={staff.id === currentUser?.id}
                            onChange={(e) =>
                              handleUpdateRole(
                                staff.id,
                                staff.name,
                                e.target.value as "ADMIN" | "STAFF"
                              )
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-extrabold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${
                              staff.role === "ADMIN"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            <option value="STAFF">ພະນັກງານ (STAFF)</option>
                            <option value="ADMIN">ຜູ້ດູແລ (ADMIN)</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(staff.id, staff.name)}
                            disabled={staff.id === currentUser?.id}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="ລຶບບັນຊີພະນັກງານ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* ── Add Staff User Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 shrink-0 bg-slate-50">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-primary" /> ເພີ່ມບັນຊີພະນັກງານໃໝ່
              </span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" /> {modalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  |ຊື່ແທ້ / FULL NAME
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <UserCheck className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ທ້າວ ສົມຊາຍ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ອີເມວ / EMAIL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ລະຫັດຜ່ານ / PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (ຢ່າງໜ້ອຍ 6 ຕົວ)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ບົດບາດ / ROLE
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "STAFF")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-extrabold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                >
                  <option value="STAFF">ພະນັກງານ (STAFF)</option>
                  <option value="ADMIN">ຜູ້ດູແລລະບົບ (ADMIN)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="border-t pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl border bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {modalLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "ຕົກລົງ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
