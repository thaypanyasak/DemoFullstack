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
import { QrCode, Printer, ExternalLink, X, Plus, Trash2, LayoutGrid } from "lucide-react";

type Table = {
  id: string;
  name: string; // display label e.g. "VIP-01" or "01"
};

const LOCAL_STORAGE_KEY = "restaurant_tables";

const defaultTables: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: `table-${String(i + 1).padStart(2, "0")}`,
  name: String(i + 1).padStart(2, "0"),
}));

export default function TablesQRPage() {
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [tables, setTables] = useState<Table[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [addError, setAddError] = useState("");
  const [printingTables, setPrintingTables] = useState<Table[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setTables(JSON.parse(stored));
        } catch {
          setTables(defaultTables);
        }
      } else {
        setTables(defaultTables);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultTables));
      }
    }
  }, []);

  const persistTables = (updated: Table[]) => {
    setTables(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddTable = () => {
    const trimmed = newTableName.trim();
    if (!trimmed) {
      setAddError("ກະລຸນາໃສ່ຊື່ໂຕະ");
      return;
    }
    if (tables.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setAddError(`ໂຕະ "${trimmed}" ມີຢູ່ແລ້ວ`);
      return;
    }
    const newTable: Table = {
      id: `table-${Date.now()}`,
      name: trimmed,
    };
    persistTables([...tables, newTable]);
    setNewTableName("");
    setAddError("");
    showToast(`ເພີ່ມ ໂຕະ ${trimmed} ສຳເລັດ!`);
  };

  const handleDeleteTable = (id: string, name: string) => {
    persistTables(tables.filter((t) => t.id !== id));
    showToast(`ລຶບ ໂຕະ ${name} ສຳເລັດ!`);
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
                <BreadcrumbPage>ຈັດການໂຕະ & QR Code</BreadcrumbPage>
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
              <LayoutGrid className="h-6 w-6 text-primary" /> ຈັດການໂຕະ & QR Code
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ເພີ່ມ/ລຶບໂຕະ ແລະ ພິມ QR Code ສຳລັບຕິດໃສ່ໂຕະ ເພື່ອໃຫ້ລູກຄ້າສະແກນສັ່ງອາຫານ
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

          {/* Table stats */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {tables.length}
            </span>
            <span>ໂຕະທັງໝົດ</span>
          </div>

          {/* Tables Grid */}
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-background rounded-xl border border-dashed">
              <LayoutGrid className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm font-medium">ຍັງບໍ່ທັນມີໂຕະ ກົດ "ເພີ່ມໂຕະ" ໄດ້ທັນທີ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tables.map((table) => {
                const orderUrl = getQrUrl(table.name);
                const qrImg = getQrImageUrl(table.name, 200);

                return (
                  <div
                    key={table.id}
                    className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow group"
                  >
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
                    <div className="h-24 w-24 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center p-2 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrImg} alt={`QR ${table.name}`} className="h-full w-full object-contain" />
                    </div>

                    {/* Link snippet */}
                    <p className="text-[9px] text-slate-400 font-mono truncate max-w-full px-1 bg-slate-50 rounded-md py-1 border w-full">
                      ?table={table.name}
                    </p>

                    {/* Actions */}
                    <div className="w-full space-y-1.5">
                      <button
                        onClick={() => handlePrintSingle(table)}
                        className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="h-3 w-3" /> ພິມ QR
                      </button>
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
