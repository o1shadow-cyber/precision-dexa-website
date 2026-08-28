"use client";

import { useState } from "react";

type Slot = { id: string; slot_date: string; slot_time: string };
type Step = "start" | "orderQuestion" | "slotPicker" | "upload" | "info" | "submitting" | "success";

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  font: "400 16px/1 var(--font-inter),sans-serif",
  color: "#0D3B66",
  border: "1px solid #E7E1D6",
  background: "#F7F7F5",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  font: "500 11px/1 var(--font-inter),sans-serif",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "#5E7F6B",
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E7E1D6",
        borderTop: "2px solid #C6B18E",
        padding: "clamp(28px,4vw,44px)",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { style, ...rest } = props;
  return (
    <button
      {...rest}
      className="pdx-btn-primary"
      style={{
        background: "#0D3B66",
        color: "#F7F7F5",
        border: 0,
        padding: "15px 28px",
        font: "500 12.5px/1 var(--font-inter),sans-serif",
        letterSpacing: ".14em",
        textTransform: "uppercase",
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
    />
  );
}

function OutlineButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { style, ...rest } = props;
  return (
    <button
      {...rest}
      className="pdx-btn-outline"
      style={{
        background: "none",
        color: "#0D3B66",
        border: "1px solid #C6B18E",
        padding: "15px 28px",
        font: "500 12.5px/1 var(--font-inter),sans-serif",
        letterSpacing: ".14em",
        textTransform: "uppercase",
        ...style,
      }}
    />
  );
}

