import { Suspense } from "react";
import ConfirmationClient from "./ConfirmationClient";

export default function ConfirmationPage() {
  return (
    <main className="pdx-main" style={{ padding: "clamp(56px,7vw,104px) clamp(20px,5vw,56px)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
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
        <h1
          style={{
            margin: "16px 0 32px",
            font: "400 clamp(28px,3.6vw,42px)/1.15 Georgia,serif",
            letterSpacing: "-.02em",
            color: "#0D3B66",
          }}
        >
          Confirmation
        </h1>
        <Suspense fallback={<div />}>
          <ConfirmationClient />
        </Suspense>
      </div>
    </main>
  );
}
