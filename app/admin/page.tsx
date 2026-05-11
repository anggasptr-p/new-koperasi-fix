"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, XCircle, RefreshCw, Banknote, PackageOpen, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleAccept = async (order: any) => {
    const go = confirm(`Accept pesanan ${order.user_name} dan potong stok?`);
    if (!go) return;

    // 1. Update Order Status
    const { error } = await supabase.from("orders").update({ order_status: "ACCEPTED" }).eq("id", order.id);

    if (!error) {
      // 2. Potong Stok Real-Time
      for (const item of order.items) {
        const { data: p } = await supabase.from("products").select("stock").eq("id", item.id).single();
        if (p) {
          await supabase.from("products").update({ stock: p.stock - item.qty }).eq("id", item.id);
        }
      }
      fetchOrders();
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt("Masukin alasan penolakan (Misal: NIS Ghaib / Stok Mendadak Ludes):");
    if (!reason) return alert("Wajib isi alasan kalo mau nolak, Ler! Jangan asal nolak.");

    const { error } = await supabase.from("orders").update({ 
      order_status: "REJECTED", 
      reject_reason: reason 
    }).eq("id", orderId);

    if (!error) fetchOrders();
  };

  const verifyCash = async (orderId: string) => {
    if (confirm("Udah pegang duit fisiknya?")) {
      await supabase.from("orders").update({ payment_status: "PAID" }).eq("id", orderId);
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black italic text-lg tracking-tighter">ADMIN SMANEKA<span className="text-emerald-500">.</span></h1>
        <button onClick={fetchOrders} className="p-2 bg-slate-800 rounded-xl"><RefreshCw size={20}/></button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {orders.map((order) => (
          <div key={order.id} className={`bg-white p-6 rounded-[2rem] border-2 transition-all ${order.order_status === 'WAITING' ? 'border-emerald-100 shadow-xl' : 'border-slate-100 opacity-80'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-slate-900">{order.user_name}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{order.payment_method} • #{order.id.substring(0,6)}</p>
              </div>
              <span className={`text-[8px] font-black px-2 py-1 rounded-md ${order.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{order.payment_status}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6 space-y-1">
              {order.items.map((it: any, i: number) => (
                <p key={i} className="text-xs font-bold text-slate-600 flex justify-between"><span>{it.qty}x {it.name}</span> <span>Rp {(it.price * it.qty).toLocaleString()}</span></p>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-black text-emerald-600"><span>TOTAL</span> <span>Rp {order.total_price.toLocaleString()}</span></div>
            </div>

            {order.order_status === "WAITING" ? (
              <div className="space-y-3">
                {order.payment_method === "TUNAI" && order.payment_status === "PENDING" && (
                  <button onClick={() => verifyCash(order.id)} className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-200"><Banknote size={14}/> Verifikasi Uang Tunai</button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleReject(order.id)} className="bg-red-50 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"><XCircle size={14}/> Reject</button>
                  <button 
                    disabled={order.payment_status === 'PENDING'}
                    onClick={() => handleAccept(order)} 
                    className={`py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 ${order.payment_status === 'PAID' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                  >
                    <CheckCircle2 size={14}/> Accept & Cut Stock
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order {order.order_status}</p>
                {order.reject_reason && <p className="text-xs text-red-500 font-bold italic mt-1">Alasan: "{order.reject_reason}"</p>}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
