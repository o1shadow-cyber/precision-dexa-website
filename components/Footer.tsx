import Link from "next/link";
import Image from "next/image";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="pdx-link"
      style={{
        background: "none",
        padding: 0,
        font: "400 15px/1.4 var(--font-inter),sans-serif",
        color: "#33424C",
      }}
    >
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: "1 1 180px", minWidth: 160 }}>
      <p
        style={{
          margin: 0,
          font: "500 10.5px/1 var(--font-inter),sans-serif",
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "#5E7F6B",
        }}
      >
        {title}
      </p>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background: "#E7E1D6",
        borderTop: "1px solid #D9D1C1",
        padding: "clamp(56px,7vw,88px) clamp(20px,5vw,56px) 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(36px,5vw,72px)",
        }}
      >
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <Image
            src="/assets/logo-lockup.png"
            alt="Precision Dexa — Accurate Insights, Better Health"
            width={300}
            height={90}
            style={{ width: "100%", maxWidth: 300, height: "auto", display: "block" }}
          />
          <p
            style={{
              margin: "24px 0 0",
              font: "400 14.5px/1.7 var(--font-inter),sans-serif",
              color: "#5A6068",
            }}
          >
            19550 SE Brady Road, Suite 18
            <br />
            Camas, WA
            <br />
            <a href="tel:3606063117">360.606.3117</a>
          </p>
        </div>

        <FooterColumn title="For Individuals">
          <FooterLink href="/book">Book a Scan</FooterLink>
          <FooterLink href="/services">Services &amp; Pricing</FooterLink>
          <FooterLink href="/bone">Bone Health Facts</FooterLink>
          <FooterLink href="/book">What to Wear</FooterLink>
        </FooterColumn>

        <FooterColumn title="For Employers">
          <FooterLink href="/corporate">Corporate Wellness</FooterLink>
          <FooterLink href="/corporate">Group Scan Days</FooterLink>
          <FooterLink href="/contact">Request a Proposal</FooterLink>
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/contact">Hours &amp; Location</FooterLink>
        </FooterColumn>
      </div>

      <div
        style={{
          maxWidth: 1240,
          margin: "clamp(48px,6vw,72px) auto 0",
          paddingTop: 24,
          borderTop: "1px solid #D9D1C1",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: "78ch",
            font: "400 12.5px/1.65 var(--font-inter),sans-serif",
            color: "#8A8378",
          }}
        >
          DEXA results are not a diagnosis by themselves and should be interpreted by an
          appropriately qualified healthcare professional in the context of the patient&apos;s
          medical history and other information.
        </p>
        <p
          style={{
            margin: 0,
            font: "400 12.5px/1.65 var(--font-inter),sans-serif",
            color: "#8A8378",
          }}
        >
          © 2026 Precision Dexa, Camas, WA
        </p>
      </div>
    </footer>
  );
}
