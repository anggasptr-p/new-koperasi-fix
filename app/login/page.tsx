"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
           <h1 className="text-3xl font-black text-white tracking-tighter italic">SMANEKA<span className="text-emerald-500">.</span></h1>
        </div>
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-tight mb-6">Experience the <br/><span className="text-emerald-500">New Standard</span> of <br/>School Cooperative.</h2>
          <div className="space-y-4">
             {[ "Seamless Digital Payment", "Kop-Point Reward System", "Verified Merchant Safety"].map((text, i) => (
               <div key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                 <CheckCircle2 className="text-emerald-500" size={20} /> {text}
               </div>
             ))}
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium">© 2024 Smaneka Digital Ecosystem. Built for Excellence.</p>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Secure Access
            </div>
            <h3 className="text-3xl font-black text-slate-950 tracking-tight mb-2">Welcome Back.</h3>
            <p className="text-slate-500 text-sm font-medium">Enter your credentials to access your cooperative account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input type="email" placeholder="nama@sman1kepanjen.sch.id" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold" onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                <a href="#" className="text-[10px] font-bold text-emerald-600 hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white focus:border-emerald-500/20 focus:ring-0 transition-all outline-none font-semibold" onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-200">
              {loading ? "Authenticating..." : "Sign In Account"} <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account? <Link href="/register" className="text-emerald-600 font-bold hover:underline">Create for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
