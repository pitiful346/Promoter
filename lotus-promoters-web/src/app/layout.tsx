import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lotus Promoters — Plataforma de Gestão de Eventos",
  description:
    "Plataforma B2B para organizadores, promoters e venues criarem, gerirem e publicarem eventos no ecossistema Lotus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${inter.variable} dark antialiased`}>
      <body className="bg-[#0B0E14] text-[#F8FAFC] min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
