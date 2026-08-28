import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services & Pricing — Precision Dexa",
  description:
    "Simple, transparent pricing for DEXA body composition scanning in Camas, WA. $149 per scan — no subscriptions, no referral required.",
};

const included = [
  "Bone-related measurements",
  "Body fat information",
  "Lean mass information",
  "Personalized results and report",
  "Quick, noninvasive examination",
  "Cash-pay pricing",
  "Superbill provided for patients who wish to seek potential insurance reimbursement",
];

export default function ServicesPage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(48px,6vw,80px)" }}
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
            Services &amp; Pricing
          </p>
          <h1
            style={{
              margin: "24px 0 0",
              font: "400 clamp(34px,4.8vw,60px)/1.1 Georgia,serif",
              letterSpacing: "-.02em",
              color: "#0D3B66",
              textWrap: "pretty",
            }}
          >
            Know more about your health — <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>$149.</em>
          </h1>
          <p
            style={{
              margin: "26px 0 0",
              maxWidth: "56ch",
              font: "400 clamp(16px,1.15vw,18px)/1.72 var(--font-inter),sans-serif",
              color: "#4A555C",
            }}
          >
            One scan, one price, about fifteen minutes. Everything below is included.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,56px) clamp(72px,9vw,120px)" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #E7E1D6",
            borderTop: "2px solid #C6B18E",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "clamp(28px,3.4vw,44px)",
              borderBottom: "1px solid #E7E1D6",
            }}
          >
            <h2 style={{ margin: 0, font: "400 clamp(24px,2.6vw,32px)/1.25 Georgia,serif", color: "#0D3B66" }}>
              DEXA Body Composition Scan
            </h2>
            <p style={{ margin: 0, font: "400 clamp(30px,3.4vw,42px)/1 Georgia,serif", color: "#5E7F6B" }}>
              $149
            </p>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "clamp(28px,3.4vw,44px)",
              display: "flex",
              flexWrap: "wrap",
              gap: "18px 40px",
            }}
          >
            {included.map((item) => (
              <li key={item} style={{ flex: "1 1 300px", display: "flex", gap: 13, alignItems: "flex-start" }}>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#5E7F6B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flex: "none", marginTop: 3 }}
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span style={{ font: "400 16px/1.6 var(--font-inter),sans-serif", color: "#33424C" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <div
            style={{
              padding: "clamp(28px,3.4vw,44px)",
              borderTop: "1px solid #E7E1D6",
              background: "#F7F7F5",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                margin: 0,
                flex: "1 1 380px",
                font: "400 clamp(19px,2.1vw,26px)/1.4 Georgia,serif",
                color: "#0D3B66",
              }}
            >
              No insurance required. No complicated billing.{" "}
              <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>One simple price.</em>
            </p>
            <Link
              href="/book"
              className="pdx-btn-primary"
              style={{
                background: "#0D3B66",
                color: "#F7F7F5",
                padding: "17px 32px",
                font: "500 12.5px/1 var(--font-inter),sans-serif",
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
