"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { CATEGORIES, ROLE_LABELS } from "@/lib/data";
import { actualizarCategoriasUsuario } from "@/lib/users/users.service";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function EquipoPage() {
  const { session, users } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  if (session.role !== "asesor" && session.role !== "administrativo") {
    return (
      <p className="py-12 text-center text-[var(--muted)]">
        No tienes acceso a esta sección.
      </p>
    );
  }

  const isAdmin = session.role === "administrativo";

  // El administrativo edita asesores y practicantes; el asesor solo practicantes
  const canEdit = (u: User) =>
    isAdmin ? u.role === "asesor" || u.role === "practicante" : u.role === "practicante";

  const asesores = users.filter((u) => u.role === "asesor");
  const practicantes = users.filter((u) => u.role === "practicante");

  async function toggle(u: User, categoryId: string) {
    const current: string[] = u.categoryIds ?? [];
    const next = current.includes(categoryId)
      ? current.filter((c) => c !== categoryId)
      : [...current, categoryId];

    setBusyId(u.id);
    setError(null);
    try {
      await actualizarCategoriasUsuario(u.id, next);
    } catch (e) {
      console.error("Error guardando categorías:", e);
      setError("No se pudo guardar. Revisa los permisos de Firestore.");
    } finally {
      setBusyId(null);
    }
  }

  function Group({ title, list }: { title: string; list: User[] }) {
    return (
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          {title}
        </h2>

        {list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--ink)]/15 p-5 text-sm text-[var(--muted)]">
            Aún no hay usuarios con este rol. Cambia el campo <code>role</code>{" "}
            del usuario en Firestore.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((u) => {
              const selected: string[] = u.categoryIds ?? [];
              const editable = canEdit(u);
              return (
                <li
                  key={u.id}
                  className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--ink)]">{u.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {u.email} · {ROLE_LABELS[u.role]}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {selected.length === 0
                        ? "Sin restricción: recibe todas las categorías"
                        : `${selected.length} categoría(s)`}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => {
                      const active = selected.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={!editable || busyId === u.id}
                          onClick={() => toggle(u, c.id)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                            active
                              ? "border-[var(--teal)] bg-[var(--teal)] text-[var(--paper)]"
                              : "border-[var(--ink)]/15 bg-[var(--paper)] text-[var(--ink)]/70 hover:bg-[var(--surface)]",
                          )}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Equipo
        </h1>
        <p className="mt-1 max-w-xl text-[var(--muted)]">
          Marca qué categorías atiende cada persona. Al validar un caso o
          asignar un practicante, solo aparecerán quienes atienden esa
          categoría.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isAdmin && <Group title="Asesores" list={asesores} />}
      <Group title="Practicantes" list={practicantes} />
    </div>
  );
}