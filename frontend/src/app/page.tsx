import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Asistente Dental Digital
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Odontograma, ficha clínica y agenda de atención en un solo lugar,
        en modo independiente.
      </p>
      <Link
        href="/pacientes"
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Ir a Pacientes
      </Link>
    </div>
  );
}
