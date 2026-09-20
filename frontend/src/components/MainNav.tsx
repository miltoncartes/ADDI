"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const ITEMS = [
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
];

const ROL_LABEL: Record<string, string> = {
  clinico: "Clínico",
  administrativo: "Administrativo",
  auditor: "Auditor",
};

export default function MainNav() {
  const pathname = usePathname();
  const { usuario, salir } = useAuth();

  if (pathname === "/login") return null;

  const items = usuario?.rol === "administrativo" ? [...ITEMS, { href: "/usuarios", label: "Usuarios" }] : ITEMS;

  return (
    <div className="flex items-center gap-5">
      <nav className="flex gap-4 text-sm">
        {items.map((item) => {
          const activo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                activo
                  ? "font-medium text-[var(--sonda-teal-dark)]"
                  : "text-[var(--sonda-ink-soft)] hover:text-[var(--sonda-ink)]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {usuario && (
        <div className="flex items-center gap-2 border-l border-[var(--sonda-border)] pl-4 text-sm">
          <div className="text-right leading-tight">
            <p className="font-medium text-[var(--sonda-ink)]">{usuario.nombre}</p>
            <p className="text-xs text-[var(--sonda-ink-faint)]">{ROL_LABEL[usuario.rol] ?? usuario.rol}</p>
          </div>
          <button
            type="button"
            onClick={salir}
            className="rounded-md border border-[var(--sonda-border)] px-2.5 py-1.5 text-xs text-[var(--sonda-ink-soft)] hover:bg-[var(--sonda-surface-2)]"
          >
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
