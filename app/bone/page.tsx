import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bone Health Facts — Precision Dexa",
  description:
    "Osteoporosis affects nearly 1 in 5 women and 1 in 20 men over 50. Learn how a DEXA scan can help you understand your bone health in Camas, WA.",
};

const whoCanBenefit = [
  "An adult concerned about bone health",
  "Someone with a family history of osteoporosis",
  "An individual who has experienced certain fractures",
  "A postmenopausal woman",
  "An older adult",
  "Living with certain medical conditions or risk factors",
  "Taking medications that may affect bone health",
  "Interested in establishing a baseline for future comparison",
];

export default function BonePage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(56px,7vw,96px)" }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,5vw,80px)",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 480px", minWidth: 300 }}>
            <p
              style={{
                margin: 0,
                font: "500 11px/1 var(--font-inter),sans-serif",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#5E7F6B",
              }}
            >
              Bone health facts
            </p>
            <h1
              style={{
                margin: "24px 0 0",
                font: "400 clamp(32px,4.4vw,56px)/1.1 Georgia,serif",
                letterSpacing: "-.02em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Know your numbers. Understand your body.{" "}
              <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>Protect your future.</em>
            </h1>
          </div>
          <p
            style={{
              flex: "1 1 360px",
              minWidth: 280,
              margin: 0,
              font: "400 clamp(16px,1.15vw,17.5px)/1.75 var(--font-inter),sans-serif",
              color: "#4A555C",
              textWrap: "pretty",
            }}
          >
            A DEXA scan provides valuable insight into your bone health and body composition. In
            a quick, painless scan, you can learn more about bone density, body fat, and lean
            muscle mass — information that can help you make more informed decisions about your
            health. DEXA is a quick, noninvasive test that is commonly used to measure bone
            mineral density, particularly at the hip and spine.
          </p>
        </div>
      </section>

      <section
        style={{ background: "#E7E1D6", padding: "clamp(64px,8vw,112px) clamp(20px,5vw,56px)" }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,80px)" }}>
            <h2
              style={{
                flex: "1 1 400px",
                minWidth: 300,
                margin: 0,
                font: "400 clamp(27px,3.5vw,42px)/1.18 Georgia,serif",
                letterSpacing: "-.015em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Your bones can lose strength{" "}
              <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>without you knowing it.</em>
            </h2>
            <p
              style={{
                flex: "1 1 380px",
                minWidth: 280,
                margin: 0,
                font: "400 clamp(16px,1.15vw,17.5px)/1.75 var(--font-inter),sans-serif",
                color: "#41505A",
                textWrap: "pretty",
              }}
            >
              Osteoporosis is often called a &quot;silent&quot; disease because bone loss can
              occur without obvious symptoms. A DEXA scan can identify low bone density before a
              fracture occurs and can help healthcare providers assess fracture risk and monitor
              bone health over time. According to the CDC, nearly 1 in 5 women and 1 in 20 men
              over age 50 are affected by osteoporosis.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(20px,2.5vw,32px)",
              marginTop: "clamp(44px,5vw,72px)",
            }}
          >
            {[
              ["1 in 5", "Women over age 50 affected by osteoporosis."],
              ["1 in 20", "Men over age 50 affected by osteoporosis."],
              [
                "~2 million",
                "Osteoporosis-related broken bones each year in the U.S., per the Bone Health and Osteoporosis Foundation.",
              ],
            ].map(([stat, desc]) => (
              <div
                key={stat}
                style={{
                  flex: "1 1 280px",
                  minWidth: 240,
                  background: "#F7F7F5",
                  padding: "clamp(28px,3vw,40px)",
                  borderTop: "2px solid #C6B18E",
                }}
              >
                <p style={{ margin: 0, font: "400 clamp(38px,4.4vw,54px)/1 Georgia,serif", color: "#0D3B66" }}>
                  {stat}
                </p>
                <p
                  style={{
                    margin: "14px 0 0",
                    font: "400 15.5px/1.65 var(--font-inter),sans-serif",
                    color: "#4A555C",
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(64px,8vw,112px) clamp(20px,5vw,56px)" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,5vw,80px)",
          }}
        >
          <h2
            style={{
              flex: "1 1 400px",
              minWidth: 300,
              margin: 0,
              font: "400 clamp(27px,3.5vw,42px)/1.18 Georgia,serif",
              letterSpacing: "-.015em",
              color: "#0D3B66",
              textWrap: "pretty",
            }}
          >
            Bone health is about <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>more than age.</em>
          </h2>
          <p
            style={{
              flex: "1 1 380px",
              minWidth: 280,
              margin: 0,
              font: "400 clamp(16px,1.15vw,17.5px)/1.75 var(--font-inter),sans-serif",
              color: "#4A555C",
              textWrap: "pretty",
            }}
          >
            Bone density can be affected by age, genetics, body weight, certain medications,
            medical conditions, hormonal changes, and lifestyle factors. Understanding your
            baseline can give you valuable information to discuss with your healthcare provider.
            NIAMS notes that DEXA can help identify osteoporosis, detect low bone density before
            osteoporosis develops, predict fracture risk, and monitor treatment effectiveness.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 clamp(20px,5vw,56px) clamp(72px,9vw,120px)" }}>
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            borderTop: "1px solid #E7E1D6",
            paddingTop: "clamp(44px,5vw,68px)",
          }}
        >
          <p
            style={{
              margin: 0,
              font: "500 11px/1 var(--font-inter),sans-serif",
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "#5E7F6B",
            }}
          >
            Who can benefit
          </p>
          <h2 style={{ margin: "22px 0 0", font: "400 clamp(26px,3.2vw,38px)/1.2 Georgia,serif", color: "#0D3B66" }}>
            A DEXA scan may be worth considering if you&apos;re…
          </h2>
          <ul
            style={{
              listStyle: "none",
              margin: "34px 0 0",
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: "16px 40px",
            }}
          >
            {whoCanBenefit.map((item) => (
              <li key={item} style={{ flex: "1 1 320px", display: "flex", gap: 13, alignItems: "flex-start" }}>
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
              marginTop: "clamp(40px,5vw,64px)",
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
            }}
          >
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
              Book Your Scan
            </Link>
            <p
              style={{
                margin: 0,
                maxWidth: "64ch",
                font: "400 13px/1.65 var(--font-inter),sans-serif",
                color: "#8A8378",
              }}
            >
              DEXA results are not a diagnosis by themselves and should be interpreted by an
              appropriately qualified healthcare professional in the context of the patient&apos;s
              medical history and other information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
