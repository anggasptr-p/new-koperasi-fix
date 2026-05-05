"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 
import { useCartStore } from "../lib/store";
import { 
  User, LogOut, History, Settings, Menu, Search, Gift, 
  LayoutGrid, Utensils, Coffee, PencilLine, Box,
  Plus, Minus, ShoppingBag, Home, ChevronRight, Bell, Sparkles
} from "lucide-react";

interface ProductIconProps {
  name: string;
  className?: string;
}

const ProductIcon = ({ name, className }: ProductIconProps) => {
  const icons: Record<string, any> = { Coffee, Utensils, PencilLine, Box };
  const IconComponent = icons[name] || Box;
  return <IconComponent className={className} strokeWidth={1.5} />;
};

export default function HomePage() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, getQty } = useCartStore();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [fullName, setFullName] = useState("Ardi");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setFullName(user.user_metadata.full_name || "Ardi");
      else { router.push("/login"); return; }

      const { data: dbProducts, error } = await supabase
        .from("products").select("*").order("name", { ascending: true });

      if (!error && dbProducts?.length > 0) setProducts(dbProducts);
      else {
        setProducts([
          { id: 1, name: "Kopi Juns Signature", price: 18000, iconName: "Coffee", category: "Minuman", desc: "Arabica blend spesial." },
          { id: 2, name: "Cilok Wagyu Pedas", price: 12000, iconName: "Utensils", category: "Makanan", desc: "Cilok premium lava." },
          { id: 3, name: "Notebook Eksklusif", price: 25000, iconName: "PencilLine", category: "Alat Tulis", desc: "Limited Smaneka." },
          { id: 4, name: "Pulpen Parker", price: 10000, iconName: "PencilLine", category: "Alat Tulis", desc: "Tinta premium." },
        ]);
      }
      setIsLoading(false);
    };
    initApp();
  }, [router]);

  const cartData = useCartStore((state) => state.cart);
  const { totalItems, totalPrice } = useMemo(() => ({
    totalItems: cartData.reduce((sum, item) => sum + item.qty, 0),
    totalPrice: cartData.reduce((sum, item) => sum + item.price * item.qty, 0)
  }), [cartData]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-28">
      
      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-all ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)}>
        <div className={`fixed top-0 left-0 w-72 h-full bg-white shadow-2xl transition-transform duration-500 p-6 flex flex-col justify-between ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`} onClick={e => e.stopPropagation()}>
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><User size={24} /></div>
              <div>
                <h2 className="font-bold text-base tracking-tight">{fullName}</h2>
                <p className="text-[10px] text-slate-400 font-medium">Siswa Smaneka</p>
              </div>
            </div>
            <nav className="space-y-1">
              {[{ icon: History, label: "History", path: "/history" }, { icon: Settings, label: "Settings", path: "/settings" }].map((m, i) => (
                <div key={i} onClick={() => router.push(m.path)} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-3 text-slate-600 group-hover:text-emerald-600">
                    <m.icon size={18} />
                    <span className="font-bold text-xs">{m.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              ))}
            </nav>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} className="flex items-center justify-center space-x-2 bg-slate-950 text-white py-3.5 rounded-xl w-full active:scale-95 transition-all shadow-lg">
            <LogOut size={16} />
            <span className="font-bold text-[10px] uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </div>

      {/* --- COMPACT HEADER --- */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 bg-slate-50 rounded-lg"><Menu size={20} className="text-slate-600" /></button>
            <h1 className="text-lg font-black tracking-tighter text-slate-950 italic">SMANEKA<span className="text-emerald-500">.</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 text-slate-400 relative"><Bell size={20} /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span></div>
            <div onClick={() => router.push('/settings')} className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-[10px] cursor-pointer">AE</div>
          </div>
        </div>
      </header>

      {/* --- BENTO HERO (COMPACT) --- */}
      <section className="max-w-7xl mx-auto px-5 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-950 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-2">
              <Sparkles size={12} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Reward Balance</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black tracking-tighter italic">2.450 <span className="text-[10px] text-emerald-400 font-medium not-italic">pts</span></h3>
                <p className="text-[9px] text-slate-400 mt-1 font-medium italic">Redeem for free snacks 🎁</p>
              </div>
              <button className="bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-xl text-[9px] font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                REDEEM
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none transition-all duration-700"></div>
        </div>
      </section>

      {/* --- SEARCH BAR (NEW PLACEMENT) --- */}
      <div className="px-5 mt-6 max-w-7xl mx-auto">
        <div className="relative">
          <input type="text" placeholder="Mau jajan apa hari ini?" className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/10 font-medium shadow-sm transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Search className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
        </div>
      </div>

      {/* --- MAIN CONTENT (COMPACT GRID) --- */}
      <main className="max-w-7xl mx-auto px-5 mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
             <LayoutGrid size={16} className="text-emerald-500" /> Catalog
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["Semua", "Makanan", "Minuman", "Alat Tulis"].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all uppercase tracking-widest border ${activeCategory === cat ? "bg-slate-950 text-white border-slate-950 shadow-md" : "bg-white text-slate-400 border-slate-100"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.filter(p => activeCategory === "Semua" || p.category === activeCategory).map((p) => {
            const qty = getQty(p.id);
            return (
              <div key={p.id} className="group bg-white rounded-[1.5rem] p-3 border border-slate-50 hover:border-emerald-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="bg-slate-50 rounded-xl h-32 flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                  <ProductIcon name={p.iconName} className="w-12 h-12 text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                </div>
                <div className="px-1 flex-1">
                   <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">{p.category}</span>
                   <h4 className="font-bold text-slate-950 text-xs leading-tight mb-1 mt-0.5 line-clamp-1">{p.name}</h4>
                   <p className="text-[11px] font-black text-slate-950 mb-3">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="mt-auto">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(p)} className="w-full bg-slate-950 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5">
                      <Plus size={12} /> Add
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 p-1 rounded-xl border border-emerald-100">
                      <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 bg-white text-emerald-600 rounded-lg flex items-center justify-center font-bold shadow-sm active:scale-90 text-xs">-</button>
                      <span className="font-black text-emerald-700 text-[10px]">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold shadow-sm active:scale-90 text-xs">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- MINIMALIST BOTTOM NAV (COMPACT) --- */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl border border-slate-100 px-8 py-3.5 rounded-full shadow-2xl z-[90] flex items-center gap-12">
        <Home size={20} className="text-emerald-600 cursor-pointer" onClick={() => router.push('/')} />
        <div className="relative cursor-pointer text-slate-300" onClick={() => router.push('/checkout')}>
          <ShoppingBag size={20} />
          {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[7px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{totalItems}</span>}
        </div>
        <User size={20} className="text-slate-300" onClick={() => router.push('/settings')} />
      </nav>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
