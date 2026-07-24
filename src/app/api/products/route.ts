import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ດຶງຂໍ້ມູນອາຫານທັງໝົດ
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const categoryId = searchParams.get("categoryId") || "";

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
          categoryId && categoryId !== "All"
            ? { categoryId: { equals: parseInt(categoryId) } }
            : {},
        ],
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການໂຫລດລາຍການອາຫານ" },
      { status: 500 }
    );
  }
}

// ເພີ່ມອາຫານໃໝ່
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, image, status } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: null, // stock is deprecated/removed in UI
        status: status !== undefined ? status : true,
        categoryId: categoryId ? parseInt(categoryId) : null,
        image: image || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST Product Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກອາຫານໃໝ່" },
      { status: 500 }
    );
  }
}
