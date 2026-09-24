"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MailCheck,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
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

type Mode = "login" | "register";

export default function HomePage() {
  const router = useRouter();
  const {
    ready: authReady,
    configured,
    firebaseUser,
    emailVerified,
    authError,
    authBusy,
    clearAuthError,
    register,
    login,
    logout,
    resendVerification,
    reloadUser,
  } = useAuth();
  const { session, login: loginRole, ready: appReady } = useApp();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!appReady) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      localStorage.removeItem("jurisu-consultorio-v1");
      window.history.replaceState({}, "", "/");
      window.location.reload();
    }
  }, [appReady]);

  useEffect(() => {
    if (!authReady || !appReady) return;
    if (configured && firebaseUser && emailVerified && session) {
      router.replace("/panel");
    }
  }, [
    authReady,
    appReady,
    configured,
    firebaseUser,
    emailVerified,
    session,
    router,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfo(null);
    clearAuthError();
    try {
      if (mode === "register") {
        await register({ name, email, password });
        setInfo(
          "Te enviamos un correo de confirmación. Ábrelo y luego pulsa “Ya confirmé mi correo”.",
        );
      } else {
        await login(email, password);
      }
    } catch {
      /* mensaje en authError */
    }
  }

  if (!authReady || !appReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          Cargando JurisU…
        </p>
      </div>
    );
  }

  const needsVerification = Boolean(firebaseUser && !emailVerified);
  const canPickRole = Boolean(
    (!configured || (firebaseUser && emailVerified)) && !session,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -left-20 top-10 h-[28rem] w-[28rem] rounded-full bg-[var(--teal)]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[var(--ink)]/8 blur-3xl" />
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
            Accede con tu correo institucional. Debes confirmar el email antes
            de entrar al consultorio.
          </p>

          <div className="animate-rise-delay-2 flex items-start gap-3 border-l-2 border-[var(--teal)] pl-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]" />
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Tras verificar tu cuenta eliges el rol de trabajo (consultante,
              administrativo, asesor o practicante).
            </p>
          </div>
        </section>

        <section
          id="entrar"
          className="animate-rise-delay rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper)]/90 p-6 shadow-[0_20px_50px_-30px_rgba(15,42,46,0.35)] backdrop-blur-sm sm:p-8"
        >
          {!configured && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Falta configurar Firebase en <code>.env.local</code>. Copia{" "}
              <code>.env.example</code> y pega las claves de tu app web.
            </div>
          )}

          {needsVerification ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--teal)]">
                <MailCheck className="h-5 w-5" />
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  Confirma tu correo
                </h2>
              </div>
              <p className="text-sm text-[var(--muted)]">
                Enviamos un enlace a{" "}
                <strong className="text-[var(--ink)]">
                  {firebaseUser?.email}
                </strong>
                . Ábrelo desde tu bandeja (y spam) para activar el acceso.
              </p>
              {info && (
                <p className="rounded-lg bg-[var(--teal-soft)]/60 px-3 py-2 text-sm text-[var(--ink)]">
                  {info}
                </p>
              )}
              {authError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {authError}
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)]"
                  disabled={authBusy}
                  onClick={async () => {
                    const ok = await reloadUser();
                    if (ok) {
                      setInfo("Correo confirmado. Elige tu rol para continuar.");
                    } else {
                      setInfo(
                        "Aún no aparece confirmado. Revisa el correo y vuelve a intentar.",
                      );
                    }
                  }}
                >
                  Ya confirmé mi correo
                </Button>
                <Button
                  variant="outline"
                  disabled={authBusy}
                  onClick={async () => {
                    try {
                      await resendVerification();
                      setInfo("Correo de confirmación reenviado.");
                    } catch {
                      /* authError */
                    }
                  }}
                >
                  Reenviar correo
                </Button>
              </div>
              <button
                type="button"
                className="text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--teal)] hover:underline"
                onClick={() => logout()}
              >
                Usar otra cuenta
              </button>
            </div>
          ) : canPickRole && emailVerified ? (
            <div className="space-y-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  Elige tu rol
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Sesión verificada: {firebaseUser?.email}
                </p>
              </div>
              <ul className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                {LOGIN_USERS.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => {
                        loginRole(user.id);
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
              <button
                type="button"
                className="text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--teal)] hover:underline"
                onClick={() => logout()}
              >
                Cerrar sesión de correo
              </button>
            </div>
          ) : canPickRole && !configured ? (
            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                Modo local (sin Firebase)
              </h2>
              <ul className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                {LOGIN_USERS.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => {
                        loginRole(user.id);
                        router.push("/panel");
                      }}
                      className="group flex w-full items-start justify-between gap-3 rounded-xl bg-[var(--surface)] px-4 py-3 text-left hover:bg-[var(--teal-soft)]/50"
                    >
                      <div>
                        <p className="font-medium text-[var(--ink)]">
                          {ROLE_LABELS[user.role]}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{user.name}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-[var(--muted)]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {mode === "login"
                    ? "Usa el correo con el que te registraste."
                    : "Te enviaremos un enlace para confirmar tu correo."}
                </p>
              </div>

              <div className="flex gap-2 rounded-lg bg-[var(--surface)] p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === "login"
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => {
                    setMode("login");
                    clearAuthError();
                    setInfo(null);
                  }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === "register"
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => {
                    setMode("register");
                    clearAuthError();
                    setInfo(null);
                  }}
                >
                  Registrarse
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="María Isabel Peña"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@universidad.edu"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {authError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {authError}
                  </p>
                )}
                {info && (
                  <p className="rounded-lg bg-[var(--teal-soft)]/60 px-3 py-2 text-sm text-[var(--ink)]">
                    {info}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={authBusy || !configured}
                  className="w-full bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)]"
                >
                  {authBusy
                    ? "Procesando…"
                    : mode === "login"
                      ? "Entrar"
                      : "Registrarme y enviar confirmación"}
                </Button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
