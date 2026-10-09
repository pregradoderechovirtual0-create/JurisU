"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-context";
import { classifyCase } from "@/lib/classify";
import { CATEGORIES } from "@/lib/data";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function CaseForm() {
  const { session, createCase } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [documentId, setDocumentId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stratum, setStratum] = useState("");
  const [mode, setMode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);
  const [dataConsent, setDataConsent] = useState<"si" | "no" | "">("");
  const [consentError, setConsentError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const text = `${title} ${description}`.trim();
    if (text.length < 12) return null;
    return classifyCase(text);
  }, [title, description]);

  const category = preview
    ? CATEGORIES.find((c) => c.id === preview.categoryId)
    : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dataConsent !== "si") {
      setConsentError(
        "Debes aceptar el tratamiento de datos personales para enviar la solicitud.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createCase({
        title: title.trim(),
        description: description.trim(),
        consultanteName: name.trim(),
        consultanteDocument: documentId.trim(),
        consultanteStratum: stratum.trim(),
        consultanteAddress: address.trim(),
        consultanteEmail: email.trim(),
        consultantePhone: phone.trim(),
      });
      if (session) {
        router.push(`/casos/${created.id}`);
      } else {
        setSentId(created.id);
      }
    } catch {
      setSubmitError("No se pudo registrar la solicitud. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sentId) {
    return (
      <div className="rounded-xl border border-[var(--teal)]/25 bg-[var(--teal-soft)]/50 p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Solicitud registrada
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Recibimos tu solicitud. Para consultar su estado, registrate
          con el correo que ingresaste inicialmente.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del consultante</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">Documento</Label>
          <Input
            id="document"
            required
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="3001234567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stratum">Estrato</Label>
        <select
          id="stratum"
          required
          value={stratum}
          onChange={(e) => setStratum(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            Selecciona un estrato
          </option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mode">Modalidad</Label>
        <select
          id="mode"
          required
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            Selecciona una modalidad
          </option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Asunto</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Solicitud de custodia y alimentos"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción del problema</Label>
        <Textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Cuenta qué ocurrió, desde cuándo y qué tipo de ayuda necesitas…"
        />
      </div>

      {preview && category && (
        <div className="rounded-lg border border-[var(--teal)]/25 bg-[var(--teal-soft)]/50 p-4">
          <div className="flex items-center gap-2 text-[var(--teal)]">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">Clasificación propuesta</p>
          </div>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            {category.name}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Confianza: {Math.round(preview.confidence * 100)}% —{" "}
            {preview.rationale}
          </p>
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          En cumplimiento con la Ley 1581 de 2012 y el Decreto 1377 de 2013, que
          regulan el tratamiento de datos personales en Colombia, se informa a
          los usuarios que los datos personales proporcionados a través de este
          formulario serán tratados de acuerdo con la legislación vigente y con
          el fin exclusivo de atender y gestionar la consulta jurídica
          solicitada. Los datos serán recolectados, almacenados, usados y en su
          caso, transmitidos únicamente para las finalidades previamente
          informadas, y se adoptarán todas las medidas necesarias para
          garantizar la seguridad, confidencialidad y derechos de los titulares
          de la información. El titular de los datos podrá ejercer en cualquier
          momento sus derechos de acceso, rectificación, cancelación u
          oposición (ARCO), conforme a lo dispuesto en la normativa colombiana y
          la política Universitaria de tratamiento de datos personales
          (Resolución de Rectoría R-072 de 09 de noviembre de 2022).
        </p>
        <p className="text-sm text-[var(--muted)]">
          Acepto que el Consultorio Jurídico Virtual de la USC realice el
          tratamiento de mis datos personales y{" "}
          <a
            href="https://www.calameo.com/universidad-santiago-cali/read/004161322df162ef1344d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--teal)] underline underline-offset-2"
          >
            Políticas de tratamiento de Datos
          </a>
          .<span className="text-red-600"> *</span>
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="radio"
              name="dataConsent"
              required
              checked={dataConsent === "si"}
              onChange={() => {
                setDataConsent("si");
                setConsentError(null);
              }}
            />
            Sí acepto
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              type="radio"
              name="dataConsent"
              checked={dataConsent === "no"}
              onChange={() => {
                setDataConsent("no");
                setConsentError(null);
              }}
            />
            No acepto
          </label>
        </div>
        {consentError && <p className="text-sm text-red-600">{consentError}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)] sm:w-auto"
      >
        {submitting ? "Registrando…" : "Registrar solicitud"}
      </Button>
    </form>
  );
}