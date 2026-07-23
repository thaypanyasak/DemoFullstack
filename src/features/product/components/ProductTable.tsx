import { formatLAK } from "@/lib/format";
import { CAT_LAO } from "@/types/product";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductTable({ products, loading, onEdit, onDelete }: Props) {
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
        <svg className="h-12 w-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5"
          />
        </svg>
        <p className="text-sm font-medium">ບໍ່ພົບສິນຄ້າ</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">ສິນຄ້າ</th>
            <th className="px-4 py-3 text-left">ປະເພດ</th>
            <th className="px-4 py-3 text-right">ລາຄາ</th>
            <th className="px-4 py-3 text-center">ຈໍານວນ</th>
            <th className="px-4 py-3 text-center">ສະຖານະ</th>
            <th className="px-4 py-3 text-center">ດໍາເນີນການ</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => {
            const isLow = product.stock <= 5;
            const isOut = product.stock === 0;
            return (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  #{product.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {product.description || "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                    {CAT_LAO[product.category] || product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatLAK(product.price)}
                </td>
                <td className="px-4 py-3 text-center font-mono">{product.stock}</td>
                <td className="px-4 py-3 text-center">
                  {isOut ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      ໝົດສາງ
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      ໃກ້ໝົດ
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      ມີສິນຄ້າ
                    </span>
                  )}
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
