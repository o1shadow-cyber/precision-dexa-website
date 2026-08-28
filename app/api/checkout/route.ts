import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// STUB for Milestone 3 — no Stripe yet. Inserts the booking as `pending`
// and returns immediately instead of redirecting to Stripe Checkout.
// Milestone 4 replaces the body of this route with a real Checkout
// Session creation; the request/response shape below is designed to
// stay compatible with that swap (client already expects `{ bookingId }`
// back, it'll just also start expecting a `{ url }` to redirect to).

export async function POST(request: Request) {
  const body = await request.json();
  const {
    slotId,
    patientName,
    birthdate,
    weightLbs,
    gender,
    email,
    phone,
    hasProviderOrder,
    providerOrderPath,
  } = body;

  if (!slotId || !patientName || !birthdate || !weightLbs || !gender || !email || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Re-verify the hold is still ours and hasn't expired before charging ahead.
  const { data: slot } = await db
    .from("available_slots")
    .select("id, status, held_until")
    .eq("id", slotId)
    .single();

  if (!slot || slot.status !== "held" || !slot.held_until || new Date(slot.held_until) < new Date()) {
    return NextResponse.json(
      { error: "Your hold on that slot expired — please pick a time again" },
      { status: 409 }
    );
  }

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      slot_id: slotId,
      patient_name: patientName,
      birthdate,
      weight_lbs: weightLbs,
      gender,
      email,
      phone,
      has_provider_order: Boolean(hasProviderOrder),
      provider_order_path: providerOrderPath ?? null,
      payment_status: "pending",
      amount_cents: 14900,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookingId: booking.id, stub: true });
}
