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
                aspectRatio: "886 / 1075",
                background: "#E7E1D6",
                overflow: "hidden",
              }}
            >
              <Image
                src="/assets/amber-about.jpg"
                alt="Amber, RT, standing beside the DEXA scanner at Precision Dexa"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 700px) 100vw, 460px"
                priority
              />
            </div>
            <figcaption
              style={{
                background: "#0D3B66",
                padding: "18px clamp(20px,2.4vw,28px)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                style={{
                  font: "500 10px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#C6B18E",
                }}
              >
                Amber, RT &nbsp;·&nbsp; Founder
              </span>
              <span style={{ font: "400 16px/1 Georgia,serif", fontStyle: "italic", color: "#F7F7F5" }}>
                18 years in diagnostic imaging
              </span>
            </figcaption>
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
            <div
              style={{
                marginTop: 36,
                display: "flex",
                flexWrap: "wrap",
                columnGap: "clamp(32px,4vw,56px)",
                rowGap: 20,
              }}
            >
              {[
                "Registered Radiologic Technologist",
                "Every scan performed personally",
                "Locally owned in Camas, WA",
              ].map((item) => (
                <p
                  key={item}
                  style={{
                    flex: "1 1 180px",
                    margin: 0,
                    paddingTop: 14,
                    borderTop: "1px solid #E7E1D6",
                    font: "400 15px/1.5 var(--font-inter),sans-serif",
                    color: "#33424C",
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
