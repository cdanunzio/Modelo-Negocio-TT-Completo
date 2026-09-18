"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Encabezado({ email }: { email: string }) {
  const router = useRouter();
  async function salir() {
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="font-semibold text-puerto-700">
          Terminal Portuaria Timbúes
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/manual" className="text-slate-600 hover:text-puerto-700">Manual</Link>
          <Link href="/glosario" className="text-slate-600 hover:text-puerto-700">Glosario</Link>
          <span className="hidden text-slate-400 sm:inline">{email}</span>
          <button onClick={salir} className="text-slate-600 underline hover:text-puerto-700">
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
