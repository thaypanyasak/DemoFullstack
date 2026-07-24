import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    // Start of today in local system time
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Today Revenue (sum totalAmount of COMPLETED orders today)
    const revenueAgg = await db.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "COMPLETED",
        createdAt: { gte: todayStart },
      },
    });
    const todayRevenue = revenueAgg._sum.totalAmount || 0;

    // 2. Today Orders Count
    const todayOrders = await db.order.count({
      where: {
        createdAt: { gte: todayStart },
      },
    });

    // 3. Total Menu Items
    const totalProducts = await db.product.count();

    // 4. Active Tables (tables with active orders right now)
    const activeTablesAgg = await db.order.groupBy({
      by: ["tableNumber"],
      where: {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    });
    const activeTablesCount = activeTablesAgg.length;

    // 5. Recent 5 Orders
    const recentOrdersDb = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const recentOrders = recentOrdersDb.map((o) => {
      const itemsStr = o.items.map((i) => `${i.product.name} (x${i.quantity})`).join(", ");
      return {
        id: `#ORD-${o.id}`,
        table: `ໂຕະ ${o.tableNumber}`,
        items: itemsStr || "ບໍ່ມີລາຍການ",
        amount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      };
    });

    // 6. Top 5 Best Sellers
    const topDishesAgg = await db.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          status: "COMPLETED",
        },
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Get max sold quantity to calculate progress bar percentages (out of max sold)
    const maxSold = topDishesAgg.length > 0 ? (topDishesAgg[0]._sum.quantity || 1) : 1;

    const topDishes = await Promise.all(
      topDishesAgg.map(async (item) => {
        const prod = await db.product.findUnique({
          where: { id: item.productId },
        });
        const sold = item._sum.quantity || 0;
        const price = prod?.price || 0;
        // Percentage of best sold dish (e.g. 100% for number 1, other dishes calculated proportionally)
        const progress = Math.round((sold / maxSold) * 100);
        return {
          name: prod?.name || "ອາຫານທີ່ລຶບແລ້ວ",
          sold,
          revenue: sold * price,
          progress,
        };
      })
    );

    return NextResponse.json({
      todayRevenue,
      todayOrders,
      totalProducts,
      activeTablesCount,
      recentOrders,
      topDishes,
    });
  } catch (error) {
    console.error("GET Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນສະຖິຕິ" },
      { status: 500 }
    );
  }
}
