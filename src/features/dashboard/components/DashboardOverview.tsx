"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  UtensilsCrossed,
  ClipboardCheck,
  Store,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import { formatLAK } from "@/lib/format";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LAO, OrderStatus } from "@/types/order";

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  totalProducts: number;
  activeTablesCount: number;
  recentOrders: {
    id: string;
    table: string;
    items: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  topDishes: {
    name: string;
    sold: number;
    revenue: number;
    progress: number;
  }[];
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to load dashboard statistics");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">ກຳລັງໂຫລດຂໍ້ມູນສະຖິຕິ...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const stats = [
    {
      title: "ລາຍໄດ້ມື້ນີ້",
      value: formatLAK(data?.todayRevenue || 0),
      change: "ອັບເດດສົດ",
      up: true,
      desc: "ຈາກອໍເດີ້ທີ່ຊຳລະແລ້ວ",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "ລາຍການອາຫານໃນເມນູ",
      value: `${data?.totalProducts || 0} ລາຍການ`,
      change: "ຄົງທີ່",
      up: true,
      desc: "ພ້ອມໃຫ້ບໍລິການລູກຄ້າ",
      icon: UtensilsCrossed,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "ອໍເດີ້ມື້ນີ້",
      value: `${data?.todayOrders || 0} ອໍເດີ້`,
      change: "ອັບເດດສົດ",
      up: true,
      desc: "ທັງໝົດທີ່ສັ່ງໃນມື້ນີ້",
      icon: ClipboardCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "ໂຕະອາຫານທີ່ກຳລັງນັ່ງ",
      value: `${data?.activeTablesCount || 0} ໂຕະ`,
      change: "ກຳລັງກິນ",
      up: true,
      desc: "ມີອໍເດີ້ທີ່ຍັງບໍ່ທັນປິດບິນ",
      icon: Store,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

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
              <BreadcrumbItem>
                <BreadcrumbPage>ໜ້າຫຼັກ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ພາບລວມລະບົບຮ້ານອາຫານ</h1>
              <p className="text-sm text-muted-foreground mt-1">ຍິນດີຕ້ອນຮັບກັບລະບົບສັ່ງອາຫານ ແລະ ຈັດການຮ້ານອາຫານ Pro</p>
            </div>
            <button
              onClick={() => fetchStats()}
              className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              ♻️ ໂຫຼດຄືນໃໝ່
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <span className="text-emerald-600 font-semibold">
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">{stat.desc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Revenue Chart (UI Only) */}
            <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">ຍອດຂາຍປະຈຳອາທິດ</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">ຍອດຂາຍລວມ ແລະ ຄ່າວັດຖຸດິບ</p>
                </div>
                <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                ອາທິດນີ້
                </button>
              </div>
              {/* Fake Bar Chart */}
              <div className="flex items-end gap-2 h-40 px-2">
                {[
                  { month: "ຈັນ", revenue: 65, cost: 40 },
                  { month: "ອັງຄານ", revenue: 78, cost: 52 },
                  { month: "ພຸດ", revenue: 55, cost: 35 },
                  { month: "ພະຫັດ", revenue: 90, cost: 60 },
                  { month: "ສຸກ", revenue: 72, cost: 45 },
                  { month: "ເສົາ", revenue: 98, cost: 58 },
                  { month: "ອາທິດ", revenue: 110, cost: 65 },
                ].map((d) => (
                  <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end gap-0.5 justify-center" style={{ height: "120px" }}>
                      <div className="w-4 rounded-t-md bg-primary/80 transition-all hover:bg-primary" style={{ height: `${d.revenue}%` }} />
                      <div className="w-4 rounded-t-md bg-muted transition-all hover:bg-muted-foreground/30" style={{ height: `${d.cost}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary/80" />ຍອດຂາຍອາຫານ</div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-muted" />ຄ່າວັດຖຸດິບ</div>
              </div>
            </div>

            {/* Top Products */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">ເມນູອາຫານຂາຍດີ</h3>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {!data?.topDishes || data.topDishes.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    ບໍ່ມີຂໍ້ມູນເມນູອາຫານຂາຍດີ
                  </div>
                ) : (
                  data.topDishes.map((product, index) => (
                    <div key={product.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="font-medium truncate max-w-[120px]" title={product.name}>
                            {product.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{product.sold} ຈານ</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${product.progress}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold text-slate-800">ລາຍການອໍເດີ້ຫຼ້າສຸດ</h3>
                <p className="text-xs text-muted-foreground mt-0.5">5 ລາຍການສັ່ງອາຫານຫຼ້າສຸດ</p>
              </div>
              <a href="/dashboard/orders" className="text-xs font-medium text-primary hover:underline">ເບິ່ງ ແລະ ຈັດການອໍເດີ້ທັງໝົດ →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left">ເລກອໍເດີ້</th>
                    <th className="px-5 py-3 text-left">ໂຕະ</th>
                    <th className="px-5 py-3 text-left">ລາຍການອາຫານທີ່ສັ່ງ</th>
                    <th className="px-5 py-3 text-right">ຍອດລວມ</th>
                    <th className="px-5 py-3 text-center">ສະຖານະອໍເດີ້</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {!data?.recentOrders || data.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                        ບໍ່ມີລາຍການອໍເດີ້ໃໝ່ໃນເວລານີ້
                      </td>
                    </tr>
                  ) : (
                    data.recentOrders.map((order) => {
                      const color = ORDER_STATUS_COLORS[order.status as OrderStatus] || { bg: "bg-slate-100", text: "text-slate-700" };
                      return (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                          <td className="px-5 py-3 font-bold">{order.table}</td>
                          <td className="px-5 py-3 text-slate-600 max-w-[300px] truncate" title={order.items}>
                            {order.items}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-900">
                            {formatLAK(order.amount)}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.bg} ${color.text}`}>
                              {ORDER_STATUS_LAO[order.status as OrderStatus] || order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
