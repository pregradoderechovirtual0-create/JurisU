"use client";

import { useState } from "react";
import { crearUsuarioAutorizado } from "@/lib/users/authorized-users.service";

export default function UsuariosAdminPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("asesor");
  const [category, setCategory] = useState("civil");

  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await crearUsuarioAutorizado(email, {
      name,
      role,
      category,
    });

    setMessage("Usuario autorizado correctamente");

    setEmail("");
    setName("");
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Usuarios autorizados</h1>

        <p className="text-gray-500">
          Agrega asesores y practicantes que podrán ingresar al sistema.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-4 rounded-xl border p-6"
      >
        <div>
          <label>Nombre</label>

          <input
            className="w-full rounded border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Correo personal</label>

          <input
            className="w-full rounded border p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Rol</label>

          <select
            className="w-full rounded border p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="asesor">Asesor jurídico</option>

            <option value="practicante">Practicante</option>
          </select>
        </div>

        {role === "asesor" && (
          <div>
            <label>Categoría</label>

            <select
              className="w-full rounded border p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="civil">Civil</option>

              <option value="familia">Familia</option>

              <option value="penal">Penal</option>

              <option value="administrativo">Administrativo</option>
            </select>
          </div>
        )}

        <button className="rounded bg-black px-4 py-2 text-white">
          Agregar usuario
        </button>

        {message && <p className="text-green-600">{message}</p>}
      </form>
    </main>
  );
}
