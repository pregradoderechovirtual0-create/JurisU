"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CaseForm } from "@/components/case-form";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Scale } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

function getPasswordStrength(pw: string) {
  if (!pw) return { level: 0, label: "" };
  if (pw.length < 6) return { level: 1, label: "Muy corta" };

  let points = 0;
  if (pw.length >= 8) points++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) points++;
  if (/\d/.test(pw)) points++;
  if (/[^A-Za-z0-9]/.test(pw)) points++;

  if (points <= 1) return { level: 1, label: "Débil" };
  if (points === 2) return { level: 2, label: "Media" };
  return { level: 3, label: "Fuerte" };
}

export default function HomePage() {
  const router = useRouter();
  const {
    ready,
    firebaseUser,
    emailVerified,
    authError,
    authBusy,
    clearAuthError,
    login,
    register,
    logout,
    resendVerification,
    reloadUser,
  } = useAuth();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loggedIn = Boolean(firebaseUser && emailVerified);
  const pendingVerification = Boolean(firebaseUser && !emailVerified);

  const strength = getPasswordStrength(password);
  const errorMessage = formError ?? authError;

  // Si hay sesión verificada, entrar directo al panel
  useEffect(() => {
    if (ready && loggedIn) router.replace("/panel");
  }, [ready, loggedIn, router]);

  function changeTab(target: "login" | "register") {
    setTab(target);
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setResetSent(false);
    setFormError(null);
    clearAuthError();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setResetSent(false);

    if (tab === "register" && password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register({ name, email, password });
      }
    } catch {
      // el error ya se muestra con authError
    }
  }

  async function onForgotPassword() {
    clearAuthError();
    setResetSent(false);

    if (!email.trim()) {
      setFormError("Escribe tu correo y vuelve a presionar el enlace.");
      return;
    }
    setFormError(null);

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch {
      // no revelamos si el correo existe o no
    }
    setResetSent(true);
  }

  async function onCheckVerified() {
    const ok = await reloadUser();
    if (ok) router.replace("/panel");
  }

  function goToAuth(target: "login" | "register") {
    changeTab(target);
    document
      .getElementById("acceso")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Evita ver la página pública mientras carga o redirige
  if (!ready || loggedIn) return null;

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--ink)]/10 bg-[var(--paper)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--paper)]">
              <Scale className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
                JurisU
              </p>
              <p className="text-xs text-[var(--muted)]">Consultorio Jurídico</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => goToAuth("register")}
              className="border-[var(--ink)]/20 text-[var(--ink)]"
            >
              Registrarse
            </Button>
            <Button
              onClick={() => goToAuth("login")}
              className="bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)]"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-12 px-4 py-10">
        {/* 1. FORMULARIO */}
        <section className="space-y-6">
          <header>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Nueva solicitud
            </h1>
            <p className="mt-1 text-[var(--muted)]">
              Describe el problema jurídico. El sistema propondrá una categoría
              automáticamente.
            </p>
          </header>
          <CaseForm />
        </section>

        {/* 2. INICIO DE SESIÓN / REGISTRO */}
        <section id="acceso" className="scroll-mt-6">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] p-5 sm:p-6">
            {pendingVerification ? (
              <div className="space-y-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  Confirma tu correo
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Enviamos un enlace de verificación a {firebaseUser?.email}.
                  Ábrelo y luego presiona el botón. Si no lo ves, revisa la
                  carpeta de spam.
                </p>
                {authError && <p className="text-sm text-red-600">{authError}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={onCheckVerified}
                    disabled={authBusy}
                    className="bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)]"
                  >
                    Ya verifiqué
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => resendVerification().catch(() => {})}
                    disabled={authBusy}
                  >
                    Reenviar correo
                  </Button>
                  <Button variant="ghost" onClick={logout} disabled={authBusy}>
                    Salir
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {tab === "login"
                    ? "Entra con tu correo para consultar el estado de tus solicitudes."
                    : "Regístrate con el mismo correo que usaste en tu solicitud para ver el estado de tu caso."}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-[var(--surface)] p-1">
                  {(["login", "register"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => changeTab(t)}
                      className={`rounded-md py-2 text-sm font-medium ${
                        tab === t
                          ? "bg-[var(--ink)] text-[var(--paper)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {t === "login" ? "Entrar" : "Registrarse"}
                    </button>
                  ))}
                </div>

                <form onSubmit={onSubmit} className="mt-4">
                  {/* fieldset disabled: bloquea campos y botón mientras procesa */}
                  <fieldset
                    disabled={authBusy}
                    className="m-0 min-w-0 space-y-4 border-0 p-0"
                  >
                    {tab === "register" && (
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Nombre</Label>
                        <Input
                          id="reg-name"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="auth-email">Correo</Label>
                      <Input
                        id="auth-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="tu.correo@universidad.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auth-password">Contraseña</Label>
                        {tab === "login" && (
                          <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-xs text-[var(--teal)] hover:underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          id="auth-password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete={
                            tab === "login" ? "current-password" : "new-password"
                          }
                          placeholder="Mínimo 6 caracteres"
                          className="pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {tab === "register" && password && (
                        <div className="space-y-1">
                          <div className="grid grid-cols-3 gap-1">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-1.5 rounded-full ${
                                  i <= strength.level
                                    ? strength.level === 1
                                      ? "bg-red-500"
                                      : strength.level === 2
                                        ? "bg-amber-500"
                                        : "bg-emerald-600"
                                    : "bg-[var(--ink)]/10"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-[var(--muted)]">
                            Seguridad: {strength.label}
                            {strength.level < 3 &&
                              " · usa mayúsculas, números y símbolos"}
                          </p>
                        </div>
                      )}
                    </div>

                    {tab === "register" && (
                      <div className="space-y-2">
                        <Label htmlFor="auth-confirm">Confirmar contraseña</Label>
                        <div className="relative">
                          <Input
                            id="auth-confirm"
                            type={showConfirm ? "text" : "password"}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            placeholder="Repite la contraseña"
                            className="pr-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            aria-label={
                              showConfirm
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-xs text-red-600">
                            Las contraseñas no coinciden.
                          </p>
                        )}
                      </div>
                    )}

                    <div aria-live="polite">
                      {errorMessage && (
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      )}
                      {resetSent && (
                        <p className="text-sm text-[var(--muted)]">
                          Si el correo está registrado, te enviamos un enlace
                          para restablecer tu contraseña. Revisa también la
                          carpeta de spam.
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--teal)]"
                    >
                      {authBusy
                        ? "Procesando…"
                        : tab === "login"
                          ? "Entrar"
                          : "Crear cuenta"}
                    </Button>
                  </fieldset>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}