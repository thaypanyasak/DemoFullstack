import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: ອັບເດດຂໍ້ມູນປະເພດອາຫານ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID ປະເພດບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, nameLao } = body;

    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: {
        name,
        nameLao,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນປະເພດອາຫານ" },
      { status: 500 }
    );
  }
}

// DELETE: ລຶບປະເພດອາຫານ (ພ້ອມຍ້າຍອາຫານໄປຫາປະເພດ "Other" / "ອື່ນໆ")
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID ປະເພດບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    // ດຶງຂໍ້ມູນປະເພດເລີ່ມຕົ້ນ "Other" ເພື່ອຍ້າຍອາຫານໄປຫາ
    let otherCategory = await db.category.findFirst({
      where: { OR: [{ name: "Other" }, { nameLao: "ອື່ນໆ" }] },
    });

    // ຫາກລຶບປະເພດ "Other" ເອງ, ບໍ່ໃຫ້ລຶບ ຫຼື ຫ້າມລຶບ
    const current = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (current && (current.name === "Other" || current.nameLao === "ອື່ນໆ")) {
      return NextResponse.json(
        { error: "ບໍ່ສາມາດລຶບປະເພດອາຫານເລີ່ມຕົ້ນ (ອື່ນໆ) ໄດ້" },
        { status: 400 }
      );
    }

    // ຍ້າຍອາຫານໄປຫາ "Other" ກ່ອນລຶບ
    await db.$transaction(async (tx) => {
      if (otherCategory) {
        await tx.product.updateMany({
          where: { categoryId },
          data: { categoryId: otherCategory.id },
        });
      }

      await tx.category.delete({
        where: { id: categoryId },
      });
    });

    return NextResponse.json({ message: "ລຶບປະເພດອາຫານສໍາເລັດ" });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການລຶບປະເພດອາຫານ" },
      { status: 500 }
    );
  }
}
