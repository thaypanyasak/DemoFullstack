import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ອັບເດດຂໍ້ມູນອາຫານ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID ອາຫານບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, categoryId, image, status } = body;

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? (description || "") : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        status: status !== undefined ? status : undefined,
        categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId) : null) : undefined,
        image: image !== undefined ? (image || null) : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT Product Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນອາຫານ" },
      { status: 500 }
    );
  }
}

// ລຶບອາຫານ
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID ອາຫານບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "ລຶບອາຫານສໍາເລັດ" });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການລຶບອາຫານ" },
      { status: 500 }
    );
  }
}
