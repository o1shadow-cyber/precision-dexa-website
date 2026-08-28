import type { Metadata } from "next";
import { bestChoices, whatToAvoid, metalExplainer } from "@/lib/bookingCopy";

export const metadata: Metadata = {
  title: "Book Now — Precision Dexa",
  description:
    "Schedule your DEXA body composition scan in Camas, WA. About 15 minutes, $149, payment collected in full at booking.",
};

export default function BookPage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(40px,5vw,64px)" }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p
            style={{
              margin: 0,
              font: "500 11px/1 var(--font-inter),sans-serif",
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "#5E7F6B",
            }}
          >
            Book now
          </p>
          <h1 style={{ margin: "24px 0 0", font: "400 clamp(34px,4.6vw,58px)/1.1 Georgia,serif", letterSpacing: "-.02em", color: "#0D3B66" }}>
            Schedule <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>your scan.</em>
          </h1>
          <p style={{ margin: "26px 0 0", maxWidth: "54ch", font: "400 clamp(16px,1.15vw,18px)/1.72 var(--font-inter),sans-serif", color: "#4A555C" }}>
            Pick a time that works for you — scans take about 15 minutes. Payment is collected
            in full at booking.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,56px) clamp(64px,8vw,104px)" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            background: "#fff",
            border: "1px dashed #C6B18E",
            minHeight: "clamp(360px,42vw,520px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center",
            padding: 40,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C6B18E"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="17"></rect>
            <path d="M8 2v4M16 2v4M3 10h18"></path>
          </svg>
          <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>
            Booking coming soon
          </p>
          <p style={{ margin: 0, maxWidth: "44ch", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#8A8378" }}>
            The booking flow is being built right now — check back shortly, or call{" "}
            <a href="tel:3606063117">360.606.3117</a> to schedule directly.
          </p>
        </div>
      </section>

      <section style={{ background: "#E7E1D6", padding: "clamp(64px,8vw,104px) clamp(20px,5vw,56px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p
            style={{
              margin: 0,
              font: "500 11px/1 var(--font-inter),sans-serif",
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "#0D3B66",
            }}
          >
            Before you arrive
          </p>
          <h2 style={{ margin: "22px 0 0", font: "400 clamp(27px,3.5vw,42px)/1.18 Georgia,serif", letterSpacing: "-.015em", color: "#0D3B66" }}>
            What to wear — <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>keep it simple, keep it metal-free.</em>
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px,2.5vw,32px)", marginTop: "clamp(36px,4vw,56px)" }}>
            <div style={{ flex: "1 1 340px", minWidth: 280, background: "#F7F7F5", padding: "clamp(28px,3vw,40px)", borderTop: "2px solid #5E7F6B" }}>
              <h3 style={{ margin: 0, font: "400 22px/1.3 Georgia,serif", color: "#0D3B66" }}>Best choices</h3>
              <ul style={{ listStyle: "none", margin: "22px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {bestChoices.map((item) => (
                  <li key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5E7F6B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flex: "none", marginTop: 4 }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span style={{ font: "400 15.5px/1.65 var(--font-inter),sans-serif", color: "#33424C" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ flex: "1 1 340px", minWidth: 280, background: "#F7F7F5", padding: "clamp(28px,3vw,40px)", borderTop: "2px solid #C6B18E" }}>
              <h3 style={{ margin: 0, font: "400 22px/1.3 Georgia,serif", color: "#0D3B66" }}>What to avoid</h3>
              <ul style={{ listStyle: "none", margin: "22px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {whatToAvoid.map((item) => (
                  <li key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ flex: "none", marginTop: 9, width: 8, height: 1, background: "#C6B18E" }} />
                    <span style={{ font: "400 15.5px/1.65 var(--font-inter),sans-serif", color: "#33424C" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p
            style={{
              margin: "clamp(36px,4vw,52px) 0 0",
              maxWidth: "70ch",
              paddingLeft: "clamp(20px,2.5vw,32px)",
              borderLeft: "2px solid #C6B18E",
              font: "400 clamp(16px,1.4vw,19px)/1.7 Georgia,serif",
              color: "#0D3B66",
              textWrap: "pretty",
            }}
          >
            {metalExplainer}
          </p>
        </div>
      </section>
    </main>
  );
}
