"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../lib/store";
import { ArrowLeft, Trash2, ShieldCheck, QrCode, ChevronRight, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, addToCart } = useCartStore();
  
  // Fitur Checklist: Kita simpan ID produk yang di-uncheck
  const [unselectedIds, setUnselectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setUnselectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Ngitung cuma yang di-checklist
  const { selectedItems, totalPrice } = useMemo(() => {
    const selected = cart.filter(item => !unselectedIds.includes(item.id));
    return {
      selectedItems: selected,
      totalPrice: selected.reduce((sum, item) => sum + item.price * item.qty, 0)
    };
  }, [cart, unselectedIds]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Review Order</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
               Cart Items <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{cart.length}</span>
            </h2>
            <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className={`bg-white rounded-[2rem] p-5 border-2 transition-all flex items-center gap-4 ${!unselectedIds.includes(item.id) ? "border-emerald-500/20 shadow-lg shadow-emerald-500/5" : "border-slate-100 opacity-60"}`}>
                {/* Custom Checklist */}
                <button onClick={() => toggleSelect(item.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${!unselectedIds.includes(item.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 bg-white"}`}>
                   {!unselectedIds.includes(item.id) && <ShieldCheck size={14} strokeWidth={3} />}
                </button>

                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl">📦</div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">Rp {item.price.toLocaleString('id-ID')}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                     <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-black shadow-sm">-</button>
                        <span className="text-xs font-black px-1">{item.qty}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-xs font-black shadow-sm">+</button>
                     </div>
                     <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
                
                <div className="text-right">
                   <p className="font-black text-slate-950">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Payment Bento */}
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
             <h3 className="font-bold text-lg mb-6">Order Summary</h3>
             <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex justify-between text-sm text-slate-400">
                   <span>Subtotal ({selectedItems.length} items)</span>
                   <span className="text-white font-semibold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                   <span>Tax (PPN 0%)</span>
                   <span className="text-white font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-400">
                   <span className="flex items-center gap-2 italic">Kop-Point Bonus</span>
                   <span className="font-black">+24 pts</span>
                </div>
             </div>
             <div className="pt-6 flex justify-between items-baseline mb-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pay</span>
                <span className="text-3xl font-black text-emerald-400">Rp {totalPrice.toLocaleString('id-ID')}</span>
             </div>
             <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                Complete Payment
             </button>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-emerald-500/20 transition-all">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><QrCode size={20}/></div>
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Method</p>
                   <p className="text-sm font-bold text-slate-900 italic">QRIS / Kop-Pay</p>
                </div>
             </div>
             <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
          </div>
        </div>
      </main>
    </div>
  );
}
