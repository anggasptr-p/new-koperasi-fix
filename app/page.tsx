"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 
import { useCartStore } from "../lib/store";

// IMPORT ICON LUCIDE (Dewa Icon SVG)
import { 
  UserCircle, LogOut, History, Settings, Menu, Search, Gift, 
  LayoutGrid, UtensilsCrossed, Coffee, PencilRuler, Package,
  Plus, Minus, ShoppingCart, Home, User, ArrowRight
} from "lucide-react";

// Komponen Pembantu buat nampilin Icon Produk dinamis
// Kalau data dari Supabase ga ada iconName-nya, default ke Package icon.
const ProductIcon = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case "Coffee": return <Coffee className={className} />;
    case "UtensilsCrossed": return <UtensilsCrossed className={className} />;
    case "PencilRuler": return <PencilRuler className={className} />;
    default: return <Package className={className} />; // Fallback icon
  }
};

export default function HomePage() {
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
        // --- FALLBACK DATA (Sekarang pake Nama Icon Lucide) ---
        setProducts([
          { id: 1, name: "Kopi Juns (Botol)", price: 15000, iconName: "Coffee", category: "Minuman" },
          { id: 2, name: "Cilok Kuah Pedas", price: 8000, iconName: "UtensilsCrossed", category: "Makanan" },
          { id: 3, name: "Buku Tulis Sidu", price: 5000, iconName: "PencilRuler", category: "Alat Tulis" },
          { id: 4, name: "Bolpoin Standard", price: 2500, iconName: "PencilRuler", category: "Alat Tulis" },
          { id: 5, name: "Es Teh Manis", price: 3000, iconName: "Coffee", category: "Minuman" },
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

  // Selector Zustand yang aman dari Infinite Loop
  const cartData = useCartStore((state) => state.cart);
  const { totalItems, totalPrice } = useMemo(() => {
    return {
      totalItems: cartData.reduce((sum, item) => sum + item.qty, 0),
      totalPrice: cartData.reduce((sum, item) => sum + item.price * item.qty, 0)
    };
  }, [cartData]);

  const categories = [
    { name: "Semua", icon: LayoutGrid },
    { name: "Makanan", icon: UtensilsCrossed },
    { name: "Minuman", icon: Coffee },
    { name: "Alat Tulis", icon: PencilRuler },
  ];

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
            <div className="flex items-center space-x-3 mb-10 mt-4 px-1">
              {/* User Icon Gede */}
              <UserCircle className="w-16 h-16 text-green-600" strokeWidth={1} />
              <div>
                <h2 className="font-bold text-lg leading-tight text-gray-950">{fullName}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">NIS: {userNis}</p>
              </div>
            </div>
            <nav className="space-y-3">
              {[
                { icon: History, label: "Riwayat Pembelian" },
                { icon: Settings, label: "Pengaturan" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 p-4 rounded-xl text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors cursor-pointer group">
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-4 rounded-2xl w-full active:scale-95 transition-all mb-4 border border-red-100 hover:bg-red-100">
            <LogOut className="w-5 h-5" />
            <span className="font-black text-xs uppercase tracking-widest">Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               <button onClick={() => setSidebarOpen(true)} className="p-1 -ml-1 text-gray-700 active:scale-90 transition-transform">
                 <Menu className="w-7 h-7" />
               </button>
               <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Selamat Datang,</p>
                  <h2 className="text-base font-black text-gray-950 leading-none">{firstName} 👋</h2>
               </div>
            </div>
            <h1 className="font-black text-2xl text-green-600 tracking-tighter italic pr-1">KOPERASI.</h1>
          </div>
          <div className="relative mt-2 max-w-2xl">
            <input type="text" placeholder="Cari jajan, buku, atau minuman..." className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-green-300 focus:border-green-500 transition-all font-medium text-gray-800 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </header>

      {/* --- KOP-POINT REWARD --- */}
      <section className="px-4 mt-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 rounded-[32px] p-6 text-white shadow-xl shadow-green-100 flex justify-between items-center relative overflow-hidden md:p-10 border border-green-700">
          <div className="relative z-10">
            <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-1">Kop-Point Reward</p>
            <h3 className="text-4xl font-black flex items-baseline gap-1">2.450 <span className="text-xs font-bold opacity-80">pts</span></h3>
            <p className="hidden md:block mt-2 text-sm font-medium opacity-90 italic">Kumpulin pts buat dituker Cilok Mang Juns gratis! 🚀</p>
          </div>
          <button className="bg-white text-green-700 px-8 py-4 rounded-2xl text-[12px] font-black shadow-lg active:scale-95 transition-transform relative z-10 uppercase flex items-center gap-2 border border-gray-100">
            <Gift className="w-4 h-4" /> Tukar Point
          </button>
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- MAIN CONTENT (KATEGORI & PRODUK) --- */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Kategori Tab */}
        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-4 mb-6 scroll-smooth">
          {categories.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-6 py-3 rounded-full text-[11px] font-black transition-all uppercase tracking-widest border-2 whitespace-nowrap flex items-center gap-2.5 ${activeCategory === cat.name ? "bg-gray-950 text-white border-gray-950 shadow-lg scale-105" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"}`}>
              <cat.icon className="w-4 h-4" /> {cat.name}
            </button>
          ))}
        </div>

        {/* Responsive Grid Produk */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const qty = getQty(p.id);
            return (
              <div key={p.id} className="bg-white rounded-[35px] p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-2xl hover:border-green-100 transition-all active:scale-[0.98] group relative">
                <div>
                  <div className="bg-gray-50 h-44 rounded-[30px] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-gray-100">
                    <ProductIcon name={p.iconName} className="w-20 h-20 text-green-600" strokeWidth={1} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{p.category}</span>
                  <h4 className="font-bold text-gray-950 text-base leading-tight mb-2 mt-1 px-1 line-clamp-2">{p.name}</h4>
                </div>
                
                <div className="mt-5">
                  <div className="flex justify-between items-end px-1 mb-3">
                    <p className="text-gray-400 text-xs font-medium">Harga</p>
                    <p className="text-green-700 font-black text-xl leading-none">Rp {p.price.toLocaleString('id-ID')}</p>
                  </div>
                  
                  {qty === 0 ? (
                    <button onClick={() => addToCart(p)} className="w-full bg-gray-950 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-green-600">
                      <Plus className="w-4 h-4" /> Tambah
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between bg-green-50 rounded-2xl p-1.5 border border-green-200 shadow-inner animate-slide-up">
                      <button onClick={() => removeFromCart(p.id)} className="w-10 h-10 bg-white text-green-700 rounded-xl font-black shadow-sm active:scale-90 flex items-center justify-center border border-green-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-green-800 text-lg">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-10 h-10 bg-green-600 text-white rounded-xl font-black shadow-sm active:scale-90 flex items-center justify-center hover:bg-green-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- FLOATING CHECKOUT BAR --- */}
      {totalItems > 0 && (
        <div className="fixed bottom-[95px] left-0 right-0 px-4 z-[80] w-full animate-slide-up md:bottom-[100px]">
          <div className="max-w-2xl mx-auto bg-gray-950 text-white rounded-[28px] p-5 flex justify-between items-center shadow-2xl shadow-gray-300 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="relative bg-gray-800 p-3 rounded-xl border border-gray-700">
                <ShoppingCart className="w-6 h-6 text-green-400" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-gray-950">{totalItems}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Belanja</span>
                <span className="font-black text-2xl text-green-400">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/checkout')}
              className="bg-green-500 hover:bg-green-400 text-gray-950 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/20 flex items-center gap-2"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAV (RESPONSIVE CENTERED) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-[90] shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl mx-auto px-10 py-5 flex justify-between items-center rounded-t-[40px]">
          {[
            { icon: Home, label: "Beranda", active: true },
            { icon: ShoppingCart, label: "Keranjang", badge: totalItems },
            { icon: User, label: "Profil" },
          ].map((item, idx) => (
            <div key={idx} className={`relative flex flex-col items-center cursor-pointer transition-colors ${item.active ? "text-green-700" : "text-gray-300 hover:text-green-600"}`}>
              <item.icon className="w-7 h-7" strokeWidth={item.active ? 2 : 1.5} />
              <span className={`text-[9px] font-black mt-1.5 uppercase tracking-tighter ${item.active ? "opacity-100" : "opacity-80"}`}>{item.label}</span>
              {item.badge && item.badge > 0 && !item.active && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{item.badge}</span>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* CSS Animasi (Slide Up) */}
      <style jsx global>{`
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
