import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to seed default tables if database is empty
async function ensureDefaultTables() {
  const count = await db.restaurantTable.count();
  if (count === 0) {
    const defaultTables = Array.from({ length: 8 }, (_, i) => ({
      name: String(i + 1).padStart(2, "0"),
    }));
    await db.restaurantTable.createMany({
      data: defaultTables,
    });
  }
}

// GET: Fetch all tables with their computed active order status
export async function GET() {
  try {
    await ensureDefaultTables();

    // Fetch all tables
    const tables = await db.restaurantTable.findMany({
      orderBy: { name: "asc" },
    });

    // Fetch all active orders (PENDING, PREPARING, SERVED)
    const activeOrders = await db.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PREPARING", "SERVED"],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Map tables to combine with active order status
    const result = tables.map((t) => {
      // Find all active orders matching table number
      const matchingOrders = activeOrders.filter(
        (o) => o.tableNumber.trim().toLowerCase() === t.name.trim().toLowerCase()
      );

      if (matchingOrders.length > 0) {
        const totalAmount = matchingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const itemsCount = matchingOrders.reduce(
          (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0
        );
        // Earliest order for table reference
        const earliestOrder = [...matchingOrders].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];

        return {
          id: t.id,
          name: t.name,
          status: "OCCUPIED",
          activeOrder: {
            id: earliestOrder.id,
            totalAmount: totalAmount,
            status: earliestOrder.status,
            createdAt: earliestOrder.createdAt,
            itemsCount: itemsCount,
            subOrdersCount: matchingOrders.length,
            orderIds: matchingOrders.map(o => o.id),
          },
        };
      }

      return {
        id: t.id,
        name: t.name,
        status: "VACANT",
        activeOrder: null,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch tables" }, { status: 500 });
  }
}

// POST: Add a new table name
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const trimmed = name?.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    // Check if table name already exists
    const existing = await db.restaurantTable.findUnique({
      where: { name: trimmed },
    });
    if (existing) {
      return NextResponse.json({ error: `Table "${trimmed}" already exists` }, { status: 400 });
    }

    const table = await db.restaurantTable.create({
      data: { name: trimmed },
    });

    return NextResponse.json(table);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create table" }, { status: 500 });
  }
}
