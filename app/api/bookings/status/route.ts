import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const { data: booking, error } = await supabaseAdmin()
    .from("bookings")
    .select("payment_status, patient_name, slot_id")
    .eq("stripe_checkout_session_id", sessionId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const { data: slot } = await supabaseAdmin()
    .from("available_slots")
    .select("slot_date, slot_time")
    .eq("id", booking.slot_id)
    .single();

  return NextResponse.json({
    paymentStatus: booking.payment_status,
    patientName: booking.patient_name,
    slotDate: slot?.slot_date ?? null,
    slotTime: slot?.slot_time ?? null,
  });
}
