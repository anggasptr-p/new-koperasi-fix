"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  CheckCircle2, XCircle, RefreshCw, Banknote, 
  PackageSearch, AlertCircle, Trash2, Clock 
} from "lucide-react";

export default function MasterAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fungsi Tarik Data dari Supabase
  const fetchOrders = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. JURUS SAKTI: Terima Pesanan + Potong Stok Otomatis
  const handleAccept = async (order: any) => {
    const confirmAccept = confirm(`Yakin mau terima pesanan ${order.user_name} dan potong stok fisik?`);
    if (!confirmAccept) return;

    // Update Status Order dulu
    const { error: orderError } = await supabase
      .from("orders")
      .update({ order_status: "ACCEPTED" })
      .eq("id", order.id);

    if (orderError) return alert("Gagal update order: " + orderError.message);

    // Proses Pengurangan Stok di Tabel Products
    for (const item of order.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);
      }
    }

    alert("Pesanan diterima & Stok berhasil dipotong! ✅");
    fetchOrders();
  };

  // 3. JURUS TOLAK: Reject Manual dengan Alasan
  const handleReject = async (orderId: string) => {
    const reason = prompt("Kasih alasan kenapa lu tolak, Ler: (Contoh: Duit lu palsu / Stok abis)");
    if (reason === null) return; // Kalo batal klik prompt
    if (!reason) return alert("Wajib kasih alasan kalo mau nolak, jangan PHP!");

    const { error } = await supabase
      .from("orders")
      .update({ 
        order_status: "REJECTED", 
        reject_reason: reason 
      })
      .eq("id", orderId);

    if (error) alert("Gagal nolak: " + error.message);
    else fetchOrders();
  };

  // 4. VERIFIKASI TUNAI: Ubah Pending jadi Paid
  const verifyCashPayment = async (orderId: string) => {
    if (confirm("Udah beneran pegang duit fisiknya? Jangan mau diboongin!")) {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "PAID" })
        .eq("id", orderId);

      if (error) alert("Gagal verifikasi: " + error.message);
      else fetchOrders();
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      
      {/* HEADER ADMIN */}
      <header className="bg-slate-950 text-white sticky top-0 z-[100] shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tighter italic">SMANEKA ADMIN<span className="text-emerald-500">.</span></h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gudang & Transaksi Center</p>
          </div>
          <button 
            onClick={fetchOrders} 
            disabled={isRefreshing}
            className="p-3 bg-slate-800 rounded-2xl active:scale-90 transition-all"
          >
            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
             <PackageSearch className="text-emerald-500" /> Antrean Pesanan
           </h2>
           <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
             {orders.filter(o => o.order_status === 'WAITING').length} Baru
           </span>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-100">
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Kantin lagi sepi, Ler...</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={`bg-white rounded-[2.5rem] p-6 border-2 transition-all duration-300 ${
                order.order_status === 'WAITING' ? 'border-emerald-100 shadow-xl shadow-emerald-500/5' : 'border-slate-100 opacity-70 grayscale-[0.5]'
              }`}>
                
                {/* Atas: Info User & Status */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-5">
                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {new Date(order.created_at).toLocaleTimeString('id-ID')} • #{(order.id).substring(0, 8)}
                     </p>
                     <h3 className="text-base font-black text-slate-950">{order.user_name}</h3>
                   </div>
                   <div className="flex flex-col gap-1.5 items-end">
                      <span className={`text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${
                        order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {order.payment_status}
                      </span>
                      <span className={`text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${
                        order.order_status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' : 
                        order.order_status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {order.order_status}
                      </span>
                   </div>
                </div>

                {/* Tengah: Item Belanjaan */}
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pesanan Barang:</p>
                  <div className="space-y-2">
                    {order.items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">{it.qty}x <span className="text-slate-900">{it.name}</span></span>
                        <span className="text-xs font-black text-slate-400">Rp {(it.price * it.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                     <span className="text-xs font-black text-slate-900 uppercase">Total Duit</span>
                     <span className="text-lg font-black text-emerald-600 italic">Rp {order.total_price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Bawah: Action Buttons (Fix Looping & Conditional) */}
                {order.order_status === "WAITING" ? (
                  <div className="space-y-3">
                    {order.payment_method === "TUNAI" && order.payment_status === "PENDING" && (
                      <button 
                        onClick={() => verifyCashPayment(order.id)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <Banknote size={16} /> Verifikasi Uang Tunai
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleReject(order.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button 
                        disabled={order.payment_status === 'PENDING'}
                        onClick={() => handleAccept(order)} 
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all ${
                          order.payment_status === 'PAID' 
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/20 active:scale-95' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <CheckCircle2 size={16} /> Accept Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-2">
                     <AlertCircle size={14} className="text-slate-400" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       Pesanan Selesai ({order.order_status})
                     </p>
                     {order.reject_reason && <span className="text-[10px] text-red-400 font-bold italic ml-2">"{order.reject_reason}"</span>}
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </main>

      {/* Global CSS for Vibe Admin */}
      <style jsx global>{`
        body { background-color: #F8FAFC; }
      `}</style>
    </div>
  );
}
