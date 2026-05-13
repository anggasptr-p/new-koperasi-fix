"use client";
import { useRouter } from "next/navigation";
import { UserCircle, PackageSearch, Package, BookOpen, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Profil Singkat Bos */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/20">
          <UserCircle size={36} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome, Chief Ardi! 👋</h2>
          <p className="text-xs text-slate-400 font-medium">Sistem normal. Pilih modul operasional Smaneka V3.</p>
        </div>
      </div>

      {/* 3 Tombol Modul Ajaib */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { path: "/admin/orders", title: "Transaction Control", desc: "Accept & Reject pesanan jajan bocah.", icon: PackageSearch, color: "from-blue-500 to-indigo-600" },
          { path: "/admin/inventory", title: "Warehouse Hub", desc: "Kelola stok fisik gudang.", icon: Package, color: "from-amber-500 to-orange-600" },
          { path: "/admin/ledger", title: "Financial Ledger", desc: "Audit & Laporan Pembukuan otomatis.", icon: BookOpen, color: "from-emerald-500 to-teal-600" }
        ].map((m) => (
          <div key={m.path} onClick={() => router.push(m.path)} className="group bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden active:scale-95 shadow-xl">
            <div className={`w-14 h-14 bg-gradient-to-br ${m.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              <m.icon size={24} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">{m.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{m.desc}</p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Open Module</span>
              <ChevronRight size={14} className="text-slate-700 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}