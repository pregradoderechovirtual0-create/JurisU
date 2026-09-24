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

export default function NuevoCasoPage() {
  const { session, createCase } = useApp();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    const text = `${title} ${description}`.trim();
    if (text.length < 12) return null;
    return classifyCase(text);
  }, [title, description]);

  const category = preview
    ? CATEGORIES.find((c) => c.id === preview.categoryId)
    : null;

  if (!session) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const created = createCase({
      title: title.trim(),
      description: description.trim(),
      consultanteName: name.trim(),
      consultanteEmail: email.trim(),
      consultantePhone: phone.trim(),
    });
    router.push(`/casos/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Nueva solicitud
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Describe el problema jurídico. El sistema propondrá una categoría
          automáticamente.
        </p>
      </header>

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

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)] sm:w-auto"
        >
          {submitting ? "Registrando…" : "Registrar solicitud"}
        </Button>
      </form>
    </div>
  );
}
