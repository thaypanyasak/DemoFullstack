import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Cập nhật thông tin sản phẩm
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, category } = body;

    // Kiểm tra và cập nhật
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        name,
        description: description ?? undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        category: category ?? undefined,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT Product Error:", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật thông tin sản phẩm" },
      { status: 500 }
    );
  }
}

// Xóa sản phẩm
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID sản phẩm không hợp lệ" },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa sản phẩm" },
      { status: 500 }
    );
  }
}
