import "server-only";

type ConfirmationEmailArgs = {
  to: string;
  patientName: string;
  slotDate: string;
  slotTime: string;
};

// STUB for Milestone 4 — Resend isn't wired up yet (that's Milestone 5).
// Logs instead of sending so the webhook flow can be fully tested now;
// the call site in the webhook handler doesn't need to change later.
export async function sendBookingConfirmationEmail(args: ConfirmationEmailArgs) {
  console.log("[email stub] would send confirmation to", args.to, args);
}
