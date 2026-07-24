import { NextResponse } from "next/server";

// API ອັບໂຫລດຮູບພາບ ຂຶ້ນ Supabase Storage
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ດຶງຂໍ້ມູນການເຊື່ອມຕໍ່ Supabase ຈາກ .env
    const rawUrl = process.env.PROJECT_URL || "";
    // ຕັດ /rest/v1/ ອອກ ຫາກມີ
    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
    const serviceKey = process.env.SERVICE_ROLE || process.env.ANON_PUBLIC || "";
    const bucketName = "food-images";

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "ລະບົບຍັງບໍ່ທັນໄດ້ຕັ້ງຄ່າ Supabase credentials ໃນ .env" },
        { status: 500 }
      );
    }

    // ສ້າງຊື່ໄຟລ໌ທີ່ບໍ່ຊ້ຳກັນ
    const fileExt = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // ເອີ້ນໃຊ້ Supabase Storage REST API ເພື່ອອັບໂຫລດໄຟລ໌
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${uniqueFilename}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type || "image/jpeg",
      },
      body: buffer,
    });

    if (!res.ok) {
      const errResponse = await res.text();
      console.error("Supabase Storage Response Error:", errResponse);
      throw new Error(`Supabase Storage error: ${errResponse}`);
    }

    // ຫຼັງຈາກອັບໂຫລດສຳເລັດ, ສ້າງ Public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${uniqueFilename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload Route Error:", error);
    return NextResponse.json(
      { error: error.message || "ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫລດຮູບພາບ" },
      { status: 500 }
    );
  }
}
