"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Video } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { STATUS_LABELS } from "@/lib/data";

export default function AgendaPage() {
  const { session, appointments, cases, visibleCases } = useApp();
  if (!session) return null;

  const visibleIds = new Set(visibleCases.map((c) => c.id));
  const items = appointments
    .filter((a) =>
      session.role === "administrativo" ? true : visibleIds.has(a.caseId),
    )
    .map((a) => ({
      ...a,
      legalCase: cases.find((c) => c.id === a.caseId),
    }))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Agenda
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Citas presenciales y virtuales del consultorio.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--ink)]/20 bg-[var(--paper)]/60 px-6 py-14 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-[var(--muted)]" />
          <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            No hay citas programadas
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cuando un asesor asigne practicante y fecha, aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {item.legalCase?.folio ?? item.caseId}
                  </p>
                  <Link
                    href={`/casos/${item.caseId}`}
                    className="mt-1 block font-medium text-[var(--ink)] hover:text-[var(--teal)]"
                  >
                    {item.legalCase?.title ?? "Caso"}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.legalCase
                      ? STATUS_LABELS[item.legalCase.status]
                      : ""}{" "}
                    · {item.legalCase?.internName ?? "Sin practicante"}
                  </p>
                </div>
                <div className="shrink-0 text-sm sm:text-right">
                  <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                    {item.date}
                  </p>
                  <p className="text-[var(--muted)]">{item.time}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5 capitalize">
                  {item.mode === "virtual" ? (
                    <Video className="h-3.5 w-3.5 text-[var(--teal)]" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-[var(--teal)]" />
                  )}
                  {item.mode}
                </span>
                <span className="break-all">{item.locationOrLink}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
