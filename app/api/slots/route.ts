import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const HOLD_MINUTES = 15;

export async function GET() {
  const db = supabaseAdmin();

  // Lazy expiry: release any hold that's timed out before reading the list.
  await db
    .from("available_slots")
    .update({ status: "available", held_until: null, stripe_checkout_session_id: null })
    .eq("status", "held")
    .lt("held_until", new Date().toISOString());

  const { data, error } = await db
    .from("available_slots")
    .select("id, slot_date, slot_time")
    .eq("status", "available")
    .order("slot_date", { ascending: true })
    .order("slot_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

// "Claim" a slot: atomically flip it to held, only if it's still available.
export async function POST(request: Request) {
  const { slotId } = await request.json();
  if (typeof slotId !== "string") {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 });
  }

  const heldUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin()
    .from("available_slots")
    .update({ status: "held", held_until: heldUntil })
    .eq("id", slotId)
    .eq("status", "available")
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "That time was just taken — pick another" },
      { status: 409 }
    );
  }

  return NextResponse.json({ slot: data, heldUntil });
}
