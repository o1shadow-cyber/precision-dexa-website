import "server-only";
import { Resend } from "resend";
import { studioAddress, studioPhone, bestChoices, whatToAvoid, metalExplainer } from "./bookingCopy";

type ConfirmationEmailArgs = {
  to: string;
  patientName: string;
  slotDate: string;
  slotTime: string;
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export async function sendBookingConfirmationEmail(args: ConfirmationEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be set");

  const resend = new Resend(apiKey);
  const dateStr = formatDate(args.slotDate);
  const timeStr = formatTime(args.slotTime);

  const text = `Hi ${args.patientName},

You're booked for your DEXA scan at Precision Dexa.

${dateStr} at ${timeStr}

Where: ${studioAddress}
Phone: ${studioPhone}

What to wear — best choices:
${bestChoices.map((item) => `- ${item}`).join("\n")}

What to avoid:
${whatToAvoid.map((item) => `- ${item}`).join("\n")}

${metalExplainer}

See you soon,
Precision Dexa`;

  const html = `
    <div style="font-family:Georgia,serif;color:#0D3B66;max-width:560px;margin:0 auto">
      <p style="font:400 20px/1.4 Georgia,serif;color:#0D3B66">Hi ${args.patientName},</p>
      <p style="font:400 16px/1.6 Inter,sans-serif;color:#4A555C">You're booked for your DEXA scan at Precision Dexa.</p>
      <p style="font:400 22px/1.4 Georgia,serif;color:#0D3B66;margin:24px 0">${dateStr} at ${timeStr}</p>
      <p style="font:400 15px/1.6 Inter,sans-serif;color:#33424C">
        <strong>Where:</strong> ${studioAddress}<br>
        <strong>Phone:</strong> ${studioPhone}
      </p>
      <h3 style="font:400 18px/1.3 Georgia,serif;color:#0D3B66;margin-top:32px">What to wear — best choices</h3>
      <ul style="font:400 14.5px/1.6 Inter,sans-serif;color:#33424C">
        ${bestChoices.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <h3 style="font:400 18px/1.3 Georgia,serif;color:#0D3B66">What to avoid</h3>
      <ul style="font:400 14.5px/1.6 Inter,sans-serif;color:#33424C">
        ${whatToAvoid.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <p style="font:400 13.5px/1.6 Inter,sans-serif;color:#8A8378;margin-top:24px">${metalExplainer}</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: `Precision Dexa <${from}>`,
    to: args.to,
    subject: `You're booked — ${dateStr} at ${timeStr}`,
    text,
    html,
  });

  if (error) {
    console.error("[email] failed to send confirmation:", error);
  }
}
