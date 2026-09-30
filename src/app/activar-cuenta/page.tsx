"use client";

import { useState } from "react";
import {
  activarCuenta,
  verificarCorreoAutorizado,
} from "@/lib/users/account.service";

import { useRouter } from "next/navigation";

export default function ActivarCuenta() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [permitido, setPermitido] = useState(false);
  const [usuarioAutorizado, setUsuarioAutorizado] = useState<any>(null);

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function verificar() {
    setCargando(true);
    setMensaje("");

    try {
      const usuario = await verificarCorreoAutorizado(email);

      if (!usuario) {
        setMensaje("Este correo no está autorizado.");
        return;
      }

      setUsuarioAutorizado(usuario);
      setPermitido(true);

      setMensaje("Correo autorizado correctamente.");
    } catch (error) {
      setMensaje("Error verificando el correo.");
    } finally {
      setCargando(false);
    }
  }

  async function crear() {
    if (password.length < 6) {
      setMensaje("La contraseña debe tener mínimo 6 caracteres.");

      return;
    }

    if (password !== confirm) {
      setMensaje("Las contraseñas no coinciden.");

      return;
    }

    setCargando(true);

    try {
      await activarCuenta(email, password);

      setMensaje("Cuenta creada correctamente. Ya puedes iniciar sesión.");
    } catch (error: any) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Activar cuenta</h1>

        <p className="text-sm text-gray-600 mb-5 text-center">
          Ingresa el correo autorizado por el administrador.
        </p>

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Correo autorizado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!permitido && (
          <button
            className="w-full bg-teal-900 text-white rounded-lg p-3"
            onClick={verificar}
            disabled={cargando}
          >
            {cargando ? "Verificando..." : "Verificar correo"}
          </button>
        )}

        {permitido && usuarioAutorizado && (
          <div className="mt-5">
            <div className="bg-gray-50 rounded-lg p-4 mb-5">
              <h3 className="font-semibold">Cuenta encontrada</h3>

              <p>{usuarioAutorizado.name}</p>

              <p className="text-sm text-gray-600">
                Rol: {usuarioAutorizado.role}
              </p>
            </div>

            <input
              className="w-full border rounded-lg p-3 mb-3"
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="w-full border rounded-lg p-3 mb-4"
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              className="w-full bg-teal-900 text-white rounded-lg p-3"
              onClick={crear}
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Activar cuenta"}
            </button>
          </div>
        )}

        <button
          className="w-full mt-3 border border-teal-900 text-teal-900 rounded-lg p-3"
          onClick={() => router.back()}
        >
          Volver
        </button>

        {mensaje && <div className="mt-5 text-center text-sm">{mensaje}</div>}
      </div>
    </div>
  );
}
