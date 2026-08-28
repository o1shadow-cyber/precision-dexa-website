import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin()
    .from("available_slots")
    .select("*")
    .order("slot_date", { ascending: true })
    .order("slot_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slot_date, slot_time } = await request.json();
  if (typeof slot_date !== "string" || typeof slot_time !== "string") {
    return NextResponse.json({ error: "slot_date and slot_time are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin()
    .from("available_slots")
    .insert({ slot_date, slot_time, status: "available" })
    .select()
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500; // unique violation
    const message = error.code === "23505" ? "That date and time already has a slot" : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ slot: data }, { status: 201 });
}
