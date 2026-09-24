"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Scale,
  Tags,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { ROLE_LABELS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

const NAV = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/casos", label: "Casos", icon: Briefcase },
  { href: "/casos/nuevo", label: "Nueva solicitud", icon: PlusCircle },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/categorias", label: "Categorías", icon: Tags },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, ready } = useApp();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
          Cargando JurisU…
        </p>
      </div>
    );
  }

useEffect(() => {
  if (!session) {
    router.replace("/");
  }
}, [session, router]);

if (!session) {
  return null;
}

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const navItems = NAV.filter((item) => {
    if (session.role === "consultante") {
      return ["Panel", "Casos", "Nueva solicitud", "Agenda"].includes(
        item.label,
      );
    }
    if (session.role === "practicante") {
      return ["Panel", "Casos", "Agenda"].includes(item.label);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[var(--teal)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--ink)]/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%0A1F2A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <header className="border-b border-[var(--ink)]/10 bg-[var(--paper)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/panel" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--paper)] transition-transform duration-300 group-hover:scale-105">
              <Scale className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg leading-none tracking-tight text-[var(--ink)]">
                JurisU
              </p>
              <p className="text-[11px] text-[var(--muted)]">
                Consultorio Jurídico
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[var(--ink)]">
                {session.name}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {ROLE_LABELS[session.role]}
              </p>
            </div>
            <Avatar className="h-9 w-9 border border-[var(--ink)]/10">
              <AvatarFallback className="bg-[var(--teal-soft)] text-[var(--teal)] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[var(--ink)]/70 transition-colors hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/panel" &&
                  item.href !== "/casos/nuevo" &&
                  pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "text-[var(--ink)]/70 hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--ink)]/70 transition-colors hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]"
          >
            <LogOut className="h-4 w-4" />
            Cambiar de rol
          </button>
          <Separator className="my-4 hidden lg:block" />
          <p className="hidden text-xs leading-relaxed text-[var(--muted)] lg:block">
            Flujo: registro → clasificación → validación → asesor →
            practicante → atención → cierre.
          </p>
        </aside>

        <main className="min-w-0 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
