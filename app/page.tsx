"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 
import { useCartStore } from "../lib/store";

export default function Home() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, getQty } = useCartStore();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [fullName, setFullName] = useState("Siswa Smaneka");
  const [userNis, setUserNis] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata) {
        setFullName(user.user_metadata.full_name || "Bro");
        setUserNis(user.user_metadata.nis || "");
      } else {
        router.push("/login");
        return;
      }

      const { data: dbProducts, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (!error && dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      } else {
        setProducts([
          { id: 1, name: "Kopi Juns (Botol)", price: 15000, icon: "☕", category: "Minuman" },
          { id: 2, name: "Cilok Kuah Pedas", price: 8000, icon: "🍲", category: "Makanan" },
          { id: 3, name: "Buku Tulis Sidu", price: 5000, icon: "📓", category: "Alat Tulis" },
          { id: 4, name: "Bolpoin Standard", price: 2500, icon: "🖊️", category: "Alat Tulis" },
          { id: 5, name: "Es Teh Manis", price: 3000, icon: "🥤", category: "Minuman" },
        ]);
      }
      setIsLoading(false);
    };

    initApp();
  }, [router]);

  const firstName = fullName.split(" ")[0];

  const filteredProducts = products.filter(p => 
    (activeCategory === "Semua" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      
      {/* --- SIDEBAR --- */}
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
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-4 rounded-2xl w-full active:scale-95 transition-all mb-4">
            <span className="text-lg">🚪</span> <span className="font-black text-xs uppercase tracking-widest">Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* --- HEADER (DIBIKIN MAX-W-6XL BIAR LEBAR DI LAPTOP) --- */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               <button onClick={() => setSidebarOpen(true)} className="p-1 -ml-1 text-2xl active:scale-90 transition-transform font-bold text-gray-700">☰</button>
               <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Selamat Datang,</p>
                  <h2 className="text-sm font-black text-gray-800 leading-none">{firstName} 👋</h2>
               </div>
            </div>
            <h1 className="font-black text-xl text-green-600 tracking-tighter italic pr-1">KOPERASI.</h1>
          </div>
          <div className="relative mt-2 max-w-2xl">
            <input type="text" placeholder="Mau jajan apa hari ini?" className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-green-500 transition-all font-bold text-gray-700 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <span className="absolute left-4 top-3.5 text-gray-400 text-lg">🔍</span>
          </div>
        </div>
      </header>

      {/* --- KOP-POINT (CENTERED & RESPONSIVE) --- */}
      <section className="px-4 mt-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-[32px] p-6 text-white shadow-xl shadow-green-100 flex justify-between items-center relative overflow-hidden md:p-10">
          <div className="relative z-10">
            <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-1">Kop-Point Reward</p>
            <h3 className="text-4xl font-black flex items-baseline gap-1">2.450 <span className="text-xs font-bold opacity-80">pts</span></h3>
            <p className="hidden md:block mt-2 text-sm font-medium opacity-90 italic">Belanja terus buat dapetin promo Cilok gratis! 🚀</p>
          </div>
          <button className="bg-white text-green-600 px-8 py-4 rounded-2xl text-[12px] font-black shadow-lg active:scale-95 transition-transform relative z-10 uppercase">Tukar Point 🎁</button>
          <div className="absolute -right-4 -bottom-4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- MAIN CONTENT (RESPONSIVE GRID) --- */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-4 mb-6 scroll-smooth">
          {["Semua", "Makanan", "Minuman", "Alat Tulis"].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-full text-[11px] font-black transition-all uppercase tracking-widest border-2 whitespace-nowrap ${activeCategory === cat ? "bg-green-600 text-white border-green-600 shadow-md scale-105" : "bg-white text-gray-400 border-gray-100"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* GRID PRODUK: Mobile 2 col, Tablet 3 col, Laptop 4 col */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const qty = getQty(p.id);
            return (
              <div key={p.id} className="bg-white rounded-[35px] p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all active:scale-[0.98] group">
                <div>
                  <div className="bg-gray-50 h-44 rounded-[30px] flex items-center justify-center text-6xl mb-5 group-hover:scale-110 transition-transform">
                    {p.icon}
                  </div>
                  <h4 className="font-bold text-gray-800 text-base leading-tight mb-2 px-1">{p.name}</h4>
                  <p className="text-green-600 font-black text-lg px-1">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="mt-5">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(p)} className="w-full bg-gray-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] active:bg-green-600 transition-colors">
                      + Tambah
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between bg-green-50 rounded-2xl p-1.5 border border-green-100 shadow-inner">
                      <button onClick={() => removeFromCart(p.id)} className="w-10 h-10 bg-white text-green-600 rounded-xl font-black shadow-sm active:scale-90">-</button>
                      <span className="font-black text-green-700 text-base">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-10 h-10 bg-green-600 text-white rounded-xl font-black shadow-sm active:scale-90">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- FLOATING CHECKOUT BAR (RESPONSIVE WIDTH) --- */}
      {totalItems > 0 && (
        <div className="fixed bottom-[90px] left-0 right-0 px-4 z-[80] w-full animate-slide-up">
          <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-[28px] p-5 flex justify-between items-center shadow-2xl border border-gray-700">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{totalItems} Item Terpilih</span>
              <span className="font-black text-xl">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => router.push('/checkout')}
              className="bg-green-500 hover:bg-green-400 text-gray-900 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/30"
            >
              Checkout ➔
            </button>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAV (DIBIKIN CENTERED DI LAPTOP) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-[90]">
        <div className="max-w-2xl mx-auto px-10 py-5 flex justify-between items-center rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col items-center text-green-600 cursor-pointer">
            <span className="text-2xl">🏠</span>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Beranda</span>
          </div>
          <div className="relative flex flex-col items-center text-gray-300 hover:text-green-600 transition-colors cursor-pointer">
            <span className="text-2xl">🛒</span>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Keranjang</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex flex-col items-center text-gray-300 hover:text-green-600 transition-colors cursor-pointer">
            <span className="text-2xl">👤</span>
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Profil</span>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
