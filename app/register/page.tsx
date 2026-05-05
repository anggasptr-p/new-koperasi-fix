"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, IdentificationCard, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [nis, setNis] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Proses SignUp ke Supabase dengan Metadata (Nama & NIS)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          nis: nis,
        },
      },
    });

    if (error) {
      alert("Waduh, gagal daftar Bro: " + error.message);
    } else {
      alert("Mantap! Cek email buat verifikasi, terus langsung login Ler!");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Kanan: Branding & Info (Hidden di HP) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
           <h1 className="text-3xl font-black text-white tracking-tighter italic">SMANEKA<span className="text-emerald-500">.</span></h1>
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-8">Join the <br/><span className="text-emerald-500">Elite Circle</span> of <br/>Smaneka Students.</h2>
          <div className="space-y-6">
             {[ 
               { title: "Smart Inventory", desc: "Akses jajan paling lengkap & update." },
               { title: "Priority Queue", desc: "Gak perlu antre, tinggal scan & ambil." },
               { title: "Kop-Point Plus", desc: "Dapet cashback poin tiap transaksi." }
             ].map((item, i) => (
               <div key={i} className="flex gap-4">
                 <div className="mt-1 bg-emerald-500/20 p-2 rounded-lg text-emerald-500 h-fit">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-lg leading-none mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Built for SMAN 1 Kepanjen Digital Era.</p>
      </div>

      {/* Kiri: Form Registrasi */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md bg-white p-10 lg:p-0 rounded-[2.5rem] shadow-2xl shadow-slate-200 lg:shadow-none">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Membership Program
            </div>
            <h3 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Create Account.</h3>
            <p className="text-slate-500 text-sm font-medium">Lengkapi data lu biar resmi jadi member koperasi digital.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Input Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" placeholder="Contoh: Ardhiansyah Emir" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold text-slate-800" onChange={e => setFullName(e.target.value)} required />
              </div>
            </div>

            {/* Input NIS */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIS (Nomor Induk Siswa)</label>
              <div className="relative group">
                <IdentificationCard className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="text" placeholder="Masukin NIS lu, Bro" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold text-slate-800" onChange={e => setNis(e.target.value)} required />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Sekolah / Personal</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="email" placeholder="nama@email.com" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold text-slate-800" onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input type="password" placeholder="Minimal 6 karakter" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold text-slate-800" onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 mt-4">
              {loading ? "Creating Account..." : "Sign Up Now"} <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            Udah punya akun? <Link href="/login" className="text-emerald-600 font-black hover:underline">Balik Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
