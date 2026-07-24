import { formatLAK } from "@/lib/format";
import type { Product } from "@/types/product";
import { Utensils } from "lucide-react";

interface Props {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
}

export function ProductTable({ products, loading, onEdit, onDelete, onToggleActive }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">ກໍາລັງໂຫລດ...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Utensils className="h-12 w-12 opacity-30" />
        <p className="text-sm font-medium">ບໍ່ພົບລາຍການອາຫານໃນເມນູ</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">ລາຍການອາຫານ</th>
            <th className="px-4 py-3 text-left">ປະເພດ</th>
            <th className="px-4 py-3 text-right">ລາຄາ</th>
            <th className="px-4 py-3 text-center">ເປີດ-ປິດຂາຍ</th>
            <th className="px-4 py-3 text-center">ດໍາເນີນການ</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => {
            return (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  #{product.id}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Small Image Preview */}
                    <div className="h-10 w-10 rounded-lg bg-slate-100 border flex items-center justify-center overflow-hidden shrink-0 text-slate-400">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Utensils className="h-4 w-4 opacity-40" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{product.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                        {product.description || "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                    {product.category?.nameLao || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {formatLAK(product.price)}
                </td>
                
                {/* Instant toggle active / inactive switch */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onToggleActive(product.id, product.status)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        product.status ? "bg-green-500" : "bg-slate-200"
                      }`}
                      title={product.status ? "ປິດຂາຍເມນູນີ້" : "ເປີດຂາຍເມນູນີ້"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          product.status ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      title="ແກ້ໄຂ"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="ລຶບ"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
