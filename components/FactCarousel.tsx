"use client";

import { useEffect, useRef, useState } from "react";

const facts = [
  <>
    Bone loss can happen silently.{" "}
    <span style={{ color: "#4A555C" }}>
      Osteoporosis may not cause noticeable symptoms until a fracture occurs.
    </span>
  </>,
  <>
    DEXA is the most common test for measuring bone mineral density.{" "}
    <span style={{ color: "#4A555C" }}>Central DEXA generally measures the hip and spine.</span>
  </>,
  <>
    Men need to pay attention to bone health too.{" "}
    <span style={{ color: "#4A555C" }}>
      The CDC reports osteoporosis in approximately 4.2% of men and 18.8% of women age 50 and
      older.
    </span>
  </>,
];

const FACT_INTERVAL_MS = 18000;

export default function FactCarousel() {
  const [fact, setFact] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setFact((f) => (f + 1) % 3);
    }, FACT_INTERVAL_MS);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pickFact = (n: number) => {
    setFact(n);
    startTimer();
  };

  return (
    <>
      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
        {[0, 1, 2].map((n) => (
          <button
            key={n}
            onClick={() => pickFact(n)}
            aria-label={`Fact ${n + 1}`}
            style={{
              width: 7,
              height: 7,
              padding: 0,
              border: "1px solid #5E7F6B",
              borderRadius: "50%",
              background: "none",
            }}
          >
            {fact === n && (
              <span
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#5E7F6B",
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          background: "#fff",
          border: "1px solid #E7E1D6",
          borderTop: "2px solid #C6B18E",
          padding: "clamp(32px,4vw,56px)",
          minHeight: 200,
          display: "flex",
          alignItems: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            font: "400 clamp(20px,2.4vw,30px)/1.45 Georgia,serif",
            color: "#0D3B66",
            textWrap: "pretty",
          }}
        >
          {facts[fact]}
        </p>
      </div>
    </>
  );
}
