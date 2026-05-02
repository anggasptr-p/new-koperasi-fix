"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; // <-- Kabel Supabase lu!

export default function LoginPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Anti-Mabok (Wajib 5 Digit)
    if (nis.length !== 5 || pin.length !== 5) {
      alert("Ler, NIS ama PIN lu kan 5 digit, cek lagi gih!");
      return;
    }

    setIsLoading(true);

    // Logika Siluman (Harus sama persis sama yang di Register)
    const dummyEmail = `${nis}@smaneka.com`;
    const securePassword = `${pin}_KopSmnk26!`;

    try {
      // PROSES LOGIN KE SUPABASE 🚀
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: securePassword,
      });

      // Kalau salah password atau akun belum ada
      if (error) {
        throw error;
      }

      // Kalau sukses masuk
      alert(`Welcome back, Bro! Login sukses.`);
      window.location.href = "/"; // <-- GANTI JADI INI LER


    } catch (error: any) {
      console.error("Error Login:", error.message);
      // Pesen error yang lebih "Manusiawi"
      if (error.message.includes("Invalid login credentials")) {
         alert("NIS atau PIN lu salah anjir! Ingat-ingat lagi Ler.");
      } else {
         alert(`Gagal login! Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 flex flex-col justify-center max-w-md mx-auto relative">
      
      <a href="/" className="absolute top-8 left-8 text-gray-300 hover:text-gray-500 text-2xl font-bold transition-colors">←</a>

      <div className="mb-12 mt-10">
        <h1 className="text-4xl font-black text-gray-900 leading-tight">
          Selamat<br/><span className="text-green-600">Datang!</span>
        </h1>
        <p className="text-gray-400 font-medium mt-3 text-sm italic">
          Koperasi Smaneka Digital Management
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username / NIS</label>
          <input 
            type="text" 
            inputMode="numeric"
            maxLength={5}
            required
            value={nis}
            onChange={(e) => setNis(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Masukin 5 digit NIS lu" 
            className="w-full mt-2 bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all font-bold text-gray-700 tracking-wider"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">PIN Keamanan</label>
          <input 
            type="password" 
            inputMode="numeric"
            maxLength={5}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="•••••" 
            className="w-full mt-2 bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all font-bold text-gray-700 tracking-[1em]"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-5 rounded-[22px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-100 active:scale-[0.97] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "BENTAR LER..." : "MASUK SEKARANG"}
        </button>
      </form>

      <div className="mt-12 text-center border-t border-gray-50 pt-8">
        <p className="text-xs text-gray-400 font-bold mb-2">Belum punya akun Koperasi?</p>
        <a href="/register" className="inline-block text-sm font-black text-green-600 border-2 border-green-600 px-8 py-3 rounded-full hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-sm">
          DAFTAR AKUN BARU 🚀
        </a>
      </div>

      <div className="mt-10 text-center opacity-30">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Built with passion by Ardi</p>
      </div>

    </div>
  );
}