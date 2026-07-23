import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Lấy danh sách sản phẩm (có tìm kiếm và lọc)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";

    const products = await db.product.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          category && category !== "All"
            ? { category: { equals: category } }
            : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tải danh sách sản phẩm" },
      { status: 500 }
    );
  }
}

// Tạo sản phẩm mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category } = body;

    // Kiểm tra dữ liệu bắt buộc
    if (!name || price === undefined || stock === undefined || !category) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ các thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo sản phẩm mới" },
      { status: 500 }
    );
  }
}
