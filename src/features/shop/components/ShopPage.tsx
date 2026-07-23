"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Search, Package, ArrowRight, Eye, ShoppingCart } from "lucide-react";
import { formatLAK, formatLAKShort } from "@/lib/format";
import { CATEGORIES, CAT_LAO } from "@/types/product";
import type { Product } from "@/types/product";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Giỏ hàng giả lập (Client-side state)
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Xem chi tiết sản phẩm
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/products", window.location.origin);
      if (search) url.searchParams.append("query", search);
      if (selectedCategory !== "All") url.searchParams.append("category", selectedCategory);
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

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Hiệu ứng mở giỏ hàng nhanh
    setIsCartOpen(true);
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

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground flex shadow-md">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">Cửa hàng Pro</span>
          </div>

          {/* Cart Trigger */}
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 border px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted"
            >
              ລະບົບຈັດການສາງ (Admin) <ArrowRight className="h-3 w-3" />
            </a>
            
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Banner ── */}
      <div className="bg-slate-900 text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black opacity-60"></div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary border border-primary/30">
            ຍິນດີຕ້ອນຮັບ
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            ເລືອກຊື້ສິນຄ້າຄຸນນະພາບດີ
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            ຄົ້ນຫາ ແລະ ສັ່ງຊື້ສິນຄ້າທີ່ທ່ານຕ້ອງການໄດ້ຢ່າງສະດວກສະບາຍ
          </p>
        </div>
      </div>

      {/* ── Filter & Main Layout ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-background border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">ຄົ້ນຫາ</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ປ້ອນຊື່ສິນຄ້າ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="bg-background border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">ປະເພດສິນຄ້າ</h3>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                ທັງໝົດ
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {CAT_LAO[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">ກໍາລັງໂຫລດຂໍ້ມູນ...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-background rounded-xl border border-dashed">
              <Package className="h-12 w-12 opacity-30 mb-2" />
              <p className="text-sm font-medium">ບໍ່ມີສິນຄ້າວາງສະແດງໃນເວລານີ້</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                const isOut = product.stock === 0;
                return (
                  <div
                    key={product.id}
                    className="group bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
                  >
                    {/* Placeholder Product Image */}
                    <div className="aspect-video w-full bg-slate-100 flex items-center justify-center relative border-b text-slate-400 group-hover:bg-slate-200 transition-colors">
                      <Package className="h-10 w-10 opacity-40" />
                      <span className="absolute bottom-2 left-2 text-[10px] bg-background/80 border px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {CAT_LAO[product.category] || product.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2rem]">
                          {product.description || "ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມ."}
                        </p>
                      </div>

                      <div className="pt-2 border-t flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-slate-900">
                            {formatLAK(product.price)}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : product.stock <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {isOut ? "ໝົດແລ້ວ" : `ຍັງເຫຼືອ ${product.stock}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="flex-1 rounded-lg border py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> ລາຍລະອຽດ
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={isOut}
                            className={`flex-1 rounded-lg py-2 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                              isOut
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary hover:bg-primary/95"
                            }`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> ໃສ່ກະຕ່າ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Slide-over Cart Panel ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">ກະຕ່າສິນຄ້າ</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-sm font-medium">ກະຕ່າສິນຄ້າວ່າງເປົ່າ</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 border-b pb-4">
                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-primary font-bold">{formatLAK(item.product.price)}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-muted text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-0.5 hover:bg-muted text-xs disabled:opacity-40 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => updateCartQty(item.product.id, 0)}
                          className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                          ລຶບ
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">ຍອດລວມທັງໝົດ:</span>
                <span className="text-lg font-bold text-slate-900">{formatLAK(totalCartPrice)}</span>
              </div>
              <button
                onClick={() => alert("ລະບົບການຊໍາລະເງິນແມ່ນ UI ກໍາລັງພັດທະນາ")}
                disabled={cart.length === 0}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/95 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                ດໍາເນີນການສັ່ງຊື້ <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Detail Modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-background border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-bold">ລາຍລະອຽດສິນຄ້າ</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="aspect-video w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <Package className="h-16 w-16 opacity-40" />
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-muted border px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {CAT_LAO[selectedProduct.category] || selectedProduct.category}
                </span>
                <h3 className="text-xl font-bold mt-2">{selectedProduct.name}</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatLAK(selectedProduct.price)}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ລາຍລະອຽດ</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedProduct.description || "ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມສໍາລັບສິນຄ້ານີ້."}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-slate-600">ສະຖານະສາງ:</span>
                <span className={`font-semibold ${selectedProduct.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {selectedProduct.stock > 0 ? `ພ້ອມສົ່ງ (ຍັງເຫຼືອ ${selectedProduct.stock})` : "ໝົດຊົ່ວຄາວ"}
                </span>
              </div>
            </div>

            <div className="border-t p-5 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                ປິດ
              </button>
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.stock === 0}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/95 transition-colors disabled:bg-muted disabled:text-muted-foreground cursor-pointer"
              >
                ໃສ່ກະຕ່າ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
