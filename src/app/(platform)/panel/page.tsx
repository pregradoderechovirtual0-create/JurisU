"use client";

import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { CaseList } from "@/components/case-list";
import { useApp } from "@/lib/app-context";
import { ROLE_LABELS } from "@/lib/data";

export default function PanelPage() {
  const { session, visibleCases, appointments, cases } = useApp();
  if (!session) return null;

  const pendingValidation = cases.filter(
    (c) => c.status === "pendiente_validacion",
  ).length;
  const inProgress = visibleCases.filter((c) =>
    ["en_atencion", "seguimiento", "asignado_asesor"].includes(c.status),
  ).length;
  const upcoming = appointments.filter((a) => a.status === "programada").length;
  const closed = visibleCases.filter((c) => c.status === "cerrado").length;

  const stats =
    session.role === "administrativo"
      ? [
          {
            label: "Pendientes de validar",
            value: pendingValidation,
            icon: AlertCircle,
          },
          { label: "Casos activos", value: inProgress, icon: Briefcase },
          { label: "Citas programadas", value: upcoming, icon: CalendarDays },
          { label: "Total registrados", value: cases.length, icon: Clock },
        ]
      : session.role === "consultante"
        ? [
            {
              label: "Mis solicitudes",
              value: visibleCases.length,
              icon: Briefcase,
            },
            { label: "En atención", value: inProgress, icon: Clock },
            {
              label: "Citas",
              value: appointments.filter((a) =>
                visibleCases.some((c) => c.id === a.caseId),
              ).length,
              icon: CalendarDays,
            },
            { label: "Cerrados", value: closed, icon: CheckCircle2 },
          ]
        : [
            {
              label: "Casos visibles",
              value: visibleCases.length,
              icon: Briefcase,
            },
            { label: "En atención", value: inProgress, icon: Clock },
            { label: "Citas", value: upcoming, icon: CalendarDays },
            { label: "Cerrados", value: closed, icon: CheckCircle2 },
          ];

  const recent = visibleCases.slice(0, 4);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--teal)]">
            {ROLE_LABELS[session.role]}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            Hola, {session.name.split(" ")[0]}
          </h1>
          <p className="mt-1 max-w-lg text-[var(--muted)]">
            {session.role === "consultante"
              ? "Revisa el avance de tus solicitudes y tus próximas citas."
              : session.role === "administrativo"
                ? "Valida clasificaciones y mantén la carga de casos bajo control."
                : session.role === "asesor"
                  ? "Asigna practicantes y programa la atención de tus casos."
                  : "Registra avances en los casos que te fueron asignados."}
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

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-[var(--teal)]" />
              </div>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Casos recientes
          </h2>
          <Link
            href="/casos"
            className="text-sm font-medium text-[var(--teal)] hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <CaseList cases={recent} />
      </section>
    </div>
  );
}
