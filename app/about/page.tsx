import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — Precision Dexa",
  description:
    "Meet Amber, RT — a Registered Radiologic Technologist with 18 years of diagnostic imaging experience, locally owned and operated in Camas, WA.",
};

export default function AboutPage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(72px,9vw,120px)" }}
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
          <figure style={{ flex: "1 1 380px", minWidth: 280, margin: 0 }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "466 / 593",
                background: "#E7E1D6",
                overflow: "hidden",
              }}
            >
              <Image
                src="/assets/amber-about.png"
                alt="Amber, RT, standing beside the DEXA scanner at Precision Dexa"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 700px) 100vw, 460px"
                priority
              />
            </div>
            <figcaption
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <span
                style={{
                  font: "500 10px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#5E7F6B",
                }}
              >
                Amber, RT &nbsp;·&nbsp; Founder
              </span>
              <span style={{ font: "400 21px/1 Georgia,serif", color: "#0D3B66" }}>
                18 <em style={{ fontStyle: "italic", color: "#5E7F6B", fontSize: 14 }}>years</em>
              </span>
            </figcaption>
            <div
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: "1px solid #E7E1D6",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                "Registered Radiologic Technologist",
                "Every scan performed personally",
                "Locally owned in Camas, WA",
              ].map((item) => (
                <span key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5E7F6B"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flex: "none", marginTop: 4 }}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span style={{ font: "400 14.5px/1.5 var(--font-inter),sans-serif", color: "#33424C" }}>
                    {item}
                  </span>
                </span>
              ))}
            </div>
          </figure>
          <div style={{ flex: "1 1 440px", minWidth: 300 }}>
            <p
              style={{
                margin: 0,
                font: "500 11px/1 var(--font-inter),sans-serif",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#5E7F6B",
              }}
            >
              About
            </p>
            <h1
              style={{
                margin: "24px 0 0",
                font: "400 clamp(32px,4.2vw,54px)/1.1 Georgia,serif",
                letterSpacing: "-.02em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Imaging experience <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>you can trust.</em>
            </h1>
            <p
              style={{
                margin: "28px 0 0",
                font: "400 clamp(16px,1.15vw,18px)/1.75 var(--font-inter),sans-serif",
                color: "#4A555C",
                textWrap: "pretty",
              }}
            >
              With approximately 18 years of experience as a Radiologic Technologist, I
              understand the importance of quality imaging, patient comfort, safety, and
              attention to detail. My goal is to create an experience where patients feel
              comfortable, informed, and respected while receiving valuable information about
              their bone health and body composition.
            </p>
            <p style={{ margin: "26px 0 0", font: "400 17px/1 Georgia,serif", fontStyle: "italic", color: "#0D3B66" }}>
              — Amber, RT
            </p>
            <p
              style={{
                margin: "36px 0 0",
                paddingTop: 24,
                borderTop: "1px solid #C6B18E",
                font: "500 12px/1.7 var(--font-inter),sans-serif",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#5E7F6B",
              }}
            >
              RT-certified &nbsp;·&nbsp; Locally owned and operated in Camas, WA
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
