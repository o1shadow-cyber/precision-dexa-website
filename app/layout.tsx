import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Precision Dexa — DEXA Body Composition Scanning in Camas, WA",
  description:
    "Clinical-grade DEXA body composition scanning in Camas, WA. Fat, muscle, and bone density measured with precision in about 15 minutes. $149, no insurance needed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        style={{
          background: "var(--pdx-mist)",
          minHeight: "100vh",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
