"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, hayBaseDeDatos, correoDeUsuario } from "@/lib/supabase/client";

/**
 * Portero de la aplicación. Mientras no haya sesión iniciada no se muestra
 * nada del modelo: solo el formulario de ingreso.
 *
 * La seguridad real no está acá sino en la base: las políticas de Supabase
 * rechazan toda lectura y toda escritura que no traiga una sesión válida.
 * Este componente es la puerta; la cerradura está del otro lado.
 */
export default function Acceso({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hayBaseDeDatos) { setVerificando(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setVerificando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: correoDeUsuario(usuario),
      password: clave,
    });
    if (error) {
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "Usuario o contraseña incorrectos."
          : error.message
      );
      setEntrando(false);
    } else {
      setClave("");
      setEntrando(false);
    }
  }

  if (!hayBaseDeDatos) return <>{children}</>;

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Verificando el acceso…</p>
      </div>
    );
  }

  if (sesion) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <form onSubmit={entrar} className="tarjeta w-full max-w-sm p-6">
        <h1 className="text-lg font-bold text-slate-900">Terminal Portuaria Timbúes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Modelo de negocio. Ingresá con el usuario del equipo.
        </p>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Usuario
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-puerto-500 focus:ring-1 focus:ring-puerto-500"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-puerto-500 focus:ring-1 focus:ring-puerto-500"
          />
        </label>

        {error && (
          <p className="mt-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={entrando} className="btn-primario mt-5 w-full">
          {entrando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

/** Botón de salida. Se muestra solo cuando hay sesión. */
export function Salir() {
  const [hay, setHay] = useState(false);

  useEffect(() => {
    if (!hayBaseDeDatos) return;
    supabase.auth.getSession().then(({ data }) => setHay(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHay(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!hay) return null;

  return (
    <button
      onClick={() => supabase.auth.signOut()}
      className="text-slate-500 hover:text-puerto-700"
    >
      Salir
    </button>
  );
}
