import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type Params = { params: Promise<{ id: string }> };
type SlotUpdate = Database["public"]["Tables"]["available_slots"]["Update"];

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { slot_date, slot_time } = await request.json();

  const update: SlotUpdate = {};
  if (typeof slot_date === "string") update.slot_date = slot_date;
  if (typeof slot_time === "string") update.slot_time = slot_time;

  // Only an untouched, unpaid slot can be moved — editing a held/booked slot
  // out from under an in-flight or paid booking would silently break it.
  const { data, error } = await supabaseAdmin()
    .from("available_slots")
    .update(update)
    .eq("id", id)
    .eq("status", "available")
    .select()
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    const message = error.code === "23505" ? "That date and time already has a slot" : error.message;
    return NextResponse.json({ error: message }, { status });
  }
  if (!data) {
    return NextResponse.json(
      { error: "Slot not found, or it's held/booked and can't be edited right now" },
      { status: 409 }
    );
  }

  return NextResponse.json({ slot: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseAdmin();

  const { data: slot, error: fetchError } = await db
    .from("available_slots")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }
  if (slot.status === "booked") {
    return NextResponse.json(
      { error: "This slot has a paid booking — cancel the booking first" },
      { status: 409 }
    );
  }

  const { error } = await db.from("available_slots").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
