import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = supabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Idempotent: only flips a booking that's still pending, so a duplicate
    // delivery of this same event (Stripe retries on non-2xx/timeout) is a no-op.
    const { data: booking } = await db
      .from("bookings")
      .update({
        payment_status: "paid",
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session.id)
      .eq("payment_status", "pending")
      .select()
      .single();

    if (booking) {
      await db
        .from("available_slots")
        .update({ status: "booked", held_until: null })
        .eq("id", booking.slot_id)
        .eq("status", "held");

      const { data: slot } = await db
        .from("available_slots")
        .select("slot_date, slot_time")
        .eq("id", booking.slot_id)
        .single();

      if (slot) {
        await sendBookingConfirmationEmail({
          to: booking.email,
          patientName: booking.patient_name,
          slotDate: slot.slot_date,
          slotTime: slot.slot_time,
        });
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;

    const { data: booking } = await db
      .from("bookings")
      .update({ payment_status: "expired", updated_at: new Date().toISOString() })
      .eq("stripe_checkout_session_id", session.id)
      .eq("payment_status", "pending")
      .select()
      .single();

    if (booking) {
      await db
        .from("available_slots")
        .update({ status: "available", held_until: null, stripe_checkout_session_id: null })
        .eq("id", booking.slot_id)
        .eq("status", "held");
    }
  }

  return NextResponse.json({ received: true });
}
