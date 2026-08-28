import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

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
    .select("id, status, held_until, slot_date, slot_time")
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL must be set");

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 14900,
          product_data: {
            name: "DEXA Body Composition Scan — Precision Dexa",
            description: `${slot.slot_date} at ${slot.slot_time} — ${patientName}`,
          },
        },
      },
    ],
    metadata: { booking_id: booking.id, slot_id: slotId },
    success_url: `${siteUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/book?cancelled=1`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Stripe minimum is 30 minutes
  });

  // Correlate the session with both rows so the webhook can find them.
  await db.from("bookings").update({ stripe_checkout_session_id: session.id }).eq("id", booking.id);
  await db.from("available_slots").update({ stripe_checkout_session_id: session.id }).eq("id", slotId);

  if (!session.url) {
    return NextResponse.json({ error: "Couldn't start checkout — please try again" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
