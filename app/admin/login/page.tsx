"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(40px,6vw,80px) 20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          border: "1px solid #E7E1D6",
          borderTop: "2px solid #C6B18E",
          padding: "clamp(28px,4vw,40px)",
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
          Admin
        </p>
        <h1
          style={{
            margin: "16px 0 0",
            font: "400 28px/1.2 Georgia,serif",
            color: "#0D3B66",
          }}
        >
          Sign in
        </h1>
        <label
          style={{
            display: "block",
            marginTop: 24,
            font: "500 11px/1 var(--font-inter),sans-serif",
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "#5E7F6B",
          }}
        >
          Password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: 10,
              padding: "12px 14px",
              font: "400 16px/1 var(--font-inter),sans-serif",
              color: "#0D3B66",
              border: "1px solid #E7E1D6",
              background: "#F7F7F5",
            }}
          />
        </label>
        {error && (
          <p style={{ margin: "14px 0 0", color: "#B3413C", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="pdx-btn-primary"
          style={{
            marginTop: 24,
            width: "100%",
            background: "#0D3B66",
            color: "#F7F7F5",
            border: 0,
            padding: "14px 22px",
            font: "500 12.5px/1 var(--font-inter),sans-serif",
            letterSpacing: ".14em",
            textTransform: "uppercase",
            opacity: loading || !password ? 0.6 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
