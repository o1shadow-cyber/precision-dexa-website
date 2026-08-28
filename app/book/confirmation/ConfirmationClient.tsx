"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { bestChoices, whatToAvoid, studioAddress, studioPhone } from "@/lib/bookingCopy";

type Status = "checking" | "paid" | "timeout" | "missing";

type BookingInfo = {
  patientName: string;
  slotDate: string;
  slotTime: string;
};

const POLL_MS = 1500;
const TIMEOUT_MS = 20000;

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

export default function ConfirmationClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>(sessionId ? "checking" : "missing");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function poll() {
      const res = await fetch(`/api/bookings/status?session_id=${sessionId}`);
      if (cancelled) return;

      if (res.ok) {
        const body = await res.json();
        if (body.paymentStatus === "paid") {
          setBooking({
            patientName: body.patientName,
            slotDate: body.slotDate,
            slotTime: body.slotTime,
          });
          setStatus("paid");
          return;
        }
      }

      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        setStatus("timeout");
        return;
      }
      setTimeout(poll, POLL_MS);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E7E1D6",
    borderTop: "2px solid #C6B18E",
    padding: "clamp(28px,4vw,44px)",
  };

  if (status === "missing") {
    return (
      <div style={cardStyle}>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          No booking to confirm here.
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          If you just paid, check your email for confirmation, or call{" "}
          <a href="tel:3606063117">{studioPhone}</a>.
        </p>
      </div>
    );
  }

  if (status === "checking") {
    return (
      <div style={cardStyle}>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          Confirming your booking…
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          This usually takes just a few seconds.
        </p>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div style={cardStyle}>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          Your payment is being confirmed.
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          This is taking a little longer than usual — you&apos;ll get a confirmation email shortly.
          If you don&apos;t see it in a few minutes, call <a href="tel:3606063117">{studioPhone}</a>{" "}
          and we&apos;ll sort it out.
        </p>
      </div>
    );
  }

  // paid
  return (
    <div style={cardStyle}>
      <p
        style={{
          margin: 0,
          font: "500 10.5px/1 var(--font-inter),sans-serif",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#3F6B4E",
          background: "#E7F0E9",
          display: "inline-block",
          padding: "6px 12px",
        }}
      >
        You&apos;re booked
      </p>
      <p style={{ margin: "16px 0 0", font: "400 24px/1.4 Georgia,serif", color: "#0D3B66" }}>
        {booking && formatDate(booking.slotDate)} at {booking && formatTime(booking.slotTime)}
      </p>
      <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
        A confirmation email is on its way to you with these same details.
      </p>

      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #E7E1D6" }}>
        <p
          style={{
            margin: 0,
            font: "500 11px/1 var(--font-inter),sans-serif",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#5E7F6B",
          }}
        >
          Where to go
        </p>
        <p style={{ margin: "10px 0 0", font: "400 16px/1.5 var(--font-inter),sans-serif", color: "#33424C" }}>
          {studioAddress}
        </p>
      </div>

      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #E7E1D6" }}>
        <p
          style={{
            margin: 0,
            font: "500 11px/1 var(--font-inter),sans-serif",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#5E7F6B",
          }}
        >
          What to wear
        </p>
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {bestChoices.slice(0, 2).map((item) => (
            <li key={item} style={{ font: "400 14.5px/1.6 var(--font-inter),sans-serif", color: "#33424C" }}>
              ✓ {item}
            </li>
          ))}
        </ul>
        <p style={{ margin: "10px 0 0", font: "400 13.5px/1.6 var(--font-inter),sans-serif", color: "#8A8378" }}>
          Avoid: {whatToAvoid.join(", ").toLowerCase()}.
        </p>
      </div>
    </div>
  );
}
