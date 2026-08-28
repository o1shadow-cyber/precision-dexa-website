import Link from "next/link";
import FactCarousel from "@/components/FactCarousel";

const barHeights = [
  16, 24, 33, 43, 56, 68, 79, 87, 93, 85, 73, 63, 71, 83, 90, 77, 61, 47, 35, 22,
];
const barColors = [
  "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B",
  "#C6B18E", "#C6B18E", "#C6B18E", "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B",
  "#C6B18E", "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B", "#5E7F6B",
];

export default function HomePage() {
  return (
    <main className="pdx-main">
      <section
        style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px) clamp(64px,8vw,112px)" }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 460px", minWidth: 300 }}>
            <p
              style={{
                margin: 0,
                font: "500 11px/1 var(--font-inter),sans-serif",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#5E7F6B",
              }}
            >
              DEXA Body Composition · Camas, WA
            </p>
            <h1
              style={{
                margin: "26px 0 0",
                font: "400 clamp(38px,5.4vw,68px)/1.08 Georgia,serif",
                letterSpacing: "-.02em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Your body composition, finally{" "}
              <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>
                measured with precision.
              </em>
            </h1>
            <p
              style={{
                margin: "28px 0 0",
                maxWidth: "52ch",
                font: "400 clamp(16px,1.2vw,18.5px)/1.72 var(--font-inter),sans-serif",
                color: "#4A555C",
                textWrap: "pretty",
              }}
            >
              Clinical-grade DEXA scanning in Camas — fat, muscle, and bone density, broken down
              clearly, in about fifteen minutes. No guessing, no averages, just your numbers.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                alignItems: "center",
                marginTop: 38,
              }}
            >
              <Link
                href="/book"
                className="pdx-btn-primary"
                style={{
                  background: "#0D3B66",
                  color: "#F7F7F5",
                  padding: "17px 30px",
                  font: "500 12.5px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                }}
              >
                Book Your Scan
              </Link>
              <Link
                href="/services"
                className="pdx-btn-outline"
                style={{
                  background: "none",
                  color: "#0D3B66",
                  border: "1px solid #C6B18E",
                  padding: "17px 30px",
                  font: "500 12.5px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                }}
              >
                $149 — see what&apos;s included
              </Link>
            </div>
            <p
              style={{
                margin: "34px 0 0",
                font: "400 13.5px/1.6 var(--font-inter),sans-serif",
                color: "#8A8378",
              }}
            >
              About 15 minutes &nbsp;·&nbsp; No prep required &nbsp;·&nbsp; No insurance needed
            </p>
          </div>

          <figure
            style={{
              flex: "1 1 400px",
              minWidth: 280,
              margin: 0,
              background: "#0D3B66",
              padding: "clamp(24px,2.6vw,38px)",
              height: "clamp(380px,46vw,548px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(198,177,142,.45)",
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
                Body composition profile
              </span>
              <span
                style={{
                  font: "400 12px/1 var(--font-inter),sans-serif",
                  color: "rgba(247,247,245,.6)",
                }}
              >
                Illustrative
              </span>
            </div>

            <div
              style={{
                position: "relative",
                flex: "1 1 auto",
                marginTop: 22,
                background:
                  "repeating-linear-gradient(to top,rgba(247,247,245,.09) 0 1px,transparent 1px 25%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "clamp(3px,.55vw,7px)",
                }}
              >
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    style={{ flex: 1, height: `${h}%`, background: barColors[i] }}
                  />
                ))}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: "62%",
                  height: 1,
                  background: "#F7F7F5",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(62% + 8px)",
                  font: "400 11.5px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".06em",
                  color: "#F7F7F5",
                }}
              >
                62nd percentile
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px 28px",
                marginTop: 22,
                paddingTop: 16,
                borderTop: "1px solid rgba(198,177,142,.45)",
              }}
            >
              {[
                ["Fat mass", "14.8%"],
                ["Lean mass", "81.4%"],
                ["Bone density", "1.184 g/cm²"],
              ].map(([label, value]) => (
                <div key={label} style={{ flex: "1 1 90px" }}>
                  <p
                    style={{
                      margin: 0,
                      font: "500 9.5px/1 var(--font-inter),sans-serif",
                      letterSpacing: ".18em",
                      textTransform: "uppercase",
                      color: "rgba(247,247,245,.55)",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: "9px 0 0",
                      font: "400 clamp(19px,1.9vw,24px)/1 Georgia,serif",
                      color: "#F7F7F5",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </figure>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid #E7E1D6",
          padding: "clamp(72px,9vw,128px) clamp(20px,5vw,56px)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(32px,5vw,80px)",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "1 1 420px", minWidth: 300 }}>
              <p
                style={{
                  margin: 0,
                  font: "500 11px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "#5E7F6B",
                }}
              >
                What a scan shows
              </p>
              <h2
                style={{
                  margin: "22px 0 0",
                  font: "400 clamp(30px,4vw,50px)/1.14 Georgia,serif",
                  letterSpacing: "-.015em",
                  color: "#0D3B66",
                  textWrap: "pretty",
                }}
              >
                The scale doesn&apos;t tell{" "}
                <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>the whole story.</em>
              </h2>
            </div>
            <p
              style={{
                flex: "1 1 380px",
                minWidth: 280,
                margin: 0,
                paddingTop: 8,
                font: "400 clamp(16px,1.15vw,18px)/1.75 var(--font-inter),sans-serif",
                color: "#4A555C",
                textWrap: "pretty",
              }}
            >
              Your weight is only one number. A body-composition DEXA scan can provide
              information about how that weight is distributed between fat mass, lean mass, and
              bone-related measurements.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(20px,2.5vw,32px)",
              marginTop: "clamp(48px,6vw,76px)",
            }}
          >
            {[
              {
                title: "Fat Mass",
                desc: "How much fat your body contains.",
                path: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
              },
              {
                title: "Lean Mass",
                desc: "Includes muscle and other lean tissues.",
                path: "M22 12h-4l-3 9L9 3l-3 9H2",
              },
              {
                title: "Bone",
                desc: "Bone mineral content and density information.",
                path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              },
            ].map((card) => (
              <div
                key={card.title}
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
                  <path d={card.path}></path>
                </svg>
                <h3
                  style={{
                    margin: "20px 0 0",
                    font: "400 22px/1.3 Georgia,serif",
                    color: "#0D3B66",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    margin: "11px 0 0",
                    font: "400 15.5px/1.7 var(--font-inter),sans-serif",
                    color: "#4A555C",
                  }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <blockquote
            style={{
              margin: "clamp(56px,7vw,96px) 0 0",
              padding: "0 0 0 clamp(24px,3vw,40px)",
              borderLeft: "2px solid #C6B18E",
              maxWidth: "26ch",
            }}
          >
            <p
              style={{
                margin: 0,
                font: "400 clamp(24px,2.9vw,36px)/1.35 Georgia,serif",
                fontStyle: "italic",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Two people can weigh the same — but have very different body compositions.
            </p>
          </blockquote>
        </div>
      </section>

      <section
        style={{ background: "#E7E1D6", padding: "clamp(72px,9vw,128px) clamp(20px,5vw,56px)" }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(36px,5vw,80px)",
            alignItems: "center",
          }}
        >
          <figure
            style={{
              flex: "1 1 400px",
              minWidth: 280,
              margin: 0,
              background: "#F7F7F5",
              border: "1px solid #D9D1C1",
              padding: "clamp(24px,2.6vw,38px)",
              display: "flex",
              flexDirection: "column",
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
              <span
                style={{
                  font: "500 10px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#5E7F6B",
                }}
              >
                Same weight, six months apart
              </span>
              <span
                style={{ font: "400 11.5px/1 var(--font-inter),sans-serif", color: "#8A8378" }}
              >
                Illustrative
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "clamp(20px,3vw,44px)",
                alignItems: "flex-end",
                marginTop: 28,
                height: "clamp(210px,24vw,280px)",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      height: "27%",
                      background: "#C6B18E",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      font: "400 12.5px/1 var(--font-inter),sans-serif",
                      color: "#4A3F2C",
                    }}
                  >
                    Fat 27%
                  </div>
                  <div
                    style={{
                      height: "73%",
                      background: "#5E7F6B",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      font: "400 12.5px/1 var(--font-inter),sans-serif",
                      color: "#F7F7F5",
                    }}
                  >
                    Lean 73%
                  </div>
                </div>
                <p
                  style={{
                    margin: "12px 0 0",
                    font: "400 13px/1.4 var(--font-inter),sans-serif",
                    letterSpacing: ".04em",
                    color: "#8A8378",
                  }}
                >
                  First scan
                </p>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      height: "19%",
                      background: "#C6B18E",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      font: "400 12.5px/1 var(--font-inter),sans-serif",
                      color: "#4A3F2C",
                    }}
                  >
                    Fat 19%
                  </div>
                  <div
                    style={{
                      height: "81%",
                      background: "#0D3B66",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      font: "400 12.5px/1 var(--font-inter),sans-serif",
                      color: "#F7F7F5",
                    }}
                  >
                    Lean 81%
                  </div>
                </div>
                <p
                  style={{
                    margin: "12px 0 0",
                    font: "400 13px/1.4 var(--font-inter),sans-serif",
                    letterSpacing: ".04em",
                    color: "#0D3B66",
                  }}
                >
                  Follow-up scan
                </p>
              </div>
            </div>

            <p
              style={{
                margin: "24px 0 0",
                paddingTop: 16,
                borderTop: "1px solid #E0D8C8",
                font: "400 14.5px/1.6 Georgia,serif",
                fontStyle: "italic",
                color: "#0D3B66",
              }}
            >
              The scale reads the same both times. The composition doesn&apos;t.
            </p>
          </figure>
          <div style={{ flex: "1 1 440px", minWidth: 300 }}>
            <p
              style={{
                margin: 0,
                font: "500 11px/1 var(--font-inter),sans-serif",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#0D3B66",
              }}
            >
              Beyond the scale
            </p>
            <h2
              style={{
                margin: "22px 0 0",
                font: "400 clamp(28px,3.7vw,46px)/1.16 Georgia,serif",
                letterSpacing: "-.015em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Are you working hard but not seeing{" "}
              <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>the whole picture?</em>
            </h2>
            <p
              style={{
                margin: "26px 0 0",
                font: "400 clamp(16px,1.15vw,18px)/1.75 var(--font-inter),sans-serif",
                color: "#41505A",
                textWrap: "pretty",
              }}
            >
              Whether you&apos;re beginning a fitness journey, strength training, losing weight,
              or simply trying to maintain your health as you age, body composition information
              can provide another way to track your progress beyond the number on the scale.
              DEXA is one tool that can help provide additional information about body
              composition that can complement other health and fitness measurements.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(64px,8vw,112px) clamp(20px,5vw,56px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
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
              Did you know
            </p>
            <FactCarousel />
          </div>
          <p
            style={{
              margin: "20px 0 0",
              maxWidth: "80ch",
              font: "400 13px/1.65 var(--font-inter),sans-serif",
              color: "#8A8378",
            }}
          >
            DEXA results are not a diagnosis by themselves and should be interpreted by an
            appropriately qualified healthcare professional in the context of the patient&apos;s
            medical history and other information.
          </p>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid #E7E1D6",
          padding: "clamp(72px,9vw,128px) clamp(20px,5vw,56px)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <p
            style={{
              margin: 0,
              font: "500 11px/1 var(--font-inter),sans-serif",
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "#5E7F6B",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              margin: "22px 0 0",
              font: "400 clamp(28px,3.7vw,46px)/1.16 Georgia,serif",
              letterSpacing: "-.015em",
              color: "#0D3B66",
            }}
          >
            You&apos;re more than <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>a number on a scale.</em>
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(24px,3vw,44px)",
              marginTop: "clamp(44px,5vw,72px)",
            }}
          >
            {[
              ["01", "Book", "Schedule your scan online in under a minute."],
              [
                "02",
                "Scan",
                "Arrive, change if needed, and complete your scan — about 15 minutes, no prep required.",
              ],
              [
                "03",
                "Results",
                "Walk away with a clear report and a conversation about what it means for your goals.",
              ],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                style={{
                  flex: "1 1 260px",
                  minWidth: 240,
                  borderTop: "1px solid #C6B18E",
                  paddingTop: 24,
                }}
              >
                <p style={{ margin: 0, font: "400 32px/1 Georgia,serif", color: "#C6B18E" }}>
                  {num}
                </p>
                <h3
                  style={{
                    margin: "18px 0 0",
                    font: "400 24px/1.25 Georgia,serif",
                    color: "#0D3B66",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    margin: "10px 0 0",
                    font: "400 15.5px/1.7 var(--font-inter),sans-serif",
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

      <section
        style={{ background: "#E7E1D6", padding: "clamp(72px,9vw,128px) clamp(20px,5vw,56px)" }}
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
          <div style={{ flex: "1 1 400px", minWidth: 290 }}>
            <p
              style={{
                margin: 0,
                font: "500 11px/1 var(--font-inter),sans-serif",
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#0D3B66",
              }}
            >
              Why Precision Dexa
            </p>
            <h2
              style={{
                margin: "22px 0 0",
                font: "400 clamp(28px,3.6vw,44px)/1.16 Georgia,serif",
                letterSpacing: "-.015em",
                color: "#0D3B66",
                textWrap: "pretty",
              }}
            >
              Walk in, walk out,{" "}
              <em style={{ fontStyle: "italic", color: "#5E7F6B" }}>
                know exactly where you stand.
              </em>
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: "34px 0 0",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {[
                "Clinical-grade DEXA equipment",
                "Performed by an RT-certified technologist",
                "Results explained in plain language, same day",
                "No insurance required — one simple cash-pay price",
              ].map((item) => (
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
                  <span
                    style={{
                      font: "400 16.5px/1.55 var(--font-inter),sans-serif",
                      color: "#33424C",
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              flex: "1 1 420px",
              minWidth: 300,
              background: "#F7F7F5",
              border: "1px solid #C6B18E",
              padding: "clamp(26px,3vw,40px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 16,
                borderBottom: "1px solid #E0D8C8",
                paddingBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, font: "400 21px/1.3 Georgia,serif", color: "#0D3B66" }}>
                See exactly where you stand
              </h3>
              <span
                style={{
                  font: "500 9.5px/1 var(--font-inter),sans-serif",
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "#8A8378",
                }}
              >
                Illustrative
              </span>
            </div>

            <p
              style={{
                margin: "26px 0 0",
                font: "500 10.5px/1 var(--font-inter),sans-serif",
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "#5E7F6B",
              }}
            >
              Body fat percentile — age &amp; sex matched
            </p>
            <div
              style={{
                marginTop: 14,
                position: "relative",
                height: 10,
                background: "#E7E1D6",
              }}
            >
              <div
                style={{ position: "absolute", inset: "0 38% 0 0", background: "#5E7F6B" }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "62%",
                  top: -6,
                  width: 2,
                  height: 22,
                  background: "#0D3B66",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 9,
                font: "400 11.5px/1 var(--font-inter),sans-serif",
                color: "#8A8378",
              }}
            >
              <span>0</span>
              <span style={{ color: "#0D3B66" }}>62nd</span>
              <span>100</span>
            </div>

            <div
              style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}
            >
              {[
                ["Fat mass", "24.1 lb · 14.8%", 26, "#C6B18E"],
                ["Lean mass", "132.6 lb · 81.4%", 81, "#5E7F6B"],
                ["Bone mineral density", "1.184 g/cm² · T-score −0.4", 64, "#0D3B66"],
              ].map(([label, value, width, color]) => (
                <div key={label as string}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      font: "400 14.5px/1 var(--font-inter),sans-serif",
                      color: "#33424C",
                    }}
                  >
                    <span>{label}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "#0D3B66" }}>
                      {value}
                    </span>
                  </div>
                  <div style={{ marginTop: 9, height: 5, background: "#E7E1D6" }}>
                    <div
                      style={{
                        width: `${width}%`,
                        height: "100%",
                        background: color as string,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                margin: "28px 0 0",
                paddingTop: 18,
                borderTop: "1px solid #E0D8C8",
                font: "400 12.5px/1.6 var(--font-inter),sans-serif",
                color: "#8A8378",
              }}
            >
              Sample layout only. Values shown are illustrative and do not represent a real
              patient.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{ background: "#0D3B66", padding: "clamp(72px,9vw,124px) clamp(20px,5vw,56px)" }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 36,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              flex: "1 1 420px",
              font: "400 clamp(30px,4vw,50px)/1.14 Georgia,serif",
              letterSpacing: "-.015em",
              color: "#F7F7F5",
            }}
          >
            Your real numbers are{" "}
            <em style={{ fontStyle: "italic", color: "#C6B18E" }}>one scan away.</em>
          </h2>
          <Link
            href="/book"
            className="pdx-btn-light"
            style={{
              background: "#F7F7F5",
              color: "#0D3B66",
              padding: "19px 34px",
              font: "500 12.5px/1 var(--font-inter),sans-serif",
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Book Your Scan
          </Link>
        </div>
      </section>
    </main>
  );
}
