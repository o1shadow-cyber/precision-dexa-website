"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navLinks = [
  { href: "/services", label: "Services & Pricing" },
  { href: "/bone", label: "Bone Health" },
  { href: "/corporate", label: "Corporate Wellness" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(247,247,245,.94)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #E7E1D6",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,56px)",
          height: 82,
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "auto",
          }}
        >
          <Image
            src="/assets/logo.png"
            alt="Precision Dexa"
            width={150}
            height={30}
            style={{ height: "clamp(24px,2.4vw,30px)", width: "auto", display: "block" }}
            priority
          />
        </Link>

        <nav
          data-navlinks="1"
          style={{ display: "flex", alignItems: "center", gap: "clamp(18px,2.4vw,32px)" }}
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  background: "none",
                  padding: "4px 0",
                  font: "400 14px/1 var(--font-inter),sans-serif",
                  color: "#0D3B66",
                }}
              >
                {link.label}
                {active && (
                  <span
                    style={{
                      display: "block",
                      height: 1,
                      background: "#C6B18E",
                      marginTop: 5,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          data-cta="1"
          href="/book"
          className="pdx-btn-primary"
          style={{
            background: "#0D3B66",
            color: "#F7F7F5",
            border: 0,
            padding: "13px 22px",
            font: "500 12px/1 var(--font-inter),sans-serif",
            letterSpacing: ".13em",
            textTransform: "uppercase",
          }}
        >
          Book a Scan
        </Link>

        <button
          data-burger="1"
          className="pdx-burger"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            background: "none",
            border: "1px solid #E7E1D6",
            padding: 0,
            flex: "none",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0D3B66"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M3 6h18M3 12h18M3 18h18"></path>
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div
          data-mobilemenu="1"
          style={{
            borderTop: "1px solid #E7E1D6",
            background: "#F7F7F5",
            padding: "14px clamp(20px,5vw,56px) 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                background: "none",
                padding: "13px 0",
                width: "100%",
                textAlign: "left",
                font: "400 17px/1.3 Georgia,serif",
                color: "#0D3B66",
                borderBottom: i < navLinks.length - 1 ? "1px solid #E7E1D6" : "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 16,
              width: "100%",
              background: "#0D3B66",
              color: "#F7F7F5",
              padding: "16px 22px",
              textAlign: "left",
              font: "500 12px/1 var(--font-inter),sans-serif",
              letterSpacing: ".13em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Book a Scan
          </Link>
        </div>
      )}
    </header>
  );
}
