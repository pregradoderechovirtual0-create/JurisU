import { CaseForm } from "@/components/case-form";

export default function NuevoCasoPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Nueva solicitud
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Completa los datos para registrar tu caso.
        </p>
      </header>
      <CaseForm />
    </div>
  );
}