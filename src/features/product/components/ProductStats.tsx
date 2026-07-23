import { formatLAKShort } from "@/lib/format";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function ProductStats({ products }: Props) {
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ສິນຄ້າທັງໝົດ
        </p>
        <h3 className="mt-2 text-3xl font-extrabold text-primary">{products.length}</h3>
        <p className="mt-1 text-xs text-muted-foreground">ລາຍການໃນສາງ</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ມູນຄ່າທັງໝົດ
        </p>
        <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
          {formatLAKShort(totalValue)}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">ລາຄາ × ຈໍານວນ</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ໃກ້ໝົດ <span className="text-red-500">(≤ 5)</span>
        </p>
        <h3
          className={`mt-2 text-3xl font-extrabold ${
            lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground"
          }`}
        >
          {lowStockCount}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">ຕ້ອງສັ່ງຊື້ເພີ່ມ</p>
      </div>
    </div>
  );
}
