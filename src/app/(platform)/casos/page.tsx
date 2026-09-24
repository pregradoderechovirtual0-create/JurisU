"use client";

import Link from "next/link";
import { CaseList } from "@/components/case-list";
import { useApp } from "@/lib/app-context";

export default function CasosPage() {
  const { session, visibleCases } = useApp();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Casos
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {visibleCases.length} caso
            {visibleCases.length === 1 ? "" : "s"} según tu rol.
          </p>
        </div>
        {(session.role === "consultante" ||
          session.role === "administrativo") && (
          <Link
            href="/casos/nuevo"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--ink)] px-3 text-sm font-medium text-[var(--paper)] transition-colors hover:bg-[var(--teal)]"
          >
            Nueva solicitud
          </Link>
        )}
      </header>
      <CaseList cases={visibleCases} />
    </div>
  );
}
