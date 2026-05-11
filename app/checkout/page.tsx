"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCartStore } from "../../lib/store";
import { ArrowLeft, Trash2, QrCode, Banknote, CreditCard, ShoppingBag, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart } = useCartStore();
  const [payMethod, setPayMethod] = useState("QRIS");
  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong, Ler!");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    // 1. Masukin data ke tabel 'orders' sesuai ERD
    const { data, error } = await supabase.from("orders").insert([{
      user_id: user.id,
      user_name: user.user_metadata.full_name || "Siswa Smaneka",
      items: cart, // JSONB sakti
      total_price: totalPrice,
      payment_method: payMethod,
      payment_status: "PENDING",
      order_status: "WAITING"
    }]).select().single();

    if (error) {
      alert("Checkout gagal: " + error.message);
    } else {
      clearCart(); // Kosongin keranjang
      router.push(`/payment/${data.id}`); // Lempar ke halaman bayar
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-5 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={18}/></button>
        <h1 className="text-lg font-black tracking-tight">Review Pesanan</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-8 space-y-8">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">📦</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{item.qty}x • Rp {item.price.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>

        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metode Pembayaran</h3>
          <div className="grid grid-cols-2 gap-3">
            {[ {id: "QRIS", icon: QrCode, label: "QRIS (Auto)"}, {id: "TUNAI", icon: Banknote, label: "Tunai (Kantin)"} ].map((m) => (
              <button key={m.id} onClick={() => setPayMethod(m.id)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${payMethod === m.id ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-50 bg-slate-50 text-slate-400"}`}>
                <m.icon size={22} />
                <span className="text-[10px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        <button onClick={handleCheckout} disabled={loading} className="w-full bg-slate-950 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
          {loading ? "Processing..." : "Konfirmasi Pesanan"} <ArrowRight size={16}/>
        </button>
      </main>
    </div>
  );
}