export default function BookingFlow() {
  const [step, setStep] = useState<Step>("start");
  const [hasProviderOrder, setHasProviderOrder] = useState<boolean | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [patientName, setPatientName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  async function loadSlots() {
    setLoadingSlots(true);
    setSlotError(null);
    const res = await fetch("/api/slots");
    const body = await res.json();
    setSlots(body.slots ?? []);
    setLoadingSlots(false);
  }

  function startFlow() {
    setStep("orderQuestion");
  }

  function answerOrderQuestion(answer: boolean) {
    setHasProviderOrder(answer);
    setStep("slotPicker");
    loadSlots();
  }

  async function pickSlot(slot: Slot) {
    setSlotError(null);
    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSlotError(body.error ?? "That time was just taken — pick another");
      loadSlots();
      return;
    }
    setSelectedSlot(slot);
    setStep(hasProviderOrder ? "upload" : "info");
  }

  async function handleUploadContinue() {
    if (!file || !selectedSlot) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slotId", selectedSlot.id);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setUploadError(body.error ?? "Couldn't upload that file");
      return;
    }
    const body = await res.json();
    setUploadedPath(body.path);
    setStep("info");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setStep("submitting");
    setSubmitError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: selectedSlot.id,
        patientName,
        birthdate,
        weightLbs: Number(weightLbs),
        gender,
        email,
        phone,
        hasProviderOrder,
        providerOrderPath: uploadedPath,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSubmitError(body.error ?? "Something went wrong — please try again");
      setStep("info");
      return;
    }

    const body = await res.json();
    if (body.url) {
      window.location.href = body.url;
      return;
    }
    // Fallback path (shouldn't happen once Stripe is wired up, kept for safety)
    setBookingId(body.bookingId);
    setStep("success");
  }

  // ---- start ----
  if (step === "start") {
    return (
      <Card>
        <p style={{ margin: 0, font: "400 18px/1.5 Georgia,serif", color: "#0D3B66" }}>
          Ready when you are.
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          Takes about a minute — pick a time, tell us a bit about yourself, and pay $149 to lock
          it in.
        </p>
        <PrimaryButton style={{ marginTop: 24 }} onClick={startFlow}>
          Book appt
        </PrimaryButton>
      </Card>
    );
  }

  // ---- order question ----
  if (step === "orderQuestion") {
    return (
      <Card>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          Do you have a current provider order?
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          A provider order isn&apos;t required to book — this just helps us prep for your scan.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <PrimaryButton onClick={() => answerOrderQuestion(true)}>Yes, I have one</PrimaryButton>
          <OutlineButton onClick={() => answerOrderQuestion(false)}>No</OutlineButton>
        </div>
      </Card>
    );
  }

  // ---- slot picker ----
  if (step === "slotPicker") {
    const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
      (acc[slot.slot_date] ??= []).push(slot);
      return acc;
    }, {});

    return (
      <Card>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          Pick a day and time.
        </p>
        {slotError && (
          <p style={{ marginTop: 12, color: "#B3413C", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
            {slotError}
          </p>
        )}
        <div style={{ marginTop: 20 }}>
          {loadingSlots && (
            <p style={{ color: "#8A8378", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
              Loading available times…
            </p>
          )}
          {!loadingSlots && slots.length === 0 && (
            <p style={{ color: "#8A8378", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
              No open times right now — call{" "}
              <a href="tel:3606063117">360.606.3117</a> and we&apos;ll find one.
            </p>
          )}
          {Object.entries(grouped).map(([date, daySlots]) => (
            <div key={date} style={{ marginBottom: 20 }}>
              <p
                style={{
                  margin: "0 0 10px",
                  font: "500 12px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".06em",
                  color: "#0D3B66",
                }}
              >
                {formatDate(date)}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => pickSlot(slot)}
                    style={{
                      background: "#F7F7F5",
                      border: "1px solid #E7E1D6",
                      padding: "10px 16px",
                      font: "400 14px/1 var(--font-inter),sans-serif",
                      color: "#33424C",
                    }}
                  >
                    {formatTime(slot.slot_time)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // ---- upload (only if hasProviderOrder) ----
  if (step === "upload") {
    return (
      <Card>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          Upload your provider order.
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          PDF, JPEG, or PNG, up to 10MB.
        </p>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: "block", marginTop: 20, font: "400 14px/1.4 var(--font-inter),sans-serif" }}
        />
        {uploadError && (
          <p style={{ marginTop: 12, color: "#B3413C", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
            {uploadError}
          </p>
        )}
        <PrimaryButton style={{ marginTop: 24 }} disabled={!file || uploading} onClick={handleUploadContinue}>
          {uploading ? "Uploading…" : "Continue"}
        </PrimaryButton>
      </Card>
    );
  }

  // ---- info form ----
  if (step === "info" || step === "submitting") {
    return (
      <Card>
        <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          A few details.
        </p>
        {selectedSlot && (
          <p style={{ margin: "8px 0 0", font: "400 14px/1.4 var(--font-inter),sans-serif", color: "#5E7F6B" }}>
            {formatDate(selectedSlot.slot_date)} at {formatTime(selectedSlot.slot_time)}
          </p>
        )}
        <form onSubmit={handleSubmit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={labelStyle}>
            Full name
            <input required style={inputStyle} value={patientName} onChange={(e) => setPatientName(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ ...labelStyle, flex: "1 1 160px" }}>
              Birthdate
              <input required type="date" style={inputStyle} value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
            </label>
            <label style={{ ...labelStyle, flex: "1 1 120px" }}>
              Weight (lb)
              <input required type="number" min="1" style={inputStyle} value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
            </label>
          </div>
          <label style={labelStyle}>
            Gender
            <select required style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="" disabled>
                Select one
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
          <label style={labelStyle}>
            Email
            <input required type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={labelStyle}>
            Phone
            <input required type="tel" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          {submitError && (
            <p style={{ margin: 0, color: "#B3413C", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
              {submitError}
            </p>
          )}
          <PrimaryButton type="submit" disabled={step === "submitting"} style={{ marginTop: 4 }}>
            {step === "submitting" ? "Submitting…" : "Continue to payment"}
          </PrimaryButton>
        </form>
      </Card>
    );
  }

  // ---- success (stub — Milestone 4 replaces this with a Stripe redirect) ----
  if (step === "success") {
    return (
      <Card>
        <p
          style={{
            margin: 0,
            font: "500 10.5px/1 var(--font-inter),sans-serif",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#8A6A2C",
            background: "#F5EFE0",
            display: "inline-block",
            padding: "6px 12px",
          }}
        >
          Test mode — payment not yet connected
        </p>
        <p style={{ margin: "16px 0 0", font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
          Booking recorded.
        </p>
        <p style={{ margin: "10px 0 0", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#4A555C" }}>
          Booking ID: {bookingId}. In the real flow this is where you&apos;d be sent to Stripe to
          pay $149 — that gets wired up next.
        </p>
      </Card>
    );
  }

  return null;
}
