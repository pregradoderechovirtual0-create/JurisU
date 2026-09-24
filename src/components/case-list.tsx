"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { CATEGORIES } from "@/lib/data";
import type { LegalCase } from "@/lib/types";

export function CaseList({ cases }: { cases: LegalCase[] }) {
  if (cases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--ink)]/20 bg-[var(--paper)]/60 px-6 py-14 text-center">
        <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Sin casos en esta vista
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Cuando se registren solicitudes aparecerán aquí según tu rol.
        </p>
        <Link
          href="/casos/nuevo"
          className="mt-4 inline-flex text-sm font-medium text-[var(--teal)] underline-offset-4 hover:underline"
        >
          Registrar una solicitud
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--ink)]/8 overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)]">
      {cases.map((c) => {
        const category = CATEGORIES.find(
          (cat) => cat.id === (c.confirmedCategoryId ?? c.proposedCategoryId),
        );
        return (
          <li key={c.id}>
            <Link
              href={`/casos/${c.id}`}
              className="group flex items-start justify-between gap-4 px-4 py-4 transition-colors hover:bg-[var(--teal-soft)]/40 sm:px-5"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {c.folio}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="truncate font-medium text-[var(--ink)] group-hover:text-[var(--teal)]">
                  {c.title}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {category?.name ?? "Sin categoría"} · {c.consultanteName}
                  {c.advisorName ? ` · ${c.advisorName}` : ""}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
