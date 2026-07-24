import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tupwcnfameowpzkynnlr.supabase.co";
const serviceRoleKey = process.env.SERVICE_ROLE || "";

// Create admin client with administrative privileges
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to verify if the requester is an ADMIN
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) return false;

    const tempClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    const { data: { user } } = await tempClient.auth.getUser(token);
    
    return user?.user_metadata?.role === "ADMIN";
  } catch {
    return false;
  }
}

// PUT: Update a user's role or full name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { name, role } = await request.json();

    const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: {
        full_name: name,
        role: role,
      },
    });

    if (error) throw error;

    return NextResponse.json({
      id: user?.id,
      email: user?.email,
      name: user?.user_metadata?.full_name,
      role: user?.user_metadata?.role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE: Remove a user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
