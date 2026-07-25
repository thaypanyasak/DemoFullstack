"use client";

import { useEffect, useState } from "react";
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
import { fetchOrders, updateOrderStatus } from "../api/orders.api";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LAO } from "@/types/order";
import type { Order, OrderStatus } from "@/types/order";
import { formatLAK, formatDateTime } from "@/lib/format";
import { ClipboardList, RefreshCw, Clock, Coffee, CheckCircle, XCircle, Printer, X, Inbox, ListFilter } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TrackerOrder extends Order {
  isConsolidated?: boolean;
  consolidatedIds?: number[];
}

export function OrdersTrackerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  
  // Navigation tabs
  const [viewTab, setViewTab] = useState<"kds" | "takeaway" | "history">("kds");
  // KDS Column tabs for mobile screens
  const [kdsMobileTab, setKdsMobileTab] = useState<"pending" | "preparing" | "served">("pending");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getOrders = async (silent = false, updatedTableNumber?: string) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchOrders();
      
      if (updatedTableNumber && orders.length > 0) {
        // Find matching pending order in current state (old) and fetched data (new)
        const oldOrder = orders.find(
          (o) => o.tableNumber === updatedTableNumber && o.status === "PENDING"
        );
        const newOrder = data.find(
          (o) => o.tableNumber === updatedTableNumber && o.status === "PENDING"
        );

        if (oldOrder && newOrder) {
          const additions: string[] = [];
          newOrder.items.forEach((newItem) => {
            const oldItem = oldOrder.items.find((oi) => oi.productId === newItem.productId);
            const oldQty = oldItem ? oldItem.quantity : 0;
            const diff = newItem.quantity - oldQty;
            if (diff > 0) {
              additions.push(`${newItem.product.name} (+${diff})`);
            }
          });

          if (additions.length > 0) {
            showToast(`ໂຕະ ${updatedTableNumber} ເພີ່ມ: ${additions.join(", ")} 🔔`);
          } else {
            showToast(`ອໍເດີ້ໂຕະ ${updatedTableNumber} ມີການອັບເດດ! 🔔`);
          }
        }
      }

      setOrders(data);
    } catch (err: any) {
      showToast(err.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນອໍເດີ້", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Native double bell chime (offline friendly)
  const playKitchenChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First bell tone
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.45);
      
      // Second higher bell tone after 120ms
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      gain2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.57);
      osc2.start(audioCtx.currentTime + 0.12);
      osc2.stop(audioCtx.currentTime + 0.57);
    } catch (err) {
      console.error("Audio chime playback failed:", err);
    }
  };

  useEffect(() => {
    getOrders();

    // Subscribe to postgres changes in real-time
    const channel = supabase
      .channel("kds-realtime-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Order" },
        () => {
          playKitchenChime();
          showToast("ມີອໍເດີ້ໃໝ່ເຂົ້າມາ! 🔔");
          getOrders(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Order" },
        (payload) => {
          const updatedOrder = payload.new as Order;
          // Play sound and alert if the order is still PENDING (items merged/modified)
          if (updatedOrder && updatedOrder.status === "PENDING") {
            playKitchenChime();
            getOrders(true, updatedOrder.tableNumber);
          } else {
            getOrders(true);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "Order" },
        () => {
          getOrders(true);
        }
      )
      .subscribe();

    // Fallback polling interval every 8 seconds
    const interval = setInterval(() => {
      getOrders(true);
    }, 8000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast("ອັບເດດສະຖານະອໍເດີ້ສໍາເລັດ!");
      getOrders(true);
    } catch (err: any) {
      showToast(err.message || "ອັບເດດສະຖານະລົ້ມεຫຼວ", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTriggerPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Group orders into columns - Sort PENDING & PREPARING by oldest first (ASC)
  const pendingOrders = orders
    .filter((o) => o.status === "PENDING")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const preparingOrders = orders
    .filter((o) => o.status === "PREPARING")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const rawServedOrders = orders.filter((o) => o.status === "SERVED");
  const historyOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

  // Group served orders by table number to print and checkout as a single consolidated bill
  // We do NOT consolidate takeaway orders; each takeaway order is treated as its own group.
  const servedOrdersGroupedByTable: Record<string, Order[]> = {};
  rawServedOrders.forEach((o) => {
    const tableKey = o.diningType === "TAKEAWAY"
      ? `takeaway-${o.id}`
      : o.tableNumber.trim().toLowerCase();

    if (!servedOrdersGroupedByTable[tableKey]) {
      servedOrdersGroupedByTable[tableKey] = [];
    }
    servedOrdersGroupedByTable[tableKey].push(o);
  });

  const consolidatedServedOrders: TrackerOrder[] = Object.entries(servedOrdersGroupedByTable).map(([tableKey, siblingOrders]) => {
    // Sort siblingOrders by ID to keep the earliest order ID as the representative ID
    const sortedSiblings = [...siblingOrders].sort((a, b) => a.id - b.id);
    const primaryOrder = sortedSiblings[0];

    // Merge all items
    const mergedItemsMap: Record<number, any> = {};
    siblingOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (mergedItemsMap[item.productId]) {
          mergedItemsMap[item.productId].quantity += item.quantity;
        } else {
          mergedItemsMap[item.productId] = {
            ...item,
          };
        }
      });
    });

    const mergedItems = Object.values(mergedItemsMap).sort(
      (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
    const totalAmount = siblingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      ...primaryOrder,
      items: mergedItems,
      totalAmount: totalAmount,
      isConsolidated: siblingOrders.length > 1,
      consolidatedIds: siblingOrders.map(o => o.id),
    };
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Render KDS Card Template
  const renderOrderCard = (order: TrackerOrder) => {
    const color = ORDER_STATUS_COLORS[order.status];
    const isTakeaway = order.diningType === "TAKEAWAY";
    return (
      <div
        key={order.id}
        className={`bg-white border rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-200 shrink-0 ${
          isTakeaway ? "border-sky-300 ring-1 ring-sky-300/35" : "border-slate-200"
        }`}
      >
        {/* Card Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isTakeaway ? "bg-sky-50/70" : "bg-slate-50/50"
        }`}>
          <div>
            <span className={`block text-sm font-black mb-1.5 ${
              isTakeaway ? "text-sky-500" : "text-amber-500"
            }`}>
              {order.consolidatedIds && order.consolidatedIds.length > 1
                ? `ຄິວທີ: ${order.consolidatedIds.map((id) => `#${id}`).join(" + ")}`
                : `ຄິວທີ: #${order.id}`}
            </span>
            <h3 className={`text-sm font-extrabold leading-tight flex items-center gap-1.5 ${
              isTakeaway ? "text-sky-800" : "text-slate-800"
            }`}>
              {isTakeaway ? (
                <>
                  <span className="animate-pulse">🛍️</span> ຫໍ່ເມືອບ້ານ (#{order.id})
                </>
              ) : (
                `ໂຕະ ${order.tableNumber}`
              )}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              {isTakeaway && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrintingOrder(order);
                  }}
                  className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer shadow-sm flex items-center justify-center"
                  title="ພິມໃບບິນຄິວ"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>
              )}
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide ${color.bg} ${color.text}`}>
                {ORDER_STATUS_LAO[order.status]}
              </span>
            </div>
            {isTakeaway && (
              <span className="bg-sky-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse self-end">
                TAKEOUT
              </span>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 flex-1 space-y-3">
          <div className="divide-y">
            {[...order.items]
              .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
              .map((item: any) => {
              // Item is new to the order (created at least 10s after order creation)
              const isNewItem =
                order.status === "PENDING" &&
                item.createdAt &&
                new Date(item.createdAt).getTime() > new Date(order.createdAt).getTime() + 10000;

              // Item quantity was increased later (updated at least 10s after order creation, but not a new item)
              const isQuantityIncreased =
                order.status === "PENDING" &&
                !isNewItem &&
                item.updatedAt &&
                new Date(item.updatedAt).getTime() > new Date(order.createdAt).getTime() + 10000;

              const isNewAddition = isNewItem || isQuantityIncreased;

              return (
                <div
                  key={item.id}
                  className={`py-2 px-2 flex items-center justify-between text-xs rounded-xl transition-all duration-300 ${
                    isNewAddition
                      ? "bg-amber-50/80 border border-amber-200/50 shadow-sm scale-[1.01] my-1"
                      : ""
                  }`}
                >
                  <div className="flex-1 pr-2 min-w-0">
                    <div className="font-extrabold text-slate-700 leading-tight flex items-center gap-1.5 flex-wrap">
                      <span>{item.product.name}</span>
                      {isNewItem && (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-1.5 py-0.5 text-[8px] font-black text-orange-600 border border-orange-200 uppercase tracking-wide animate-pulse shrink-0">
                          ເພີ່ມໃໝ່
                        </span>
                      )}
                      {isQuantityIncreased && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-black text-amber-700 border border-amber-200 uppercase tracking-wide animate-pulse shrink-0">
                          ເພີ່ມຈຳນວນ
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatLAK(item.price)}
                    </div>
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs shrink-0 transition-colors ${
                    isNewAddition ? "bg-amber-500 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}>
                    x{item.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-4 border-t bg-slate-50/20 space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-semibold text-[10px]">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(order.createdAt)}
            </span>
            <span className="font-black text-slate-900 text-sm">
              {formatLAK(order.totalAmount)}
            </span>
          </div>

          {/* Status Controls */}
          <div className="flex gap-2">
            {order.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                  disabled={updatingId === order.id}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-amber-500/10 disabled:opacity-50"
                >
                  <Coffee className="h-3.5 w-3.5" /> ເລີ່ມເຮັດ
                </button>
                <button
                  onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                  disabled={updatingId === order.id}
                  className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="ຍົກເລີກອໍເດີ້"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}
            
            {order.status === "PREPARING" && (
              <>
                <button
                  onClick={() => handleUpdateStatus(order.id, "SERVED")}
                  disabled={updatingId === order.id}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-indigo-500/10 disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> ປຸງແຕ່ງສຳເລັດ
                </button>
                <button
                  onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                  disabled={updatingId === order.id}
                  className="rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="ຍົກເລີກອໍເດີ້"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            )}
            
            {order.status === "SERVED" && (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setPrintingOrder(order)}
                  className="flex-1 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Printer className="h-3.5 w-3.5" /> ພິມບິນ
                </button>
                <button
                  onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                  disabled={updatingId === order.id}
                  className="flex-1 rounded-xl bg-green-600 py-2.5 text-xs font-bold text-white hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-green-500/10 disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> ເກັບເງິນສຳເລັດ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                <BreadcrumbPage>ຈັດການອໍເດີ້ປະຈຳໂຕະ</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <button
              onClick={() => getOrders()}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              ໂຫຼດໃໝ່
            </button>
          </div>
        </header>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ຈັດການອໍເດີ້ປະຈຳໂຕະ (KDS Monitor)</h1>
              <p className="text-sm text-muted-foreground mt-1">
                ຕິດຕາມການສັ່ງອາຫານ, ປຸງແຕ່ງ ແລະ ເສີບໃຫ້ລູກຄ້າແຕ່ລະໂຕະດ້ວຍລະບົບແບ່ງສິດຂັ້ນຕອນ
              </p>
            </div>
            
            {/* View Switching Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit self-start sm:self-auto gap-1">
              <button
                onClick={() => setViewTab("kds")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewTab === "kds"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🍽️ ຈັດການໂຕະ KDS
              </button>
              <button
                onClick={() => setViewTab("takeaway")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewTab === "takeaway"
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🛍️ ຫໍ່ເມືອບ້ານ / Takeaway
              </button>
              <button
                onClick={() => setViewTab("history")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewTab === "history"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📜 ປະຫວັດອໍເດີ້
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">ກຳລັງໂຫລດຂໍ້ມູນອໍເດີ້...</p>
            </div>
          ) : viewTab === "kds" ? (
            // ── KDS COLUMN BOARD VIEW ──
            <div className="flex flex-col gap-6 flex-1">
              
              {/* Mobile Column Select Subtabs (Visible only on mobile/tablet) */}
              <div className="flex lg:hidden bg-slate-50 p-1.5 border rounded-xl w-full justify-between gap-1">
                <button
                  onClick={() => setKdsMobileTab("pending")}
                  className={`flex-1 text-center py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    kdsMobileTab === "pending"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ອໍເດີ້ໃໝ່ ({pendingOrders.length})
                </button>
                <button
                  onClick={() => setKdsMobileTab("preparing")}
                  className={`flex-1 text-center py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    kdsMobileTab === "preparing"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ກຳລັງເຮັດ ({preparingOrders.length})
                </button>
                <button
                  onClick={() => setKdsMobileTab("served")}
                  className={`flex-1 text-center py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    kdsMobileTab === "served"
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ເສີບແລ້ວ ({consolidatedServedOrders.length})
                </button>
              </div>

              {/* Three Column Kanban Layout (Responsive: Grid on desktop, Stack/Tab on mobile) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
                
                {/* 1. PENDING COLUMN */}
                <div className={`flex flex-col gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[300px] lg:min-h-[500px] ${
                  kdsMobileTab === "pending" ? "flex" : "hidden lg:flex"
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <h2 className="text-xs font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      ອໍເດີ້ໃໝ່ (New Orders)
                    </h2>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingOrders.length}
                    </span>
                  </div>
                  
                  {pendingOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white border border-dashed rounded-xl flex-1">
                      <Inbox className="h-10 w-10 opacity-15 mb-2" />
                      <p className="text-[11px] font-semibold">ບໍ່ມີອໍເດີ້ລໍຖ້າ</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {pendingOrders.map(renderOrderCard)}
                    </div>
                  )}
                </div>

                {/* 2. PREPARING COLUMN */}
                <div className={`flex flex-col gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[300px] lg:min-h-[500px] ${
                  kdsMobileTab === "preparing" ? "flex" : "hidden lg:flex"
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <h2 className="text-xs font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      ກຳລັງປຸງແຕ່ງ (Cooking)
                    </h2>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {preparingOrders.length}
                    </span>
                  </div>
                  
                  {preparingOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white border border-dashed rounded-xl flex-1">
                      <Inbox className="h-10 w-10 opacity-15 mb-2" />
                      <p className="text-[11px] font-semibold">ບໍ່ມີອາຫານກຳລັງປຸງແຕ່ງ</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {preparingOrders.map(renderOrderCard)}
                    </div>
                  )}
                </div>

                {/* 3. SERVED COLUMN */}
                <div className={`flex flex-col gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[300px] lg:min-h-[500px] ${
                  kdsMobileTab === "served" ? "flex" : "hidden lg:flex"
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 mb-1">
                    <h2 className="text-xs font-black uppercase text-green-600 tracking-wider flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      ເສີບແລ້ວ / ລໍຖ້າເຊັກບິນ (Served)
                    </h2>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {consolidatedServedOrders.length}
                    </span>
                  </div>
                  
                  {consolidatedServedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white border border-dashed rounded-xl flex-1">
                      <Inbox className="h-10 w-10 opacity-15 mb-2" />
                      <p className="text-[11px] font-semibold">ບໍ່ມີອໍເດີ້ລໍຖ້າເຊັກບິນ</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {consolidatedServedOrders.map(renderOrderCard)}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : viewTab === "takeaway" ? (
            // ── TAKEAWAY ORDERS VIEW ──
            <div className="flex flex-col gap-4 flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b pb-4 mb-5">
                  <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    🛍️ ລາຍການອໍເດີ້ຫໍ່ເມືອບ້ານ (Active Takeaway Orders)
                  </h2>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    ທັງໝົດ: {orders.filter(o => o.diningType === "TAKEAWAY" && o.status !== "COMPLETED" && o.status !== "CANCELLED").length} ອໍເດີ້
                  </span>
                </div>

                {orders.filter(o => o.diningType === "TAKEAWAY" && o.status !== "COMPLETED" && o.status !== "CANCELLED").length === 0 ? (
                  <div className="text-center py-24 text-slate-400">
                    <ClipboardList className="h-12 w-12 mx-auto opacity-20 mb-3 text-sky-500 animate-pulse" />
                    <p className="text-xs font-black text-slate-500">ບໍ່ມີລາຍການອໍເດີ້ຫໍ່ເມືອບ້ານໃນເວລານີ້</p>
                    <p className="text-[10px] text-slate-400 mt-1">ເມື່ອມີລູກຄ້າສັ່ງແບບ Takeaway ລະບົບຈະແຈ້ງເຕືອນ ແລະ ປະກົດຢູ່ບ່ອນນີ້</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {orders
                      .filter(o => o.diningType === "TAKEAWAY" && o.status !== "COMPLETED" && o.status !== "CANCELLED")
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map(renderOrderCard)
                    }
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ── HISTORY COMPLETED/CANCELLED VIEW ──
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3 text-left">ເລກອໍເດີ້</th>
                      <th className="px-5 py-3 text-left">ໂຕະ</th>
                      <th className="px-5 py-3 text-left">ເວລາ</th>
                      <th className="px-5 py-3 text-left">ອາຫານ</th>
                      <th className="px-5 py-3 text-right">ຍອດລວມ</th>
                      <th className="px-5 py-3 text-center">ສະຖານະ</th>
                      <th className="px-5 py-3 text-center">ພິມບິນ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {historyOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                          ບໍ່ມີປະຫວັດການສັ່ງຊື້
                        </td>
                      </tr>
                    ) : (
                      historyOrders.map((order) => {
                        const color = ORDER_STATUS_COLORS[order.status];
                        return (
                          <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                              #{order.id}
                            </td>
                            <td className="px-5 py-3 font-bold">
                              ໂຕະ {order.tableNumber}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">
                              {formatDateTime(order.createdAt)}
                            </td>
                            <td className="px-5 py-3 max-w-[250px] truncate font-semibold text-xs">
                              {order.items.map((i) => `${i.product.name} (x${i.quantity})`).join(", ")}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold">
                              {formatLAK(order.totalAmount)}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.bg} ${color.text}`}>
                                {ORDER_STATUS_LAO[order.status]}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => setPrintingOrder(order)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors cursor-pointer flex items-center justify-center mx-auto"
                                title="ພິມບິນ"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* ── Receipt Print Modal ── */}
      {(() => {
        if (!printingOrder) return null;

        // Find all sibling orders of the same table session to show on receipt slip
        // For takeaway orders, we never consolidate. We only print the single selected order.
        const printSessionOrders =
          printingOrder.status === "COMPLETED" ||
          printingOrder.status === "CANCELLED" ||
          printingOrder.diningType === "TAKEAWAY"
            ? [printingOrder]
            : orders.filter(
                (o) =>
                  o.diningType !== "TAKEAWAY" &&
                  o.tableNumber.trim().toLowerCase() === printingOrder.tableNumber.trim().toLowerCase() &&
                  o.status !== "COMPLETED" &&
                  o.status !== "CANCELLED"
              );

        // Group same products and sum their quantities
        const printItemsMap: Record<number, { name: string; quantity: number; price: number }> = {};
        printSessionOrders.forEach((order) => {
          order.items.forEach((item) => {
            if (printItemsMap[item.productId]) {
              printItemsMap[item.productId].quantity += item.quantity;
            } else {
              printItemsMap[item.productId] = {
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
              };
            }
          });
        });
        const printItems = Object.values(printItemsMap);
        const printTotalAmount = printSessionOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const earliestCreatedAt = printSessionOrders.reduce((min, o) => {
          return new Date(o.createdAt).getTime() < new Date(min).getTime() ? o.createdAt : min;
        }, printingOrder.createdAt);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4" id="modal-receipt-container">
            <div className="bg-white border rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header Controls */}
              <div className="flex items-center justify-between border-b p-4 shrink-0 bg-slate-50">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Printer className="h-4 w-4 text-primary" /> ຕົວຢ່າງບິນເກັບເງິນ
                </span>
                <button
                  onClick={() => setPrintingOrder(null)}
                  className="h-7 w-7 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Printable Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
                {/* POS Bill Slip Design */}
                <div
                  id="printable-receipt"
                  className="bg-white text-black p-4 shadow-md w-full max-w-[105mm] text-[10px] border border-slate-200 leading-normal"
                  style={{ fontFamily: "'Noto Sans Lao', sans-serif", fontSize: "9px" }}
                >
                  {/* Store Info */}
                  <div className="text-center space-y-1 mb-2">
                    <h3 className="font-extrabold text-xs uppercase">ຮ້ານອາຫານ ແສນສະບາຍ</h3>
                    <p className="text-[9px] text-slate-600">ຖະໜົນລ້ານຊ້າງ, ວຽງຈັນ</p>
                    <p className="text-[9px] text-slate-600">Tel: 020 5555 9999</p>
                    <div className="border-b border-dashed border-black/30 my-1.5" />
                    <h4 className="font-bold text-[10px] tracking-widest mt-0.5">ບິນເກັບເງິນ / RECEIPT</h4>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-[9px] mb-2">
                    {printingOrder.diningType === "TAKEAWAY" ? (
                      <div className="bg-sky-50 border border-sky-100 p-2.5 rounded-lg text-center space-y-1 mb-2">
                        <span className="text-[10px] font-black text-sky-800 uppercase block tracking-wider">ຫໍ່ເມືອບ້ານ / TAKEAWAY</span>
                        <h2 className="text-xl font-black text-sky-950 font-mono tracking-wide">ຄິວທີ: {printingOrder.id}</h2>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>ເລກໂຕະ / Table:</span>
                        <span className="font-bold">ໂຕະ {printingOrder.tableNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>ເລກອໍເດີ້ / Bill No:</span>
                      <span>
                        {printSessionOrders.length === 1 ? `#${printingOrder.id}` : printSessionOrders.map((o) => `#${o.id}`).join("+")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ວັນທີ / Date:</span>
                      <span>
                        {formatDateTime(earliestCreatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-black/30 my-1.5" />

                  {/* Bill Items Header */}
                  <div className="grid grid-cols-12 font-bold text-slate-700 mb-1">
                    <span className="col-span-6">ລາຍການ / Item</span>
                    <span className="col-span-2 text-center">ຈຳນວນ / Qty</span>
                    <span className="col-span-4 text-right">ລາຄາ / Amt</span>
                  </div>

                  {/* Bill Items List */}
                  <div className="space-y-1.5 my-1">
                    {printItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-slate-800 text-[9px]">
                        <span className="col-span-6">{item.name}</span>
                        <span className="col-span-2 text-center font-mono">{item.quantity}</span>
                        <span className="col-span-4 text-right font-mono">{formatLAK(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-b border-dashed border-black/30 my-2" />

                  {/* Billing Summary */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between font-extrabold text-slate-900 text-xs">
                      <span>ຍອດລວມທັງໝົດ / TOTAL:</span>
                      <span className="font-mono">{formatLAK(printTotalAmount)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-black/30 my-2" />

                  {/* Thanks footer */}
                  <div className="text-center text-[8px] text-slate-500 space-y-0.5 mt-2">
                    <p className="font-bold">ຂອບໃຈທີ່ມາອຸດໜູນ / THANK YOU</p>
                    <p>ກະລຸນາກວດສອບເງິນທອນກ່ອນອອກຈາກຮ້ານ</p>
                  </div>
                </div>
              </div>

              {/* Print Action Footer */}
              <div className="border-t p-4 shrink-0 bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="flex-1 rounded-xl border bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> ພິມບິນ
                </button>
              </div>
            </div>

            {/* Centering receipt preview styles */}
            <style dangerouslySetInnerHTML={{ __html: `
              @page { size: auto; margin: 10mm; }
              @media print {
                body { background: white !important; margin: 0 !important; padding: 0 !important; }
                body * { visibility: hidden !important; }
                #printable-receipt, #printable-receipt * { visibility: visible !important; }
                #printable-receipt {
                  position: absolute !important;
                  left: 50% !important; top: 0 !important;
                  transform: translateX(-50%) !important;
                  width: 100% !important; max-width: 58mm !important;
                  margin: 0 !important; padding: 4px !important;
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}} />
          </div>
        );
      })()}
    </SidebarProvider>
  );
}
