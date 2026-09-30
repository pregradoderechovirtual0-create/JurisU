"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";

export default function AsesorPage() {
  const { visibleCases, users, assignIntern, addNote, updateStatus } = useApp();

  const practicantes = users.filter((u) => u.role === "practicante");

  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel del Asesor</h1>

        <p className="text-muted-foreground">
          Casos asignados para revisión jurídica.
        </p>
      </div>

      {visibleCases.length === 0 ? (
        <div className="rounded-xl border p-6">No tienes casos asignados.</div>
      ) : (
        <div className="grid gap-4">
          {visibleCases.map((caso) => (
            <div key={caso.id} className="rounded-xl border p-5 space-y-3">
              <h2 className="text-xl font-semibold">{caso.title}</h2>

              <p>
                <b>Folio:</b> {caso.folio}
              </p>

              <p>
                <b>Consultante:</b> {caso.consultanteName}
              </p>

              <p>
                <b>Categoría:</b> {caso.confirmedCategoryId}
              </p>

              <p>
                <b>Estado:</b> {caso.status}
              </p>

              <button
                className="rounded bg-black px-4 py-2 text-white"
                onClick={() => setSelectedCase(caso.id)}
              >
                Gestionar caso
              </button>

              {selectedCase === caso.id && (
                <div className="border-t pt-4 space-y-3">
                  <select
                    className="border rounded p-2 w-full"
                    onChange={(e) => {
                      if (!e.target.value) return;

                      assignIntern(caso.id, e.target.value, {
                        date: "",
                        time: "",
                        notes: "",
                      });
                    }}
                  >
                    <option>Asignar practicante</option>

                    {practicantes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="rounded border px-3 py-2"
                    onClick={() => {
                      addNote(caso.id, "Caso revisado por asesor");
                    }}
                  >
                    Agregar nota
                  </button>

                  <button
                    className="rounded bg-green-600 px-3 py-2 text-white"
                    onClick={() => {
                      updateStatus(caso.id, "en_atencion");
                    }}
                  >
                    Marcar en atención
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
