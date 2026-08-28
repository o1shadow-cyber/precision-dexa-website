import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corporate Wellness — Precision Dexa",
  description:
    "Group DEXA scanning days for Camas and Vancouver-area employers, gyms, and teams. Private results, group pricing for 10+.",
};

const features = [
  {
    title: "Scheduled scan days",
    desc: "We block a day for your group and run appointments back to back.",
    path: (
      <>
        <rect x="3" y="4" width="18" height="17"></rect>
        <path d="M8 2v4M16 2v4M3 10h18"></path>
      </>
    ),
  },
  {
    title: "Group pricing",
    desc: "Reduced per-scan rates for groups of ten or more.",
    path: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      </>
    ),
  },
  {
    title: "Private results",
    desc: "Individual reports go to the participant only — never to the employer.",
    path: (
      <>
        <path d="M3 3v18h18"></path>
        <path d="M7 15l4-5 3 3 5-7"></path>
      </>
    ),
  },
];

const runList = [
  "One point of contact, one invoice",
  "Fifteen minutes per participant, no prep",
  "Optional follow-up scans to track change over time",
  "Performed by an RT-certified technologist",
];

const schedule = [
  "8:00 am",
  "8:20 am",
  "8:40 am",
  "9:00 am",
  "9:20 break",
  "9:40 am",
  "10:00 am",
  "10:20 am",
];

export default function CorporatePage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(56px,7vw,96px)" }}
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
            For employers
          </p>
          <h1
            style={{
              margin: "24px 0 0",
              font: "400 clamp(34px,4.6vw,58px)/1.1 Georgia,serif",
              letterSpacing: "-.02em",
              color: "#0D3B66",
              textWrap: "pretty",
            }}
          >
            A wellness benefit your team can{" "}
            <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>actually measure.</em>
          </h1>
          <p
            style={{
              margin: "26px 0 0",
              maxWidth: "58ch",
              font: "400 clamp(16px,1.15vw,18px)/1.72 var(--font-inter),sans-serif",
              color: "#4A555C",
              textWrap: "pretty",
            }}
          >
            Group scanning days for Camas and Vancouver-area employers, gyms, and teams. Each
            participant gets the same fifteen-minute scan and plain-language report we give
            every client — no insurance, no paperwork for your HR team.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,56px) clamp(64px,8vw,104px)" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(20px,2.5vw,32px)",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                flex: "1 1 280px",
                minWidth: 250,
                background: "#fff",
                border: "1px solid #E7E1D6",
                padding: "clamp(28px,3vw,40px)",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5E7F6B"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {f.path}
              </svg>
              <h3 style={{ margin: "20px 0 0", font: "400 22px/1.3 Georgia,serif", color: "#0D3B66" }}>
                {f.title}
              </h3>
              <p style={{ margin: "11px 0 0", font: "400 15.5px/1.7 var(--font-inter),sans-serif", color: "#4A555C" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{ background: "#E7E1D6", padding: "clamp(64px,8vw,104px) clamp(20px,5vw,56px)" }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(40px,5vw,88px)",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 420px", minWidth: 300 }}>
            <h2
              style={{
                margin: 0,
                font: "400 clamp(27px,3.4vw,42px)/1.18 Georgia,serif",
                letterSpacing: "-.015em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Simple to run, <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>easy to offer.</em>
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: "32px 0 0",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {runList.map((item) => (
                <li key={item} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <svg
                    width="18"
                    height="18"
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
                  <span style={{ font: "400 16.5px/1.55 var(--font-inter),sans-serif", color: "#33424C" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="pdx-btn-primary"
              style={{
                marginTop: 36,
                display: "inline-block",
                background: "#0D3B66",
                color: "#F7F7F5",
                padding: "17px 32px",
                font: "500 12.5px/1 var(--font-inter),sans-serif",
                letterSpacing: ".14em",
                textTransform: "uppercase",
              }}
            >
              Request a proposal
            </Link>
          </div>
          <figure
            style={{
              flex: "1 1 380px",
              minWidth: 280,
              margin: 0,
              background: "#F7F7F5",
              border: "1px solid #D9D1C1",
              padding: "clamp(24px,2.6vw,38px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                paddingBottom: 14,
                borderBottom: "1px solid #E0D8C8",
              }}
            >
              <span style={{ font: "500 10px/1 var(--font-inter),sans-serif", letterSpacing: ".2em", textTransform: "uppercase", color: "#5E7F6B" }}>
                A sample scan day
              </span>
              <span style={{ font: "400 11.5px/1 var(--font-inter),sans-serif", color: "#8A8378" }}>
                15 min each
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
              {schedule.map((slot) => (
                <div
                  key={slot}
                  style={{
                    flex: "1 1 110px",
                    borderLeft: `2px solid ${slot.includes("break") ? "#C6B18E" : "#5E7F6B"}`,
                    padding: "10px 0 10px 12px",
                    font: "400 14px/1.3 var(--font-inter),sans-serif",
                    color: slot.includes("break") ? "#8A8378" : "#33424C",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {slot}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px 32px",
                marginTop: 26,
                paddingTop: 18,
                borderTop: "1px solid #E0D8C8",
              }}
            >
              <div style={{ flex: "1 1 120px" }}>
                <p style={{ margin: 0, font: "400 clamp(24px,2.4vw,32px)/1 Georgia,serif", color: "#0D3B66" }}>
                  Up to 20
                </p>
                <p style={{ margin: "8px 0 0", font: "400 13.5px/1.5 var(--font-inter),sans-serif", color: "#5A6068" }}>
                  scans in a single day
                </p>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <p style={{ margin: 0, font: "400 clamp(24px,2.4vw,32px)/1 Georgia,serif", color: "#0D3B66" }}>
                  10+
                </p>
                <p style={{ margin: "8px 0 0", font: "400 13.5px/1.5 var(--font-inter),sans-serif", color: "#5A6068" }}>
                  participants for group pricing
                </p>
              </div>
            </div>
          </figure>
        </div>
      </section>
    </main>
  );
}
