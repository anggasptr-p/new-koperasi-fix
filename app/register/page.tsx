"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { supabase } from "../../lib/supabase"; // <-- Manggil kabel Supabase lu!

export default function RegisterPage() {
  const router = useRouter(); // Buat pindah halaman otomatis
  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Biar tombol loading pas diteken

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Anti-Orang-Mabok
    if (nis.length !== 5 || pin.length !== 5) {
      alert("Woi anjir! NIS sama PIN lu harus pas 5 digit!");
      return;
    }

    if (nis !== pin) {
      alert("Ler, NIS sama PIN lu beda tuh. Samain aja biar ga lupa!");
      return;
    }

    setIsLoading(true); // Nyalain efek loading

    // Logika Siluman
    const dummyEmail = `${nis}@smaneka.com`;
    const securePassword = `${pin}_KopSmnk26!`;

    try {
      // PROSES NEMBAK KE SUPABASE AUTH 🚀
      const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password: securePassword,
        options: {
          data: {
            full_name: nama, // Simpen nama aslinya ke metadata
            nis: nis // Simpen juga NIS-nya buat jaga-jaga
          }
        }
      });

      // Kalau error (misal NIS udah pernah didaftarin)
      if (error) throw error;

      // Kalau sukses
      alert(`Mantap jiwa! Akun ${nama} berhasil dibikin. Gas login sekarang, Bro!`);
      router.push('/login'); // Otomatis pindah ke halaman login
      
    } catch (error: any) {
      console.error("Error dari Supabase:", error.message);
      alert(`Gagal bikin akun, Ler! Error: ${error.message}`);
    } finally {
      setIsLoading(false); // Matiin efek loading
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 flex flex-col justify-center max-w-md mx-auto relative">
      <a href="/login" className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors">←</a>

      <div className="mb-10 mt-12">
        <h1 className="text-4xl font-black text-gray-900 leading-tight">Bikin<br/><span className="text-green-600">Akun Baru!</span></h1>
        <p className="text-gray-400 font-medium mt-3 text-sm">Daftar pake NIS lu. Gampang, ga pake ribet.</p>
      </div>

      <form className="space-y-5" onSubmit={handleRegister}>
        {/* Input Nama */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Lengkap</label>
          <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Ardiansyah Emir" className="w-full mt-2 bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all font-bold text-gray-700"/>
        </div>

        {/* Input NIS */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">NIS (Nomor Induk Siswa)</label>
          <input type="text" inputMode="numeric" required maxLength={5} value={nis} onChange={(e) => setNis(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Contoh: 18477" className="w-full mt-2 bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all font-bold text-gray-700"/>
        </div>

        {/* Input PIN */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bikin PIN (Samain kaya NIS)</label>
          <input type="password" inputMode="numeric" required maxLength={5} value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ketik ulang NIS lu" className="w-full mt-2 bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all font-bold text-gray-700 font-mono tracking-widest"/>
        </div>

        {/* Tombol Submit dengan efek Loading */}
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-green-100 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Lagi Bikin Akun..." : "Daftar Sekarang"}
        </button>
      </form>

      <div className="mt-8 text-center pb-8">
        <p className="text-xs text-gray-400 font-bold">Udah punya akun? <a href="/login" className="text-green-600 cursor-pointer hover:underline">Masuk di sini</a></p>
      </div>
    </div>
  );
}
