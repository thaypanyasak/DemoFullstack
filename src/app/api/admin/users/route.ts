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

    // Use regular client to verify token securely
    const tempClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    const { data: { user } } = await tempClient.auth.getUser(token);
    
    return user?.user_metadata?.role === "ADMIN";
  } catch {
    return false;
  }
}

// GET: List all users
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    // Format list for client display
    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || "ບໍ່ລະບຸຊື່",
      role: u.user_metadata?.role || "STAFF",
      createdAt: u.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list users" }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { email, password, name, role } = await request.json();
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so they can log in immediately
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
      createdAt: user?.created_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}
