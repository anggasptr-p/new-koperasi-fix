"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { IdCard, User, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function SmartLoginPage() {
  const [nis, setNis] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSmartAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- AKAL-AKALAN DIMULAI ---
    if (!nis) return alert("NIS wajib diisi, Ler!");
    setLoading(true);

    // 1. Bikin Email Siluman
    const dummyEmail = `${nis}@smaneka.local`;
    // 2. Akalin Password (Supabase butuh min 6 karakter)
    const dummyPassword = nis.length >= 6 ? nis : `${nis}smaneka`;

    // 3. Coba Login Dulu
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: dummyPassword,
    });

    if (loginError) {
      // Kalo errornya "Invalid login credentials", berarti dia belum pernah daftar
      if (loginError.message.includes("Invalid login credentials")) {
        if (!fullName) {
          setLoading(false);
          return alert("NIS lu belum terdaftar! Isi 'Nama Lengkap' lu di bawah, terus klik Login lagi buat otomatis daftar.");
        }

        // 4. Auto-Register karena datanya belum ada
        const { error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: {
            data: { full_name: fullName, nis: nis },
          },
        });

        if (signUpError) {
          alert("Gagal daftar otomatis: " + signUpError.message);
        } else {
          // Kalo sukses daftar, Supabase langsung nge-login-in user
          router.push("/");
        }
      } else {
        alert("Error: " + loginError.message);
      }
    } else {
      // Kalo login sukses, langsung lempar ke beranda
      router.push("/");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Sisi Kiri: Visual Branding (Sama kayak kemaren biar tetep Sultan) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
           <h1 className="text-3xl font-black text-white tracking-tighter italic">SMANEKA<span className="text-emerald-500">.</span></h1>
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-6">Fast & Simple.<br/><span className="text-emerald-500">Just Scan</span> and <br/>Enjoy your snacks.</h2>
          <div className="space-y-4">
             {[ "Login pakai NIS", "Checkout Super Cepat", "Sistem Otomatis"].map((text, i) => (
               <div key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                 <CheckCircle2 className="text-emerald-500" size={20} /> {text}
               </div>
             ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">© 2024 Smaneka Digital Ecosystem.</p>
      </div>

      {/* Sisi Kanan: Form Sat-Set */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} /> Quick Access
            </div>
            <h3 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Masuk Koperasi.</h3>
            <p className="text-slate-500 text-sm font-medium">Masukin NIS lu. Kalo baru pertama kali, isi Nama Lengkap juga biar langsung terdaftar.</p>
          </div>

          <form onSubmit={handleSmartAuth} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nomor Induk Siswa (NIS)</label>
              <div className="relative group">
                <IdCard className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input type="number" placeholder="Contoh: 123456" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold text-slate-900" value={nis} onChange={e => setNis(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap <span className="text-[10px] font-medium opacity-70">(Isi kalo belum pernah daftar)</span></label>
              <div className="relative group">
                <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input type="text" placeholder="Contoh: Ardhiansyah Emir" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold text-slate-900" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-200">
              {loading ? "Memproses..." : "Masuk / Daftar Otomatis"} <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
