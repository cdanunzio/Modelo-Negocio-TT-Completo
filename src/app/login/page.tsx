"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const volver = params.get("volver") || "/";
  const [modo, setModo] = useState<"entrar" | "registrar">("entrar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMsg(null);
    const sb = supabaseBrowser();
    try {
      if (modo === "entrar") {
        const { error } = await sb.auth.signInWithPassword({ email, password: clave });
        if (error) throw error;
        router.push(volver);
        router.refresh();
      } else {
        const { error } = await sb.auth.signUp({
          email, password: clave, options: { data: { nombre } },
        });
        if (error) throw error;
        setMsg("Cuenta creada. Si el proyecto pide confirmación por mail, revisá tu casilla.");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "No se pudo completar la operación.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="tarjeta w-full max-w-md p-6">
      <h1 className="text-xl font-bold text-puerto-700">Terminal Portuaria Timbúes</h1>
      <p className="mt-1 text-sm text-slate-600">Modelo de negocio · acceso del equipo</p>

      <form onSubmit={enviar} className="mt-6 space-y-3">
        {modo === "registrar" && (
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="campo campo-texto mt-1" required />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium">Correo</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="campo campo-texto mt-1" required autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Contraseña</span>
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)}
            className="campo campo-texto mt-1" required minLength={6}
            autoComplete={modo === "entrar" ? "current-password" : "new-password"} />
        </label>

        <button type="submit" disabled={cargando} className="btn-primario w-full justify-center">
          {cargando ? "Procesando..." : modo === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      {msg && (
        <p className="mt-4 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">{msg}</p>
      )}

      <button onClick={() => { setModo(modo === "entrar" ? "registrar" : "entrar"); setMsg(null); }}
        className="mt-4 text-sm text-puerto-600 underline">
        {modo === "entrar" ? "No tengo cuenta todavía" : "Ya tengo cuenta"}
      </button>
    </div>
  );
}

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Suspense fallback={<div className="text-slate-500">Cargando…</div>}>
        <Formulario />
      </Suspense>
    </main>
  );
}
