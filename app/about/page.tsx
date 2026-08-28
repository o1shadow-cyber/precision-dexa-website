import type { Metadata } from "next";

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
          <figure
            style={{
              flex: "1 1 380px",
              minWidth: 280,
              margin: 0,
              background: "#0D3B66",
              padding: "clamp(28px,3vw,44px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 32,
              minHeight: "clamp(360px,40vw,520px)",
            }}
          >
            <p
              style={{
                margin: 0,
                font: "500 10px/1 var(--font-inter),sans-serif",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#C6B18E",
              }}
            >
              Amber, RT &nbsp;·&nbsp; Founder
            </p>
            <div>
              <p
                style={{
                  margin: 0,
                  font: "400 clamp(64px,8vw,104px)/.92 Georgia,serif",
                  letterSpacing: "-.03em",
                  color: "#F7F7F5",
                }}
              >
                18
              </p>
              <p
                style={{
                  margin: "14px 0 0",
                  font: "400 clamp(17px,1.7vw,21px)/1.45 Georgia,serif",
                  fontStyle: "italic",
                  color: "#C6B18E",
                }}
              >
                years in diagnostic imaging
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Registered Radiologic Technologist",
                "Every scan performed personally",
                "Locally owned in Camas, WA",
              ].map((item) => (
                <p
                  key={item}
                  style={{
                    margin: 0,
                    paddingTop: 14,
                    borderTop: "1px solid rgba(198,177,142,.45)",
                    font: "400 15px/1.5 var(--font-inter),sans-serif",
                    color: "rgba(247,247,245,.9)",
                  }}
                >
                  {item}
                </p>
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
