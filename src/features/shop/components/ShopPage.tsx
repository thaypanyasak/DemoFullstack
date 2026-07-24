"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Search, Package, ArrowRight, Eye, ShoppingCart, Clock, Utensils, CheckCircle2, ChevronRight, Plus, Minus, X, Trash2 } from "lucide-react";
import { formatLAK } from "@/lib/format";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { Order } from "@/types/order";
import { createOrder } from "@/features/order/api/orders.api";
import { fetchCategories } from "@/features/category/api/categories.api";
import { supabase } from "@/lib/supabase";

// Helper to assign cute food emojis based on category name
function getCategoryEmoji(name: string, nameLao: string): string {
  const lower = (name + " " + nameLao).toLowerCase();
  if (lower.includes("food") || lower.includes("ອາຫານ")) return "🍜";
  if (lower.includes("drink") || lower.includes("ເຄື່ອງດື່ມ") || lower.includes("ເບຍ")) return "🍹";
  if (lower.includes("dessert") || lower.includes("ຂອງຫວານ") || lower.includes("ເຄັກ")) return "🍰";
  if (lower.includes("snack") || lower.includes("ອາຫານວ່າງ") || lower.includes("ຂອງກິນຫຼິ້ນ")) return "🍟";
  if (lower.includes("soup") || lower.includes("ແກງ") || lower.includes("ຕົ້ມ")) return "🍲";
  return "🍽️";
}

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Table info
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  
  // Shopping Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Active orders tracking for this table
  const [activeTableOrders, setActiveTableOrders] = useState<Order[]>([]);

  // View details modal
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Detect Table Number and Fetch Categories on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const table = params.get("table");
      if (table) {
        setTableNumber(table);
      } else {
        setIsTableModalOpen(true);
      }
    }
    
    // Fetch Categories
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // 2. Fetch active orders for this table to track status
  const fetchActiveOrders = async () => {
    if (!tableNumber) return;
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const allOrders: Order[] = await res.json();
        const filtered = allOrders.filter(
          (o) => o.tableNumber === tableNumber && o.status !== "COMPLETED" && o.status !== "CANCELLED"
        );
        setActiveTableOrders(filtered);
      }
    } catch (err) {
      console.error("Error fetching table orders:", err);
    }
  };

  useEffect(() => {
    if (tableNumber) {
      fetchActiveOrders();

      // Subscribe to postgres changes on the Order table in real-time
      const channel = supabase
        .channel("shop-realtime-orders")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Order" },
          () => {
            // Re-fetch table orders when database updates occur (e.g. kitchen completes/updates status)
            fetchActiveOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tableNumber]);

  // 3. Fetch products list
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/products", window.location.origin);
      if (search) url.searchParams.append("query", search);
      if (selectedCategory !== "All") url.searchParams.append("categoryId", selectedCategory);
      const res = await fetch(url.toString());
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, selectedCategory]);

  // 4. Cart actions
  const getCartItemQty = (productId: number) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0;
  };

  const handleAddOne = (product: Product) => {
    if (!product.status) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleMinusOne = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateCartQty = (productId: number, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: qty } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      showToast("ກະລຸນາເລືອກໂຕະກ່ອນສັ່ງອາຫານ", "error");
      return;
    }
    if (cart.length === 0) return;

    setOrdering(true);
    try {
      const payload = {
        tableNumber,
        items: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
        })),
      };

      await createOrder(payload);
      showToast("ສົ່ງອໍເດີ້ອາຫານສໍາເລັດ! ຫ້ອງຄົວກຳລັງກະກຽມໃຫ້ທ່ານ.");
      setCart([]);
      setIsCartOpen(false);
      fetchActiveOrders();
    } catch (err: any) {
      showToast(err.message || "ເກີດຂໍ້ຜິດພາດໃນການສັ່ງອາຫານ", "error");
    } finally {
      setOrdering(false);
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const statusLaoMap: Record<string, string> = {
    PENDING: "ລໍຖ້າຄິວ ⏳",
    PREPARING: "ກຳລັງເຮັດ 👨‍🍳",
    SERVED: "ເສີບແລ້ວ 🍜",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-28 text-slate-800">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 text-white px-5 py-3 shadow-xl text-xs font-semibold backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-200 border border-white/10`}
        >
          {toast.type === "success" ? "✨" : "❌"} {toast.message}
        </div>
      )}

      {/* ── Mobile Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-sm flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex shadow-md">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                {tableNumber ? `ໂຕະ ${tableNumber}` : "ສັ່ງອາຫານປະຈຳໂຕະ"}
              </h1>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ເມນູອາຫານອອນລາຍ
              </p>
            </div>
          </div>

          <a
            href="/dashboard"
            className="text-[10px] font-bold text-slate-500 hover:text-amber-600 transition-colors border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50"
          >
            ຈັດການຫຼັງຮ້ານ
          </a>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາອາຫານ ຫຼື ເຄື່ອງດື່ມ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-100 bg-slate-100/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
          />
        </div>
      </header>

      {/* ── Table Selector Reminder ── */}
      {!tableNumber && (
        <div className="bg-amber-50 border-b border-amber-200/50 text-amber-900 py-3 px-4 text-center text-xs font-semibold animate-pulse shrink-0">
          ⚠️ ທ່ານຍັງບໍ່ໄດ້ລະບຸເລກໂຕະອາຫານ.{" "}
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="text-orange-600 underline font-bold cursor-pointer ml-1"
          >
            ຄລິກທີ່ນີ້ເພື່ອເລືອກໂຕະ
          </button>
        </div>
      )}

      {/* ── Active Table Orders Status Tracker ── */}
      {tableNumber && activeTableOrders.length > 0 && (
        <div className="bg-orange-50/80 border-b border-orange-100 px-4 py-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-orange-950 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-600 animate-spin shrink-0" />
              ອໍເດີ້ກຳລັງດຳເນີນການ:
            </span>
            <div className="flex gap-1.5 overflow-x-auto max-w-[60%] py-0.5 no-scrollbar">
              {activeTableOrders.map((order) => (
                <span
                  key={order.id}
                  className="bg-white border border-orange-200/50 rounded-full px-2 py-0.5 text-[9px] shrink-0 font-bold"
                >
                  #{order.id}: {statusLaoMap[order.status]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Categories Bar (Horizontal Scroll) ── */}
      <div className="bg-white py-3.5 px-4 shadow-sm border-b border-slate-100 sticky top-[105px] z-30 shrink-0">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5 flex-nowrap touch-pan-x">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              selectedCategory === "All"
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 scale-105"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            🍽️ ທັງໝົດ
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.id.toString()
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{getCategoryEmoji(cat.name, cat.nameLao)}</span>
              <span>{cat.nameLao}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Food Menu Grid ── */}
      <main className="max-w-7xl mx-auto px-4 py-5 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-xs text-muted-foreground font-semibold">ກຳລັງໂຫລດເມນູອາຫານ...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Utensils className="h-10 w-10 opacity-30 mb-2" />
            <p className="text-xs font-bold">ບໍ່ພົບເມນູອາຫານໃນເວລານີ້</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const isOut = !product.status;
              const qtyInCart = getCartItemQty(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Photo area */}
                  <div className="aspect-square w-full bg-slate-50 flex items-center justify-center relative overflow-hidden text-slate-400 select-none">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Utensils className="h-10 w-10 opacity-20" />
                    )}
                    
                    {/* Category tag */}
                    <span className="absolute top-2 left-2 text-[9px] font-bold bg-white/95 px-2 py-0.5 rounded-full shadow-sm text-slate-700 backdrop-blur-sm">
                      {product.category?.nameLao}
                    </span>

                    {/* Out of Stock overlay */}
                    {isOut && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-white text-xs font-extrabold bg-red-600/90 px-3 py-1 rounded-full shadow-md">
                          ໝົດຊົ່ວຄາວ
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {product.description || "ອາຫານແຊບໆ ປຸງແຕ່ງສົດໃໝ່"}
                      </p>
                    </div>

                    {/* Price and Add Control */}
                    <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-50">
                      <span className="text-[11px] font-extrabold text-orange-600">
                        {formatLAK(product.price)}
                      </span>

                      {/* Quantity buttons directly on Card */}
                      {isOut ? (
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                      ) : qtyInCart > 0 ? (
                        <div className="flex items-center gap-2 border border-orange-200 bg-orange-50/50 rounded-full px-1.5 py-0.5">
                          <button
                            onClick={() => handleMinusOne(product.id)}
                            className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-orange-600 hover:bg-orange-100 active:scale-95 transition-all shadow-sm border border-orange-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-mono font-extrabold text-orange-600 min-w-[12px] text-center">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => handleAddOne(product)}
                            className="h-5 w-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddOne(product)}
                          disabled={!tableNumber}
                          className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/10 active:scale-95 hover:opacity-95 transition-all disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Sticky Bottom Cart Summary Bar ── */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-tr from-amber-500 to-orange-600 text-white py-3.5 px-5 flex items-center justify-between shadow-2xl rounded-t-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shadow-inner">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center shadow-md">
                {totalCartItems}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/80 font-bold">ຍອດລວມທັງໝົດ</span>
              <span className="text-base font-extrabold tracking-wide">{formatLAK(totalCartPrice)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 bg-white text-orange-600 px-4.5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:bg-orange-50 active:scale-95 transition-all cursor-pointer"
          >
            ເບິ່ງກະຕ່າ <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Slide-up Cart Drawer (Mobile style) ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end animate-in fade-in duration-200">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
          
          {/* Drawer Sheet */}
          <div className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 shrink-0" />
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                <h3 className="font-extrabold text-base">ລາຍການອາຫານທີ່ເລືອກ</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4 border-b border-slate-50 pb-4 items-center">
                  <div className="h-14 w-14 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border">
                    {item.product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Utensils className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1">{item.product.name}</h4>
                    <p className="text-xs text-orange-600 font-extrabold">{formatLAK(item.product.price)}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 px-1 py-0.5">
                        <button
                          onClick={() => handleMinusOne(item.product.id)}
                          className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-slate-600 border shadow-sm cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-extrabold text-slate-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleAddOne(item.product)}
                          className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-slate-600 border shadow-sm cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => updateCartQty(item.product.id, 0)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                        title="ລຶບອອກ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50/50 shrink-0">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-600">ຍອດລວມທັງໝົດ:</span>
                <span className="text-lg font-extrabold text-slate-900">{formatLAK(totalCartPrice)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || ordering || !tableNumber}
                className="w-full rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 py-3.5 text-sm font-extrabold text-white hover:opacity-95 active:scale-[0.99] transition-all disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {ordering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ກຳລັງສົ່ງອໍເດີ້...
                  </>
                ) : (
                  <>
                    ສັ່ງອາຫານໃສ່ ໂຕະ {tableNumber || ""}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table Selection Modal ── */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 shrink-0 bg-slate-50">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                🍽️ ເລືອກໂຕະອາຫານຂອງທ່ານ
              </span>
              {tableNumber && (
                <button
                  onClick={() => setIsTableModalOpen(false)}
                  className="h-7 w-7 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-muted-foreground font-semibold">
                ກະລຸນາເລືອກເລກໂຕະທີ່ທ່ານນັ່ງ ເພື່ອໃຫ້ຄົວເສີບອາຫານໄດ້ຢ່າງຖືກຕ້ອງ:
              </p>

              {/* Grid of Tables */}
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: 12 }, (_, i) => {
                  const num = String(i + 1).padStart(2, "0");
                  const isActive = tableNumber === num;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        setTableNumber(num);
                        if (typeof window !== "undefined") {
                          window.history.pushState({}, "", `?table=${num}`);
                        }
                        setIsTableModalOpen(false);
                        showToast(`ເລືອກ ໂຕະ ${num} ສຳເລັດ!`);
                      }}
                      className={`py-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25 scale-105"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Custom input if needed */}
              <div className="border-t pt-4 space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ຫຼື ປ້ອນເລກໂຕະດ້ວຍຕົນເອງ
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ເຊັ່ນ: 15, VIP-01..."
                    defaultValue={tableNumber || ""}
                    id="custom-table-input"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setTableNumber(val);
                          if (typeof window !== "undefined") {
                            window.history.pushState({}, "", `?table=${val}`);
                          }
                          setIsTableModalOpen(false);
                          showToast(`ເລືອກ ໂຕະ ${val} ສຳເລັດ!`);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("custom-table-input") as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val) {
                        setTableNumber(val);
                        if (typeof window !== "undefined") {
                          window.history.pushState({}, "", `?table=${val}`);
                        }
                        setIsTableModalOpen(false);
                        showToast(`ເລືອກ ໂຕະ ${val} ສຳເລັດ!`);
                      }
                    }}
                    className="rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ຕົກລົງ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loader helper icon
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
