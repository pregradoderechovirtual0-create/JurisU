"use client";

import { useApp } from "@/lib/app-context";

export default function AdminPage() {
  const { session, cases, users } = useApp();

  if (!session) {
    return <div>Cargando...</div>;
  }

  if (session.role !== "administrativo") {
    return <div>No tienes permisos para entrar aquí.</div>;
  }

  const casosPendientes = cases.filter(
    (c) => c.status === "pendiente_validacion",
  ).length;

  const casosAsignados = cases.filter(
    (c) => c.status === "asignado_asesor",
  ).length;

  const casosCerrados = cases.filter((c) => c.status === "cerrado").length;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Panel Administrativo</h1>

      <p className="mt-4">Bienvenido {session.name}</p>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="rounded-xl border p-5">
          <h2>Casos pendientes</h2>
          <p className="text-3xl">{casosPendientes}</p>
        </div>

        <div className="rounded-xl border p-5">
          <h2>Usuarios</h2>
          <p className="text-3xl">{users.length}</p>
        </div>

        <div className="rounded-xl border p-5">
          <h2>Asignados</h2>
          <p className="text-3xl">{casosAsignados}</p>
        </div>

        <div className="rounded-xl border p-5">
          <h2>Cerrados</h2>
          <p className="text-3xl">{casosCerrados}</p>
        </div>
      </div>
    </main>
  );
}
