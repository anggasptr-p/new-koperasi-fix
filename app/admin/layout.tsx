"use client";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans pb-10">
      <header className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-[100] flex justify-between items-center">
        <div className="flex items-center gap-3">
          {pathname !== "/admin" && (
            <button onClick={() => router.push("/admin")} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <ArrowLeft size={18}/>
            </button>
          )}
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white">SMANEKA<span className="text-emerald-500">.</span>COMMAND</h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">Operational Level: Administrator</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
          <RefreshCw size={18}/>
        </button>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
