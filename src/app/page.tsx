"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { ROLE_LABELS, USERS } from "@/lib/data";

const ROLE_BLURBS: Record<string, string> = {
  consultante: "Registra tu problema jurídico y consulta el estado de tu caso.",
  administrativo: "Valida clasificaciones, asigna asesores y supervisa la agenda.",
  asesor: "Revisa casos de tu área, asigna practicantes y programa atención.",
  practicante: "Atiende casos asignados, registra avances y documentos.",
};

const LOGIN_USERS = [
  USERS.find((u) => u.id === "cons-1")!,
  USERS.find((u) => u.id === "admin-1")!,
  ...USERS.filter((u) => u.role === "asesor"),
  USERS.find((u) => u.id === "prac-1")!,
];


export default function HomePage() {
  const { session, login, ready } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      localStorage.removeItem("jurisu-consultorio-v1");
      window.history.replaceState({}, "", "/");
      window.location.reload();
      return;
    }

    const loginId = params.get("login");
    if (loginId) {
      login(loginId);
      window.history.replaceState({}, "", "/");
      router.replace("/panel");
      return;
    }

    if (session) router.replace("/panel");
  }, [ready, session, router, login]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -left-20 top-10 h-[28rem] w-[28rem] rounded-full bg-[var(--teal)]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[var(--ink)]/8 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40h80M40 0v80' stroke='%0F2A2E' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <section className="animate-rise space-y-8">
          <div className="inline-flex items-center gap-2 text-[var(--teal)]">
            <Scale className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Consultorio Jurídico Universitario
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
            JurisU
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
            Registra, clasifica y da seguimiento a casos jurídicos desde un
            solo flujo: de la solicitud del consultante hasta el cierre con
            asesor y practicante.
          </p>

          <div className="animate-rise-delay flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)]"
              onClick={() => {
                const el = document.getElementById("entrar");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Entrar a la plataforma
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-sm text-[var(--muted)]">
              Demo local · sin credenciales
            </p>
          </div>

          <div className="animate-rise-delay-2 flex items-start gap-3 border-l-2 border-[var(--teal)] pl-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              La clasificación automática propone el área jurídica (familia,
              penal, civil, laboral o administrativo) para acelerar la
              asignación.
            </p>
          </div>
        </section>

        <section
          id="entrar"
          className="animate-rise-delay rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)]/90 p-6 shadow-[0_20px_50px_-30px_rgba(15,42,46,0.35)] backdrop-blur-sm sm:p-8"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Entra con un rol
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Elige un perfil de demostración para explorar el flujo completo.
          </p>

          <ul className="mt-6 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {LOGIN_USERS.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => {
                    login(user.id);
                    router.push("/panel");
                  }}
                  className="group flex w-full items-start justify-between gap-3 rounded-xl border border-transparent bg-[var(--surface)] px-4 py-3 text-left transition-all hover:border-[var(--teal)]/30 hover:bg-[var(--teal-soft)]/50"
                >
                  <div>
                    <p className="font-medium text-[var(--ink)]">
                      {ROLE_LABELS[user.role]}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{user.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {ROLE_BLURBS[user.role]}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--teal)]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
