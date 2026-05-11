"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, XCircle, RefreshCw, Banknote, ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const fetchOrders = async () => {
    setSyncing(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setSyncing(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, col: string, val: string) => {
    const { error } = await supabase.from("orders").update({ [col]: val }).eq("id", id);
    if (!error) fetchOrders();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black italic text-lg tracking-tighter">SMANEKA ADMIN<span className="text-emerald-500">.</span></h1>
        <button onClick={fetchOrders} className={`p-2 bg-slate-800 rounded-xl transition-all ${syncing && 'animate-spin'}`}><RefreshCw size={20}/></button>
      </header>

      <main className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-all">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-50">
              <div>
                <h3 className="font-black text-slate-900 leading-none mb-1">{order.user_name}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Method: {order.payment_method}</p>
              </div>
              <div className="text-right">
                <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${order.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{order.payment_status}</span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {order.items.map((it: any, i: number) => (
                  <p key={i} className="text-xs font-bold text-slate-600 flex justify-between"><span>{it.qty}x {it.name}</span> <span>Rp {(it.price * it.qty).toLocaleString()}</span></p>
                ))}
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-600 px-1"><span>Total</span> <span>Rp {order.total_price.toLocaleString()}</span></div>
            </div>

            <div className="mt-8 space-y-3">
              {/* Tunai Verification */}
              {order.payment_method === "TUNAI" && order.payment_status === "PENDING" && (
                <button onClick={() => updateStatus(order.id, 'payment_status', 'PAID')} className="w-full bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"><Banknote size={14}/> Duit Fisik Diterima</button>
              )}
              
              {order.order_status === "WAITING" && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => updateStatus(order.id, 'order_status', 'REJECTED')} className="bg-red-50 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-all">Reject</button>
                  <button 
                    onClick={() => updateStatus(order.id, 'order_status', 'ACCEPTED')} 
                    disabled={order.payment_status === 'PENDING'} 
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${order.payment_status === 'PAID' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    Accept Order
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
