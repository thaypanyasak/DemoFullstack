import { formatLAKShort } from "@/lib/format";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function ProductStats({ products }: Props) {
  const activeCount = products.filter((p) => p.status).length;
  const inactiveCount = products.filter((p) => !p.status).length;
  const avgPrice = products.length > 0 
    ? products.reduce((acc, p) => acc + p.price, 0) / products.length 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ລາຍການເມນູທັງໝົດ
        </p>
        <h3 className="mt-2 text-3xl font-extrabold text-primary">{products.length}</h3>
        <p className="mt-1 text-xs text-muted-foreground">ລາຍການອາຫານ ແລະ ເຄື່ອງດື່ມ</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ເປີດຂາຍຢູ່ (Active)
        </p>
        <h3 className="mt-2 text-3xl font-extrabold text-green-600">
          {activeCount}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">ພ້ອມໃຫ້ລູກຄ້າສັ່ງໄດ້ທັນທີ</p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ປິດຂາຍຊົ່ວຄາວ (Inactive)
        </p>
        <h3
          className={`mt-2 text-3xl font-extrabold ${
            inactiveCount > 0 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {inactiveCount}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">ອາຫານໝົດ ຫຼື ວັດຖຸດິບໝົດ</p>
      </div>
    </div>
  );
}
