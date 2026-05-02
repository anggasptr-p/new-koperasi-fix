"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 
import { useCartStore } from "../lib/store"; // Pastikan path lib/store.ts bener

export default function Home() {
  const router = useRouter();
  
  // --- GLOBAL STATE (ZUSTAND) ---
  const { cart, addToCart, removeFromCart, getQty } = useCartStore();

  // --- LOCAL UI STATE ---
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [fullName, setFullName] = useState("Siswa Smaneka");
  const [userNis, setUserNis] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA USER & PRODUK ---
  useEffect(() => {
    const initApp = async () => {
      // 1. Cek User Session
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata) {
        setFullName(user.user_metadata.full_name || "Bro");
        setUserNis(user.user_metadata.nis || "");
      } else {
        // Kalo belum login, usir ke halaman login
        router.push("/login");
        return;
      }

      // 2. Tarik Data Produk dari Supabase
      // Catatan: Kalo tabel 'products' belum lo bikin, ini bakal return array kosong
      const { data: dbProducts, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (!error && dbProducts) {
        setProducts(dbProducts);
      } else {
        // Fallback data sementara kalo tabel di Supabase belum siap
        setProducts([
          { id: 1, name: "Kopi Juns (Botol)", price: 15000, icon: "☕", category: "Minuman" },
          { id: 2, name: "Cilok Kuah Pedas", price: 8000, icon: "🍲", category: "Makanan" },
          { id: 3, name: "Buku Tulis Sidu", price: 5000, icon: "📓", category: "Alat Tulis" },
        ]);
      }
      setIsLoading(false);
    };

    initApp();
  }, [router]);

  // LOGIKA UX: Nama depan doang buat sapaan
  const firstName = fullName.split(" ")[0];

  // LOGIKA FILTER: Cari & Kategori
  const filteredProducts = products.filter(p => 
    (activeCategory === "Semua" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // HITUNG TOTAL BUAT UI
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-40 overflow-x-hidden relative">
      
      {/* --- SIDEBAR MENU --- */}
      <div className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setSidebarOpen(false)}>
        <div className={`fixed top-0 left-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 p-6 flex flex-col justify-between ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
          <div>
            <div className="flex items-center space-x-3 mb-10 mt-4">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl shadow-inner">👤</div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{fullName}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">NIS: {userNis}</p>
              </div>
            </div>
            <nav className="space-y-6">
              <div className="flex items-center space-x-4 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                <span className="text-xl">📜</span> <span className="font-black text-xs uppercase tracking-widest">Riwayat Pembelian</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                <span className="text-xl">⚙️</span> <span className="font-black text-xs uppercase tracking-widest">Pengaturan Akun</span>
              </div>
            </nav>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} 
            className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-4 rounded-2xl w-full active:scale-95 transition-all mb-4"
          >
            <span className="text-lg">🚪</span> <span className="font-black text-xs uppercase tracking-widest">Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 px-4 pt-4 pb-3 shadow-sm max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="p-1 -ml-1 text-2xl active:scale-90 transition-transform font-bold text-gray-700">☰</button>
             <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Selamat Datang,</p>
                <h2 className="text-sm font-black text-gray-800 leading-none">{firstName} 👋</h2>
             </div>
          </div>
          <h1 className="font-black text-xl text-green-600 tracking-tighter italic pr-1">KOPERASI.</h1>
        </div>
        <div className="relative mt-2">
          <input type="text" placeholder="Mau jajan apa hari ini?" className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-green-500 transition-all font-bold text-gray-700 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <span className="absolute left-4 top-3.5 text-gray-400 text-lg">🔍</span>
        </div>
      </header>

      {/* --- KOP-POINT SECTION --- */}
      <section className="px-4 mt-4 max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-[24px] p-5 text-white shadow-xl shadow-green-100 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black opacity-80 uppercase tracking-[0.2em] mb-1">Kop-Point Reward</p>
            <h3 className="text-3xl font-black flex items-baseline gap-1">2.450 <span className="text-xs font-bold opacity-80">pts</span></h3>
          </div>
          <button className="bg-white text-green-600 px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg active:scale-95 transition-transform relative z-10 uppercase">Tukar 🎁</button>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </section>

      {/* --- KATEGORI --- */}
      <main className="max-w-md mx-auto px-4 mt-6">
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-3 mb-4 scroll-smooth">
          {["Semua", "Makanan", "Minuman", "Alat Tulis"].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-[10px] font-black transition-all uppercase tracking-widest border-2 ${activeCategory === cat ? "bg-green-600 text-white border-green-600 shadow-md scale-105" : "bg-white text-gray-400 border-gray-100"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* --- GRID PRODUK --- */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((p) => {
            const qty = getQty(p.id);
            return (
              <div key={p.id} className="bg-white rounded-[28px] p-4 border border-gray-50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow active:scale-[0.98]">
                <div>
                  <div className="bg-gray-50 h-36 rounded-[20px] flex items-center justify-center text-5xl mb-4">
                    {p.icon}
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1 px-1">{p.name}</h4>
                  <p className="text-green-600 font-black text-sm px-1">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="mt-4">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(p)} className="w-full bg-gray-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] active:bg-green-600 transition-colors">
                      + Tambah
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between bg-green-50 rounded-xl p-1 border border-green-100 shadow-inner">
                      <button onClick={() => removeFromCart(p.id)} className="w-8 h-8 bg-white text-green-600 rounded-lg font-black shadow-sm active:scale-90">-</button>
                      <span className="font-black text-green-700 text-sm">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-8 h-8 bg-green-600 text-white rounded-lg font-black shadow-sm active:scale-90">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm font-bold uppercase tracking-widest">
            Barangnya Ga Ada, Ler! 😅
          </div>
        )}
      </main>

      {/* --- FLOATING CHECKOUT BAR --- */}
      {totalItems > 0 && (
        <div className="fixed bottom-[88px] left-0 right-0 px-4 z-[80] max-w-md mx-auto animate-slide-up">
          <div className="bg-gray-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl border border-gray-700">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{totalItems} Barang Dipilih</span>
              <span className="font-black text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => router.push('/checkout')}
              className="bg-green-500 hover:bg-green-400 text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/30"
            >
              Checkout ➔
            </button>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-10 py-4 flex justify-between items-center max-w-md mx-auto rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-[90]">
        <div className="flex flex-col items-center text-green-600">
          <span className="text-2xl">🏠</span>
          <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">Home</span>
        </div>
        <div className="relative flex flex-col items-center text-gray-300">
          <span className="text-2xl">🛒</span>
          <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              {totalItems}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center text-gray-300">
          <span className="text-2xl">👤</span>
          <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">Profile</span>
        </div>
      </nav>

      <style jsx global>{`
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
