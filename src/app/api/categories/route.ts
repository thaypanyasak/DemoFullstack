import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Default categories helper to bootstrap database if empty
const DEFAULT_CATEGORIES = [
  { name: "Foods", nameLao: "ອາຫານຫຼັກ" },
  { name: "Drinks", nameLao: "ເຄື່ອງດື່ມ" },
  { name: "Desserts", nameLao: "ຂອງຫວານ" },
  { name: "Snacks", nameLao: "ອາຫານວ່າງ" },
  { name: "Other", nameLao: "ອື່ນໆ" },
];

// GET: ດຶງຂໍ້ມູນປະເພດທັງໝົດ
export async function GET() {
  try {
    let categories = await db.category.findMany({
      orderBy: { id: "asc" },
    });

    // ຫາກຖານຂໍ້ມູນຍັງຫວ່າງເປົ່າ, ຈະທຳການສ້າງຂໍ້ມູນເລີ່ມຕົ້ນໃຫ້ອັດຕະໂນມັດ
    if (categories.length === 0) {
      await db.category.createMany({
        data: DEFAULT_CATEGORIES,
      });
      categories = await db.category.findMany({
        orderBy: { id: "asc" },
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET Categories Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນປະເພດອາຫານ" },
      { status: 500 }
    );
  }
}

// POST: ສ້າງປະເພດອາຫານໃໝ່
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameLao } = body;

    if (!name || !nameLao) {
      return NextResponse.json(
        { error: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ (Name & NameLao)" },
        { status: 400 }
      );
    }

    // ກວດສອບຄວາມຊ້ຳຊ້ອນ
    const existing = await db.category.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ມີປະເພດອາຫານນີ້ແລ້ວໃນລະບົບ" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: { name, nameLao },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { error: "ເກີດຂໍ້ຜິດພາດໃນການສ້າງປະເພດອາຫານໃໝ່" },
      { status: 500 }
    );
  }
}
