import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — Precision Dexa",
  description:
    "Visit Precision Dexa at 19550 SE Brady Road, Suite 18, Camas, WA. Call 360.606.3117 or email welcome@precisiondexa.com.",
};

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid #E7E1D6", paddingTop: 16 }}>
      <p
        style={{
          margin: 0,
          font: "500 10.5px/1 var(--font-inter),sans-serif",
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "#5E7F6B",
        }}
      >
        {label}
      </p>
      <p style={{ margin: "10px 0 0", font: "400 17.5px/1.55 var(--font-inter),sans-serif", color: "#33424C" }}>
        {children}
      </p>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(48px,6vw,80px)" }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,5vw,80px)",
          }}
        >
          <div style={{ flex: "1 1 380px", minWidth: 290 }}>
            <p
              style={{
                margin: 0,
                font: "500 11px/1 var(--font-inter),sans-serif",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#5E7F6B",
              }}
            >
              Contact
            </p>
            <h1 style={{ margin: "24px 0 0", font: "400 clamp(34px,4.6vw,58px)/1.1 Georgia,serif", letterSpacing: "-.02em", color: "#0D3B66" }}>
              Visit <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>us.</em>
            </h1>
            <div style={{ marginTop: 38, display: "flex", flexDirection: "column", gap: 26 }}>
              <InfoBlock label="Address">
                19550 SE Brady Road, Suite 18
                <br />
                Camas, WA
              </InfoBlock>
              <InfoBlock label="Phone">
                <a href="tel:3606063117">360.606.3117</a>
              </InfoBlock>
              <InfoBlock label="Email">
                <a href="mailto:welcome@precisiondexa.com">welcome@precisiondexa.com</a>
              </InfoBlock>
              <div style={{ borderTop: "1px solid #E7E1D6", paddingTop: 16 }}>
                <p
                  style={{
                    margin: 0,
                    font: "500 10.5px/1 var(--font-inter),sans-serif",
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "#5E7F6B",
                  }}
                >
                  Hours
                </p>
                <div
                  style={{
                    margin: "12px 0 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 7,
                    font: "400 16px/1.5 var(--font-inter),sans-serif",
                    color: "#33424C",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 300 }}>
                    <span>Monday – Friday</span>
                    <span>8am – 8pm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 300 }}>
                    <span>Saturday</span>
                    <span>8am – 5pm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 300, color: "#8A8378" }}>
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/book"
              className="pdx-btn-primary"
              style={{
                marginTop: 38,
                display: "inline-block",
                background: "#0D3B66",
                color: "#F7F7F5",
                padding: "17px 32px",
                font: "500 12.5px/1 var(--font-inter),sans-serif",
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}
            >
              Book a Scan
            </Link>
          </div>

          <div style={{ flex: "1 1 420px", minWidth: 290 }}>
            <div
              style={{
                background: "#fff",
                border: "1px dashed #C6B18E",
                height: "clamp(340px,42vw,560px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                textAlign: "center",
                padding: 32,
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
                <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <p style={{ margin: 0, font: "400 20px/1.4 Georgia,serif", color: "#0D3B66" }}>Map</p>
              <p style={{ margin: 0, maxWidth: "38ch", font: "400 14.5px/1.65 var(--font-inter),sans-serif", color: "#8A8378" }}>
                Reserved space for a Google Maps embed of 19550 SE Brady Road, Suite 18.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
