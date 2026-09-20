import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import MainNav from "@/components/MainNav";
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
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
              ADDI
            </Link>
            <MainNav />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
