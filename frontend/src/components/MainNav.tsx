"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 text-sm">
      {ITEMS.map((item) => {
        const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              activo
                ? "font-medium text-zinc-900 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
