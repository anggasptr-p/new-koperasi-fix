"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 
import { useCartStore } from "../lib/store";
import { 
  User, LogOut, History, Settings, Menu, Search, 
  LayoutGrid, Utensils, Coffee, PencilLine, Box,
  Plus, ShoppingBag, Home, ChevronRight, Bell, Sparkles, Package
} from "lucide-react";

// Komponen Helper buat Icon Dinamis
const ProductIcon = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, any> = { Coffee, Utensils, PencilLine, Box };
  const IconComponent = icons[name] || Box;
  return <IconComponent className={className} strokeWidth={1.5} />;
};

export default function HomePage() {
  const router = useRouter();
  const { addToCart, getQty, cart } = useCartStore();

  // States
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [fullName, setFullName] = useState("Ardi");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tarik Data User & Produk dari Supabase
  useEffect(() => {
    const initApp = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata.full_name || "Ardi");
      } else {
        router.push("/login");
        return;
      }

      const { data: dbProducts, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (!error && dbProducts) {
        setProducts(dbProducts);
      }
      setIsLoading(false);
    };
    initApp();
  }, [router]);

  // 2. Hitung Total Item di Keranjang (Floating Indicator)
  const totalItemsInCart = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  // 3. Filter Produk (Search + Category)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === "Semua" || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, activeCategory]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Gudang...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-28 overflow-x-hidden">
      
      {/* --- SIDEBAR DRAWER --- */}
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)}>
        <div className={`fixed top-0 left-0 w-72 h-full bg-white shadow-2xl transition-transform duration-500 p-6 flex flex-col justify-between ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`} onClick={e => e.stopPropagation()}>
          <div>
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <User size={24} />
              </div>
              <div>
                <h2 className="font-bold text-base tracking-tight">{fullName}</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Member Smaneka</p>
              </div>
            </div>
            <nav className="space-y-2">
              {[
                { icon: History, label: "Riwayat Jajan", path: "/history" },
                { icon: Settings, label: "Pengaturan", path: "/settings" }
              ].map((m, i) => (
                <div key={i} onClick={() => router.push(m.path)} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-3 text-slate-600 group-hover:text-emerald-600">
                    <m.icon size={18} />
                    <span className="font-bold text-xs">{m.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              ))}
            </nav>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} className="flex items-center justify-center space-x-2 bg-slate-950 text-white py-4 rounded-2xl w-full active:scale-95 transition-all shadow-xl shadow-slate-200">
            <LogOut size={16} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Sign Out</span>
          </button>
        </div>
      </div>

      {/* --- COMPACT HEADER --- */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
              <Menu size={20} className="text-slate-600" />
            </button>
            <h1 className="text-lg font-black tracking-tighter text-slate-950 italic">SMANEKA<span className="text-emerald-500">.</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 text-slate-400 relative active:scale-90 transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div onClick={() => router.push('/settings')} className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black text-[10px] cursor-pointer shadow-lg shadow-emerald-100">
              {fullName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* --- BENTO HERO (SALDO/REWARD) --- */}
      <section className="max-w-7xl mx-auto px-5 mt-6">
        <div className="bg-slate-950 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-2">
              <Sparkles size={12} />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Smaneka Point Balance</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black tracking-tighter italic">2.450 <span className="text-[10px] text-emerald-400 font-medium not-italic tracking-normal">pts</span></h3>
                <p className="text-[9px] text-slate-400 mt-1 font-bold italic uppercase tracking-wider">Redeem for free cilok 🎁</p>
              </div>
              <button className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/30">
                TUKAR
              </button>
            </div>
          </div>
          {/* Efek Cahaya */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full"></div>
        </div>
      </section>

      {/* --- SEARCH BAR --- */}
      <div className="px-5 mt-6 max-w-7xl mx-auto">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Mau jajan apa hari ini, Ler?" 
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-xs focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 font-bold shadow-sm transition-all outline-none" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
          <Search className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
        </div>
      </div>

      {/* --- CATEGORY FILTER --- */}
      <div className="px-5 mt-6 flex gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
        {["Semua", "Makanan", "Minuman", "Alat Tulis"].map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-[0.15em] border whitespace-nowrap ${activeCategory === cat ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-200" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- PRODUCT GRID --- */}
      <main className="max-w-7xl mx-auto px-5 mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black text-slate-950 tracking-tight flex items-center gap-2">
             <LayoutGrid size={18} className="text-emerald-500" /> Katalog Barang
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredProducts.length} Item</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const qty = getQty(p.id);
            const isOutOfStock = p.stock <= 0;

            return (
              <div key={p.id} className={`group bg-white rounded-[2rem] p-3 border border-slate-50 hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col relative ${isOutOfStock ? 'opacity-60' : ''}`}>
                
                {/* Visual Barang */}
                <div className="bg-slate-50 rounded-[1.5rem] h-36 flex items-center justify-center mb-4 group-hover:bg-emerald-50/50 transition-colors relative overflow-hidden">
                  <ProductIcon name={p.iconName} className="w-14 h-14 text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-500" />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="bg-white px-3 py-1 rounded-full text-[8px] font-black text-slate-950 shadow-sm uppercase tracking-widest">Habis</span>
                    </div>
                  )}
                </div>

                {/* Konten Barang */}
                <div className="px-1 flex-1">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">{p.category}</span>
                      <span className={`text-[8px] font-black ${p.stock <= 5 ? 'text-red-500' : 'text-slate-400'}`}>
                        {isOutOfStock ? 'Stok Kosong' : `Stok: ${p.stock}`}
                      </span>
                   </div>
                   <h4 className="font-bold text-slate-950 text-xs leading-tight mb-1 mt-0.5 line-clamp-1">{p.name}</h4>
                   <p className="text-[12px] font-black text-slate-950 mb-4 tracking-tight">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
                
                {/* Action Button */}
                <div className="mt-auto">
                  {qty === 0 ? (
                    <button 
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p)} 
                      className={`w-full py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${isOutOfStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-emerald-600 shadow-slate-100'}`}
                    >
                      <Plus size={14} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 p-1.5 rounded-2xl border border-emerald-100 shadow-inner">
                      <button onClick={() => useCartStore.getState().removeFromCart(p.id)} className="w-8 h-8 bg-white text-emerald-600 rounded-xl flex items-center justify-center font-black shadow-sm active:scale-90 text-sm">-</button>
                      <span className="font-black text-emerald-700 text-xs">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black shadow-sm active:scale-90 text-sm">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="mt-10 text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Barang kaga ketemu, Ler...</p>
          </div>
        )}
      </main>

      {/* --- MINIMALIST BOTTOM NAV --- */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl px-10 py-4 rounded-full shadow-2xl z-[90] flex items-center gap-14 border border-white/10">
        <Home size={20} className="text-emerald-500 cursor-pointer" onClick={() => router.push('/')} />
        <div className="relative cursor-pointer text-white/40 hover:text-white transition-colors" onClick={() => router.push('/checkout')}>
          <ShoppingBag size={20} />
          {totalItemsInCart > 0 && (
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-slate-950 animate-bounce">
              {totalItemsInCart}
            </span>
          )}
        </div>
        <User size={20} className="text-white/40 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)} />
      </nav>

      {/* Global CSS for Smooth Experience */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
