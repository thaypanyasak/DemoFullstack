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
import { QrCode, Printer, ExternalLink, X, Plus, Trash2, LayoutGrid, Eye } from "lucide-react";
import { formatLAK } from "@/lib/format";

type Table = {
  id: number;
  name: string;
  status: "VACANT" | "OCCUPIED";
  activeOrder?: {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    itemsCount: number;
  } | null;
};

export function TablesPage() {
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableName, setNewTableName] = useState("");
  const [addError, setAddError] = useState("");
  const [printingTables, setPrintingTables] = useState<Table[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTables = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/tables");
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      } else {
        showToast("ບໍ່ສາມາດດຶງຂໍ້ມູນໂຕະໄດ້", "error");
      }
    } catch {
      showToast("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ", "error");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchTables(true);

    // Auto-polling every 5 seconds for live restaurant seating floor status
    const interval = setInterval(() => {
      fetchTables(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddTable = async () => {
    const trimmed = newTableName.trim();
    if (!trimmed) {
      setAddError("ກະລຸນາໃສ່ຊື່ໂຕະ");
      return;
    }

    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.ok) {
        setNewTableName("");
        setAddError("");
        showToast(`ເພີ່ມ ໂຕະ ${trimmed} ສຳເລັດ!`);
        fetchTables(false);
      } else {
        const err = await res.json();
        setAddError(err.error || "ເພີ່ມໂຕະບໍ່ສຳເລັດ");
      }
    } catch {
      showToast("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ", "error");
    }
  };

  const handleDeleteTable = async (id: number, name: string) => {
    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ ໂຕະ ${name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`ລຶບ ໂຕະ ${name} ສຳເລັດ!`);
        fetchTables(false);
      } else {
        const err = await res.json();
        showToast(err.error || "ລຶບໂຕະບໍ່ສຳເລັດ", "error");
      }
    } catch {
      showToast("ການເຊື່ອມຕໍ່ກັບເຊີເວີຂັດຂ້ອງ", "error");
    }
  };

  const handlePrintSingle = (table: Table) => {
    setPrintingTables([table]);
    setIsPrintModalOpen(true);
  };

  const handlePrintAll = () => {
    setPrintingTables(tables);
    setIsPrintModalOpen(true);
  };

  const triggerBrowserPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getQrUrl = (tableName: string) =>
    `${origin}/?table=${encodeURIComponent(tableName)}`;

  const getQrImageUrl = (tableName: string, size = 200) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      getQrUrl(tableName)
    )}`;

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
                <BreadcrumbPage>ຈັດການໂຕະ & QR Code (Live Seating)</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handlePrintAll}
              disabled={tables.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Printer className="h-4 w-4" /> ພິມ QR ທັງໝົດ
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
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" /> ແຜນຜັງໂຕະອາຫານ & QR Code (Realtime Floor)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ຈັດການໂຕະ, ພິມ QR Code ແລະ ຕິດຕາມສະຖານະແຂກນັ່ງ ກິນອາຫານຢູ່ແຕ່ລະໂຕະແບບທັນເວລາ
            </p>
          </div>

          {/* Add Table form */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> ເພີ່ມໂຕະໃໝ່
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <div className="flex-1 space-y-1.5 w-full">
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => {
                    setNewTableName(e.target.value);
                    setAddError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
                  placeholder="ຊື່ໂຕະ (ຕົວຢ່າງ: 13, VIP-01, ກາເຟ...)"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    addError ? "border-red-400 bg-red-50" : "border-slate-200"
                  }`}
                />
                {addError && (
                  <p className="text-xs text-red-600 font-medium">{addError}</p>
                )}
              </div>
              <button
                onClick={handleAddTable}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> ເພີ່ມໂຕະ
              </button>
            </div>
          </div>

          {/* Table stats & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground bg-slate-50 border rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {tables.length}
              </span>
              <span>ໂຕະທັງໝົດ</span>
            </div>
            
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <span>ໂຕະວ່າງ ({tables.filter(t => t.status === "VACANT").length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span>ມີແຂກນັ່ງ ({tables.filter(t => t.status === "OCCUPIED").length})</span>
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">ກຳລັງໂຫລດຂໍ້ມູນແຜນຜັງໂຕະ...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-background rounded-xl border border-dashed">
              <LayoutGrid className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm font-medium">ຍັງບໍ່ທັນມີໂຕະ ກົດ "ເພີ່ມໂຕະ" ໄດ້ທັນທີ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tables.map((table) => {
                const orderUrl = getQrUrl(table.name);
                const qrImg = getQrImageUrl(table.name, 200);
                const isOccupied = table.status === "OCCUPIED";

                return (
                  <div
                    key={table.id}
                    className={`border rounded-2xl p-4 shadow-sm flex flex-col items-center text-center gap-3 transition-all relative group ${
                      isOccupied 
                        ? "bg-amber-500/5 border-amber-300 shadow-amber-100" 
                        : "bg-white border-slate-200 hover:shadow-md"
                    }`}
                  >
                    {/* Status pulse lamps */}
                    <div className="absolute top-3.5 right-3">
                      {isOccupied ? (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                      ) : (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Table header */}
                    <div className="w-full flex items-start justify-between">
                      <div className="text-left">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Table</span>
                        <h3 className="text-base font-extrabold text-slate-800 leading-tight">{table.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDeleteTable(table.id, table.name)}
                        className="h-7 w-7 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="ລຶບໂຕະ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* QR Preview */}
                    <div className="h-24 w-24 rounded-xl border border-slate-100 bg-white flex items-center justify-center p-2 overflow-hidden shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrImg} alt={`QR ${table.name}`} className="h-full w-full object-contain" />
                    </div>

                    {/* Table Dynamic Status Details */}
                    <div className="w-full py-1.5 px-2 bg-slate-50 border rounded-xl flex flex-col items-center justify-center min-h-[46px]">
                      {isOccupied && table.activeOrder ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-orange-600 block uppercase tracking-wide">
                            ມີແຂກນັ່ງ (Occupied)
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {formatLAK(table.activeOrder.totalAmount)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-green-600 block uppercase tracking-wide">
                          ໂຕະວ່າງ (Available)
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-1.5 mt-1">
                      {isOccupied && table.activeOrder ? (
                        <a
                          href="/dashboard/orders"
                          className="w-full rounded-xl bg-orange-600 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10"
                        >
                          <Eye className="h-3 w-3" /> ເບິ່ງອໍເດີ້
                        </a>
                      ) : (
                        <button
                          onClick={() => handlePrintSingle(table)}
                          className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="h-3 w-3" /> ພິມ QR
                        </button>
                      )}
                      
                      <a
                        href={orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full rounded-xl border py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ທົດລອງ <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SidebarInset>

      {/* ── QR Card Printing Modal ── */}
      {isPrintModalOpen && printingTables.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          id="modal-qr-container"
        >
          <div className="bg-white border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 shrink-0 bg-slate-50">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-primary" />
                {printingTables.length === 1
                  ? `ພິມ QR ໂຕະ ${printingTables[0].name}`
                  : `ພິມ QR ທັງໝົດ (${printingTables.length} ໂຕະ)`}
              </span>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex flex-col items-center gap-6">
              <p className="text-xs text-muted-foreground text-center">
                ກວດສອບ QR Card ກ່ອນ ແລ້ວກົດ "ພິມ"
              </p>
              <div
                id="printable-qr-container"
                className="flex flex-col gap-8 w-full max-w-[320px] bg-transparent"
              >
                {printingTables.map((table) => {
                  const qrImg = getQrImageUrl(table.name, 260);
                  return (
                    <div
                      key={table.id}
                      className="printable-qr-card bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-md flex flex-col items-center justify-center text-center gap-4 w-full mx-auto"
                    >
                      {/* Restaurant name */}
                      <div className="space-y-1">
                        <h2 className="font-black text-slate-900 text-base uppercase tracking-wide">
                          ຮ້ານອາຫານ ແສນສະບາຍ
                        </h2>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto" />
                      </div>

                      {/* Instructions */}
                      <div>
                        <p className="text-[10px] font-extrabold text-orange-600 tracking-wide uppercase">
                          ສະແກນສັ່ງອາຫານຢູ່ໂຕະນີ້
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold">SCAN TO ORDER</p>
                      </div>

                      {/* QR Code */}
                      <div className="h-36 w-36 rounded-2xl border-2 border-slate-100 bg-white flex items-center justify-center p-2.5 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrImg} alt={`QR Table ${table.name}`} className="h-full w-full object-contain" />
                      </div>

                      {/* Table badge */}
                      <div className="bg-slate-950 text-white rounded-2xl px-8 py-2 shadow-md">
                        <span className="text-[8px] font-bold tracking-widest text-amber-400 block">TABLE</span>
                        <span className="text-lg font-black tracking-widest">{table.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t p-4 shrink-0 bg-slate-50 flex gap-3">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="flex-1 rounded-xl border bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={triggerBrowserPrint}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" /> ພິມ
              </button>
            </div>
          </div>

          {/* Print CSS */}
          <style dangerouslySetInnerHTML={{ __html: `
            @page { size: auto; margin: 10mm; }
            @media print {
              body { background: white !important; margin: 0 !important; padding: 0 !important; }
              body * { visibility: hidden !important; }
              #printable-qr-container, #printable-qr-container * { visibility: visible !important; }
              #printable-qr-container {
                position: absolute !important;
                left: 50% !important; top: 0 !important;
                transform: translateX(-50%) !important;
                width: 100% !important; max-width: 280px !important;
                margin: 0 !important; padding: 0 !important;
                background: transparent !important;
              }
              .printable-qr-card {
                border: 2px solid #e2e8f0 !important;
                border-radius: 24px !important; padding: 24px !important;
                background: white !important; color: black !important;
                box-shadow: none !important; width: 280px !important; height: 390px !important;
                margin: 20px auto !important; page-break-after: always !important;
                display: flex !important; flex-direction: column !important;
                align-items: center !important; justify-content: center !important;
              }
            }
          `}} />
        </div>
      )}
    </SidebarProvider>
  );
}
