"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/app-context";
import { CATEGORIES, ROLE_LABELS } from "@/lib/data";
import type { AppointmentMode, LegalCategoryId } from "@/lib/types";

const selectClassName =
  "flex h-9 w-full rounded-lg border border-[var(--ink)]/15 bg-[var(--paper)] px-3 text-sm text-[var(--ink)] outline-none focus-visible:border-[var(--teal)] focus-visible:ring-2 focus-visible:ring-[var(--teal)]/30";

const outlineBtn =
  "inline-flex h-9 items-center justify-center rounded-lg border border-[var(--ink)]/15 bg-[var(--paper)] px-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface)]";



export default function CasoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    session,
    getCase,
    getAppointmentForCase,
    users,
    validateCase,
    assignIntern,
    addNote,
    updateStatus,
  } = useApp();

  const legalCase = getCase(params.id);
  const appointment = legalCase
    ? getAppointmentForCase(legalCase.id)
    : undefined;

  const [categoryId, setCategoryId] = useState<LegalCategoryId | "">("");
  const [advisorId, setAdvisorId] = useState("");
  const [internId, setInternId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [mode, setMode] = useState<AppointmentMode>("presencial");
  const [location, setLocation] = useState(
    "Sala 1 — Consultorio Jurídico, Edificio A",
  );
  const [note, setNote] = useState("");

  const category = useMemo(() => {
    if (!legalCase) return undefined;
    return CATEGORIES.find(
      (c) =>
        c.id === (legalCase.confirmedCategoryId ?? legalCase.proposedCategoryId),
    );
  }, [legalCase]);

  if (!session) return null;

  if (!legalCase) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Caso no encontrado
        </p>
        <button
          type="button"
          className={outlineBtn}
          onClick={() => router.push("/casos")}
        >
          Volver a casos
        </button>
      </div>
    );
  }

  const effectiveCategory =
    (categoryId ||
      legalCase.confirmedCategoryId ||
      legalCase.proposedCategoryId) as LegalCategoryId;

  const advisors = users.filter(
    (u) =>
      u.role === "asesor" &&
      (!u.categoryIds || u.categoryIds.includes(effectiveCategory)),
  );
  const interns = users.filter(
    (u) =>
      u.role === "practicante" &&
      (!u.categoryIds || u.categoryIds.includes(effectiveCategory)),
  );

  const canValidate =
    session.role === "administrativo" &&
    legalCase.status === "pendiente_validacion";
  const canAssignIntern =
    (session.role === "asesor" || session.role === "administrativo") &&
    ["asignado_asesor", "en_atencion"].includes(legalCase.status) &&
    !legalCase.internId;
  const canNote =
    session.role === "practicante" ||
    session.role === "asesor" ||
    session.role === "administrativo";
  const canClose =
    (session.role === "asesor" || session.role === "administrativo") &&
    legalCase.status !== "cerrado";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/casos"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--teal)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Casos
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-[var(--muted)]">
            {legalCase.folio}
          </span>
          <StatusBadge status={legalCase.status} />
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          {legalCase.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Descripción
            </h2>
            <p className="mt-2 leading-relaxed text-[var(--ink)]">
              {legalCase.description}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--teal)]/20 bg-[var(--teal-soft)]/40 p-5">
            <div className="flex items-center gap-2 text-[var(--teal)]">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Clasificación automática</h2>
            </div>
            <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
              {category?.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Confianza{" "}
              {Math.round(legalCase.classificationConfidence * 100)}% —{" "}
              {legalCase.classificationRationale}
            </p>
            {legalCase.confirmedCategoryId && (
              <p className="mt-2 text-xs text-[var(--teal)]">
                Categoría confirmada por administrativo
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
              Avances
            </h2>
            {legalCase.notes.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Aún no hay notas de seguimiento.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {legalCase.notes.map((n) => (
                  <li
                    key={n.id}
                    className="border-l-2 border-[var(--teal)]/40 pl-3"
                  >
                    <p className="text-sm text-[var(--ink)]">{n.content}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {n.authorName} ·{" "}
                      {new Date(n.createdAt).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {canNote && (
              <form
                className="mt-4 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  addNote(legalCase.id, note.trim());
                  setNote("");
                }}
              >
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Registrar avance o documento revisado…"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--ink)]/15 bg-[var(--paper)] px-3 py-2 text-sm outline-none focus-visible:border-[var(--teal)] focus-visible:ring-2 focus-visible:ring-[var(--teal)]/30"
                />
                <button type="submit" className={outlineBtn}>
                  Agregar nota
                </button>
              </form>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5 text-sm">
            <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
              Personas
            </h2>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-[var(--muted)]">Consultante</dt>
                <dd className="text-[var(--ink)]">
                  {legalCase.consultanteName}
                  <br />
                  <span className="text-xs">{legalCase.consultanteEmail}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Asesor</dt>
                <dd className="text-[var(--ink)]">
                  {legalCase.advisorName ?? "Sin asignar"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Practicante</dt>
                <dd className="text-[var(--ink)]">
                  {legalCase.internName ?? "Sin asignar"}
                </dd>
              </div>
            </dl>
          </div>

          {appointment && (
            <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5 text-sm">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                Cita
              </h2>
              <p className="mt-2 text-[var(--ink)]">
                {appointment.date} · {appointment.time}
              </p>
              <p className="capitalize text-[var(--muted)]">
                {appointment.mode}
              </p>
              <p className="mt-1 break-all text-[var(--ink)]">
                {appointment.locationOrLink}
              </p>
            </div>
          )}

          {canValidate && (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/80 p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                Validar clasificación
              </h2>
              <div className="space-y-2">
                <Label htmlFor="validate-category">Categoría</Label>
                <select
                  id="validate-category"
                  className={selectClassName}
                  value={categoryId || legalCase.proposedCategoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value as LegalCategoryId)
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validate-advisor">Asesor</Label>
                <select
                  id="validate-advisor"
                  className={selectClassName}
                  value={advisorId}
                  onChange={(e) => setAdvisorId(e.target.value)}
                >
                  <option value="">Seleccionar asesor</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[var(--ink)] px-3 text-sm font-medium text-[var(--paper)] transition-colors hover:bg-[var(--teal)] disabled:opacity-50"
                disabled={!advisorId}
                onClick={() => {
                  validateCase(
                    legalCase.id,
                    (categoryId ||
                      legalCase.proposedCategoryId) as LegalCategoryId,
                    advisorId,
                  );
                }}
              >
                Confirmar y asignar asesor
              </button>
            </div>
          )}

          {canAssignIntern && (
            <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/80 p-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                Asignar practicante y cita
              </h2>
              <div className="space-y-2">
                <Label htmlFor="assign-intern">Practicante</Label>
                <select
                  id="assign-intern"
                  className={selectClassName}
                  value={internId}
                  onChange={(e) => setInternId(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {interns.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.activeCases ?? 0} casos)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="assign-date">Fecha</Label>
                  <Input
                    id="assign-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assign-time">Hora</Label>
                  <Input
                    id="assign-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-mode">Modalidad</Label>
                <select
                  id="assign-mode"
                  className={selectClassName}
                  value={mode}
                  onChange={(e) => setMode(e.target.value as AppointmentMode)}
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-location">Lugar o enlace</Label>
                <Input
                  id="assign-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-[var(--ink)] px-3 text-sm font-medium text-[var(--paper)] transition-colors hover:bg-[var(--teal)] disabled:opacity-50"
                disabled={!internId || !date}
                onClick={() => {
                  assignIntern(legalCase.id, internId, {
                    date,
                    time,
                    mode,
                    locationOrLink: location,
                  });
                }}
              >
                Programar atención
              </button>
            </div>
          )}

          {canClose && (
            <div className="flex flex-wrap gap-2">
              {legalCase.status === "en_atencion" && (
                <button
                  type="button"
                  className={outlineBtn}
                  onClick={() => updateStatus(legalCase.id, "seguimiento")}
                >
                  Pasar a seguimiento
                </button>
              )}
              <button
                type="button"
                className={outlineBtn}
                onClick={() => updateStatus(legalCase.id, "cerrado")}
              >
                Cerrar caso
              </button>
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">
            Vista como {ROLE_LABELS[session.role]}
          </p>
        </aside>
      </div>
    </div>
  );
}
