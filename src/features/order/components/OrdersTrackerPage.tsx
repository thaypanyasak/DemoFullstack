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
import { ClipboardList, RefreshCw, Clock, Coffee, CheckCircle, XCircle, Printer, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function OrdersTrackerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: any) {
      showToast(err.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນອໍເດີ້", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      getOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast("ອັບເດດສະຖານະອໍເດີ້ສໍາເລັດ!");
      getOrders(true);
    } catch (err: any) {
      showToast(err.message || "ອັບເດດສະຖານະລົ້ມເຫຼວ", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTriggerPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Group active orders vs completed/cancelled
  const activeOrders = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");
  const historyOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

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
                <BreadcrumbPage>ຈັດການອໍເດີ້</BreadcrumbPage>
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ຈັດການອໍເດີ້ປະຈຳໂຕະ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ຕິດຕາມການສັ່ງອາຫານ, ປຸງແຕ່ງ ແລະ ເສີບໃຫ້ລູກຄ້າແຕ່ລະໂຕະ
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">ກຳລັງໂຫລດຂໍ້ມູນອໍເດີ້...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Orders Grid */}
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeOrders.length}
                  </span>
                  ອໍເດີ້ທີ່ກຳລັງດຳເນີນການ
                </h2>

                {activeOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-background rounded-xl border border-dashed">
                    <ClipboardList className="h-12 w-12 opacity-30 mb-2" />
                    <p className="text-sm font-medium">ບໍ່ມີອໍເດີ້ທີ່ກຳລັງລໍຖ້າໃນເວລານີ້</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeOrders.map((order) => {
                      const color = ORDER_STATUS_COLORS[order.status];
                      return (
                        <div
                          key={order.id}
                          className="bg-background border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                          {/* Card Header */}
                          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-muted-foreground">ອໍເດີ້ #{order.id}</span>
                              <h3 className="text-base font-extrabold text-slate-800">
                                ໂຕະ {order.tableNumber}
                              </h3>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.bg} ${color.text}`}>
                              {ORDER_STATUS_LAO[order.status]}
                            </span>
                          </div>

                          {/* Items List */}
                          <div className="p-4 flex-1 space-y-3">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              ລາຍການອາຫານ
                            </div>
                            <div className="divide-y max-h-[200px] overflow-y-auto pr-1">
                              {order.items.map((item) => (
                                <div key={item.id} className="py-2 flex items-center justify-between text-sm">
                                  <div className="flex-1 pr-2">
                                    <div className="font-medium text-slate-800">{item.product.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatLAK(item.price)}
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-slate-600 bg-muted px-2 py-0.5 rounded-md">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="p-4 border-t bg-slate-50/30 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDateTime(order.createdAt)}
                              </span>
                              <span className="font-extrabold text-slate-900">
                                {formatLAK(order.totalAmount)}
                              </span>
                            </div>

                            {/* Status controls */}
                            <div className="flex gap-2">
                              {order.status === "PENDING" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                                  disabled={updatingId === order.id}
                                  className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-white hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Coffee className="h-3.5 w-3.5" /> ເລີ່ມປຸງແຕ່ງ
                                </button>
                              )}
                              {order.status === "PREPARING" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "SERVED")}
                                  disabled={updatingId === order.id}
                                  className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" /> ເສີບອາຫານ
                                </button>
                              )}
                              
                              {order.status === "SERVED" && (
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={() => setPrintingOrder(order)}
                                    className="flex-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <Printer className="h-3.5 w-3.5" /> ພິມບິນ
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                                    disabled={updatingId === order.id}
                                    className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-bold text-white hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" /> ສຳເລັດ / ເກັບເງິນ
                                  </button>
                                </div>
                              )}
                              
                              {order.status !== "SERVED" && order.status !== "COMPLETED" && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                  disabled={updatingId === order.id}
                                  className="rounded-lg border border-red-200 text-red-600 hover:bg-red-50 p-2 transition-colors cursor-pointer"
                                  title="ຍົກເລີກອໍເດີ້"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* History Orders */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-muted-foreground">ປະຫວັດອໍເດີ້</h2>
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
                          <th className="px-5 py-3 text-center">...</th>
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
                                <td className="px-5 py-3 max-w-[250px] truncate">
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
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* ── Receipt Print Modal ── */}
      {printingOrder && (
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
                  <div className="flex justify-between">
                    <span>ເລກໂຕະ / Table:</span>
                    <span className="font-bold">ໂຕະ {printingOrder.tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ເລກອໍເດີ້ / Bill No:</span>
                    <span>#{printingOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ວັນທີ / Date:</span>
                    <span>
                      {formatDateTime(printingOrder.createdAt)}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-black/30 my-1.5" />
                </div>

                {/* Items */}
                <div className="space-y-2 mb-2">
                  {printingOrder.items.map((item) => (
                    <div key={item.id} className="text-[9px]">
                      <div className="flex justify-between font-bold">
                        <span className="truncate max-w-[75%]">{item.product.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>@ {formatLAK(item.price)}</span>
                        <span>{formatLAK(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-b border-dashed border-black/30 my-1.5 pt-0.5" />
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-[10px] mb-4">
                  <div className="flex justify-between font-extrabold text-xs border-t border-dashed pt-1.5">
                    <span>ຍອດລວມ / TOTAL:</span>
                    <span>{formatLAK(printingOrder.totalAmount)}</span>
                  </div>
                  <div className="border-b border-dashed border-black/30 my-1.5" />
                </div>

                {/* Message */}
                <div className="text-center text-[9px] space-y-0.5 mt-2">
                  <p className="font-bold">ຂໍຂອບໃຈທີ່ມາອຸດໜູນ</p>
                  <p className="uppercase">Thank you & see you again</p>
                  <p className="text-[8px] text-slate-400 pt-1">Powered by Antigravity POS</p>
                </div>
              </div>
            </div>

            {/* Print trigger footer controls */}
            <div className="border-t p-4 shrink-0 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="flex-1 rounded-xl border bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleTriggerPrint}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" /> ພິມບິນເກັບເງິນ
              </button>
            </div>
          </div>

          {/* Inline styles for media printing to target #printable-receipt only */}
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;700&display=swap');
            @page {
              size: auto;
              margin: 10mm;
            }
            @media print {
              body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-receipt, #printable-receipt * {
                visibility: visible !important;
                font-family: 'Noto Sans Lao', sans-serif !important;
              }
              #printable-receipt {
                position: absolute !important;
                left: 50% !important;
                top: 0 !important;
                transform: translateX(-50%) !important;
                width: 100% !important;
                max-width: 105mm !important;
                margin: 0 !important;
                padding: 10px !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                color: black !important;
              }
            }
          `}} />
        </div>
      )}
    </SidebarProvider>
  );
}
