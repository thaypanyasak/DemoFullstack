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
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import { formatLAK, formatLAKShort } from "@/lib/format";

const stats = [
  {
    title: "ລາຍໄດ້ທັງໝົດ",
    value: formatLAKShort(926_250_000),
    change: "+20.1%",
    up: true,
    desc: "ທຽບກັບເດືອນກ່ອນ",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "ສິນຄ້າ",
    value: "128",
    change: "+12",
    up: true,
    desc: "ເພີ່ມໃໝ່ເດືອນນີ້",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "ຄໍາສັ່ງຊື້",
    value: "573",
    change: "+8.2%",
    up: true,
    desc: "ທຽບກັບເດືອນກ່ອນ",
    icon: ShoppingCart,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "ລູກຄ້າ",
    value: "2,350",
    change: "-3.1%",
    up: false,
    desc: "ທຽບກັບເດືອນກ່ອນ",
    icon: Users,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const recentOrders = [
  { id: "#ORD-001", customer: "ສົມຈິດ ວົງໄຊ", product: "iPhone 15 Pro", amount: formatLAK(20_479_500), status: "ສໍາເລັດ", statusColor: "bg-green-100 text-green-700" },
  { id: "#ORD-002", customer: "ນາງ ບຸນມີ", product: "Samsung Galaxy S24", amount: formatLAK(16_359_500), status: "ກໍາລັງສົ່ງ", statusColor: "bg-blue-100 text-blue-700" },
  { id: "#ORD-003", customer: "ທ້າວ ພັນດີ", product: "Nike Air Max 270", amount: formatLAK(3_072_000), status: "ລໍຖ້າ", statusColor: "bg-amber-100 text-amber-700" },
  { id: "#ORD-004", customer: "ນາງ ດາລາ", product: "Sony WH-1000XM5", amount: formatLAK(7_147_500), status: "ສໍາເລັດ", statusColor: "bg-green-100 text-green-700" },
  { id: "#ORD-005", customer: "ທ້າວ ສີທອນ", product: "MacBook Air M3", amount: formatLAK(26_620_000), status: "ຍົກເລີກ", statusColor: "bg-red-100 text-red-700" },
];

const topProducts = [
  { name: "iPhone 15 Pro", sold: 128, revenue: formatLAKShort(2_621_376_000), progress: 90 },
  { name: "Samsung Galaxy S24", sold: 94, revenue: formatLAKShort(1_537_771_000), progress: 66 },
  { name: "MacBook Air M3", sold: 61, revenue: formatLAKShort(1_623_399_000), progress: 43 },
  { name: "Sony WH-1000XM5", sold: 49, revenue: formatLAKShort(350_571_500), progress: 35 },
  { name: "Nike Air Max 270", sold: 38, revenue: formatLAKShort(116_736_000), progress: 27 },
];

export function DashboardOverview() {
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ພາບລວມລະບົບ</h1>
            <p className="text-sm text-muted-foreground mt-1">ຍິນດີຕ້ອນຮັບກັບລະບົບຄຸ້ມຄອງສາງສິນຄ້າ</p>
          </div>

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
                  <p className="text-2xl font-extrabold">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {stat.up ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={stat.up ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
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
                  <h3 className="font-semibold">ລາຍໄດ້ 6 ເດືອນຜ່ານມາ</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">ລາຍໄດ້ລວມ ແລະ ຄ່າໃຊ້ຈ່າຍ</p>
                </div>
                <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                  ເດືອນນີ້
                </button>
              </div>
              {/* Fake Bar Chart */}
              <div className="flex items-end gap-2 h-40 px-2">
                {[
                  { month: "ມ.ກ", revenue: 65, cost: 40 },
                  { month: "ກ.ພ", revenue: 78, cost: 52 },
                  { month: "ມີ.ນ", revenue: 55, cost: 35 },
                  { month: "ເມ.ສ", revenue: 90, cost: 60 },
                  { month: "ພ.ພ", revenue: 72, cost: 45 },
                  { month: "ມິ.ຖ", revenue: 95, cost: 58 },
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
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary/80" />ລາຍໄດ້</div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-muted" />ຄ່າໃຊ້ຈ່າຍ</div>
              </div>
            </div>

            {/* Top Products */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">ສິນຄ້າຂາຍດີ</h3>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="font-medium truncate max-w-[120px]">{product.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{product.sold} ອັນ</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${product.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold">ຄໍາສັ່ງຊື້ຫຼ້າສຸດ</h3>
                <p className="text-xs text-muted-foreground mt-0.5">5 ລາຍການລ່າສຸດ</p>
              </div>
              <a href="#" className="text-xs font-medium text-primary hover:underline">ເບິ່ງທັງໝົດ →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left">ເລກທີ</th>
                    <th className="px-5 py-3 text-left">ລູກຄ້າ</th>
                    <th className="px-5 py-3 text-left">ສິນຄ້າ</th>
                    <th className="px-5 py-3 text-right">ຈໍານວນ</th>
                    <th className="px-5 py-3 text-center">ສະຖານະ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{order.id}</td>
                      <td className="px-5 py-3 font-medium">{order.customer}</td>
                      <td className="px-5 py-3 text-muted-foreground">{order.product}</td>
                      <td className="px-5 py-3 text-right font-semibold">{order.amount}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
