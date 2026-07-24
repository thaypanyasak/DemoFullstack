import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE: Remove a table by database ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tableId = parseInt(id, 10);
    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID" }, { status: 400 });
    }

    await db.restaurantTable.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ success: true, message: "Table deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete table" }, { status: 500 });
  }
}
