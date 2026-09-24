"use client";

import { useApp } from "@/lib/app-context";

export default function CategoriasPage() {
  const { session, categories, cases, users } = useApp();
  if (!session) return null;

  if (session.role === "consultante" || session.role === "practicante") {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--muted)]">
          La gestión de categorías está disponible para administrativo y
          asesores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Categorías jurídicas
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Áreas del consultorio, carga de casos y equipo disponible.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => {
          const load = cases.filter(
            (c) =>
              (c.confirmedCategoryId ?? c.proposedCategoryId) === cat.id &&
              c.status !== "cerrado",
          ).length;
          const advisors = users.filter((u) => cat.advisorIds.includes(u.id));
          const interns = users.filter((u) => cat.internIds.includes(u.id));

          return (
            <li
              key={cat.id}
              className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    {cat.description}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--teal-soft)] px-3 py-2 text-center">
                  <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                    {load}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                    activos
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Asesores
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[var(--ink)]">
                    {advisors.map((a) => (
                      <li key={a.id}>{a.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Practicantes
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[var(--ink)]">
                    {interns.map((i) => (
                      <li key={i.id}>
                        {i.name}{" "}
                        <span className="text-[var(--muted)]">
                          ({i.activeCases ?? 0})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
