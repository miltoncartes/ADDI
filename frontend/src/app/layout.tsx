import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import MainNav from "@/components/MainNav";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADDI — Asistente Dental Digital",
  description: "Gestión clínica odontológica: pacientes, odontograma, ficha clínica y agenda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--sonda-bg)] text-[var(--sonda-ink)]">
        <AuthProvider>
          <header className="sonda-no-print border-b border-[var(--sonda-border)] bg-[var(--sonda-surface)]">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
              <Link href="/pacientes" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sonda-teal)]">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 stroke-white">
                    <path d="M12 2c-3 0-5 2-5 5 0 4 1 6 1 9 0 3 1.5 4 2.5 4s1.8-1.5 1.8-3.5c0-1.5.7-2 .7-2s.7.5.7 2C13.7 19.5 14.5 21 15.5 21s2.5-1 2.5-4c0-3 1-5 1-9 0-3-2-5-5-5z" />
                  </svg>
                </span>
                <span className="font-semibold text-[var(--sonda-ink)]">ADDI</span>
              </Link>
              <MainNav />
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
